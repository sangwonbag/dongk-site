import { createClient } from '@supabase/supabase-js';

const NTS_ENDPOINT = 'https://api.odcloud.kr/api/nts-businessman/v1/validate';

export function normalizeBusinessNumber(input) {
  const number = typeof input === 'string' ? input.trim() : '';
  if (!/^(?:[0-9]{10}|[0-9]{3}-[0-9]{2}-[0-9]{5})$/.test(number)) return null;

  const digits = number.replaceAll('-', '');
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  const sum = weights.reduce((total, weight, index) => total + weight * Number(digits[index]), 0);
  const checkDigit = (10 - (sum + Math.floor(Number(digits[8]) * 5 / 10)) % 10) % 10;
  return checkDigit === Number(digits[9]) && digits !== '0000000000' ? digits : null;
}

function readText(value, limit) {
  return typeof value === 'string' && value.trim().length <= limit ? value.trim() : '';
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: '지원하지 않는 요청입니다.' });
  }

  const token = req.headers.authorization?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return res.status(401).json({ message: '로그인 후 이용해 주세요.' });

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ntsKey = process.env.NTS_BUSINESS_API_KEY;
  if (!url || !serviceKey || !ntsKey) {
    return res.status(503).json({ message: '사업자 인증 서비스가 아직 연결되지 않았습니다.' });
  }

  const body = req.body ?? {};
  const number = normalizeBusinessNumber(body.businessNumber);
  const name = readText(body.businessName, 120);
  const representative = readText(body.representative, 80);
  const openedOn = readText(body.openedOn, 10);
  const address = readText(body.address, 250);
  const businessType = readText(body.businessType, 120);
  const businessItem = readText(body.businessItem, 120);

  if (!number) return res.status(400).json({ message: '사업자등록번호 10자리를 확인해 주세요.' });
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(openedOn) &&
    Number.isFinite(Date.parse(openedOn)) && new Date(openedOn).toISOString().slice(0, 10) === openedOn;
  if (!name || !representative || !validDate) {
    return res.status(400).json({ message: '상호, 대표자명, 개업연월일을 확인해 주세요.' });
  }

  try {
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user || user.is_anonymous) {
      return res.status(401).json({ message: '로그인 세션을 확인할 수 없습니다. 다시 로그인해 주세요.' });
    }

    const endpoint = new URL(NTS_ENDPOINT);
    endpoint.searchParams.set('serviceKey', ntsKey);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businesses: [{
        b_no: number, start_dt: openedOn.replaceAll('-', ''), p_nm: representative,
        p_nm2: '', b_nm: name, corp_no: '', b_sector: '', b_type: '', b_adr: ''
      }] }),
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error('NTS request failed');
    const result = await response.json();
    const verification = result.data?.[0];
    if (result.status_code !== 'OK' || !verification) throw new Error('Invalid NTS response');
    if (verification.valid !== '01' || verification.status?.b_stt_cd !== '01') {
      return res.status(422).json({ message: '국세청 정보와 일치하는 계속사업자를 확인하지 못했습니다. 등록증 내용을 확인해 주세요.' });
    }

    const verifiedAt = new Date().toISOString();
    const { error } = await admin.from('business_verifications').upsert({
      user_id: user.id, business_number: number, business_name: name, representative,
      opened_on: openedOn, business_address: address, business_type: businessType,
      business_item: businessItem, verified_at: verifiedAt
    });
    if (error) throw new Error('Business verification could not be saved');
    return res.status(200).json({ verifiedAt });
  } catch {
    return res.status(503).json({ message: '사업자 인증을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.' });
  }
}
