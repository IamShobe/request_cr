/*global chrome*/
import {
  GET_KEY,
  GET_NAME_MESSAGE,
  GET_WEBHOOK_MESSAGE,
  SAVE_KEY, SAVE_WEBHOOK_URL, SET_WEBHOOK_URL_MESSAGE,
  UPDATE_NAME_MESSAGE,
  UPDATE_WEBHOOK_MESSAGE
} from "../consts";


export const refreshName = () => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({type: GET_NAME_MESSAGE}, (response) => {
      console.log(response.name);
      resolve(response.name)
    })
  })
}

export const refreshWebhookURL = () => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({type: GET_WEBHOOK_MESSAGE}, (response) => {
      console.log(response.url);
      resolve(response.url)
    })
  })
}

export const setWebhookURL = (url) => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({type: SAVE_WEBHOOK_URL, value: url}, () => {
      resolve()
    })
  })
}

export const saveKey = (key, value) => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({type: SAVE_KEY, key, value}, (response) => {
      resolve(response)
    })
  })
}

export const getKey = (key) => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({type: GET_KEY, key}, (response) => {
      resolve(response.value)
    })
  })
}

const registrations = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request)
  const listeners = registrations[request.type] ?? [];
  listeners.forEach(listener => listener(request))
})


export const registerToEvent = (eventName, method) => {
  if(!registrations[eventName]) registrations[eventName] = [];
  registrations[eventName].push(method);
}

export const unregisterToEvent = (eventName, method) => {
  const listeners = registrations[eventName] ?? [];
  const index = listeners.indexOf(method);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
}