// バージョンを比較する関数
// '1.10.2' > '1.5.0' のような比較を正しく行います
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  const len = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < len; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

// アップデートをチェックする関数
async function checkUpdate() {
  try {
    // 1秒待ってから実行（ブラウザ起動直後の負荷を避けるため）
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch('https://zsp.yoima.com/version.json', { cache: 'no-cache' });
    if (!response.ok) {
      console.error('ZEN Study Plus: Failed to fetch version.json:', response.status);
      return;
    }
    const data = await response.json();
    const latestVersion = data.version;
    const historyUrl = data.historyUrl;

    const currentVersion = chrome.runtime.getManifest().version;

    if (compareVersions(currentVersion, latestVersion) < 0) {
      // 現在のバージョンが古い場合
      console.log(`ZEN Study Plus: New version available: ${latestVersion}. Current version: ${currentVersion}`);
      
      // アップデート通知ページを開く
      const updatePageUrl = chrome.runtime.getURL('update_notification/update.html');
      chrome.tabs.create({
        url: `${updatePageUrl}?historyUrl=${encodeURIComponent(historyUrl)}&newVersion=${encodeURIComponent(latestVersion)}`
      });
    } else {
      console.log('ZEN Study Plus is up to date.');
    }
  } catch (error) {
    console.error('ZEN Study Plus: Error checking for updates:', error);
  }
}

// 拡張機能のインストール時またはアップデート時にウェルカムページを開く
function openLoginIfNeeded() {
  chrome.storage.local.get('jwt', data => {
    if (!data.jwt) {
      chrome.tabs.create({ url: chrome.runtime.getURL('auth/login.html') });
    }
  });
}

chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    openLoginIfNeeded();
  }
  checkUpdate();
});

// ブラウザ起動時にアップデートをチェック
chrome.runtime.onStartup.addListener(() => {
  openLoginIfNeeded();
  checkUpdate();
});

// ポップアップや他スクリプトからのメッセージを処理するリスナー
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'OPEN_POPUP') {
    chrome.action.openPopup()
      .then(() => sendResponse({ success: true }))
      .catch(error => {
        console.warn('Could not open popup programmatically:', error.message);
        sendResponse({ success: false, error: error.message });
      });
    return true; // 非同期レスポンス
  }
  
  if (message.action === 'LOAD_HTML2CANVAS') {
    if (sender.tab && sender.tab.id) {
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        files: ['html2canvas.min.js']
      })
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    }
    return true; // 非同期レスポンス
  }
});