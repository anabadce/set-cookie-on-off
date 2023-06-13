const domains = ["edge:", "chrome:"];
const cookieDuration = 28800 // 8 hours

var cookie_name = "";
var cookie_value = "";

chrome.action.onClicked.addListener(async (tab) => {

  // Only perform action if domain is in allow list
  if (!domains.some(v => tab.url.includes(v))) {

    chrome.storage.local.get(["cookie"], (result) => {
      if(result) {
        try {
          //console.log("Configuration loaded: " + result.cookie + ", " + result.cookie.cookieName + ", " + result.cookie.cookieValue);
          cookie_name = result.cookie.cookieName;
          cookie_value = result.cookie.cookieValue;
        }
        catch {};
      }
    });

    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    // Next state will always be the opposite
    const nextState = prevState === 'ON' ? 'OFF' : 'ON'

    // Set the action badge to the next state
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState,
    });

    var now = (new Date().getTime() / 1000);
    var expDate = now + cookieDuration;
    var url = new URL(tab.url);

    try {
      var domain = url.hostname;

      if (nextState === "ON") {
        // Set cookie
        await chrome.cookies.set({
          domain: domain,
          expirationDate: expDate,
          httpOnly: false,
          path: "/",
          sameSite: "no_restriction",
          secure: true,
          url: tab.url,
          name: cookie_name,
          value: cookie_value
        });

      } else if (nextState === "OFF") {
        // Remove cookie
        await chrome.cookies.remove({
          name: cookie_name,
          url: tab.url
        });
      }
    }
    catch {};
  }
  else {
    //console.log("Doing nothing.");
  }
});

// === function to get cookies
function getCookie(url, name, callback) {
  chrome.cookies.get({"url": url, "name": name}, function(cookie) {
      if(callback) {
          try {
            callback(cookie.value);
          }
          catch {};
      }
  });
}

// === on page load
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (!domains.some(v => tab.url.includes(v))) {
    if (changeInfo.status == 'complete') {

      getCookie(tab.url, cookie_name, function(cookie) {
        if (cookie === cookie_value) {
          chrome.action.setBadgeText({
            tabId: tab.id,
            text: "ON",
          });
        } else {
          chrome.action.setBadgeText({
            tabId: tab.id,
            text: "OFF",
          });
        };
      });  
    }
  }
})

// === on extension first run
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
  chrome.storage.local.get(["cookie"], (result) => {
    if(result) {
      try {
        //console.log("Configuration loaded: " + result.cookie + ", " + result.cookie.cookieName + ", " + result.cookie.cookieValue);
        cookie_name = result.cookie.cookieName;
        cookie_value = result.cookie.cookieValue;
      }
      catch {};
    }
  });
});
