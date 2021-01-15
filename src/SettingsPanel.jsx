import React, {useState, useEffect, useContext} from 'react';
import styled from 'styled-components';
import lodash from "lodash";
import { v4 as uuidv4 } from 'uuid';
import {FormContext} from "./state/FormState";
import { observer } from "mobx-react"



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
  padding: 0 10px 10px 10px;
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
  min-width: 100px;
  background-color: ${({stretched}) => stretched ? '#2ea44f' : '#fafbfc'} ;
  border: 1px solid lightgray;
  padding: 5px;
  margin-top: 5px;
  border-radius: 5px;
  color: ${({stretched}) => stretched ? 'white' : 'black'} ;
  font-weight: 500;
  flex: ${({stretched}) => stretched ? 1 : undefined};

  &:hover {
    background-color: ${({stretched}) => stretched ? '#2c974b' : '#f3f4f6'} ;
  }
`

const ButtonWrappers = styled.div`
  display: flex;
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

const StaticInput = (Component) => observer(({initialValue, valueReader, ...props}) => {
  const [value, setValue] = useState([initialValue, null]);
  useEffect(() => {
    valueReader?.(...value)
  }, [value]);
  return <Component value={value[0]} onChange={(e) => setValue([e.target.value, value[0]])} {...props}/>
})

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
  min-width: 100px;
  background-color: #a42e2e;
  border: 1px solid lightgray;
  margin-left: 5px;
  color: white;
  font-weight: 500;
  white-space: nowrap;
  
  &:hover {
   background-color: #972c2c;
  }
`

const Default = styled(Delete)`
  background-color: #2e4fa4;
 
  &:hover {
   background-color: #2c5397;
  }
`

const StyledTableInput = styled.input`
  min-width: 100px;
  flex: ${({stretched=false}) => stretched && 1};
`;
const TableInput = StaticInput(StyledTableInput);

const TableRow = observer(({valKey, value, uneditable=false, valueReaderKey, valueReaderValue, deleteRow, defaultText, setDefault, canBeDefault}) => {
  return <StyledTableRow uneditable={uneditable}>
    <TableInput initialValue={valKey} disabled={uneditable} valueReader={valueReaderKey}/>=
    <TableInput initialValue={value} disabled={uneditable} valueReader={valueReaderValue} stretched/>
    {!uneditable && <Delete onClick={deleteRow}>Delete</Delete>}
    {defaultText && setDefault && canBeDefault && <Default onClick={setDefault}>Repo Default</Default>}
  </StyledTableRow>
})

const EMPTY_VARIABLE = {key: '', value: ''}
const VariablesTable = observer(({variablesKey, uneditableVars, onDelete, setDefault, defaultLabel, canBeDefault}) => {
  const {formState: form} = useContext(FormContext);
  useEffect(() => {
    if (form[variablesKey].length === 0 || form[variablesKey][form[variablesKey].length - 1].key !== '') {
      form[variablesKey] = [...form[variablesKey], {...EMPTY_VARIABLE, uuid: uuidv4()}]
    }
  }, [form[variablesKey]])


  const deleteRow = (index) => (() => {
    onDelete?.(form[variablesKey][index]);
    const copy = [...form[variablesKey]];
    copy.splice(index, 1)
    form[variablesKey] = copy;
  })


  const valueReaderKey = (index) => {
    return value => {
      const copy = [...form[variablesKey]];
      if(!copy[index]) copy[index] = {...EMPTY_VARIABLE}
      copy[index].key = value;
      form[variablesKey] = copy
    }
  }

  const valueReaderValue = (index) => {
    return value => {
      const copy = [...form[variablesKey]];
      if(!copy[index]) copy[index] = {...EMPTY_VARIABLE}
      copy[index].value = value;
      form[variablesKey] = copy
    }
  };

  return <TableWrapper>
    {
      uneditableVars && Object.entries(uneditableVars).map(([key, value]) => <TableRow key={key} valKey={key} value={value} uneditable={true}/>)
    }
    {
      form[variablesKey].map((variable, index) => <TableRow key={`${variable.uuid}`} valKey={variable.key}
                                                            value={variable.value}
                                                            valueReaderKey={valueReaderKey(index)}
                                                            valueReaderValue={valueReaderValue(index)}
                                                            setDefault={setDefault?.(index)}
                                                            defaultText={defaultLabel}
                                                            canBeDefault={canBeDefault?.(index)}
                                                            deleteRow={deleteRow(index)}/>)
    }
  </TableWrapper>
})


const TabSelector = observer(({tab, uneditableVars}) => {
  const {formState} = useContext(FormContext);

  const valueReader = (key) => {
    return value => formState[key] = value;
  };

  const setDefaultRepoWebhook = (index) => () => {
    formState.defaultWebhooks[uneditableVars.fullName] = formState.webhookUrls[index].uuid;
  }

  const canBeDefault = (index) =>
    ((formState.defaultWebhooks[uneditableVars.fullName] !== formState.webhookUrls[index].uuid) &&
      (Boolean(formState.webhookUrls[index].key) && Boolean(formState.webhookUrls[index].value)))

  const onDelete = (deleted) => {
    if (formState.defaultWebhooks[uneditableVars.fullName] === deleted.uuid) {
      delete formState.defaultWebhooks[uneditableVars.fullName];
    }
  }

  switch (tab) {
    case 'variables':
      return (
        <VariablesTable key='variables' variablesKey={'editableVars'} uneditableVars={uneditableVars}/>
      )
    case 'webhooksUrls':
      return (
        <VariablesTable key='webhooksUrls' variablesKey={'webhookUrls'} setDefault={setDefaultRepoWebhook}
                        canBeDefault={canBeDefault} defaultLabel='Repo Default'
                        onDelete={onDelete}
        />
      )

    default:
    case 'message':
      return (
        <InputWrapper key='message'>
          <Message initialValue={formState.messageFormat} valueReader={valueReader('messageFormat')}/>
        </InputWrapper>
      )
  }
})

const AVAILABLE_TABS = [
  'message', 'variables', 'webhooksUrls'
]

export const SettingsPanel = observer(React.forwardRef(({isOpen, setOpen, uneditableVars, requestCR}, ref) => {
  const [tab, setTab] = useState(isOpen);
  const {formState} = useContext(FormContext);

  const webhookUUID = formState.defaultWebhooks[uneditableVars.fullName];
  const webhook = lodash.find(formState.webhookUrls, {uuid: webhookUUID});

  const saveSettings = async () => {
    await formState.saveToServer();
    setOpen?.(false);
  }

  const saveAndSend = async () => {
    if (!webhook) {
      setTab('webhooksUrls')
      return;
    }
    await formState.saveToServer();
    requestCR();
    setOpen?.(false);
  }

  return <Wrapper ref={ref}>
    <TabHolder>
      <Tab onClick={() => setTab('message')} selected={tab === 'message' || (Boolean(tab) && !AVAILABLE_TABS.includes(tab))}>Message</Tab>
      <Tab onClick={() => setTab('variables')} selected={tab === 'variables'}>Variables</Tab>
      <Tab onClick={() => setTab('webhooksUrls')} selected={tab === 'webhooksUrls'}>Webhooks Urls</Tab>
    </TabHolder>
    <TabSelector tab={tab} uneditableVars={uneditableVars}/>
    <ButtonWrappers>
      <Button style={{marginRight: 5}} onClick={saveSettings}>Save</Button>
      <Button onClick={saveAndSend} stretched>{webhook ? `Save & Send (${webhook.key})` : 'Choose repo default url'}</Button>
    </ButtonWrappers>
  </Wrapper>
}))

export default SettingsPanel
