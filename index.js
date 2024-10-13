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

  const client = await page.target().createCDPSession();
  await client.send("Network.enable");  // Must enable network.
  await client.send("Network.setBypassServiceWorker", { bypass: true });
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const url = request.url().toLowerCase();
    if (url.includes('kaios-d.facebook.com')) {
      console.log(request.method() + ' Request:', url);
    }
    // if (url.includes('wss')) {
      // console.log(request.method() + ' Request:', url);
    // }
    request.continue();
    // if (!url.includes('wss')) {
    //   if (
    //     url.endsWith('.css')
    //     || url.endsWith('.js')
    //     || url.endsWith('.png')
    //     || url.endsWith('.woff2')
    //     || url.includes('td.doubleclick.net')
    //     || url.includes('1.fna.fbcdn.net')
    //     || url.includes('google.com')
    //     || url.includes('google.rs')
    //     || url.includes('weblite_load_logging')
    //     || url.includes('data:image/')
    //     || url.includes('.jpg')
    //     || url.includes('.png')
    //   ) {
    //     request.continue();
    //     return;
    //   }
    // }
    // console.log(request.method() + ' Request:', url);
    // request.continue();
  });

   // Обработчик события для ответов
   page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();
    if (url.includes('wss')) {
      try {
        // Попытка получить тело ответа (если это JSON)
        const data = await response.json();
        console.log(`Ответ от ${url} со статусом ${status}:`, data);
      } catch (error) {
        console.log(`Ответ от ${url} со статусом ${status}, но не JSON.`);
      }
    }
    //   if (
    //     url.endsWith('.css')
    //     || url.endsWith('.js')
    //     || url.endsWith('.png')
    //     || url.endsWith('.woff2')
    //     || url.includes('td.doubleclick.net')
    //     || url.includes('1.fna.fbcdn.net')
    //     || url.includes('google.com')
    //     || url.includes('google.rs')
    //     || url.includes('weblite_load_logging')
    //     || url.includes('data:image/')
    //     || url.includes('.jpg')
    //     || url.includes('.png')
    //   ) {
    //     return;
    //   }
    // }
  });

  let login = async () => {
    // login
    await page.goto('https://m.facebook.com', {
      waitUntil: 'networkidle2'
    });
    console.log('waiting for login');
    await page.waitForSelector(ID.login);
    console.log(CRED.user);
    console.log(ID.login);
    await page.type(ID.login, CRED.user);
    await page.type(ID.pass, CRED.pass);
    // await page.keyboard.press('Enter');
    await sleep(500);
    await page.keyboard.press('Enter');
    await sleep(500);

    // await page.click("#loginbutton")

    console.log("login done");
    await page.waitForNavigation();
  }

  await login();
  await sleep(500);
  await page.screenshot({
    path: 'login.png'
  });

