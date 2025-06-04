let includeMoviePlus = false;
let autoHideNPlus = false;
let darkMode = false;
let enableVideoEndSound = false;
let discordWebhook = '';
let intervalID = null;
let watchingVideo = false;
let videoEndNotified = false;
let notificationAudio = new Audio(chrome.runtime.getURL('audio/notification.mp3'));
let currentVideoTitle = null; // 動画タイトルを保存する変数

// ダークモードの処理をここに直接書きます
function applyDarkMode() {
  function updateStyles(colorMap, shadowMap) {
    // メインドキュメントのスタイルを更新
    applyStyles(document, colorMap, shadowMap);

    // iframe内のスタイルを更新
    document.querySelectorAll('iframe').forEach(iframe => {
        try {
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            applyStyles(iframeDocument, colorMap, shadowMap);
            updateIframeStyles(iframeDocument, colorMap, shadowMap);
        } catch (e) {
            
        }
    });
}

function updateIframeStyles(doc, colorMap, shadowMap) {
    doc.querySelectorAll('iframe').forEach(iframe => {
        try {
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            applyStyles(iframeDocument, colorMap, shadowMap);
            updateIframeStyles(iframeDocument, colorMap, shadowMap);
        } catch (e) {
            
        }
    });
}

function applyStyles(doc, colorMap, shadowMap) {
    const elements = doc.querySelectorAll('*');
    elements.forEach(element => {
        // "sc-aXZVg kLYaYr" クラスを持つ要素はスキップ
        if (element.classList.contains('sc-aXZVg') && element.classList.contains('kLYaYr')) {
            return;
        }

        const computedStyle = getComputedStyle(element);

        // 背景色、テキスト色、ボーダー色を更新
        ["backgroundColor", "color", "borderColor", "borderBottomColor"].forEach(styleProp => {
            const currentColor = computedStyle[styleProp];
            if (colorMap[currentColor]) {
                element.style[styleProp] = colorMap[currentColor];
            }
        });

        // ボックスシャドウを更新
        const currentShadow = computedStyle.boxShadow;
        if (currentShadow) {
            Object.keys(shadowMap).forEach(oldShadow => {
                if (currentShadow.includes(oldShadow)) {
                    element.style.boxShadow = currentShadow.replace(oldShadow, shadowMap[oldShadow]);
                }
            });
        }
    });
}


// 色のマッピング
const colorMap = {
    "rgb(241, 241, 241)": "rgb(35, 35, 35)",    // #f1f1f1 → #232323
    "rgb(34, 34, 34)": "rgb(242, 242, 242)",    // #222 → #f2f2f2
    "rgb(255, 255, 255)": "rgb(35, 35, 35)",    // 白 → #232323
    "rgb(0, 0, 0)": "rgb(242, 242, 242)",       // 黒 → #f2f2f2
    "rgb(34, 34, 34)": "rgb(242, 242, 242)",    // 明確に処理
    "rgb(96, 96, 96)": "rgb(242, 242, 242)",    // rgb(96, 96, 96) → #f2f2f2
    "rgb(0, 0, 102)": "rgb(0, 119, 211)",       // rgb(0, 0, 102) → rgb(147, 161, 255)
    "rgb(85, 85, 85)": "rgb(200, 200, 200)" ,    // rgb(85, 85, 85) → rgb(200, 200, 200)
    "rgb(246, 246, 246)": "rgb(35, 35, 35)",     // rgb(246, 246, 246) → rgb(35, 35, 35)
    "rgb(51, 51, 51)": "rgb(200, 200, 200)",      // rgb(51, 51, 51) → rgb(200, 200, 200)
    "rgb(233, 233, 233)": "rgb(65, 65, 65)",      // rgb(233, 233, 233) → rgb(65, 65, 65)
    "rgb(130, 130, 130)": "rgb(200, 200, 200)",   // rgb(130, 130, 130) → rgb(200, 200, 200)
    "rgb(255, 250, 188)": "rgb(63, 63, 63)",
    "rgb(234, 248, 253)": "rgb(63, 63, 63)",
    "rgb(255, 249, 235)": "rgb(63, 63, 63)",
    
};

// シャドウのマッピング
const shadowMap = {
    "rgba(0, 0, 0, 0.2) 0px 0px 2px 0px": "rgb(255 255 255 / 20%) 0px 0px 2px 0px",
    "rgba(0, 0, 0, 0.1) 0px 1px 1px 0px": "rgb(255 255 255 / 10%) 0px 1px 1px 0px"
};

// スタイルを一括更新
updateStyles(colorMap, shadowMap);
}

