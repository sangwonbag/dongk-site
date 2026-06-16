export default async function handler(req, res) {
  // 1. POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // 2. 환경변수 확인
  const apiKey = process.env.EMAIL_API_KEY;
  const adminEmail = process.env.ADMIN_ORDER_EMAIL;
  const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  if (!apiKey || !adminEmail) {
    console.error('[Email Service Error] Missing required server-side environment variables.');
    return res.status(500).json({ 
      success: false, 
      error: '이메일 서비스 설정(EMAIL_API_KEY, ADMIN_ORDER_EMAIL)이 서버에 누락되었습니다.' 
    });
  }

  // 3. 바디 데이터 추출 및 필수값 검증
  const { 
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
  } = req.body;

  if (!order_no || !customer_name || !phone || !total_amount || !items || !Array.isArray(items)) {
    return res.status(400).json({ 
      success: false, 
      error: '필수 주문 정보(주문번호, 고객명, 연락처, 금액, 상품목록)가 누락되었습니다.' 
    });
  }

  // 4. HTML 본문 구성 (인라인 스타일 적용)
  const formattedDate = created_at 
    ? new Date(created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) 
    : new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  const itemsHtml = items.map(item => {
    const qty = item.quantity || 1;
    const unitPrice = item.unit_price || item.price || 0;
    const total = qty * unitPrice;
    const imgUrl = item.image_url || item.image || item.thumbnail || 'https://dk-floor.vercel.app/images/deco_tile.png';

    return `
      <tr>
        <td style="padding: 12px; border: 1px solid #ECEFF1; font-size: 13.5px; color: #141615;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 44px; padding: 0; border: none;">
                <img src="${imgUrl}" alt="${item.product_name}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover; border: 1px solid #ECEFF1;" />
              </td>
              <td style="padding-left: 10px; border: none; font-size: 13.5px; line-height: 1.4;">
                <span style="font-size: 11px; font-weight: 800; color: #0A4C37; display: block;">[${item.brand || '자재'}]</span>
                <strong style="color: #141615; font-size: 13.5px;">${item.product_name || item.name}</strong>
                <span style="font-size: 11px; color: #78909C; display: block;">코드: ${item.product_code || item.code || '-'} / 규격: ${item.spec || '-'}</span>
              </td>
            </tr>
          </table>
        </td>
        <td style="padding: 12px; border: 1px solid #ECEFF1; font-size: 13.5px; color: #141615; text-align: center;">
          ${qty}${item.unit || '평'}
        </td>
        <td style="padding: 12px; border: 1px solid #ECEFF1; font-size: 13.5px; color: #141615; text-align: right;">
          ${unitPrice.toLocaleString()}원
        </td>
        <td style="padding: 12px; border: 1px solid #ECEFF1; font-size: 13.5px; color: #141615; text-align: right; font-weight: bold;">
          ${total.toLocaleString()}원
        </td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>신규 주문 접수 알림</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #141615; margin: 0; padding: 20px; background-color: #FAFAF9;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #ECEFF1; box-sizing: border-box;">
        
        <!-- Header -->
        <div style="border-bottom: 3px solid #0A4C37; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="margin: 0; color: #0A4C37; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">동경바닥재 - 신규 주문 접수</h2>
          <span style="font-size: 12px; color: #78909C;">본 메일은 동경바닥재 관리자용 자동 주문 알림 메일입니다.</span>
        </div>

        <!-- Summary -->
        <div style="background-color: #FAFAF9; border: 1px solid #ECEFF1; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="text-align: left; color: #78909C; font-size: 13px; font-weight: 700; width: 110px; padding: 6px 0; border: none;">주문번호</th>
              <td style="color: #141615; font-size: 14.5px; font-weight: bold; font-family: monospace; padding: 6px 0; border: none;">${order_no}</td>
            </tr>
            <tr>
              <th style="text-align: left; color: #78909C; font-size: 13px; font-weight: 700; padding: 6px 0; border: none;">주문일시</th>
              <td style="color: #141615; font-size: 14px; padding: 6px 0; border: none;">${formattedDate}</td>
            </tr>
            <tr>
              <th style="text-align: left; color: #78909C; font-size: 13px; font-weight: 700; padding: 6px 0; border: none;">주문자/업체</th>
              <td style="color: #141615; font-size: 14px; font-weight: bold; padding: 6px 0; border: none;">${customer_name} ${company_name ? `(${company_name})` : ''}</td>
            </tr>
            <tr>
              <th style="text-align: left; color: #78909C; font-size: 13px; font-weight: 700; padding: 6px 0; border: none;">연락처</th>
              <td style="color: #141615; font-size: 14px; padding: 6px 0; border: none;">${phone}</td>
            </tr>
            <tr>
              <th style="text-align: left; color: #78909C; font-size: 13px; font-weight: 700; padding: 6px 0; border: none;">배송지 주소</th>
              <td style="color: #141615; font-size: 14px; padding: 6px 0; border: none;">${address} ${address_detail || ''}</td>
            </tr>
            ${delivery_request_date ? `
            <tr>
              <th style="text-align: left; color: #00695C; font-size: 13px; font-weight: 700; padding: 6px 0; border: none;">희망배송일</th>
              <td style="color: #004D40; font-size: 14px; font-weight: bold; padding: 6px 0; border: none; background-color: #E0F2F1; padding-left: 6px; border-radius: 4px;">${delivery_request_date}</td>
            </tr>` : ''}
            <tr>
              <th style="text-align: left; color: #78909C; font-size: 13px; font-weight: 700; padding: 6px 0; border: none;">결제 방식</th>
              <td style="color: #141615; font-size: 14px; padding: 6px 0; border: none;">${payment_method || '무통장입금'}</td>
            </tr>
            <tr>
              <th style="text-align: left; color: #78909C; font-size: 13px; font-weight: 700; padding: 6px 0; border: none;">주문 상태</th>
              <td style="color: #EF6C00; font-size: 14px; font-weight: bold; padding: 6px 0; border: none;">${status || '접수완료'}</td>
            </tr>
            <tr>
              <th style="text-align: left; color: #78909C; font-size: 13px; font-weight: 700; padding: 6px 0; border: none;">결제 상태</th>
              <td style="color: #C62828; font-size: 14px; font-weight: bold; padding: 6px 0; border: none;">${payment_status || '미입금'}</td>
            </tr>
            ${memo ? `
            <tr>
              <th style="text-align: left; color: #78909C; font-size: 13px; font-weight: 700; padding: 6px 0; border: none; vertical-align: top;">요청사항</th>
              <td style="color: #37474F; font-size: 13.5px; padding: 6px 0; border: none; white-space: pre-wrap;">${memo}</td>
            </tr>` : ''}
            <tr style="border-top: 1px solid #ECEFF1;">
              <th style="text-align: left; color: #0A4C37; font-size: 14px; font-weight: 800; padding: 12px 0 0 0; border: none;">총 주문금액</th>
              <td style="color: #0A4C37; font-size: 20px; font-weight: 800; padding: 12px 0 0 0; border: none;">${total_amount.toLocaleString()}원</td>
            </tr>
          </table>
        </div>

        <!-- Items Table -->
        <h3 style="font-size: 15px; font-weight: 800; color: #141615; margin: 0 0 12px 0; padding-left: 8px; border-left: 3px solid #0A4C37;">주문 자재 내역</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px; border: 1px solid #ECEFF1;">
          <thead>
            <tr style="background-color: #ECEFF1;">
              <th style="padding: 10px; border: 1px solid #CFD8DC; font-size: 11.5px; font-weight: 700; color: #37474F; text-align: left;">자재/상품 정보</th>
              <th style="padding: 10px; border: 1px solid #CFD8DC; font-size: 11.5px; font-weight: 700; color: #37474F; text-align: center; width: 60px;">수량</th>
              <th style="padding: 10px; border: 1px solid #CFD8DC; font-size: 11.5px; font-weight: 700; color: #37474F; text-align: right; width: 90px;">단가</th>
              <th style="padding: 10px; border: 1px solid #CFD8DC; font-size: 11.5px; font-weight: 700; color: #37474F; text-align: right; width: 100px;">합계금액</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Call to Action -->
        <div style="text-align: center; border-top: 1px solid #ECEFF1; padding-top: 24px; margin-top: 20px;">
          <a href="https://dk-floor.vercel.app/admin-orders" target="_blank" style="display: inline-block; background-color: #141615; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14.5px; font-weight: 700; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
            관리자 주문관리 바로가기
          </a>
          <p style="font-size: 11px; color: #78909C; margin: 12px 0 0 0;">(Vercel 서버 호스팅 주소에 따라 상세 이동이 지원됩니다)</p>
        </div>

      </div>
    </body>
    </html>
  `;

  // 5. API Key 형식 식별을 통한 이메일 전송 분기 (Resend vs SendGrid)
  const isSendGrid = apiKey.startsWith('SG.');

  try {
    let emailResponse;
    if (isSendGrid) {
      // SendGrid 전송 규격
      emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: adminEmail }] }],
          from: { email: emailFrom, name: '동경바닥재' },
          subject: `[동경바닥재] 신규 주문 접수 - ${order_no}`,
          content: [{ type: 'text/html', value: htmlContent }]
        })
      });
    } else {
      // Resend 전송 규격
      emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: emailFrom,
          to: adminEmail,
          subject: `[동경바닥재] 신규 주문 접수 - ${order_no}`,
          html: htmlContent
        })
      });
    }

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Email gateway returned status ${emailResponse.status}: ${errorText}`);
    }

    console.log(`[Email Service] Success sending order mail for: ${order_no}`);
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('[Email Service Exception]:', err);
    return res.status(502).json({ 
      success: false, 
      error: `이메일 게이트웨이 전송 중 오류가 발생했습니다: ${err.message}` 
    });
  }
}
