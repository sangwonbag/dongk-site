/**
 * 주문 완료 알림을 처리하는 클라이언트 서비스 모듈입니다.
 * Vercel Serverless Function (/api/send-order-email)을 비동기 호출합니다.
 */

export const sendOrderNotification = async (orderData, type = "admin") => {
  try {
    if (!orderData) {
      return { success: false, error: '전송할 주문 정보가 누락되었습니다.' };
    }

    // orderService.js에서 한글 상태를 리턴받으므로 mapping 데이터 준비
    const {
      order_no,
      customer_name,
      company_name,
      phone,
      email,
      customer_email,
      address,
      address_detail,
      memo,
      delivery_request_date,
      payment_method,
      payment_status,
      status,
      total_amount,
      order_items,
      created_at
    } = orderData;

    // 고객 이메일 주소 추출
    const targetEmail = email || customer_email || orderData.customer?.email || '';

    // 상세 품목 구조 매핑
    const items = (order_items || []).map(item => ({
      product_name: item.product_name,
      product_code: item.product_code,
      brand: item.brand,
      spec: item.spec,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.unit_price,
      image_url: item.image_url
    }));

    // 서버 사이드 API 호출
    const response = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type, // "admin" 또는 "customer"
        recipient_email: targetEmail,
        order_no,
        customer_name,
        company_name,
        phone,
        address,
        address_detail,
        memo,
        delivery_request_date,
        payment_method,
        payment_status,
        status,
        total_amount,
        items,
        created_at
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      console.warn('[NotificationService Warning] Email alert failed:', result.error || 'Unknown server error');
      return { 
        success: false, 
        error: result.error || `HTTP ${response.status} 게이트웨이 전송 실패` 
      };
    }

    console.log('[NotificationService] Email alert sent successfully for:', order_no);
    return { success: true };

  } catch (err) {
    // 알림 전송 실패가 메인 주문 성공 플로우를 막지 않도록 에러 격리 처리
    console.error('[NotificationService Exception] Failed to send email alert:', err);
    return { 
      success: false, 
      error: `네트워크 오류 또는 전송 예외 발생: ${err.message}` 
    };
  }
};
