chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      chrome.tabs.create({ url: "/welcome/welcome.html" });
    }
  });

// バックグラウンドスクリプトでメッセージリスナーを設定
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "LOAD_HTML2CANVAS") {
    // content scriptからのリクエストを処理
    console.log("html2canvasのロードリクエストを受信しました");
    
    // html2canvasをインジェクトするスクリプトを実行
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      files: ['html2canvas.min.js']
    }).then(() => {
      sendResponse({success: true});
    }).catch(error => {
      console.error("html2canvasのロードに失敗:", error);
      sendResponse({success: false, error: error.message});
    });
    
    return true; // 非同期レスポンス用
  }
  
  // ポップアップを開くリクエストを処理
  if (request.action === "OPEN_POPUP") {
    try {
      chrome.action.openPopup()
        .then(() => {
          sendResponse({success: true});
        })
        .catch((error) => {
          console.error("ポップアップを開けませんでした:", error);
          sendResponse({success: false, error: error.message});
        });
    } catch (error) {
      sendResponse({success: false, error: error.message});
    }
    
    return true; // 非同期レスポンス用
  }
});

