/*global chrome*/
import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import styled, {createGlobalStyle} from 'styled-components';
import {
  GET_NAME_MESSAGE,
  GET_WEBHOOK_MESSAGE,
  WEBHOOK_URL,
  SLACK_KEY,
  UPDATE_WEBHOOK_MESSAGE,
  UPDATE_NAME_MESSAGE
} from "./api/consts";

const GlobalStyle = createGlobalStyle`
  #reactApp_requestCR {
    display: inline-flex;
    height: 28px;
    margin-top: auto;
    margin-bottom: auto;
    margin-left: 4px;
  }
  .gh-header-actions {
    display: flex;
    justify-content: center;
  }
`

const StyledField = styled.div`
  display: flex;
  align-items: center;
`


const App = () => {

  const [webhookURL, setWebhookURL] = useState('');
  const [name, setName] = useState('');


  useEffect(() => {
    chrome.runtime.sendMessage({type: GET_WEBHOOK_MESSAGE}, (response) => {
      console.log(response.url);
      setWebhookURL(response.url)
    })

    chrome.runtime.sendMessage({type: GET_NAME_MESSAGE}, (response) => {
      console.log(response.name);
      setName(response.name)
    })
  }, [])

  const saveDetails = () => {
    console.log(name, webhookURL)
    chrome.storage.sync.set({[WEBHOOK_URL]: webhookURL}, function() {
      console.log('saved webhooks')
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: UPDATE_WEBHOOK_MESSAGE, url: webhookURL}, () => {})
      });
    });
    chrome.storage.sync.set({[SLACK_KEY]: name}, function() {
      console.log('saved slack key')
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: UPDATE_NAME_MESSAGE, name: name}, () => {})
      });
    });
  }


  return (
    <>
      <GlobalStyle/>
      <StyledField>
        <span>WebhookURL: </span>
        <input value={webhookURL} onChange={e => setWebhookURL(e.target.value)}/>
      </StyledField>
      <StyledField>
        <span>SlackName: </span>
        <input value={name} onChange={e => setName(e.target.value)}/>
      </StyledField>
      <button onClick={saveDetails}>Save</button>
    </>
  )
}


const wrapper = document.getElementById('root');

if (wrapper) {
  ReactDOM.render(<App/>, wrapper);
}

