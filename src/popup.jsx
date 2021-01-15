/*global chrome*/
import React from 'react';
import ReactDOM from 'react-dom';
import styled, {createGlobalStyle} from 'styled-components';

const GlobalStyle = createGlobalStyle`
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 100px;
  height: auto;
  white-space: nowrap;
`;

const App = () => {
  const manifestData = chrome.runtime.getManifest();
  return (
    <Wrapper>
      <GlobalStyle/>
      <b>Github + Slack Integrator</b>
      Version: {manifestData.version}
    </Wrapper>
  )
}


const wrapper = document.getElementById('root');

if (wrapper) {
  ReactDOM.render(<App/>, wrapper);
}

