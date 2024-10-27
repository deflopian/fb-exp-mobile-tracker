const puppeteer = require('puppeteer');
const CRED = {
  user: '',
  pass: ''
}

const sleep = async (ms) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, ms)
  });
}

const ID = {
  login: '#m_login_email',
  pass: '#m_login_password'
};

(async () => {
  const iPhone = puppeteer.KnownDevices['iPhone 6'];

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    devtools: true,
    ignoreHTTPSErrors: true,
    defaultViewport: {
      width: 375,
      height: 667,
      isMobile: true,
    }
  });
  const page = await browser.newPage();
  await page.emulate(iPhone);
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const url = request.url().toLowerCase();
    if (url.includes('kaios-d.facebook.com')) {
      console.log(request.method() + ' Request:', url);
    }

    if (
      url.endsWith('.css')
      || url.endsWith('.js')
      || url.endsWith('.png')
      || url.endsWith('.woff2')
      || url.includes('td.doubleclick.net')
      || url.includes('1.fna.fbcdn.net')
      || url.includes('google.com')
      || url.includes('google.rs')
      || url.includes('weblite_load_logging')
      || url.includes('data:image/')
      || url.includes('.jpg')
      || url.includes('.png')
    ) {
      request.continue();
      return;
    }
    console.log(request.method() + ' Request:', url);
    request.continue();
  });

   // Обработчик события для ответов
   page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();
    if (
      url.endsWith('.css')
      || url.endsWith('.js')
      || url.endsWith('.png')
      || url.endsWith('.woff2')
      || url.includes('td.doubleclick.net')
      || url.includes('1.fna.fbcdn.net')
      || url.includes('google.com')
      || url.includes('google.rs')
      || url.includes('weblite_load_logging')
      || url.includes('data:image/')
      || url.includes('.jpg')
      || url.includes('.png')
    ) {
      return;
    }

    try {
      const data = await response.json();
      console.log(`Ответ от ${url} со статусом ${status}:`, data);
    } catch (error) {
      console.log(`Ответ от ${url} со статусом ${status}, но не JSON.`);
    }
  });

  let login = async () => {
    await page.goto('https://m.facebook.com', {
      waitUntil: 'networkidle2'
    });
    console.log('waiting for login');
    await page.waitForSelector(ID.login);
    await page.type(ID.login, CRED.user);
    await page.type(ID.pass, CRED.pass);
    await sleep(500);
    await page.keyboard.press('Enter');
    await sleep(500);

    console.log("login done");
    await page.waitForNavigation();
  }

  await login();
  await sleep(500);
  await page.screenshot({
    path: 'login.png'
  });

  await page.goto('https://m.facebook.com');

  await sleep(500);
  await page.screenshot({ path: 'screenshot.png' });
  await sleep(60000);
  await browser.close();
})();