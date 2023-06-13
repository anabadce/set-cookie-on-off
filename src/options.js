function handleButtonClick(event) {

  const cookieName = document.getElementById('cookieName').value
  const cookieValue = document.getElementById('cookieValue').value
  
  const value = {
    "cookieName" : cookieName,
    "cookieValue" : cookieValue,
  }

  chrome.storage.local.set({cookie: value }, () => {
    console.log("Extension configuration saved: " + value.cookieName + ", " + value.cookieValue);
  });

  // Close extension settings after saving settings.
  chrome.tabs.getCurrent(function(tab) {
    chrome.tabs.remove(tab.id, function() { });
  });

}

function constructOptions() {
  chrome.storage.local.get(["cookie"], (result) => {
    if(result) {
      try {
        //console.log("Configuration loaded: " + result.cookie + ", " + result.cookie.cookieName + ", " + result.cookie.cookieValue);

        const currentCookieName = result.cookie.cookieName;
        const currentCookieValue = result.cookie.cookieValue;

        document.getElementById('cookieName').value = currentCookieName;
        document.getElementById('cookieValue').value = currentCookieValue;
      }
      catch {};
    }
    const okButton = document.getElementById('okButton');
    okButton.addEventListener('click', handleButtonClick);
  });
}

constructOptions();
