/*global chrome*/
import {
  GET_KEY,
  SAVE_KEY,
} from "../consts";


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