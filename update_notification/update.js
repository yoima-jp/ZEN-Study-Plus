document.addEventListener('DOMContentLoaded', () => {
  // ローディング画面を非表示にする
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
      }
    }, 1000);
  });

  const params = new URLSearchParams(window.location.search);
  const historyUrl = params.get('historyUrl');
  const newVersion = params.get('newVersion');

  if (newVersion) {
    const newVersionElement = document.getElementById('newVersion');
    if (newVersionElement) {
      newVersionElement.textContent = newVersion;
    }
  }

  if (historyUrl) {
    const updateButton = document.getElementById('updateButton');
    if (updateButton) {
      updateButton.href = historyUrl;
    }
  }
});