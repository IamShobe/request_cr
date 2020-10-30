import React, {useState, useEffect, useContext} from 'react';
import styled from 'styled-components';
import {StateContext} from "./StateContext";
import {getVars} from "./content/staticVars";
import lodash from "lodash";
import { v4 as uuidv4 } from 'uuid';


let messageVariables = [];
const formParams = {};


const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  background-color: #fff;
  right: 0;
  bottom: 0;
  z-index: 10000001;
  border-radius: 5px;
  border: 1px solid lightgray;
  padding: 10px;
  min-width: 600px;
  transform: translateY(calc(100% + 5px));
`


const StyledInput = styled.input`
  background-color: #f8f8f8;
  color: black;
  padding: 5px;
  border-radius: 5px;
  border: 1px solid lightgray;
  margin-left: 10px;
  flex: 1;
`

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;
  margin: 5px 0;
`

const Button = styled.button`
  background-color: #2ea44f;
  border: 1px solid lightgray;
  padding: 5px;
  margin-top: 5px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  
  &:hover {
   background-color: #2c974b;
  }
`
const TabHolder = styled.div`
  display: flex;
  width: 100%;
`
const Tab = styled.button`
  padding: 10px;
  border: 0;
  border-bottom: 2px solid ${props => props.selected ? '#f9826c' : 'transparent'};
  transition: border-bottom-color .36s ease-in;
  background-color: transparent;
  font-weight: ${props => props.selected && 'bold'};
  
  &:hover {
    border-bottom: 2px solid ${props => props.selected ? '#f9826c' : '#cdcdcd'};
  }
`

const StyledMessage = styled.textarea`
  background-color: #f8f8f8;
  color: black;
  padding: 5px;
  border-radius: 5px;
  border: 1px solid lightgray;
  resize: none;
  width: 100%;
  height: 200px;
`

const StaticInput = (Component) => ({initialValue, valueReader, ...props}) => {
  const [value, setValue] = useState([initialValue, null]);
  useEffect(() => {
    valueReader?.(...value)
  }, [value]);
  return <Component value={value[0]} onChange={(e) => setValue([e.target.value, value[0]])} {...props}/>
}

const Input = StaticInput(StyledInput);
const Message = StaticInput(StyledMessage);


const TableWrapper = styled.div`
  background-color: #f8f8f8;
  border: 1px solid lightgray;
  width: 100%;
  height: 200px;
  overflow: auto;
  border-radius: 5px;
  padding: 5px;
  margin: 5px 0;
`

const StyledTableRow = styled.div`
  color: black;
  padding: 5px;
  border-radius: 5px;
  display: flex;
  align-items: center;
`;

const Delete = styled.button`
  border-radius: 5px;
  width: 100px;
  background-color: #a42e2e;
  border: 1px solid lightgray;
  margin-left: 5px;
  color: white;
  font-weight: bold;
  
  &:hover {
   background-color: #972c2c;
  }
`

const StyledTableInput = styled.input`
  min-width: 200px;
  flex: ${({stretched=false}) => stretched && 1};
`;
const TableInput = StaticInput(StyledTableInput);

const TableRow = ({valKey, value, uneditable=false, valueReaderKey, valueReaderValue, deleteRow}) => {
  return <StyledTableRow uneditable={uneditable}>
    <TableInput initialValue={valKey} disabled={uneditable} valueReader={valueReaderKey}/>=
    <TableInput initialValue={value} disabled={uneditable} valueReader={valueReaderValue} stretched/>
    {!uneditable && <Delete onClick={deleteRow}>Delete</Delete>}
  </StyledTableRow>
}

const EMPTY_VARIABLE = {key: '', value: ''}
const VariablesTable = ({variables}) => {
  const [editableVars, setEditableVars] = useState(variables);
  useEffect(() => {
    messageVariables = editableVars
    if (editableVars.length === 0 || editableVars[editableVars.length - 1].key !== '') {
      setEditableVars([...editableVars, {...EMPTY_VARIABLE, uuid: uuidv4()}])
    }
  }, [editableVars])

  const deleteRow = (index) => (() => {
    const copy = [...editableVars];
    copy.splice(index, 1)
    setEditableVars(copy);
  })

  const valueReaderKey = (index) => {
    return value => {
      const copy = [...editableVars];
      if(!copy[index]) copy[index] = {...EMPTY_VARIABLE}
      copy[index].key = value;
      setEditableVars(copy)
    }
  }

  const valueReaderValue = (index) => {
    return value => {
      const copy = [...editableVars];
      if(!copy[index]) copy[index] = {...EMPTY_VARIABLE}
      copy[index].value = value;
      setEditableVars(copy)
    }
  };

  return <TableWrapper>
      {
        Object.entries(getVars()).map(([key, value]) => <TableRow key={key} valKey={key} value={value} uneditable={true}/>)
      }
      {
        editableVars.map((variable, index) => <TableRow key={`${variable.uuid}`} valKey={variable.key} value={variable.value}
                                                        valueReaderKey={valueReaderKey(index)} valueReaderValue={valueReaderValue(index)}
                                                        deleteRow={deleteRow(index)}/>)
      }
  </TableWrapper>
}


const TabSelector = ({tab}) => {
  const state = useContext(StateContext);
  const [messageFormat, setMessageFormat] = state.messageFormatTuple;
  const [variables] = state.variablesTuple;

  const valueReader = (key) => {
    return value => formParams[key] = value;
  };

  switch (tab) {
    case 'variables':
      return (
        <VariablesTable variables={variables}/>
      )
    default:
    case 'message':
      return (
        <InputWrapper>
          <Message initialValue={messageFormat} valueReader={valueReader('messageFormat')}/>
        </InputWrapper>
      )
  }
}


export const SettingsPanel = React.forwardRef(({}, ref) => {
  const [tab, setTab] = useState(null);
  const state = useContext(StateContext);
  const [, setMessageFormat] = state.messageFormatTuple;
  const [webhookURL, setWebhookURL] = state.webhookURLTuple;
  const [,setVariables] = state.variablesTuple;
  const saveSettings = () => {
    const editableVariables = lodash.uniqBy(messageVariables, 'key').filter(v => v.key);
    setVariables(editableVariables)
    setMessageFormat(formParams.messageFormat);
    setWebhookURL(formParams.webhookURL);
  }

  const valueReader = (key) => {
    return value => formParams[key] = value;
  };

  return <Wrapper ref={ref}>
    <InputWrapper>
      Webhook URL
      <Input initialValue={webhookURL} valueReader={valueReader('webhookURL')}/>
    </InputWrapper>
    <TabHolder>
      <Tab onClick={() => setTab('message')} selected={!tab || tab === 'message'}>Message</Tab>
      <Tab onClick={() => setTab('variables')} selected={tab === 'variables'}>Variables</Tab>
    </TabHolder>
    <TabSelector tab={tab}/>
    <Button onClick={saveSettings}>Save</Button>
  </Wrapper>
})

export default SettingsPanel
