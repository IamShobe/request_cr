/*global chrome*/
import {
  GET_KEY,
  GET_KEY_RESPONSE,
  GET_NAME_MESSAGE, GET_NAME_MESSAGE_RESPONSE,
  GET_WEBHOOK_MESSAGE,
  GET_WEBHOOK_MESSAGE_RESPONSE,
  POST_CR_MESSAGE, SAVE_KEY, SAVE_KEY_RESPONSE, SAVE_WEBHOOK_URL,
  SLACK_KEY, WEBHOOK_URL
} from "./api/consts";
import axios from 'axios';

const initializeStorage = (key, value) => {
  chrome.storage.sync.get([key], (res) => {
    if (typeof res[key] === 'undefined') {
      chrome.storage.sync.set({[key]: ''}, function() {
        console.log("registered", key, value);
      });
    }
  })
}

const setStorage = async (key, value) => {
  return new Promise(resolve => {
    chrome.storage.sync.set({[key]: value}, () => {
      resolve(true)
    })
  })
}

const getStorage = async (key) => {
  return new Promise(resolve => {
    chrome.storage.sync.get([key], res => {
      resolve(res[key])
    })
  })
}

chrome.runtime.onInstalled.addListener(function() {

  initializeStorage(WEBHOOK_URL, '');
  initializeStorage(SLACK_KEY, '');
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'github.com'},
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(sender.tab ?
    "from a content script:" + sender.tab.url :
    "from the extension");
  if (request.type === GET_WEBHOOK_MESSAGE) {
    getStorage(WEBHOOK_URL).then(url => sendResponse({type: GET_WEBHOOK_MESSAGE_RESPONSE, url: url}))
  }

  if (request.type === GET_NAME_MESSAGE) {
    getStorage(SLACK_KEY).then(name => sendResponse({type: GET_NAME_MESSAGE_RESPONSE, name: name}))
  }

  if (request.type === GET_KEY) {
    getStorage(`CUSTOM_KEY_${request.key}`).then(value => sendResponse({type: GET_KEY_RESPONSE, key: request.key, value: value}));
  }
  if (request.type === SAVE_KEY) {
    setStorage(`CUSTOM_KEY_${request.key}`, request.value).then(() => sendResponse({type: SAVE_KEY_RESPONSE, key: request.key}))
  }

  if (request.type === SAVE_WEBHOOK_URL) {
    setStorage(WEBHOOK_URL, request.value).then(() => sendResponse({type: SAVE_KEY_RESPONSE, key: WEBHOOK_URL}))
  }

  if (request.type === POST_CR_MESSAGE) {
    getStorage(WEBHOOK_URL).then(url => {
      axios.post(url, request.data)
    })
  }

  return true;
});
// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//   chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
//     console.log(response.farewell);
//   });
// });
