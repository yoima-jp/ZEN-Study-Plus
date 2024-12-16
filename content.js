let includeMoviePlus = false;
let autoHideNPlus = false;
let darkMode = false;
let intervalID = null;

function applyDarkMode() {
  function updateStyles(colorMap, shadowMap) {
    applyStyles(document, colorMap, shadowMap);

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
        if (element.classList.contains('sc-aXZVg') && element.classList.contains('kLYaYr')) {
            return;
        }

        const computedStyle = getComputedStyle(element);

        ["backgroundColor", "color", "borderColor", "borderBottomColor"].forEach(styleProp => {
            const currentColor = computedStyle[styleProp];
            if (colorMap[currentColor]) {
                element.style[styleProp] = colorMap[currentColor];
            }
        });

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

const shadowMap = {
    "rgba(0, 0, 0, 0.2) 0px 0px 2px 0px": "rgb(255 255 255 / 20%) 0px 0px 2px 0px",
    "rgba(0, 0, 0, 0.1) 0px 1px 1px 0px": "rgb(255 255 255 / 10%) 0px 1px 1px 0px"
};

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
      if (iconType === 'movie-rounded' || (iconType === 'movie-rounded-plus' && includeMoviePlus)) {
        const iconStyle = icon.style.color;
        if (iconStyle !== 'rgb(0, 197, 65)') {
          videoCount++;
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

  chrome.storage.sync.get(['showVideoTime', 'showVideoCount', 'showTestCount', 'showQuestionCount'], function(result) {
    if (chrome.runtime.lastError) {
      console.error('Error retrieving settings:', chrome.runtime.lastError);
      return;
    }

    const totalMinutes = Math.floor(totalDuration / 60);
    const totalSeconds = totalDuration % 60;
    const newElement = document.createElement('div');
    newElement.style.marginTop = '10px';

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
  });

  if (autoHideNPlus) {
    let button1 = Array.from(document.querySelectorAll('button')).find(el => el.textContent === '必修教材のみ');
    let button2 = Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Nプラス教材のみ');

    let isButton2Blue = false;

    if (button2) {
        let style2 = getComputedStyle(button2);
        let backgroundColor2 = style2.backgroundColor;

        isButton2Blue = backgroundColor2 === 'rgb(0, 119, 211)';
    }

    if (button1 && !isButton2Blue) {
        let style1 = getComputedStyle(button1);
        let backgroundColor1 = style1.backgroundColor;

        if (backgroundColor1 !== 'rgb(0, 119, 211)') {
            button1.click(); 
        }
    }
  }

  if (darkMode) {
    applyDarkMode();
  }
}

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
  }
});

chrome.storage.sync.get(['includeMoviePlus', 'autoHideNPlus', 'darkMode'], function(result) {
  includeMoviePlus = result.includeMoviePlus || false;
  autoHideNPlus = result.autoHideNPlus || false;
  darkMode = result.darkMode || false;
  updateCountAndTime();

  if (intervalID) {
    clearInterval(intervalID);
  }

  intervalID = darkMode 
    ? setInterval(updateCountAndTime, 0) 
    : setInterval(updateCountAndTime, 1000);
});
