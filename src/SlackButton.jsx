/*global chrome*/
import React, {useRef, useState, useEffect, useContext} from 'react';
import styled from 'styled-components';
import SettingsPanel from "./SettingsPanel";
import {POST_CR_MESSAGE} from "./api/consts";
import slackIcon from "./assets/slack.svg";
import {getVars} from "./content/staticVars";
import {FormContext} from "./state/FormState";
import lodash from "lodash";

const ButtonBase = styled.div`
  margin-top: auto;
  margin-bottom: auto;
  display: flex;
  background-color: black;
  border: 1px solid lightgray;
  padding: 2px 5px;
  height: 100%;
  transition: background-color .2s cubic-bezier(.3,0,.5,1);
  cursor: pointer;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: 500;
  
  
  &:hover {
    background-color: #242a2e;
  }
  & span {
    line-height: 100%;
  }
`
const ButtonContainer = styled(ButtonBase)`
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
`

const ButtonMore = styled(ButtonBase)`
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  width: 15px;
  
  &::after {
    display: inline-block;
    width: 0;
    height: 0;
    transform: translateY(25%);
    content: "";
    border: 4px solid transparent;
    border-top-color: currentcolor;
  }
`

const SlackIconWrapper = styled.div`
  height: 20px;
  width: 20px;
  margin-right: 5px;
  
  & img {
    width: 100%;
    height: 100%;
  }
`

const ButtonWrapper = styled.div`
  display: flex;
  position: relative;
`


const slackURL = chrome.extension.getURL(slackIcon);

/*

<!here> *Please CR* - <@${name}> is requesting you to code-review
PR: <${url}|${title}> \`${branchFrom} -> ${branchTo}\`
Repo: <https://github.com/tapingo/${repo}|tapingo/${repo}>
Issue: <https://tapingo.atlassian.net/browse/${branchFrom}|${branchFrom}>

*/

const formatMessage = (str, vars) => {
  for (const [key, val] of Object.entries(vars)) {
    const varReg = RegExp(`\\$\{${key}}`, 'g');
    str = str.replaceAll(varReg, val)
  }
  return str;
}

export const SlackButton = () => {
  const settingsRef = useRef(null);
  const panelRef = useRef(null);
  const [isOpen, setOpen] = useState(false);
  const {formState} = useContext(FormContext);
  const uneditableVars = getVars();
  const sendCRRequest = () => {
    const webhookUUID = formState.defaultWebhooks[uneditableVars.fullName];
    const webhook = lodash.find(formState.webhookUrls, {uuid: webhookUUID});
    if (!webhook) {
      setOpen('webhooksUrls');
      return;
    }
    const allVars = {...uneditableVars}
    for (const v of formState.editableVars) {
      allVars[v.key] = v.value;
    }
    const msg = formatMessage(formState.messageFormat, allVars);
    chrome.runtime.sendMessage({type: POST_CR_MESSAGE,
      url: webhook.value,
      data: {
        'text': msg
      }}, (response) => {
      console.log('posted message');
    })
  }
  useEffect(() => {
    const onArrowClick = (e) => {
      if(settingsRef.current?.contains?.(e.target)) {
        setOpen(!Boolean(isOpen));
      } else {
        if (!panelRef.current?.contains?.(e.target)) {
          setOpen(false);
        }
      }
    }

    document.addEventListener('click', onArrowClick, true);
    return () => {
      document.removeEventListener('click', onArrowClick, true);
    }
  }, [isOpen, settingsRef, panelRef]);
  return (
    <ButtonWrapper>
      <ButtonContainer onClick={sendCRRequest}><SlackIconWrapper><img src={slackURL}/></SlackIconWrapper><span>Request CR</span></ButtonContainer>
      <ButtonMore ref={settingsRef}/>
      {isOpen && <SettingsPanel ref={panelRef} isOpen={isOpen} setOpen={setOpen} uneditableVars={uneditableVars} requestCR={sendCRRequest}/>}
    </ButtonWrapper>);
}

export default SlackButton;
