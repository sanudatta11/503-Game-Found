var titles = {
    online: "Online",
    offline: "Offline",
    issues: "Connection issues"
};
var defaultSettings = {
    play_sound: false,
    theme: "default"
};
var audioOnline = new Audio("../assets/sounds/online.mp3");
var audioOffline = new Audio("../assets/sounds/offline.mp3");

var current_status,
    prev_status,
    current_requests_count = 0;


function readSettingsFromLocalStorage() {
    if (localStorage.getItem("settings")) {
        var settings = _.extend(defaultSettings, JSON.parse(localStorage.getItem("settings")));
        if (settings.theme !== "flat1" && settings.theme !== "default") {
            settings.theme = "default";
        }
        return settings;
    }
    return defaultSettings;
}

setStatus(navigator.onLine ? "online" : "offline");

updateBrowserAction();

//Adding Event Listeners

window.addEventListener("online", function (e) {
    current_requests_count = 0;
    setStatus("online");
    updateBrowserAction();
}, false);

window.addEventListener("offline", function (e) {
    setStatus("offline");
    updateBrowserAction();
}, false);


window.setTimeout(function () {
    window.setInterval(function () {
        if (current_requests_count > 1) {
            setStatus("issues");
            updateBrowserAction();
        }

        var img = document.createElement("img");
        current_requests_count += 1;

        img.onerror = function () {
            current_requests_count = current_requests_count > 0 ? current_requests_count - 1 : 0;
            setStatus("offline");
            updateBrowserAction();
        };

        img.onload = function () {
            console.log("c1");
            current_requests_count = current_requests_count > 0 ? current_requests_count - 1 : 0;
            setStatus("online");
            updateBrowserAction();
        };

        img.src = "https://www.google.com/favicon.ico?_" + (Math.floor(Math.random() * 1000000000));

        setTimeout(function () {
            img = null;
        }, 7000);
    }, 3000);

    // Clearing current requests count
    window.setInterval(function () {
        current_requests_count = 0;
    }, 3600000);
}, 1000);


function setStatus(status) {
    prev_status = current_status || status;
    current_status = status;
    localStorage.setItem("current_status", JSON.stringify(current_status));
}


function updateBrowserAction(disable_sound) {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function (tabs) {
        if (tabs.length > 0) {
            var settings = readSettingsFromLocalStorage();
            console.log("in Update cs="+current_status, "PrevStatus="+prev_status);
            chrome.browserAction.setTitle({
                title: titles[current_status] + "."
            });
            // chrome.browserAction.setIcon({
            //   path: {
            //     "19": "assets/images/" + settings.theme + "/" + current_status + ".png",
            //     "38": "assets/images/" + settings.theme + "/" + current_status + "x38.png",
            //   }
            // });

            // if (!disable_sound && prev_status != current_status && settings.play_sound) {

            // }
            if (prev_status != current_status) {
                console.log("Diff Status");
                if (current_status === "online") {
                    console.log("Online Again");
                    audioOnline.play();
                    chrome.tabs.query({
                        currentWindow: true,
                        active: true
                    }, function (tabs) {
                        var tabUrl = tabs[0].url;
                        var tabTitle = tabs[0].title;
                        var splitArray = tabUrl.split("?next=");
                        var splitArrayNext = splitArray[1].split("&title=");
                        console.log(splitArrayNext[0]);
                        var nextURI = splitArrayNext[0];
                        console.log(tabUrl, nextURI);
                        //Update the url with Next URL.
                        chrome.tabs.update(tabs[0].id, {
                            url: decodeURIComponent(nextURI)
                        });
                    });
                } else {
                    console.log(current_status);
                    audioOffline.play();
                    //Redirect to Game when offline
                    console.log("Its offline");
                    //Redirect the exisiting tab with get parameter with present URI to our HTML Page
                    chrome.tabs.query({
                        currentWindow: true,
                        active: true
                    }, function (tabs) {
                        var tabUrl = encodeURIComponent(tabs[0].url);
                        var tabTitle = encodeURIComponent(tabs[0].title);

                        var myNewUrl = chrome.runtime.getURL("testCatalog.html") + "?next=" + tabUrl + "&title=" + tabTitle;
                        console.log(myNewUrl);
                        //Update the url with present URL.
                        chrome.tabs.update(tabs[0].id, {
                            url: myNewUrl
                        });
                    });
                }
            }
        } else {
            console.log("Not in tab active");
        }
    });
}