//   [
//     "c_user=1337013376",
//     "presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1730116940172%2C%22v%22%3A1%7D",
//     "wd=368x630",
//     "dpr=2.0000000298023224",
//     "locale=en_US",
//     "fbl_st=100733938%3BT%3A28835282",
//     "vpd=v1%3B630x368x2.0000000298023224",
//     "wl_cbv=v2%3Bclient_version%3A2656%3Btimestamp%3A1730116942"
// ]

  // await page.setCookie(
  //   {
  //     name: 'c_user',
  //     value: '1337013376',
  //     domain: 'https://www.facebook.com',
  //   },
  //   {
  //     name: 'presence',
  //     value: 'C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1730116940172%2C%22v%22%3A1%7D',
  //     domain: 'https://www.facebook.com',
  //   },
  //   {
  //     name: 'wd',
  //     value: '368x630',
  //     domain: 'https://www.facebook.com',
  //   },
  //   {
  //     name: 'dpr',
  //     value: '2.0000000298023224',
  //     domain: 'https://www.facebook.com',
  //   },
  //   {
  //     name: 'locale',
  //     value: 'en_US',
  //     domain: 'https://www.facebook.com',
  //   },
  //   {
  //     name: 'fbl_st',
  //     value: '100733938%3BT%3A28835282',
  //     domain: 'https://www.facebook.com',
  //   },
  //   {
  //     name: 'vpd',
  //     value: 'v1%3B630x368x2.0000000298023224',
  //     domain: 'https://www.facebook.com',
  //   },
  //   {
  //     name: 'wl_cbv',
  //     value: 'v2%3Bclient_version%3A2656%3Btimestamp%3A1730116942',
  //     domain: 'https://www.facebook.com',
  //   }
  // );

  await page.goto('https://m.facebook.com');

  // await page.evaluate(() => {
  //   window.localStorage.setItem('CacheStorageVersion', '3b');
  //   window.localStorage.setItem('PropertiesStore_v02', 'DwECACQ5MjQzNWRiYi01OTY0LTVmMGQtODczMS1hZGVkNTU0M');
  //   window.localStorage.setItem('Session', 'io9a1q:1730116977526');
  //   window.localStorage.setItem('ares_last_signal_flush', '1726481077554');
  //   window.localStorage.setItem('armadillo_msgr_data_loss_stats', '{}');
  //   window.localStorage.setItem('armadillo_msgr_local_takeover', 'hino6k');
  //   window.localStorage.setItem('armadillo_msgr_mutex', 'hino6k');
  //   window.localStorage.setItem('banzai:last_storage_flush', '1730116940059');
  //   window.localStorage.setItem('bdz_playback_state', '{"session_key":"m14u999u","buffer_length":60}');
  //   window.localStorage.setItem(
  //     'falco_queue_critical^$1337013376^#1337013376^#^#hmac.AR0quqUKQh_Ga4anu_Xba8PzjZg7DpptGA-FuhP6GVcjYilp^$fd6b3d49177aea119',
  //     "{\"items\":[{\"name\":\"web_time_spent_navigation\",\"policy\":{\"r\":1},\"time\":1730116942267.9502,\"extra\":\"{\\\"cause\\\":\\\"unload\\\",\\\"custom_data_json\\\":\\\"{\\\\\\\"source_pa\\\\\\\":\\\\\\\"{\\\\\\\\\\\\\\\"0\\\\\\\\\\\\\\\":{\\\\\\\\\\\\\\\"bookmark_id\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"4748854339\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"bookmark_type_name\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"session\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"io9a1q:3xt5i0:hino6k\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"subsession\\\\\\\\\\\\\\\":1,\\\\\\\\\\\\\\\"tap_point\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"via_cold_start\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"timestamp\\\\\\\\\\\\\\\":1730116936168,\\\\\\\\\\\\\\\"trace_policy\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"comet.home\\\\\\\\\\\\\\\"}}\\\\\\\",\\\\\\\"source_pav2\\\\\\\":\\\\\\\"CometHomeRoot.react,comet.home,via_cold_start,1730116936168,654723,4748854339,,\\\\\\\",\\\\\\\"source_uri\\\\\\\":\\\\\\\"/\\\\\\\",\\\\\\\"source_imp_id\\\\\\\":\\\\\\\"0li3cF1O1803It3LM\\\\\\\",\\\\\\\"source_visitation_id\\\\\\\":\\\\\\\"comet.home:hino6k:1:1730116936.169\\\\\\\"}\\\",\\\"sid_raw\\\":\\\"io9a1q:3xt5i0:hino6k\\\",\\\"source_path\\\":\\\"comet.home\\\"}\",\"tags\":[1,128],\"sessionId\":\"io9a1q:3xt5i0:hino6k\",\"deviceId\":\"$^|Acb2J-ia3LWkA67_PQVz6zS2wkVho8PLQWYJwLEYV-E3n5ay2uWSMJDAu65NsW2W20NZ6Ce8lwIQifaGUvH_tN2sIX2dbiw|fd.AcY_0xI8Ga_F1RJXZVoCR0B3YN5LEoHPIu9YiRKukfZAQkPx35F69JQbOboPXy9IQkSocEsXkZ9a8rvVcV3WGJhO\"},{\"name\":\"web_time_spent_bit_array\",\"policy\":{\"r\":1},\"time\":1730116942268.1501,\"extra\":\"{\\\"sid_raw\\\":\\\"io9a1q:3xt5i0:hino6k\\\",\\\"start_endpoint\\\":\\\"comet.home\\\",\\\"start_time\\\":1730116936,\\\"tos_array\\\":[3,0],\\\"tos_cum\\\":2,\\\"tos_id\\\":\\\"hino6k\\\",\\\"tos_len\\\":7,\\\"tos_seq\\\":0}\",\"tags\":[1,128],\"sessionId\":\"io9a1q:3xt5i0:hino6k\",\"deviceId\":\"$^|Acb2J-ia3LWkA67_PQVz6zS2wkVho8PLQWYJwLEYV-E3n5ay2uWSMJDAu65NsW2W20NZ6Ce8lwIQifaGUvH_tN2sIX2dbiw|fd.AcY_0xI8Ga_F1RJXZVoCR0B3YN5LEoHPIu9YiRKukfZAQkPx35F69JQbOboPXy9IQkSocEsXkZ9a8rvVcV3WGJhO\"}],\"ts\":1730116942527}")

  //   window.localStorage.setItem('hb_timestamp', '1730116939540');
  //   window.localStorage.setItem('last_headload_time', '1730116936615');
  //   window.localStorage.setItem('mw_encrypted_backups_restore_upsell_first_impression_time_key', '1718290411886');
  //   window.localStorage.setItem('mw_worker_ready', '1718736955842');
  //   window.localStorage.setItem('pigeonSession:et', '1730117933237');
  //   window.localStorage.setItem('pigeonSession:id', '15675112670');
  //   window.localStorage.setItem('ps:1524055381:f4f49ef1-a28a-435b-baff-edf7363844aa', "fdfbede6-17da-4514-a3b0-59059aef6a30:1728930803146");
  //   window.localStorage.setItem('ps:61566577616039:07d80ef5-b9d0-455e-bdbf-71cfc5c5cb5a', "f210741a-4348-4404-8e2c-8f3cfac080c1:1729241271973");
  //   window.localStorage.setItem('ps:100003053666312:aef9966f-109e-4e7c-9060-b4f2c89a40e2', "d226af92-5dc3-416a-9d76-2b1fda08d52b:1728982596509");
  //   window.localStorage.setItem('signal_flush_timestamp', '1730116939677');
  //   window.localStorage.setItem('_cs_viewer', '1337013376');
  //   window.localStorage.setItem('_oz_bandwidthAndTTFBSamples', "{\"b\":[{\"b\":218400,\"s\":1729241840850,\"t\":27},{\"b\":261976,\"s\":1729241854932,\"t\":33},{\"b\":144831,\"s\":1729241854985,\"t\":39},{\"b\":233990,\"s\":1729247120646,\"t\":24},{\"b\":144831,\"s\":1729247120678,\"t\":21}],\"t\":[{\"s\":1729247120644,\"t\":10.5,\"l\":11.099999994039536,\"b\":826},{\"s\":1729247120655,\"t\":10,\"l\":29.099999994039536,\"b\":361889},{\"s\":1729247120678,\"t\":10.599999994039536,\"l\":17.5,\"b\":144831},{\"s\":1729247120708,\"t\":11.099999994039536,\"l\":12,\"b\":14575},{\"s\":1729247120724,\"t\":10.200000017881393,\"l\":10.700000017881393,\"b\":14575}]}");
  //   window.localStorage.setItem('_oz_bandwidthEstimate', '55772198');
  // });
  // await page.goto('https://m.facebook.com');

  await sleep(500);
  await page.screenshot({ path: 'screenshot.png' });
  await sleep(60000);
  // await browser.close();
})();