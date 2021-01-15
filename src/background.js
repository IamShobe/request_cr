/*global chrome*/
import {
  GET_KEY,
  GET_KEY_RESPONSE,
  POST_CR_MESSAGE, SAVE_KEY, SAVE_KEY_RESPONSE,
} from "./api/consts";
import axios from 'axios';

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

  if (request.type === GET_KEY) {
    getStorage(`CUSTOM_KEY_${request.key}`).then(value => sendResponse({type: GET_KEY_RESPONSE, key: request.key, value: value}));
  }
  if (request.type === SAVE_KEY) {
    setStorage(`CUSTOM_KEY_${request.key}`, request.value).then(() => sendResponse({type: SAVE_KEY_RESPONSE, key: request.key}))
  }

  if (request.type === POST_CR_MESSAGE) {
    axios.post(request.url, request.data)
  }

  return true;
});