function updateCountAndTime() {
  const videoElements = document.querySelectorAll('li.sc-aXZVg.sc-gEvEer');
  const testElements = document.querySelectorAll('svg[type="exercise-rounded"]');
  let videoCount = 0;
  let testCount = 0;
  let totalQuestions = 0;
  let totalDuration = 0;
  videoElements.forEach(element => {
    const watchedLabel = element.querySelector('div.sc-aXZVg.JyFzy');
    const icon = element.querySelector('svg.sc-1kjz3de-2');
    const durationElement = element.querySelector('div.sc-aXZVg.iuHQbN');
    if (watchedLabel && watchedLabel.textContent.includes('視聴済み')) {
      return;
    }
    if (icon) {
      const iconType = icon.getAttribute('type');
      // 動画をカウントする条件
      if (iconType === 'movie-rounded' || (iconType === 'movie-rounded-plus' && includeMoviePlus)) {
        const iconStyle = icon.style.color;
        if (iconStyle !== 'rgb(0, 197, 65)') {
          videoCount++;
          // 動画の再生時間を合計する
          if (durationElement) {
            const durationText = durationElement.textContent.trim();
            const [minutes, seconds] = durationText.split(':').map(Number);
            const durationInSeconds = (minutes * 60) + seconds;
            totalDuration += durationInSeconds;
          }
        }
      }
    }
  });
  testElements.forEach(element => {
    const parentLi = element.closest('li.sc-aXZVg.sc-gEvEer');
    const questionCountElement = parentLi.querySelector('div.sc-aXZVg.iFkSEV');
    // テストの進捗が完了していない場合のみカウント
    if (element.getAttribute('fill') === '#00c541' || element.getAttribute('color') === '#00c541') {
      return;
    }
    if (questionCountElement) {
      const questionText = questionCountElement.textContent.trim();
      const questionCount = parseInt(questionText.replace('問', ''), 10);
      if (!isNaN(questionCount)) {
        testCount++;
        totalQuestions += questionCount;
      }
    }
  });

  // URLからコース情報を抽出
  const currentUrl = window.location.href;
  const courseMatch = currentUrl.match(/\/courses\/(\d+)\/chapters\/(\d+)/);
  
  if (courseMatch) {
    const courseInfo = `${courseMatch[1]}/chapters/${courseMatch[2]}`;
    const totalMinutes = Math.floor(totalDuration / 60);
    const totalSeconds = totalDuration % 60;
    
    // コース情報と統計を保存
    chrome.storage.sync.get('courseHistory', function(result) {
      let courseHistory = result.courseHistory || {};
      
      courseHistory[courseInfo] = {
        url: currentUrl,
        title: document.title || 'コース',
        videoTime: `${totalMinutes}分${totalSeconds}秒`,
        videoCount: videoCount,
        testCount: testCount,
        questionCount: totalQuestions,
        timestamp: new Date().toISOString()
      };
      
      chrome.storage.sync.set({ courseHistory: courseHistory });
    });
  }

  // ストレージから設定を取得して表示する内容を決定
  chrome.storage.sync.get(['showVideoTime', 'showVideoCount', 'showTestCount', 'showQuestionCount'], function(result) {
    if (chrome.runtime.lastError) {
      console.error('Error retrieving settings:', chrome.runtime.lastError);
      return;
    }

    const totalMinutes = Math.floor(totalDuration / 60);
    const totalSeconds = totalDuration % 60;
    const newElement = document.createElement('div');
    newElement.style.marginTop = '10px';

    // 各項目を条件に応じて表示
    if (result.showVideoTime) {
      newElement.textContent += `動画時間: ${totalMinutes}分${totalSeconds}秒 `;
    }
    if (result.showVideoCount) {
      newElement.textContent += `動画数: ${videoCount} `;
    }
    if (result.showTestCount) {
      newElement.textContent += `テスト数: ${testCount} `;
    }
    if (result.showQuestionCount) {
      newElement.textContent += `問題数: ${totalQuestions}`;
    }
    const existingElement = document.getElementById('countAndTime');
    if (existingElement) {
      existingElement.innerHTML = `${newElement.outerHTML}`;
    } else {
      const parentElement = document.querySelector('.sc-aXZVg.elbZCm');
      if (parentElement) {
        const combinedElement = document.createElement('div');
        combinedElement.id = 'countAndTime';
        combinedElement.innerHTML = `${newElement.outerHTML}`;
        parentElement.appendChild(combinedElement);
      }
    }
    
    // コースリンクに残り時間情報を追加
    addRemainingTimeToLinks();
  });

  // Nプラス教材自動非表示の設定が有効な場合、ボタンをクリック
  if (autoHideNPlus) {
    let button1 = Array.from(document.querySelectorAll('button')).find(el => el.textContent === '必修教材のみ');
    let button2 = Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Nプラス教材のみ');

    let isButton2Blue = false;

    if (button2) {
        // "テスト"ボタンの背景色を取得
        let style2 = getComputedStyle(button2);
        let backgroundColor2 = style2.backgroundColor;

        // "テスト"ボタンの背景色が青色かどうかをチェック
        isButton2Blue = backgroundColor2 === 'rgb(0, 119, 211)';
    }

    if (button1 && !isButton2Blue) {
        // "必修教材のみ"ボタンの背景色を取得
        let style1 = getComputedStyle(button1);
        let backgroundColor1 = style1.backgroundColor;

        // "必修教材のみ"ボタンの背景色が青色でない場合はクリック
        if (backgroundColor1 !== 'rgb(0, 119, 211)') {
            button1.click(); // ボタンをクリック
        }
    }
  }

  // ダークモードが有効な場合、applyDarkModeを呼び出す
  if (darkMode) {
    applyDarkMode();
  }
  
  // 動画視聴完了の検出
  checkVideoCompletion();
}

