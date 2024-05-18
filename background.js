// Load stored preferences
var store = {};

function updateStore() {
  chrome.storage.sync.get('urlalias', function (obj) {
    store = {};

    // First time, initialize.
    if (obj != null) {
      store = obj.urlalias;
    }

    // Add default keys if empty.
    if (store == null || Object.keys(store).length == 0) {
      store = {};
      store["m"] = "https://mail.google.com";
      store["c"] = "https://calendar.google.com";
      store["d"] = "https://drive.google.com";
      chrome.storage.sync.set({ 'urlalias': store});
    }
  });
}

updateStore();

// Checks if 'server' is to be redirected, and executes the redirect.
function doRedirectIfSaved(details) {
  var url = new URL(details.url);
  var server = url.hostname;
  var redirect = store[server];

  if (redirect == null) {
    // Check if we have a matching redirect
    for (var key in store) {
      if (key.startsWith(server)) {
        // Found the server
        redirect = store[key].replace("###", url.pathname.slice(1));
        break;
      }
    }
  }

  if (redirect) {
    if (redirect.indexOf('://') < 0) {
      // Add a default protocol
      redirect = "http://" + redirect;
    }
    return { redirectUrl: redirect };
  }
}

// Intercept requests before they're sent
chrome.webRequest.onBeforeRequest.addListener(
  doRedirectIfSaved,
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Track changes to data object.
chrome.storage.onChanged.addListener(function(changes, namespace) {
  updateStore();
});

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}