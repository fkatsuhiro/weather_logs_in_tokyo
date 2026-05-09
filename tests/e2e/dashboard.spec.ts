import { test, expect } from '@playwright/test';

test.describe('天気ダッシュボード', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/weather_logs_in_tokyo/');
  });

  test('ページタイトルが表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('東京 天気ダッシュボード');
  });

  test('日別/月別トグルボタンが存在する', async ({ page }) => {
    const dailyBtn = page.getByRole('button', { name: '日別' });
    const monthlyBtn = page.getByRole('button', { name: '月別サマリー' });
    await expect(dailyBtn).toBeVisible();
    await expect(monthlyBtn).toBeVisible();
  });

  test('初期状態では日別カードが表示される', async ({ page }) => {
    const cards = page.getByTestId('daily-card');
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('monthly-card')).toHaveCount(0);
  });

  test('月別ボタンを押すと月別カードに切り替わる', async ({ page }) => {
    await page.getByRole('button', { name: '月別サマリー' }).click();
    await expect(page.getByTestId('monthly-card').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('daily-card')).toHaveCount(0);
  });

  test('月別カードに気温サマリーが含まれる', async ({ page }) => {
    await page.getByRole('button', { name: '月別サマリー' }).click();
    const card = page.getByTestId('monthly-card').first();
    await expect(card).toContainText('平均気温');
    await expect(card).toContainText('最高気温');
    await expect(card).toContainText('最低気温');
  });

  test('日別に戻すと日別カードが再表示される', async ({ page }) => {
    await page.getByRole('button', { name: '月別サマリー' }).click();
    await expect(page.getByTestId('monthly-card').first()).toBeVisible();
    await page.getByRole('button', { name: '日別' }).click();
    await expect(page.getByTestId('daily-card').first()).toBeVisible();
    await expect(page.getByTestId('monthly-card')).toHaveCount(0);
  });

  test('月別カードに天気の内訳が含まれる', async ({ page }) => {
    await page.getByRole('button', { name: '月別サマリー' }).click();
    const dist = page.getByTestId('monthly-distribution').first();
    await expect(dist).toBeVisible({ timeout: 5000 });
    await expect(dist).toContainText('天気の内訳');
  });
});