// 動画視聴完了を検出する関数
function checkVideoCompletion() {
  // メインドキュメントの動画プレーヤーをチェック
  checkVideoCompletionInDocument(document);
  
  // iframe内の動画プレーヤーをチェック
  document.querySelectorAll('iframe').forEach(iframe => {
    try {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      checkVideoCompletionInDocument(iframeDocument);
      
      // ネストされたiframeも再帰的にチェック
      checkNestedIframes(iframeDocument);
    } catch (e) {
      // クロスオリジンiframeへのアクセスではエラーが発生することがあるため無視
    }
  });
}

// 指定されたドキュメント内の動画プレーヤーをチェックする関数
function checkVideoCompletionInDocument(doc) {
  const videoPlayers = doc.querySelectorAll('video');
  
  if (videoPlayers.length > 0) {
    // 動画が検出され、まだ視聴中フラグが立っていない場合 (＝動画開始時)
    if (!watchingVideo) {
      watchingVideo = true;
      videoEndNotified = false; // 新しい動画なので通知フラグをリセット
      // 動画開始時にタイトルを取得・保存
      currentVideoTitle = getVideoTitleFromIframe();
      // 取得できなかった場合のフォールバック
      if (!currentVideoTitle) {
        console.log("iframeから動画タイトルを取得できませんでした。ページタイトルを使用します。");
        currentVideoTitle = document.title || 'タイトルなし';
      }
      console.log("動画タイトルを保存:", currentVideoTitle);
    }
    
    videoPlayers.forEach(videoPlayer => {
      // 動画が終了に近い状態かどうかをチェック
      if (enableVideoEndSound && 
          videoPlayer.currentTime > 0 && 
          videoPlayer.duration > 0 &&
          videoPlayer.currentTime >= videoPlayer.duration - 0.5 && // 0.5秒前
          !videoEndNotified) {
        
        // 通知音を再生
        notificationAudio.play()
          .then(() => {
            console.log('通知音を再生しました');
            videoEndNotified = true;

            // デスクトップ通知を表示
            if (Notification.permission === 'granted') {
              new Notification('動画が終了しました', {
                body: '次の動画を再生してください。',
                icon: chrome.runtime.getURL('images/notification_icon.png') // アイコンを指定
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                  new Notification('動画が終了しました', {
                    body: '次の動画を再生してください。',
                    icon: chrome.runtime.getURL('images/notification_icon.png')
                  });
                }
              });
            }
            
            // Discord Webhookに通知を送信
            sendDiscordNotification();
          })
          .catch(error => {
            console.error('通知音の再生に失敗しました:', error);
          });
      }
      
      // 動画が始めから再生された場合、通知フラグをリセット
      if (videoPlayer.currentTime < 1) {
        videoEndNotified = false;
      }
    });
  } else {
    // 動画ページから離れた場合（他の動画がない場合）
    if (watchingVideo && !hasVideoInAnyFrame()) {
      watchingVideo = false;
      videoEndNotified = false;
      // 動画視聴が終わったのでタイトルをリセット
      currentVideoTitle = null;
      console.log("動画視聴終了、タイトルをリセットしました。");
    }
  }
}

