import { expect, test } from '@playwright/test'

test('planner opens evidence drawer with citations', async ({ page }) => {
  await page.goto('/planner')
  await page.getByLabel('Campus').selectOption('UC Irvine')
  await page.getByLabel('Cohort').selectOption('transfer')
  await page.getByLabel('Major').selectOption('Mathematics')
  await page.getByRole('button', { name: '2024' }).click()
  await page.getByRole('button', { name: '2023' }).click()
  await page.getByRole('button', { name: 'Open Evidence' }).click()
  await expect(page.getByText('Evidence Drawer')).toBeVisible()
  await expect(page.getByRole('link', { name: /source/i }).first()).toBeVisible()
})
