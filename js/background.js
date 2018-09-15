var titles = {
    online: "Online",
    offline: "Offline",
    issues: "Connection issues"
};


var audioOnline = new Audio("../assets/sounds/online.mp3");
var audioOffline = new Audio("../assets/sounds/offline.mp3");

var current_status,
prev_status,
current_requests_count = 0;

setStatus(navigator.onLine ? "online" : "offline");

updateBrowserAction();

//Adding Event Listeners

window.addEventListener("online", function(e) {
  current_requests_count = 0;
  setStatus("online");
  updateBrowserAction();
}, false);

window.addEventListener("offline", function(e) {
  setStatus("offline");
  updateBrowserAction();
}, false);

function setStatus(status) {
    prev_status = current_status || status;
    current_status = status;
    localStorage.setItem("current_status", JSON.stringify(current_status));
}


function updateBrowserAction(disable_sound) {
    var settings = readSettingsFromLocalStorage();
  
    chrome.browserAction.setTitle({ title: titles[current_status] + "." });
    chrome.browserAction.setIcon({
      path: {
        "19": "assets/images/" + settings.theme + "/" + current_status + ".png",
        "38": "assets/images/" + settings.theme + "/" + current_status + "x38.png",
      }
    });

    if (!disable_sound && prev_status != current_status && settings.play_sound) {
      if (current_status == "online") {
        audioOnline.play();
        //Redirect to Page when online or Refresh it
        chrome.tabs.getSelected(null, function(tab) {
            var code = 'window.location.reload();';
            chrome.tabs.executeScript(tab.id, {code: code});
          });
          
        chrome.tabs.getCurrent(function (tab) {
            var tabUrl = encodeURIComponent(tab.url);
            var tabTitle = encodeURIComponent(tab.title);
            var url = new URL(tabUrl);
            var nextURI = url.searchParams.get("next");
            //Update the url with Next URL.
            chrome.tabs.update(tab.id, {url: nextURI});
        });
      } else {
        audioOffline.play();
        //Redirect to Game when offline
        if(current_status != "online"){
            //Redirect the exisiting tab with get parameter with present URI to our HTML Page
            chrome.tabs.getCurrent(function (tab) {
                var tabUrl = encodeURIComponent(tab.url);
                var tabTitle = encodeURIComponent(tab.title);
                var myNewUrl = chrome.runtime.getURL("catalog.html") + "?=next=" + tabUrl + "&title=" + tabTitle;
              
                //Update the url with present URL.
                chrome.tabs.update(tab.id, {url: myNewUrl});
              });
        }
      }
    }
}
  