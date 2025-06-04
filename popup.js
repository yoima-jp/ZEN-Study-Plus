document.addEventListener('DOMContentLoaded', function() {
  // 設定を読み込んで初期値を設定
  loadSettings();
  
  // コース履歴を読み込む
  loadCourseHistory();

  // タブ切り替え機能の実装
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      
      // タブボタンのアクティブ状態を切り替え
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // タブコンテンツの表示を切り替え
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId) {
          content.classList.add('active');
        }
      });
    });
  });

  // アコーディオン機能の実装
  const accordionHeaders = document.querySelectorAll('.setting-group-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      // ヘッダーのアクティブ状態を切り替え
      header.classList.toggle('active');
      
      // コンテンツ部分の表示/非表示を切り替え
      const content = header.nextElementSibling;
      content.classList.toggle('active');
      
      // アイコンの回転を切り替え
      const icon = header.querySelector('.icon');
      if (content.classList.contains('active')) {
        icon.style.transform = 'rotate(180deg)';
      } else {
        icon.style.transform = 'rotate(0deg)';
      }
    });
  });

  // チェックボックスの変更を監視
  document.querySelectorAll('input[type="checkbox"]:not(#darkMode)').forEach(checkbox => {
    checkbox.addEventListener('change', function(e) {
      const setting = {};
      if (e.target.id === 'movieplus') {
        setting['includeMoviePlus'] = e.target.checked;
      } else if (e.target.id === 'autoHideNPlus') {
        setting['autoHideNPlus'] = e.target.checked;
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'autoHideNPlusChanged',
            autoHideNPlus: e.target.checked
          });
        });
      } else if (e.target.id === 'enableVideoEndSound') {
        setting['enableVideoEndSound'] = e.target.checked;
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'videoEndSoundChanged',
            enableVideoEndSound: e.target.checked
          });
        });
      } else {
        setting[e.target.id] = e.target.checked;
      }
      saveSettingAndNotify(setting);
    });
  });

  // Discord Webhook URLの変更を監視
  document.getElementById('discordWebhook').addEventListener('change', function(e) {
    saveSettingAndNotify({ discordWebhook: e.target.value });
  });

  document.getElementById('darkMode').addEventListener('change', function(e) {
    const modal = document.getElementById('darkModeModal');
    if (e.target.checked) {
      modal.style.display = "block";
    } else {
      // チェックを外した場合は設定を保存して通知
      setDarkModeSetting(false);
    }
  });

  document.getElementById('darkModeConfirm').addEventListener('click', function() {
    setDarkModeSetting(true);
    closeModal();
  });

  document.getElementById('darkModeCancel').addEventListener('click', function() {
    document.getElementById('darkMode').checked = false;
    closeModal();
  });

  // 履歴クリアボタンのイベントリスナーを追加
  document.getElementById('clearHistory').addEventListener('click', function() {
    if (confirm('本当にすべての履歴を削除しますか？')) {
      chrome.storage.sync.remove('courseHistory', function() {
        loadCourseHistory(); // 履歴を再読み込み
      });
    }
  });

  function closeModal() {
    document.getElementById('darkModeModal').style.display = "none";
  }

  function setDarkModeSetting(enabled) {
    saveSettingAndNotify({ darkMode: enabled });
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'darkModeChanged',
        darkMode: enabled
      });
    });
  }

  function loadSettings() {
    chrome.storage.sync.get(['includeMoviePlus', 'autoHideNPlus', 'darkMode', 'showVideoTime', 
                            'showVideoCount', 'showTestCount', 'showQuestionCount', 
                            'enableVideoEndSound', 'discordWebhook', 'showRemainingTime'], function(result) {
      document.getElementById('movieplus').checked = result.includeMoviePlus || false;
      document.getElementById('autoHideNPlus').checked = result.autoHideNPlus || false;
      document.getElementById('darkMode').checked = result.darkMode || false;
      document.getElementById('showVideoTime').checked = result.showVideoTime || false;
      document.getElementById('showVideoCount').checked = result.showVideoCount || false;
      document.getElementById('showTestCount').checked = result.showTestCount || false;
      document.getElementById('showQuestionCount').checked = result.showQuestionCount || false;
      document.getElementById('enableVideoEndSound').checked = result.enableVideoEndSound || false;
      document.getElementById('discordWebhook').value = result.discordWebhook || '';
      document.getElementById('showRemainingTime').checked = result.showRemainingTime || false;
    });
  }

  function saveSettingAndNotify(setting) {
    chrome.storage.sync.set(setting, function() {
      console.log('設定が保存されました:', setting);
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'settingChanged',
        ...setting
      });
    });
  }

  function loadCourseHistory() {
    const historyContainer = document.getElementById('courseHistoryContainer');
    historyContainer.innerHTML = '<div class="loading-message">履歴を読み込み中...</div>';
    
    chrome.storage.sync.get('courseHistory', function(result) {
      const courseHistory = result.courseHistory || {};
      
      if (Object.keys(courseHistory).length === 0) {
        historyContainer.innerHTML = '<div class="no-history">履歴がありません</div>';
        return;
      }
      
      historyContainer.innerHTML = '';
      
      // 新しい順に並べ替え
      const sortedHistory = Object.entries(courseHistory).sort((a, b) => {
        return new Date(b[1].timestamp) - new Date(a[1].timestamp);
      });
      
      sortedHistory.forEach(([courseInfo, data]) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const date = new Date(data.timestamp);
        const formattedDate = `${date.getFullYear()}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        historyItem.innerHTML = `
          <div class="history-title">
            <a href="${data.url}" target="_blank">${data.title}</a>
            <span class="history-date">${formattedDate}</span>
          </div>
          <div class="history-details">
            <div class="history-stat">動画時間: ${data.videoTime}</div>
            <div class="history-stat">動画数: ${data.videoCount}</div>
            <div class="history-stat">テスト数: ${data.testCount}</div>
            <div class="history-stat">問題数: ${data.questionCount}</div>
          </div>
        `;
        
        historyContainer.appendChild(historyItem);
      });
    });
  }
});