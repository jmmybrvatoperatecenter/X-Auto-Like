const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Inject login cookie
  await context.addCookies([{
    name: 'auth_token',
    value: process.env.AUTH_TOKEN,
    domain: '.x.com',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  }]);

  const page = await context.newPage();

  // Go directly to @Rxdha1's posts tab
  await page.goto('https://x.com/Rxdha1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Find the first/latest tweet
  const firstTweet = page.locator('article[data-testid="tweet"]').first();

  if (await firstTweet.count() > 0) {
    // Check and click Like button
    const likeBtn = firstTweet.locator('[data-testid="like"]');
    if (await likeBtn.count() > 0) {
      await likeBtn.click();
      console.log('Liked latest post!');
      await page.waitForTimeout(1000);
    }

    // Check and click Retweet button
    const retweetBtn = firstTweet.locator('[data-testid="retweet"]');
    if (await retweetBtn.count() > 0) {
      await retweetBtn.click();
      await page.waitForTimeout(1000);
      
      // Confirm Retweet popup menu
      const confirmRetweet = page.locator('[data-testid="retweetConfirm"]');
      if (await confirmRetweet.count() > 0) {
        await confirmRetweet.click();
        console.log('Retweeted latest post!');
      }
    }
  } else {
    console.log('No tweets found.');
  }

  await browser.close();
})();
