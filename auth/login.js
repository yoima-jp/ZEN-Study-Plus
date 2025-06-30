function apiRequest(endpoint, data) {
  return fetch('https://zsp-api.yoima.com' + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const msg = document.getElementById('message');

  loginBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    apiRequest('/login.php', { username, password })
      .then(data => {
        if (data.token) {
          chrome.storage.local.set({ jwt: data.token }, () => {
            msg.style.color = 'green';
            msg.textContent = 'ログインしました';
          });
        } else {
          msg.textContent = 'ログインに失敗しました';
        }
      })
      .catch(() => { msg.textContent = '通信エラー'; });
  });

  registerBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    apiRequest('/register.php', { username, password })
      .then(data => {
        if (data.ok) {
          msg.style.color = 'green';
          msg.textContent = '登録しました。ログインしてください';
        } else {
          msg.textContent = '登録に失敗しました';
        }
      })
      .catch(() => { msg.textContent = '通信エラー'; });
  });
});
