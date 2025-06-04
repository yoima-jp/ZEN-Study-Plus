// 拡張機能の初期化状態を追跡
let zenStudyPlusInitialized = false;
let initializationAttempts = 0;
const MAX_INITIALIZATION_ATTEMPTS = 10;

// URLをチェックして条件に合致したら拡張機能を初期化
function checkAndInitializeZenStudyPlus() {
  if (window.location.href.includes('https://www.nnn.ed.nico/study_plans/month/')) {
    // 条件に合致するURLの場合は、再試行回数に関わらず常に初期化を試みる
    zenStudyPlusInitialized = false;
    initializeZenStudyPlus();
  }
}

// 拡張機能を初期化する関数
function initializeZenStudyPlus() {
  if (!zenStudyPlusInitialized && initializationAttempts < MAX_INITIALIZATION_ATTEMPTS) {
    initializationAttempts++;
    
    // 即時関数でメイン処理を実行する関数を定義
    function initializeExtension() {
      // 1. html2canvas を動的に読み込む - CSP対応版
      function loadDependencies(callback) {
        // CSP対策: 外部CDN読み込みをやめ、内部実装を使用
        
        // スタイルシートの追加
        const style = document.createElement('style');
        style.textContent = `
          .elegant-share-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #0077d3;
            color: white;
            border: none;
            border-radius: 20px;
            padding: 6px 14px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 119, 211, 0.25);
            display: flex;
            align-items: center;
            gap: 6px;
            z-index: 9999;
          }
          
          .elegant-share-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 10px rgba(0, 119, 211, 0.3);
            background: #0088f0;
          }
          
          .elegant-share-btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0, 119, 211, 0.2);
          }
          
          .elegant-share-btn span {
            margin-left: 3px;
          }
          
          .share-tooltip {
            position: absolute;
            top: 48px;
            right: 0;
            background: white;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            display: none;
            flex-direction: column;
            gap: 8px;
            width: 180px;
            z-index: 10000;
            border: 1px solid #eee;
          }
          
          .share-tooltip button {
            display: flex;
            align-items: center;
            gap: 8px;
            background: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;
            font-size: 14px;
            color: #333;
          }
          
          .share-tooltip button:hover {
            background: #f5f5f5;
          }
          
          .share-success {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #44db6c;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 10001;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          /* アイコン代替クラス */
          .icon-share:before { content: "↗"; }
          .icon-download:before { content: "↓"; }
          .icon-copy:before { content: "⎘"; }
          .icon-check:before { content: "✓"; }
          .icon-spinner:before { content: "⟳"; }
          .icon-error:before { content: "⚠"; }
          
          /* スピンアニメーション */
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .icon-spinner {
            display: inline-block;
            animation: spin 1s linear infinite;
          }
        `;
        document.head.appendChild(style);
        
        // html2canvasライブラリをページに追加（CSP対応）
        if (!window.html2canvas) {
          // バックグラウンドスクリプトからhtml2canvasを実行する方法
          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            // 拡張機能コンテキストでのみ使用可能
            chrome.runtime.sendMessage({
              action: "LOAD_HTML2CANVAS"
            }, function(response) {
              if (response && response.success) {
                callback();
              } else {
                showSimpleShareUI();
                callback();
              }
            });
          } else {
            // フォールバック: シンプルな共有UIで代替
            showSimpleShareUI();
            callback();
          }
        } else {
          callback();
        }
      }
      
      // CSP制限に対応したシンプルな共有UI
      function showSimpleShareUI() {
        window.html2canvas = function(el, options) {
          // ダミー実装
          return Promise.reject(new Error("html2canvas is not available due to CSP restrictions"));
        };
      }
      
      // 2. ターゲット要素に「共有」ボタンを追加
      function addShareButtons() {
        // セレクター更新 - 提供されたHTMLに基づく
        const selectorParent = '.sc-imWYAI.dCtEov';
        const selectorChild = 'div.sc-gFqAkR.gtBwtj.sc-11kdijq-0.kOBuPI';
        
        // 複数の異なるセレクター組み合わせを試す
        const selectors = [
          `${selectorParent} ${selectorChild}`,
          '.dCtEov .kOBuPI',
          'div[class*="sc-gFqAkR"][class*="kOBuPI"]',
          'div[class*="sc-11kdijq-0"]',
          'div:has(h3:contains("レポート"))'
        ];
        
        let targets = [];
        for (const selector of selectors) {
          try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              targets = elements;
              break;
            }
          } catch (e) {
            // エラー処理をスキップ
          }
        }
        
        // 直接h3を探してその親要素を特定する代替アプローチ
        if (targets.length === 0) {
          document.querySelectorAll('h3').forEach(h3 => {
            if (h3.textContent.includes('月のレポート') || h3.textContent.includes('年次レポート進捗')) {
              // 親要素を4段階上までさかのぼって検索
              let parent = h3.parentElement;
              for (let i = 0; i < 4; i++) {
                if (parent) {
                  parent = parent.parentElement;
                  if (parent && parent.className.includes('kOBuPI')) {
                    targets = [parent];
                    break;
                  }
                }
              }
            }
          });
        }
        
        targets.forEach((el, index) => {
          // 文字列フィルタリング：「レポート」が含まれないならスキップ
          if (!el.textContent.includes('レポート')) {
            return;
          }
          
          // 既にボタンがあればスキップ
          if (el.querySelector('.elegant-share-btn')) {
            return;
          }
          
          // 親を relative に
          if (getComputedStyle(el).position === 'static') {
            el.style.position = 'relative';
          }
          
          // 共有ボタンの作成 - Font Awesomeの代わりにUnicodeシンボル使用
          const btn = document.createElement('button');
          btn.className = 'elegant-share-btn';
          btn.innerHTML = '<span class="icon-share"></span> <span>共有</span>';
          el.appendChild(btn);
          
          // ツールチップの作成 - Font Awesomeの代わりにUnicodeシンボル使用
          const tooltip = document.createElement('div');
          tooltip.className = 'share-tooltip';
          tooltip.innerHTML = `
            <button class="download-btn"><span class="icon-download"></span> 画像として保存</button>
            <button class="copy-btn"><span class="icon-copy"></span> クリップボードにコピー</button>
          `;
          btn.appendChild(tooltip);
          
          // 通知の作成
          const notification = document.createElement('div');
          notification.className = 'share-success';
          notification.style.opacity = '0';
          document.body.appendChild(notification);
          
          // ボタンクリックでツールチップの表示/非表示
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = tooltip.style.display === 'flex';
            tooltip.style.display = isVisible ? 'none' : 'flex';
          });
          
          // 外部クリックでツールチップを閉じる
          document.addEventListener('click', () => {
            tooltip.style.display = 'none';
          });
          
          // 画像として保存ボタン
          tooltip.querySelector('.download-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            tooltip.style.display = 'none';
            captureAndProcess(el, 'download');
          });
          
          // クリップボードにコピーボタン
          tooltip.querySelector('.copy-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            tooltip.style.display = 'none';
            captureAndProcess(el, 'copy');
          });
        });
      }
      
      // 3. キャプチャと処理を実行
      function captureAndProcess(el, action) {
        // 共有ボタンを一時的に非表示
        const shareBtn = el.querySelector('.elegant-share-btn');
        const originalDisplay = shareBtn.style.display;
        shareBtn.style.display = 'none';
        
        // ロード中の表示 - Font Awesomeの代わりにUnicodeシンボル使用
        const notification = document.querySelector('.share-success');
        notification.innerHTML = '<span class="icon-spinner"></span> 処理中...';
        notification.style.backgroundColor = '#6366f1';
        notification.style.opacity = '1';
        
        // 要素内の画像ロード待ち
        const imgs = Array.from(el.querySelectorAll('img'));
        const imgPromises = imgs.map(img => img.complete
          ? Promise.resolve()
          : new Promise(res => { img.onload = img.onerror = res; })
        );
        
        Promise.all(imgPromises).then(() => {
          // html2canvasが利用可能か確認
          if (typeof html2canvas !== 'function') {
            notification.innerHTML = '<span class="icon-error"></span> スクリーンショット機能を利用できません';
            notification.style.backgroundColor = '#ef4444';
            setTimeout(() => { notification.style.opacity = '0'; }, 3000);
            return;
          }
          
          html2canvas(el, {
            useCORS: true,
            allowTaint: false,
            backgroundColor: null,
            scale: window.devicePixelRatio,
            ignoreElements: node => node.classList && 
              (node.classList.contains('elegant-share-btn') || 
               node.classList.contains('share-tooltip'))
          }).then(canvas => {
            // 共有ボタンを元に戻す
            shareBtn.style.display = originalDisplay;
            
            if (action === 'download') {
              // ダウンロード処理
              canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'screenshot.png';
                a.click();
                URL.revokeObjectURL(url);
                
                // 成功通知 - Font Awesomeの代わりにUnicodeシンボル使用
                notification.innerHTML = '<span class="icon-check"></span> 画像を保存しました';
                notification.style.backgroundColor = '#10b981';
                
                // 通知を消す
                setTimeout(() => {
                  notification.style.opacity = '0';
                }, 3000);
              });
            } else if (action === 'copy') {
              // クリップボードにコピー
              canvas.toBlob(blob => {
                navigator.clipboard.write([
                  new ClipboardItem({
                    'image/png': blob
                  })
                ]).then(() => {
                  // 成功通知
                  notification.innerHTML = '<span class="icon-check"></span> クリップボードにコピーしました';
                  notification.style.backgroundColor = '#10b981';
                  
                  // 通知を消す
                  setTimeout(() => {
                    notification.style.opacity = '0';
                  }, 3000);
                }).catch(err => {
                  notification.innerHTML = '<span class="icon-error"></span> コピーに失敗しました';
                  notification.style.backgroundColor = '#ef4444';
                  
                  // 通知を消す
                  setTimeout(() => {
                    notification.style.opacity = '0';
                  }, 3000);
                });
              });
            }
          }).catch(err => {
            // 共有ボタンを元に戻す
            shareBtn.style.display = originalDisplay;
            
            notification.innerHTML = '<span class="icon-error"></span> 処理に失敗しました';
            notification.style.backgroundColor = '#ef4444';
            
            // 通知を消す
            setTimeout(() => {
              notification.style.opacity = '0';
            }, 3000);
          });
        });
      }
      
      // 実行
      loadDependencies(() => {
        addShareButtons();
      });
      
      // 動的要素追加時用
      window.addElementShareButtons = addShareButtons;
    }
    
    // DOMContentLoaded イベントが既に発火していた場合の対応
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeExtension);
    } else {
      initializeExtension();
      
      // 要素が見つかったら初期化完了としてフラグを設定
      if (document.querySelector('.elegant-share-btn')) {
        zenStudyPlusInitialized = true;
      } else {
        // 要素が見つからない場合は、少し遅延して再試行
        setTimeout(() => {
          if (!zenStudyPlusInitialized) {
            initializeZenStudyPlus();
          }
        }, 1000);
      }
    }
    
    // MutationObserver設定
    const observer = new MutationObserver(mutations => {
      if (window.addElementShareButtons) {
        window.addElementShareButtons();
      }
    });
    
    // 監視設定
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// 初期チェック - ページ読み込み完了時に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndInitializeZenStudyPlus);
} else {
  checkAndInitializeZenStudyPlus();
}

// 完全読み込み後にも確認
window.addEventListener('load', checkAndInitializeZenStudyPlus);

// URL変更イベントを監視
window.addEventListener('popstate', checkAndInitializeZenStudyPlus);
window.addEventListener('hashchange', checkAndInitializeZenStudyPlus);

// SPA対応（シングルページアプリケーション）
const originalPushState = history.pushState;
history.pushState = function() {
  originalPushState.apply(this, arguments);
  checkAndInitializeZenStudyPlus();
};

const originalReplaceState = history.replaceState;
history.replaceState = function() {
  originalReplaceState.apply(this, arguments);
  checkAndInitializeZenStudyPlus();
};

// 定期的なチェック - SPAでURLが変わっても検出できるように
setInterval(checkAndInitializeZenStudyPlus, 2000);
