const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });

  // Inject login cookie
  await context.addCookies([{
    name: 'auth_token',
    value: process.env.AUTH_TOKEN.trim(),
    domain: '.x.com',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  }]);

  const page = await context.newPage();

  console.log('Navigating to profile...');
  await page.goto('https://x.com/Rxdha1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Check if logged in by looking for timeline posts
  const firstTweet = page.locator('article[data-testid="tweet"]').first();
  
  if (await firstTweet.count() > 0) {
    console.log('Tweet found! Checking engagement buttons...');

    // Like Action
    const likeBtn = firstTweet.locator('[data-testid="like"]').first();
    if (await likeBtn.isVisible()) {
      await likeBtn.click();
      console.log('Successfully liked latest post!');
    } else {
      console.log('Post already liked or like button missing.');
    }

    await page.waitForTimeout(2000);

    // Retweet Action
    const retweetBtn = firstTweet.locator('[data-testid="retweet"]').first();
    if (await retweetBtn.isVisible()) {
      await retweetBtn.click();
      await page.waitForTimeout(1500);

      const confirmRetweet = page.locator('[data-testid="retweetConfirm"]').first();
      if (await confirmRetweet.isVisible()) {
        await confirmRetweet.click();
        console.log('Successfully retweeted latest post!');
      }
    } else {
      console.log('Post already retweeted or retweet button missing.');
    }

  } else {
    console.log('No tweets found or auth token expired.');
  }

  await browser.close();
})();
