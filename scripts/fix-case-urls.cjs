require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: cases, error } = await supabase.from('construction_cases').select('*').order('id');
  if (error) {
    console.error('Error fetching cases:', error);
    process.exit(1);
  }

  for (const c of cases) {
    let changed = false;
    let mainImg = c.main_image_url;
    let imgUrls = Array.isArray(c.image_urls) ? [...c.image_urls] : [];

    if (mainImg && mainImg.includes('/images/시공사례/202')) {
      mainImg = mainImg.replace(/\/images\/시공사례\/20(2[56]\.)/g, '/images/시공사례/$1');
      changed = true;
    }

    imgUrls = imgUrls.map(u => {
      if (typeof u === 'string' && u.includes('/images/시공사례/202')) {
        changed = true;
        return u.replace(/\/images\/시공사례\/20(2[56]\.)/g, '/images/시공사례/$1');
      }
      return u;
    });

    if (changed) {
      console.log(`Updating Case ID ${c.id}: ${c.title}`);
      console.log(`  Old main: ${c.main_image_url}`);
      console.log(`  New main: ${mainImg}`);
      console.log(`  Old images[0]: ${c.image_urls ? c.image_urls[0] : 'none'}`);
      console.log(`  New images[0]: ${imgUrls[0]}`);

      const { data, error: updateErr } = await supabase
        .from('construction_cases')
        .update({
          main_image_url: mainImg,
          image_urls: imgUrls
        })
        .eq('id', c.id)
        .select();

      if (updateErr) {
        console.error(`  Update FAILED on ID ${c.id}:`, updateErr);
      } else {
        console.log(`  Successfully updated ID ${c.id}. Verified row:`, data && data[0] ? data[0].main_image_url : 'ok');
      }
    }
  }

  console.log('--- Verification after updates ---');
  const { data: verified } = await supabase.from('construction_cases').select('id, title, main_image_url').order('id');
  verified.forEach(c => console.log(`${c.id}: ${c.main_image_url}`));
}

run();
