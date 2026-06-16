import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrdersInsert() {
  console.log('--- Orders & Order Items Insert Test (amount Column Omitted) ---');
  
  // 0. profiles에서 테스트를 위한 유저 하나 가져오기
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)
    .single();

  if (profileError || !profile) {
    console.error('❌ Failed to fetch user profile for testing:', profileError);
    return;
  }

  const userId = profile.id;
  console.log(`Using user_id: ${userId} for testing.`);

  // 1. orders 테이블 insert
  const dummyOrder = {
    user_id: userId,
    customer_name: '테스트구매자',
    company_name: '테스트업체',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123',
    address_detail: '4층',
    memo: '조심히 배송바랍니다.',
    subtotal: 50000,
    shipping_fee: 0,
    total_amount: 50000,
    status: 'submitted', // 접수완료
    payment_method: 'bank_transfer', // 무통장입금
    payment_status: 'unpaid' // 미입금
  };

  console.log('Attempting insert into orders...');
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert(dummyOrder)
    .select('*')
    .maybeSingle();

  if (orderError) {
    console.error('❌ Orders insert failed:', orderError);
    if (orderError.message.includes('foreign key constraint')) {
      console.log('💡 Note: orders_user_id_fkey violates referential integrity. (This is expected if the foreign key has not been altered in Supabase yet.)');
    }
    return;
  }

  console.log('✅ Orders insert successful!', orderData);
  const orderId = orderData.id;

  // 2. order_items 테이블 insert (amount 컬럼 생략)
  const dummyItem = {
    order_id: orderId,
    category: '바닥재',
    brand: '동경',
    product_name: '테스트 자재 A',
    product_code: 'TEST-001',
    spec: '300x300',
    unit: '평',
    quantity: 10,
    unit_price: 5000,
    // amount 컬럼은 GENERATED ALWAYS이므로 제외
    image_url: 'https://example.com/image.jpg'
  };

  console.log('Attempting insert into order_items...');
  const { data: itemData, error: itemError } = await supabase
    .from('order_items')
    .insert(dummyItem)
    .select('*')
    .maybeSingle();

  if (itemError) {
    console.error('❌ Order items insert failed:', itemError);
  } else {
    console.log('✅ Order items insert successful!', itemData);
    console.log('Generated amount in DB:', itemData.amount);
  }

  // clean up test data
  console.log('Cleaning up test data...');
  const { error: deleteError } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (deleteError) {
    console.error('Cleanup failed:', deleteError.message);
  } else {
    console.log('🧹 Cleanup completed successfully.');
  }
}

testOrdersInsert();
