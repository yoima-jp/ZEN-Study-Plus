document.addEventListener('DOMContentLoaded', function() {
  // 設定を読み込んで初期値を設定
  loadSettings();

  // チェックボックスの変更を監視
  document.querySelectorAll('input[type="checkbox"]:not(#darkMode)').forEach(checkbox => {
    checkbox.addEventListener('change', function(e) {
      const setting = {};
      if (e.target.id === 'movieplus') {
        setting['includeMoviePlus'] = e.target.checked;
      } else {
        setting[e.target.id] = e.target.checked;
      }
      saveSettingAndNotify(setting);
    });
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

  function closeModal() {
    document.getElementById('darkModeModal').style.display = "none";
  }

  function setDarkModeSetting(enabled) {
    saveSettingAndNotify({ darkMode: enabled });
  }

  function loadSettings() {
    chrome.storage.sync.get(['includeMoviePlus', 'autoHideNPlus', 'darkMode', 'showVideoTime', 'showVideoCount', 'showTestCount', 'showQuestionCount'], function(result) {
      document.getElementById('movieplus').checked = result.includeMoviePlus || false;
      document.getElementById('autoHideNPlus').checked = result.autoHideNPlus || false;
      document.getElementById('darkMode').checked = result.darkMode || false;
      document.getElementById('showVideoTime').checked = result.showVideoTime || false;
      document.getElementById('showVideoCount').checked = result.showVideoCount || false;
      document.getElementById('showTestCount').checked = result.showTestCount || false;
      document.getElementById('showQuestionCount').checked = result.showQuestionCount || false;
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
});