import https from 'https';

function checkUrl(urlPath) {
  return new Promise((resolve) => {
    https.get(`https://dkfloor.co.kr${urlPath}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          path: urlPath,
          status: res.statusCode,
          headers: res.headers,
          bodySnippet: body.substring(0, 300)
        });
      });
    });
  });
}

async function test() {
  console.log(await checkUrl('/'));
  console.log(await checkUrl('/materials'));
  console.log(await checkUrl('/materials/'));
  console.log(await checkUrl('/login'));
  console.log(await checkUrl('/login/'));
  console.log(await checkUrl('/login.html'));
  console.log(await checkUrl('/admin'));
}

test();
