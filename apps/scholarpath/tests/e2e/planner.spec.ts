import { expect, test } from '@playwright/test'

test('planner opens evidence drawer with citations', async ({ page }) => {
  await page.goto('/planner')
  await page.getByLabel('Transfer to').selectOption('UC Irvine')
  await page.getByLabel('Plan type').selectOption('transfer')
  await page.getByLabel('Transfer major').selectOption('Mathematics')
  await page.getByRole('button', { name: '2024' }).click()
  await page.getByRole('button', { name: 'Open Evidence' }).click()
  await expect(page.getByText('Evidence Drawer')).toBeVisible()
  await expect(page.getByRole('link', { name: /UC Information Center/i }).first()).toBeVisible()
})
