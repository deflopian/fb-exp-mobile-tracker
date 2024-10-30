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
  // const iPhone = puppeteer.KnownDevices['iPhone 6'];
  const withLogin = false;
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    devtools: false,
    ignoreHTTPSErrors: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
      isMobile: false,
    }
  });
  const page = await browser.newPage();
  // await page.emulate(iPhone);
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const url = request.url().toLowerCase();
    const headers = request.headers();
    let updateObjHeaders = null;
    let updateObjParams = null;
    if (url.includes('graphql') && headers['x-fb-friendly-name'] === 'CometMarketplaceSearchContentPaginationQuery') {
      console.log(request.method() + ' Request:', url);
      const removeHeaders = ['referer', 'accept-language'];
      removeHeaders.forEach(header => {
        delete headers[header];
      });
      updateObjHeaders = headers;

      const body = request.postData();
      const params = new URLSearchParams(body);
      updateObjParams = Array.from(params.keys()).reduce((acc, key) => {
        acc[key] = params.get(key);

        if (key === 'variables') {
          acc[key] = JSON.parse(acc[key]);
          delete acc[key].cursor
        }
        return acc;
      }, {});

      if (updateObjHeaders && updateObjParams) {
        const updateObj = {
          headers: updateObjHeaders,
          params: updateObjParams
        }
        console.log(updateObj);
      }
    }

    // if (
    //   url.endsWith('.css')
    //   || url.endsWith('.js')
    //   || url.endsWith('.png')
    //   || url.endsWith('.woff2')
    //   || url.includes('td.doubleclick.net')
    //   || url.includes('1.fna.fbcdn.net')
    //   || url.includes('google.com')
    //   || url.includes('google.rs')
    //   || url.includes('weblite_load_logging')
    //   || url.includes('data:image/')
    //   || url.includes('.jpg')
    //   || url.includes('.png')
    // ) {
    //   request.continue();
    //   return;
    // }
    // console.log(request.method() + ' Request:', url);
    request.continue();
  });

  if (withLogin) {
    let login = async () => {
      await page.goto('https://www.facebook.com/marketplace/nyc/search/?minPrice=0&maxPrice=1000&daysSinceListed=1&sortBy=creation_time_descend&query=couch&exact=false', {
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
  }

  await page.goto('https://www.facebook.com/marketplace/nyc/search/?minPrice=0&maxPrice=1000&daysSinceListed=1&sortBy=creation_time_descend&query=couch&exact=false');

  await sleep(500);
  await page.screenshot({ path: 'screenshot.png' });
  const logging = (name, text) => {
    console.log(name, text);
  }
  page.exposeFunction('logging', logging);

  if (!withLogin) {
    await page.evaluate(() => {
      const formElement = document.getElementById('login_popup_cta_form')
      if (formElement) {
        logging('formElement exists');
        const parent = formElement.parentElement;
        if (parent) {
          logging('parent exists');
          const elementBeforeParent = parent.previousElementSibling;
          if (elementBeforeParent) {
            logging('elementBeforeParent exists');
            const btn = elementBeforeParent.querySelector('[role="button"]');
            if (btn) {
              logging('btn exists');
              btn.click();
            }
          }
        }
      }
    });
  }

  await sleep(500);
  await page.evaluate(() => {
    logging('scrolling');
    window.scrollTo(0, 500);
  });
  await sleep(5000);
  await browser.close();
})();