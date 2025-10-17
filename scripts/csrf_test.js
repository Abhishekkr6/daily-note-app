/*
Simple script to simulate fetching CSRF token and then posting a login request
that includes the CSRF token in both body and `x-csrf-token` header.

Usage:
  node scripts/csrf_test.js https://your-deployed-app.example

This script uses node-fetch@2 and tough-cookie to store and send cookies.
Install dependencies locally in the project before running:
  npm install node-fetch@2 tough-cookie fetch-cookie

NOTE: This script simulates a browser's cookie jar behavior and may help
reproduce cross-origin cookie issues.
*/

const fetch = require('node-fetch');
const tough = require('tough-cookie');
const fetchCookie = require('fetch-cookie');

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node scripts/csrf_test.js <BASE_URL>');
  process.exit(1);
}
const BASE = args[0].replace(/\/+$/, '');

(async () => {
  const jar = new tough.CookieJar();
  const fetchWithCookies = fetchCookie(fetch, jar);

  try {
    console.log('GET', BASE + '/api/csrf-token');
    const res1 = await fetchWithCookies(BASE + '/api/csrf-token', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    });
    const json1 = await res1.json();
    console.log('csrf-token response:', json1);

    // list cookies
    const cookies = await new Promise((resolve, reject) => {
      jar.getCookies(BASE, {}, (err, cookies) => err ? reject(err) : resolve(cookies));
    });
    console.log('Cookies stored:', cookies.map(c => ({ key: c.key, domain: c.domain, path: c.path, secure: c.secure, httpOnly: c.httpOnly, sameSite: c.sameSite })));

    // Now try login (this will obviously fail unless correct creds used)
    const payload = {
      email: 'test@example.com',
      password: 'wrongpassword',
      csrfToken: json1.csrfToken,
    };
    console.log('POST', BASE + '/api/users/login');
    const res2 = await fetchWithCookies(BASE + '/api/users/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': json1.csrfToken,
      },
      body: JSON.stringify(payload),
    });
    const json2 = await res2.json();
    console.log('login response status:', res2.status);
    console.log(json2);
  } catch (err) {
    console.error('Error during test:', err);
  }
})();
