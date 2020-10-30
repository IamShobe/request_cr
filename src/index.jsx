/*global chrome*/
import React, {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import {createGlobalStyle} from 'styled-components';
import {
  UPDATE_KEY, UPDATE_WEBHOOK_MESSAGE,
} from "./api/consts";
import SlackButton from "./SlackButton";
import {StateContext} from './StateContext';
import * as api from './api/content/api'


const GlobalStyle = createGlobalStyle`
  #reactApp_requestCR {
    display: inline-flex;
    height: 28px;
    margin-left: 4px;
  }
  .gh-header-actions {
    display: flex;
    justify-content: center;
  }
`
const useServerKey = (key, defaultValue, getProcessor=value => value, saveProcessor=value => value) => {
  const [val, setVal] = useState(defaultValue);
  const setServerVal = async (value) => {
    const savedVal = saveProcessor(value);
    await api.saveKey(key, savedVal);
    setVal(value);
  }
  const refresh = async () => {
    const value = await api.getKey(key)
    try {
      setVal(getProcessor(value));
    } catch (e) {
      console.warn('Error caught couldn\'t process', e)
      await setServerVal(defaultValue)
    }
  }
  useEffect(() => {
      refresh();
      api.registerToEvent(UPDATE_KEY, (request) => {
        if(request.key === key) {
          refresh();
        }
      });
  }, [])

  return [val, setServerVal, refresh]
}

const useWebhookURL = () => {
  const [webhookURL, setWebhookURL] = useState('');
  const refreshWebhookURL = async () => {
    setWebhookURL(await api.refreshWebhookURL())
  }

  useEffect(() => {
    refreshWebhookURL();
    api.registerToEvent(UPDATE_WEBHOOK_MESSAGE, refreshWebhookURL);
  }, []);

  const setWebhook = async (url) => {
    await api.setWebhookURL(url);
    setWebhookURL(url);
  }

  return [webhookURL, setWebhook];
}

const App = () => {
  const webhookURLTuple = useWebhookURL();
  const messageFormatTuple = useServerKey('messageFormat', '');
  const variablesTuple = useServerKey('variables', [], JSON.parse, JSON.stringify);


  return (
    <>
      <GlobalStyle/>
      <StateContext.Provider value={{
        messageFormatTuple, variablesTuple, webhookURLTuple
      }}>
        <SlackButton/>
      </StateContext.Provider>
    </>
  )
}

const renderApp = () => {
  const wrapper = document.querySelector('.gh-header-actions');
  if (wrapper) {
    const reactApp = document.createElement("div");
    reactApp.id = 'reactApp_requestCR';
    wrapper.appendChild(reactApp);
    ReactDOM.render(<App/>, reactApp);
  }
}

window.addEventListener('load', () => {
  renderApp()
})

setInterval( () => {
  if (!document.getElementById('reactApp_requestCR')) {
    console.log('App not found! reviving!')
    renderApp()
  }
}, 5000)


