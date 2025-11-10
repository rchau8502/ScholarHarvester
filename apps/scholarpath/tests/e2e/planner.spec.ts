import { test, expect } from '@playwright/test'

test('planner renders KPIs', async ({ page }) => {
  await page.goto('/planner')
  await expect(page.getByText('Open Evidence')).toBeVisible()
})
