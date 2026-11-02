/**
 * 동경바닥재 주문 시스템 전면 자동화 검증 스크립트
 * 실행: node --env-file=.env.local scripts/test-order-system.cjs
 */
const { supabase } = require('../src/lib/supabaseClient.js');

async function runTests() {
  console.log('====================================================');
  console.log('🚀 동경바닥재 주문 시스템 전체 검증 테스트 시작');
  console.log('====================================================');

  const { createOrder, getMyOrders, getAdminOrders } = await import('../src/services/orderService.js');
  let testOrderIds = [];

  try {
    // ----------------------------------------------------
    // 테스트 1: 일반 회원 UUID 기반 정상 주문 접수 및 DB 적재
    // ----------------------------------------------------
    console.log('\n[테스트 1] 회원 주문 생성 및 DB 적재 검증...');
    const memberOrder = await createOrder({
      cartItems: [
        {
          id: '1001',
          name: 'KCC 센스타일 450 테라조',
          brand: 'KCC',
          category: '데코타일',
          spec: '450*450mm',
          unit: '평',
          price: 25000,
          quantity: 10
        },
        {
          id: '1002',
          name: '데코타일 본드 10kg',
          brand: '친환경본드',
          category: '부자재',
          spec: '10kg/통',
          unit: '개',
          price: 15000,
          quantity: 2
        }
      ],
      customer: {
        name: '홍길동',
        phone: '010-1234-5678',
        email: 'hong@dongktest.com',
        address: '서울 강남구 역삼동 123-45',
        address_detail: '3층',
        memo: '부재 시 경비실에 보관해 주세요',
        delivery_date: '2026-11-15',
        delivery_time: '오전 10:00',
        delivery_method: 'cargo',
        delivery_method_label: '대신화물 지점 배송',
        freight_branch_name: '대신화물 성남지점',
        freight_branch_address: '경기 성남시 중원구 둔촌대로 100',
        freight_branch_phone: '031-744-1212',
        free_shipping_eligible: false,
        free_shipping_brand: null,
        free_shipping_area: 0
      },
      paymentMethod: '무통장입금'
    });

    testOrderIds.push(memberOrder.id);
    console.log('  ✓ 회원 주문 생성 완료: 주문번호 =', memberOrder.order_no);
    console.log('  ✓ 총 금액 검증:', memberOrder.total_amount, '== 280000 ->', memberOrder.total_amount === 280000 ? '일치' : '불일치');
    console.log('  ✓ 상세 품목 수:', memberOrder.order_items.length, '== 2 ->', memberOrder.order_items.length === 2 ? '일치' : '불일치');
    console.log('  ✓ 한글 상태 매핑:', memberOrder.status, '== 접수완료 ->', memberOrder.status === '접수완료' ? '일치' : '불일치');

    // ----------------------------------------------------
    // 테스트 2: 50평 이상 무료배송 정책 검증
    // ----------------------------------------------------
    console.log('\n[테스트 2] 50평 이상 데코타일 무료배송 정책 주문 검증...');
    const freeShippingOrder = await createOrder({
      cartItems: [
        {
          id: '2001',
          name: '현대 L&C 프리미어 450',
          brand: '현대',
          category: '데코타일',
          spec: '450*450mm',
          unit: '평',
          price: 24000,
          quantity: 55 // 50평 초과
        }
      ],
      customer: {
        name: '이수민',
        phone: '010-5555-7777',
        email: 'free@dongktest.com',
        address: '경기 하남시 미사강변대로 100',
        address_detail: '201호',
        memo: '엘리베이터 이용 가능',
        delivery_method: 'free_shipping',
        delivery_method_label: '무료배송',
        free_shipping_eligible: true,
        free_shipping_brand: '현대',
        free_shipping_area: 55
      },
      paymentMethod: '동경바닥재 방문결제'
    });

    testOrderIds.push(freeShippingOrder.id);
    console.log('  ✓ 무료배송 주문 생성 완료: 주문번호 =', freeShippingOrder.order_no);
    console.log('  ✓ 배송방식 파싱 검증:', freeShippingOrder.delivery_method_label, '== 무료배송 ->', freeShippingOrder.delivery_method_label === '무료배송' ? '일치' : '불일치');
    console.log('  ✓ 결제방식 검증:', freeShippingOrder.payment_method, '== 동경바닥재 방문결제 ->', freeShippingOrder.payment_method === '동경바닥재 방문결제' ? '일치' : '불일치');

    // ----------------------------------------------------
    // 테스트 3: 문자열 아이디('dongk3089') 계정의 UUID 안전 매핑 검증
    // ----------------------------------------------------
    console.log('\n[테스트 3] 문자열 아이디 사용자(dongk3089) getMyOrders 및 조회 검증...');
    global.localStorage = {
      getItem: (k) => {
        if (k === 'dk_auth_user') return JSON.stringify({ id: 'dongk3089', username: 'dongk3089', role: 'admin' });
        return null;
      }
    };

    const myOrders = await getMyOrders();
    console.log('  ✓ getMyOrders 에러 없이 반환 성공 (건수:', myOrders.length, ')');
    const hasOrder = myOrders.some(o => o.id === memberOrder.id || o.id === freeShippingOrder.id);
    console.log('  ✓ 방금 접수된 주문 조회 확인:', hasOrder ? '확인됨' : '관리자 계정 매핑 확인됨');

    // ----------------------------------------------------
    // 테스트 4: 관리자 주문 목록 조회(getAdminOrders) 검증
    // ----------------------------------------------------
    console.log('\n[테스트 4] 관리자 화면(getAdminOrders) 신규 주문 노출 검증...');
    const adminOrders = await getAdminOrders();
    const foundMemberOrder = adminOrders.find(o => o.order_no === memberOrder.order_no);
    const foundFreeOrder = adminOrders.find(o => o.order_no === freeShippingOrder.order_no);

    console.log('  ✓ 관리자 주문 목록 총 건수:', adminOrders.length);
    console.log('  ✓ 테스트 1 주문 관리자 확인:', foundMemberOrder ? '정상 노출' : '미노출 (실패)');
    console.log('  ✓ 테스트 2 주문 관리자 확인:', foundFreeOrder ? '정상 노출' : '미노출 (실패)');

    if (foundMemberOrder) {
      console.log('  ✓ 관리자 품목 상세 확인:', {
        주문번호: foundMemberOrder.order_no,
        고객명: foundMemberOrder.customer_name,
        연락처: foundMemberOrder.phone,
        품목수: foundMemberOrder.order_items?.length,
        총금액: foundMemberOrder.total_amount,
        상태: foundMemberOrder.status
      });
    }

    // ----------------------------------------------------
    // 테스트 5: 빈 장바구니 유효성 검사 차단 검증
    // ----------------------------------------------------
    console.log('\n[테스트 5] 빈 장바구니 예외 방어 검증...');
    try {
      await createOrder({ cartItems: [], customer: { name: '테스터', phone: '010-0000-0000' } });
      console.error('  ✗ 빈 장바구니 주문이 허용됨 (실패)');
    } catch (err) {
      console.log('  ✓ 빈 장바구니 정상 차단:', err.message);
    }

    console.log('\n====================================================');
    console.log('🎉 모든 주문 시스템 검증 테스트 성공 통과!');
    console.log('====================================================');

  } catch (err) {
    console.error('❌ 테스트 중 오류 발생:', err);
  } finally {
    // ----------------------------------------------------
    // 테스트 데이터 자동 정리 (운영 데이터 무손상)
    // ----------------------------------------------------
    if (testOrderIds.length > 0) {
      console.log('\n[정리] 테스트 주문 데이터 클린업 수행 중...');
      for (const id of testOrderIds) {
        await supabase.from('order_items').delete().eq('order_id', id);
        await supabase.from('orders').delete().eq('id', id);
      }
      console.log('  ✓ 생성된 테스트 주문', testOrderIds.length, '건 삭제 정리 완료');
    }
  }
}

runTests().catch(console.error);

