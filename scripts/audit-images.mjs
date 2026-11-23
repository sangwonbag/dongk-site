#!/usr/bin/env node
/**
 * 동경바닥재 전체 이미지 연결 상태 진단 스크립트
 * Usage: node scripts/audit-images.mjs
 */
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const env = { ...process.env };
  for (const f of ['.env', '.env.local']) {
    if (!fs.existsSync(f)) continue;
    for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
  return env;
}

function loadImageManifest() {
  const raw = fs.readFileSync('src/data/imageManifest.js', 'utf8');
  return JSON.parse(raw.replace(/^[\s\S]*?export const imageManifest\s*=\s*/, '').replace(/;\s*$/, ''));
}

function normCode(val) {
  return String(val || '').replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase();
}

function checkLocalPublicFile(relPath) {
  let decoded = relPath;
  try { decoded = decodeURIComponent(relPath); } catch { /* keep raw */ }
  const full = path.join(process.cwd(), 'public', decoded.replace(/^\/+/, ''));
  return fs.existsSync(full);
}

async function run() {
  const env = loadEnv();
  const manifest = loadImageManifest();
  const manifestKeys = Object.keys(manifest);
  const normManifest = new Map();
  for (const k of manifestKeys) {
    const n = normCode(k);
    if (n && !normManifest.has(n)) normManifest.set(n, manifest[k]);
  }

  // 1. Audit Home.jsx recommended items
  const homeSrc = fs.readFileSync('src/pages/Home/Home.jsx', 'utf8');
  const homeItems = [...homeSrc.matchAll(/"?code"?\s*:\s*"([^"]+)"[\s\S]*?"?image"?\s*:\s*"([^"]+)"/g)].map((m) => ({
    code: m[1],
    image: m[2],
  }));
  const homeValid = homeItems.filter((i) => i.image.startsWith('https://')).length;

  // 2. Audit local materials.db.js against imageManifest.js
  const { materials = [] } = await import('../src/data/materials.db.js');
  const localStats = {
    totalCatalogProducts: materials.length,
    resolvedViaManifestOrHttp: 0,
    missingImage: 0,
    missingRows: [],
  };
  for (const m of materials) {
    const raw = (m.image_url || m.thumbnail_url || m.image || '').trim();
    const code = m.code || m.product_code || '';
    const nCode = normCode(code);
    const hasHttp = raw.startsWith('http://') || raw.startsWith('https://');
    const hasManifest = Boolean(manifest[code] || (nCode && normManifest.has(nCode)));
    const hasLocal = raw.startsWith('/') && checkLocalPublicFile(raw);
    if (hasHttp || hasManifest || hasLocal) {
      localStats.resolvedViaManifestOrHttp++;
    } else {
      localStats.missingImage++;
      if (localStats.missingRows.length < 30) {
        localStats.missingRows.push(
          `${m.brand || '-'} | ${code || '-'} | ${m.name || '-'} | ${raw || '(없음)'} | 로컬 파일 부재 및 매니페스트 미등록 | 기본 이미지 표시`
        );
      }
    }
  }

  // 3. Audit Supabase live DB (products & construction_cases) if reachable
  let dbAudit = { status: 'skipped' };
  const supaUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const supaKey = env.SUPABASE_SERVICE_ROLE || env.VITE_SUPABASE_ANON_KEY;
  if (supaUrl && supaKey) {
    try {
      const supa = createClient(supaUrl, supaKey);
      const products = [];
      let from = 0;
      while (true) {
        const { data, error } = await supa
          .from('products')
          .select('id, name, product_code, image_url, is_active')
          .range(from, from + 999);
        if (error) throw error;
        products.push(...(data || []));
        if (!data || data.length < 1000) break;
        from += 1000;
      }

      const { data: cases, error: caseErr } = await supa
        .from('construction_cases')
        .select('id, title, main_image_url, image_urls');
      if (caseErr) throw caseErr;

      let withHttp = 0;
      let withDeadLocal = 0;
      let withEmpty = 0;
      let recoverableViaManifest = 0;
      const missingDbRows = [];

      for (const p of products) {
        const raw = (p.image_url || '').trim();
        const code = p.product_code || '';
        const nCode = normCode(code);
        const hasManifest = Boolean(manifest[code] || (nCode && normManifest.has(nCode)));
        if (!raw || raw === '/images/no-image.svg') {
          withEmpty++;
          if (hasManifest) recoverableViaManifest++;
          else if (missingDbRows.length < 25) {
            missingDbRows.push(`- | ${code || '-'} | ${p.name} | (없음) | DB 이미지 미등록 | 기본 이미지 표시`);
          }
        } else if (raw.startsWith('http://') || raw.startsWith('https://')) {
          withHttp++;
        } else if (checkLocalPublicFile(raw)) {
          withHttp++;
        } else {
          withDeadLocal++;
          if (hasManifest) recoverableViaManifest++;
          else if (missingDbRows.length < 25) {
            missingDbRows.push(`- | ${code || '-'} | ${p.name} | ${raw} | 로컬 파일 없음/매니페스트 미등록 | 기본 이미지 표시`);
          }
        }
      }

      let validCases = 0;
      let missingCases = 0;
      for (const c of cases || []) {
        const u = (c.main_image_url || '').trim();
        if (u && (u.startsWith('http') || checkLocalPublicFile(u))) validCases++;
        else missingCases++;
      }

      dbAudit = {
        status: 'ok',
        totalDbProducts: products.length,
        withValidUrl: withHttp,
        withDeadLocalPath: withDeadLocal,
        withNoImage: withEmpty,
        recoverableViaManifest,
        totalCases: (cases || []).length,
        validCases,
        missingCases,
        missingDbRows,
      };
    } catch (err) {
      dbAudit = { status: 'unreachable', error: err.message || String(err) };
    }
  }

  console.log(JSON.stringify({
    manifestEntries: manifestKeys.length,
    homeRecommended: { total: homeItems.length, validHttps: homeValid },
    localCatalogAudit: localStats,
    supabaseDbAudit: dbAudit,
  }, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
