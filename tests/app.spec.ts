import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

async function setProgress(page: Page, number: number) {
  await page
    .getByRole('button', { name: /Read through book|Set reading progress/ })
    .first()
    .click()
  await page.getByLabel('Last book finished').selectOption(String(number))
  await page.getByRole('button', { name: 'Save my reading boundary' }).click()
}

test('ordered map, branches, faction filtering and book lookup work', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'The road to Terra' }),
  ).toBeVisible()
  await expect(page.locator('.book-card').first()).toHaveAccessibleName(
    'Open Horus Rising',
  )
  await expect(page.locator('.book-card')).toHaveCount(54)
  await expect(
    page.getByRole('button', { name: /Short story.*The Last Church/ }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Main books', exact: true }).click()
  await expect(page.locator('.side-story')).toHaveCount(0)
  await page.getByRole('button', { name: 'Mechanicum', exact: true }).click()
  await expect(page.locator('.book-card')).toHaveCount(3)
  await expect(
    page.getByRole('button', { name: 'Open Mechanicum', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clear story filter' }).click()
  if (testInfo.project.name === 'desktop') {
    await page
      .getByRole('combobox', { name: 'Find a book', exact: true })
      .fill('54')
    await page.getByRole('option', { name: /The Buried Dagger/ }).click()
    await expect(
      page.getByRole('button', { name: 'Open The Buried Dagger', exact: true }),
    ).toBeInViewport()
  }
  await expect(page.locator('body')).toHaveJSProperty(
    'scrollWidth',
    await page.evaluate(() => window.innerWidth),
  )
})

test('unread book content is not fetched until deliberately revealed', async ({
  page,
}) => {
  const requests: string[] = []
  page.on('request', (r) => {
    if (r.url().includes('/content/books/')) requests.push(r.url())
  })
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Open Horus Rising', exact: true })
    .click()
  const dialog = page.getByRole('dialog', { name: 'Horus Rising', exact: true })
  await expect(
    dialog.getByText('This story is beyond your reading boundary.'),
  ).toBeVisible()
  expect(requests).toEqual([])
  await dialog.getByRole('button', { name: 'Reveal this story' }).click()
  await expect(
    dialog.getByText(/The Great Crusade reaches a turning point/),
  ).toBeVisible()
  await dialog.getByRole('slider').fill('2')
  await expect(dialog.getByText(/Erebus/)).toBeVisible()
  await dialog.getByRole('button', { name: 'Next volume' }).click()
  await expect(
    page
      .getByRole('dialog', { name: 'False Gods' })
      .getByRole('button', { name: 'Reveal this story' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await expect(page.locator('.progress-button')).toHaveText(
    'Set reading progress',
  )
})

test('character entry requires progress; later sections and identities stay hidden', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Character view' }).click()
  const progress = page.getByRole('dialog', { name: 'Set reading progress' })
  await expect(progress).toBeVisible()
  await expect(
    progress.getByRole('button', { name: 'Save my reading boundary' }),
  ).toBeDisabled()
  await page.getByLabel('Last book finished').selectOption('1')
  await page.getByRole('button', { name: 'Save my reading boundary' }).click()
  await expect(page.getByText('Barabas Dantioch', { exact: true })).toHaveCount(
    0,
  )
  await page.getByRole('button', { name: /Astartes Garviel Loken/ }).click()
  await expect(
    page.getByRole('heading', { name: 'Horus Rising', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'False Gods', exact: true }),
  ).toHaveCount(0)
  await expect(page.getByText(/Torgaddon is killed/)).toHaveCount(0)
  await page.getByRole('button', { name: 'Keeler', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Euphrati Keeler' }),
  ).toBeVisible()
  await expect(page.locator('.progress-button')).toContainText('01')
  await page.reload()
  await expect(page.locator('.progress-button')).toContainText('01')
})

test('cutoff reductions remove active dossiers, search identities and filters', async ({
  page,
}) => {
  await page.goto('/')
  await setProgress(page, 34)
  await page.getByRole('button', { name: 'Character view' }).click()
  await page
    .getByRole('combobox', { name: 'Search characters', exact: true })
    .fill('Dantioch')
  await page.getByRole('option', { name: /Barabas Dantioch/ }).click()
  await expect(
    page.getByRole('heading', { name: 'Pharos', exact: true }),
  ).toBeVisible()
  await setProgress(page, 16)
  await page.getByRole('button', { name: /Astartes Barabas Dantioch/ }).click()
  await expect(
    page.getByRole('heading', { name: 'Age of Darkness', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Pharos', exact: true }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('heading', { name: 'The Unremembered Empire', exact: true }),
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Story view' }).click()
  await page
    .getByRole('combobox', { name: 'Search story filters', exact: true })
    .fill('Dantioch')
  await page.getByRole('option', { name: /Barabas Dantioch/ }).click()
  await expect(
    page.getByRole('button', { name: 'Open Age of Darkness', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Open Pharos', exact: true }),
  ).toHaveCount(0)
  await setProgress(page, 1)
  await page.getByRole('button', { name: 'Character view' }).click()
  await page
    .getByRole('combobox', { name: 'Search characters', exact: true })
    .fill('Dantioch')
  await expect(
    page.getByRole('option', { name: /Barabas Dantioch/ }),
  ).toHaveCount(0)
})

test('hierarchy browsing preserves the reading boundary', async ({ page }) => {
  await page.goto('/')
  await setProgress(page, 16)
  await page.getByRole('button', { name: 'Character view' }).click()
  await page.getByRole('button', { name: 'Browse by hierarchy' }).click()
  await page.getByLabel('1. Origin').selectOption('Astartes')
  await page.getByLabel('2. Initial affiliation').selectOption('Iron Warriors')
  await expect(page.locator('.character-card')).toHaveCount(1)
  await page.getByRole('button', { name: /Barabas Dantioch/ }).click()
  await expect(
    page.getByRole('heading', { name: 'Barabas Dantioch' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Pharos', exact: true }),
  ).toHaveCount(0)
})

test('keyboard controls and initial pages meet accessibility checks', async ({
  page,
}) => {
  await page.goto('/')
  let result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(result.violations).toEqual([])
  await page
    .getByRole('button', { name: /Set reading progress/ })
    .first()
    .click()
  result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(result.violations).toEqual([])
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.progress-button')).toBeFocused()
  await setProgress(page, 3)
  await page.getByRole('button', { name: 'Character view' }).click()
  result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(result.violations).toEqual([])
})

test('corrupt saved progress fails closed and resetting locks the archive again', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('spoils-of-lore.reading-cutoff.v1', '999'),
  )
  await page.goto('/')
  await expect(page.locator('.progress-button')).toHaveText(
    'Set reading progress',
  )
  await setProgress(page, 3)
  await page.getByRole('button', { name: 'Character view' }).click()
  await page.getByRole('button', { name: /Astartes Garviel Loken/ }).click()
  await expect(
    page.getByRole('heading', { name: 'Galaxy in Flames', exact: true }),
  ).toBeVisible()
  await page.locator('.progress-button').click()
  await page
    .getByRole('button', { name: 'Clear reading progress', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Garviel Loken', exact: true }),
  ).toHaveCount(0)
  await expect(
    page
      .getByRole('button', { name: 'Set reading progress', exact: true })
      .last(),
  ).toBeVisible()
})

test('story and character readers are accessible and unavailable depth is explicit', async ({
  page,
}) => {
  await page.goto('/')
  await setProgress(page, 16)
  await page
    .getByRole('button', { name: 'Open Horus Rising', exact: true })
    .click()
  await expect(
    page.getByText(/The Great Crusade reaches a turning point/),
  ).toBeVisible()
  let result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(result.violations).toEqual([])
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await page
    .getByRole('button', { name: 'Open Descent of Angels', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Into the detail', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'This level is still being curated.' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await page.getByRole('button', { name: 'Character view' }).click()
  await page.getByRole('button', { name: /Astartes Garviel Loken/ }).click()
  await expect(
    page.getByRole('heading', { name: 'Horus Rising', exact: true }),
  ).toBeVisible()
  result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(result.violations).toEqual([])
})
