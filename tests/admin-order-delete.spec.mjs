import { test, expect } from '@playwright/test';

test.describe('AdminOrders in-app order deletion', () => {
  test('canceling confirm preserves order; confirming deletes order_items & orders and removes card', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const mockOrder = {
      id: 'mock-order-del-001',
      order_no: 'DK-TEST-DEL-001',
      user_id: '0e628119-fdca-4f94-8400-f5864b712c59',
      status: 'submitted',
      payment_method: 'bank_transfer',
      payment_status: 'unpaid',
      customer_name: '테스트삭제',
      phone: '010-1111-2222',
      customer_phone: '010-1111-2222',
      address: '서울시 테스트구 123',
      total_amount: 150000,
      billed_amount: 150000,
      paid_amount: 0,
      order_type: 'material_only',
      has_construction: false,
      admin_checked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order_items: [
        {
          id: 'mock-item-001',
          order_id: 'mock-order-del-001',
          product_name: '테스트 데코타일',
          product_code: 'TEST-001',
          quantity: 5,
          unit_price: 30000,
          subtotal: 150000,
          unit: '박스'
        }
      ]
    };

    let deleteItemsCalled = false;
    let deleteOrderCalled = false;

    await page.route('**/rest/v1/orders*', async (route) => {
      const req = route.request();
      const method = req.method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([mockOrder])
        });
        return;
      }
      if (method === 'DELETE') {
        deleteOrderCalled = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ id: mockOrder.id }])
        });
        return;
      }
      await route.continue();
    });

    await page.route('**/rest/v1/order_items*', async (route) => {
      const method = route.request().method();
      if (method === 'DELETE') {
        deleteItemsCalled = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('dk_auth_user', JSON.stringify({
        id: '0e628119-fdca-4f94-8400-f5864b712c59',
        username: 'dongk3089',
        name: '관리자',
        phone: '02-487-9775',
        company_name: '동경바닥재',
        user_type: '관리자',
        role: 'admin',
        isLoggedIn: true
      }));
    });

    await page.goto('/admin-orders');
    const orderCard = page.locator(`#order-card-${mockOrder.id}`);
    await expect(orderCard).toBeVisible({ timeout: 10000 });

    // Expand order card
    await orderCard.locator('.card-summary-row').click();
    const deleteBtn = orderCard.locator('button.btn-admin-order-delete');
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });

    // 1. Dismiss confirm dialog -> order remains, DELETE not called
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('DK-TEST-DEL-001');
      await dialog.dismiss();
    });
    await deleteBtn.click();
    await expect(orderCard).toBeVisible();
    expect(deleteOrderCalled).toBe(false);

    // 2. Accept confirm dialog -> DELETE called and card removed
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('DK-TEST-DEL-001');
      await dialog.accept();
    });
    await deleteBtn.click();

    await expect(orderCard).toHaveCount(0, { timeout: 5000 });
    expect(deleteItemsCalled).toBe(true);
    expect(deleteOrderCalled).toBe(true);
  });
});

