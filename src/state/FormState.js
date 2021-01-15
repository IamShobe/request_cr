import React from 'react';
import {makeAutoObservable} from "mobx";
import * as api from "../api/content/api";
import {UPDATE_KEY} from "../api/consts";

export const FormContext = React.createContext();

class FormState {
  editableVars = []
  messageFormat = ''
  webhookUrls = []
  defaultWebhooks = {}
  constructor() {
    makeAutoObservable(this)
    this.fetchFromServer()
    this.registerToUpdate()
  }

  updateEditableVars = async () => {
    this.editableVars = await this.getServerKey('variables', [])
  }

  updateMessageFormat = async () => {
    this.messageFormat = await this.getServerKey('messageFormat', '');
  }

  updateWebhookUrls = async () => {
    this.webhookUrls = await this.getServerKey('webhookUrls', []);
  }

  updateDefaultWebhooks = async () => {
    this.defaultWebhooks = await this.getServerKey('defaultWebhooks', {});
  }

  registerToUpdate = () => {
    api.registerToEvent(UPDATE_KEY, (request) => {
      switch (request.key) {
        case 'variables':
          this.updateEditableVars()
          break;
        case 'messageFormat':
          this.updateMessageFormat()
          break;
        case 'webhookUrls':
          this.updateWebhookUrls()
          break;
        case 'defaultWebhooks':
          this.updateDefaultWebhooks()
          break;
      }
    })
  }

  fetchFromServer = () => {
    this.updateEditableVars();
    this.updateMessageFormat();
    this.updateWebhookUrls();
    this.updateDefaultWebhooks();
  }

  saveToServer = async () => {
    await Promise.all([
      this.saveKey('variables', this.editableVars),
      this.saveKey('messageFormat', this.messageFormat),
      this.saveKey('webhookUrls', this.webhookUrls),
      this.saveKey('defaultWebhooks', this.defaultWebhooks),
    ])
  }

  saveKey = async (key, value) => {
    await api.saveKey(key, value);
  }

  getServerKey = async (key, defaultValue) => {
    let value = await api.getKey(key)
    try {
      return value;
    } catch (e) {
      console.warn('Error caught couldn\'t process', e)
      await this.saveKey(key, defaultValue);
    }
  }
}


export default FormState;
