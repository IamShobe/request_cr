/*global chrome*/
import React, {useMemo} from 'react';
import ReactDOM from 'react-dom';
import {createGlobalStyle} from 'styled-components';
import SlackButton from "./SlackButton";
import FormState, {FormContext} from "./state/FormState";


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
const App = () => {
  const formState = useMemo(() => new FormState(), []);

  return (
    <>
      <GlobalStyle/>
      <FormContext.Provider value={{
        formState: formState
      }}>
        <SlackButton/>
      </FormContext.Provider>
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