// Discord Webhookに通知を送信する関数
function sendDiscordNotification() {
  console.log('Discord通知を送信します。Webhook URL:', discordWebhook ? 'URLあり' : 'URLなし');
  
  if (!discordWebhook || discordWebhook.trim() === '') {
    console.log('Discord Webhook URLが設定されていないため、通知は送信されません');
    return;
  }
  
  // 現在のページタイトルを取得
  let pageTitle = document.title || '動画視聴';
  let cleanedPageTitle = pageTitle;
  if (pageTitle.includes('- ZEN Study')) {
    cleanedPageTitle = pageTitle.replace('- ZEN Study', '').trim();
  }
  pageTitle = cleanedPageTitle;
  
  // 保存されたタイトルを使用
  const videoTitle = currentVideoTitle;
  
  // 説明文を構築
  let description = '';
  description += `**${pageTitle}**\n`;
  
  if (videoTitle) {
    description += `**${videoTitle}**\n`;
  }
  
  description += '次の動画を再生してください。';
  
  // 現在のURLを取得
  const currentUrl = window.location.href;
  
  // Webhookに送信するデータを作成
  const webhookData = {
    content: '動画視聴が完了しました！',
    embeds: [
      {
        title: '動画視聴完了',
        description: description,
        color: 5814783, // 紫色
        fields: [
          {
            name: 'ページURL',
            value: currentUrl
          },
          {
            name: '完了時刻',
            value: new Date().toLocaleString('ja-JP')
          }
        ],
        footer: {
          text: 'ZEN Study Plus'
        }
      }
    ]
  };
  
  console.log('送信するデータ:', JSON.stringify(webhookData));
  
  // Fetch APIを使用してWebhookにPOSTリクエストを送信
  fetch(discordWebhook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(webhookData)
  })
  .then(response => {
    if (response.ok) {
    } else {
      console.error('Discord通知の送信に失敗しました:', response.status);
      return response.text().then(text => console.error('エラー詳細:', text));
    }
  })
  .catch(error => {
    console.error('Discord通知の送信中にエラーが発生しました:', error);
  });
}

// iframe内の特定のヘッダーからタイトルを取得する関数
function getVideoTitleFromIframe() {
  // まず直接ドキュメント内を検索
  const headerElement = document.querySelector('header.sc-aXZVg.iCLTaq h3.sc-1qf3z6b-2.gSFcmh');
  if (headerElement) {
    return headerElement.textContent.trim();
  }
  
  // ドキュメント内に見つからない場合、iframeを検索
  let titleText = null;
  
  function searchInFrames(doc) {
    if (titleText) return; // すでに見つかっている場合は処理をスキップ
    
    doc.querySelectorAll('iframe').forEach(iframe => {
      try {
        if (titleText) return; // すでに見つかっている場合は処理をスキップ
        
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const headerElement = iframeDocument.querySelector('header.sc-aXZVg.iCLTaq h3.sc-1qf3z6b-2.gSFcmh');
        
        if (headerElement) {
          titleText = headerElement.textContent.trim();
        } else {
          // 見つからない場合は、さらにネストされたiframeを検索
          searchInFrames(iframeDocument);
        }
      } catch (e) {
        // クロスオリジンiframeへのアクセスではエラーが発生することがあるため無視
      }
    });
  }
  
  searchInFrames(document);
  return titleText;
}

// ネストされたiframeを再帰的にチェックする関数
function checkNestedIframes(doc) {
  doc.querySelectorAll('iframe').forEach(iframe => {
    try {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      checkVideoCompletionInDocument(iframeDocument);
      checkNestedIframes(iframeDocument);
    } catch (e) {
      // クロスオリジンiframeへのアクセスではエラーが発生することがあるため無視
    }
  });
}

