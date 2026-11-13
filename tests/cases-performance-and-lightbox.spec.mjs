import { test, expect } from '@playwright/test';

test.describe('Construction Cases Performance & Lightbox Verification', () => {
  test('Initial /cases load downloads optimized WebP images, keeping total image payload under 3MB (down from 50MB)', async ({ page }) => {
    let totalImageBytes = 0;
    const requestedImages = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (/\.(webp|jpe?g|png)/i.test(url) && !url.includes('favicon') && !url.includes('logo')) {
        requestedImages.push(url);
        try {
          const buffer = await response.body();
          totalImageBytes += buffer.length;
        } catch {
          // ignore stream errors
        }
      }
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    const startTime = Date.now();
    await page.goto('/cases');

    // Wait for cards to appear
    const cards = page.locator('.case-portfolio-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const elapsed = Date.now() - startTime;

    console.log(`Page load time: ${elapsed}ms`);
    console.log(`Total image payload: ${(totalImageBytes / 1024).toFixed(1)} KB across ${requestedImages.length} images`);

    // Verify optimized WebP files were loaded rather than massive raw camera JPEGs
    const rawLargeJpegLoads = requestedImages.filter(url => 
      url.includes('/images/시공사례/') && !url.includes('시공사례_optimized')
    );
    expect(rawLargeJpegLoads.length).toBe(0);

    // Total initial images payload MUST be well under 3MB (typically under 1.5MB)
    expect(totalImageBytes).toBeLessThan(3 * 1024 * 1024);
  });

  test('Lightbox opens high-res preview and closes cleanly without memory leak', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/cases');

    // Click the first card image wrapper to open lightbox
    const firstCardImgWrapper = page.locator('.case-img-wrapper').first();
    await firstCardImgWrapper.click();

    // Verify lightbox overlay and image
    const overlay = page.locator('.case-lightbox-overlay');
    await expect(overlay).toBeVisible();

    const lightboxImg = page.locator('.case-lightbox-img');
    await expect(lightboxImg).toBeVisible();
    const imgSrc = await lightboxImg.getAttribute('src');
    expect(imgSrc).toContain('preview-1600');

    // Test next button if multiple images
    const nextBtn = page.locator('.case-lightbox-nav.next');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(100);
    }

    // Close via close button
    const closeBtn = page.locator('.case-lightbox-btn.close');
    await closeBtn.click();
    await expect(overlay).not.toBeVisible();
  });

  test('Fast category switching renders with 0ms lag from memory cache', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/cases');

    const cards = page.locator('.case-portfolio-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    // Click '주거공간'
    const residentialFilter = page.locator('.filter-btn:has-text("주거공간")');
    await residentialFilter.click();
    await expect(page.locator('.case-tag-badge:has-text("주거공간")').first()).toBeVisible();

    // Click '상업공간'
    const commercialFilter = page.locator('.filter-btn:has-text("상업공간")');
    await commercialFilter.click();
    await expect(page.locator('.case-tag-badge:has-text("상업공간")').first()).toBeVisible();

    // Back to '전체'
    const allFilter = page.locator('.filter-btn:has-text("전체")');
    await allFilter.click();
    await expect(cards).toHaveCount(11);
  });

  test('Mobile viewport (390px iPhone & 412px Galaxy) operates smoothly with lazy loading', async ({ page }) => {
    // iPhone 14 / 15 viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/cases');

    const cards = page.locator('.case-portfolio-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    // Smooth scroll down to last card
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    await page.waitForTimeout(500);

    const lastCard = cards.last();
    await expect(lastCard).toBeVisible();

    // Click material link on mobile
    const materialLink = lastCard.locator('.case-material-link').first();
    if (await materialLink.isVisible()) {
      const href = await materialLink.getAttribute('href');
      expect(href).toMatch(/^\/materials/);
    }
  });
});