// いずれかのフレームに動画があるかどうかをチェックする関数
function hasVideoInAnyFrame() {
  // メインドキュメントに動画があるかチェック
  if (document.querySelector('video')) {
    return true;
  }
  
  // iframe内に動画があるかチェック
  let hasVideo = false;
  
  function checkFramesForVideos(doc) {
    doc.querySelectorAll('iframe').forEach(iframe => {
      try {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDocument.querySelector('video')) {
          hasVideo = true;
        } else {
          checkFramesForVideos(iframeDocument);
        }
      } catch (e) {
        // クロスオリジンiframeへのアクセスではエラーが発生することがあるため無視
      }
    });
  }
  
  checkFramesForVideos(document);
  return hasVideo;
}

// 設定変更を受け取る
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'settingChanged') {
    includeMoviePlus = message.includeMoviePlus;
    updateCountAndTime();
  } else if (message.type === 'autoHideNPlusChanged') {
    autoHideNPlus = message.autoHideNPlus;
    updateCountAndTime();
  } else if (message.type === 'darkModeChanged') {
    darkMode = message.darkMode;
    updateCountAndTime();
  } else if (message.type === 'videoEndSoundChanged') {
    enableVideoEndSound = message.enableVideoEndSound;
    // 設定変更時に通知フラグをリセット
    videoEndNotified = false;
  } else if (message.type === 'settingChanged' && message.discordWebhook !== undefined) {
    discordWebhook = message.discordWebhook;
  }
});

// 初期設定を読み込む
chrome.storage.sync.get(['includeMoviePlus', 'autoHideNPlus', 'darkMode', 'enableVideoEndSound', 'discordWebhook'], function(result) {
  includeMoviePlus = result.includeMoviePlus || false;
  autoHideNPlus = result.autoHideNPlus || false;
  darkMode = result.darkMode || false;
  enableVideoEndSound = result.enableVideoEndSound || false;
  discordWebhook = result.discordWebhook || '';
  updateCountAndTime();

  // 既存のインターバルがあれば解除
  if (intervalID) {
    clearInterval(intervalID);
  }

  // ダークモードの場合は100msごと、それ以外は1000msごとに更新
  intervalID = darkMode 
    ? setInterval(updateCountAndTime, 0) 
    : setInterval(updateCountAndTime, 1000);
});

// コースリンクに残り時間情報を表示する関数
function addRemainingTimeToLinks() {
  // 設定を取得
  chrome.storage.sync.get('showRemainingTime', function(result) {
    // 機能が無効の場合は何もしない
    if (result.showRemainingTime === false) {
      return;
    }
    
    // コース一覧ページのリンクを取得
    const courseLinks = document.querySelectorAll('a[href^="/courses/"]');
    
    // 履歴データがあれば処理を実行
    chrome.storage.sync.get('courseHistory', function(result) {
      const courseHistory = result.courseHistory || {};
      
      courseLinks.forEach(link => {
        // リンクからコースIDとチャプターIDを抽出
        const courseMatch = link.getAttribute('href').match(/\/courses\/(\d+)\/chapters\/(\d+)/);
        if (courseMatch) {
          const courseInfo = `${courseMatch[1]}/chapters/${courseMatch[2]}`;
          
          // 履歴にこのコースの情報があるか確認
          if (courseHistory[courseInfo]) {
            const courseData = courseHistory[courseInfo];
            
            // 残り時間表示用の要素を作成または更新
            let remainingTimeElem = link.querySelector('.remaining-time-indicator');
            
            if (!remainingTimeElem) {
              remainingTimeElem = document.createElement('div');
              remainingTimeElem.className = 'remaining-time-indicator';
              remainingTimeElem.style.fontSize = '12px';
              remainingTimeElem.style.color = '#4A90E2';
              remainingTimeElem.style.fontWeight = 'bold';
              remainingTimeElem.style.marginTop = '5px';
              
              // 進捗バーの下に配置
              const progressContainer = link.querySelector('.sc-1ckq7w0-0');
              if (progressContainer) {
                progressContainer.parentNode.insertBefore(remainingTimeElem, progressContainer.nextSibling);
              } else {
                const contentDiv = link.querySelector('.sc-aXZVg.dKubqp.sc-ni8l2q-1.iUHSzE');
                if (contentDiv) {
                  contentDiv.appendChild(remainingTimeElem);
                }
              }
            }
            
            // 残り時間の表示
            const videoTime = courseData.videoTime;
            remainingTimeElem.textContent = `残り時間: ${videoTime}`;
          }
        }
      });
    });
  });
}
