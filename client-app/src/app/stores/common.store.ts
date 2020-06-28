import { RootStore } from './root.store';
import { observable, action, reaction } from 'mobx';

export default class CommonStore {

  constructor(public rootStore: RootStore) { 
    
    // reaction subscribes to the observables and does logic on emission
    reaction(
      () => this.token,
      token => {
        if (token) {
          window.localStorage.setItem('jwt', token);
        } else {
          window.localStorage.removeItem('jwt');
        }
      }
    )
  }

  @observable token: string | null = window.localStorage.getItem('jwt');
  @observable appLoaded = false;

  @action setToken = (token: string | null) => {
    this.token = token;
  }

  @action setAppLoaded = () => {
    this.appLoaded = true;
  }
}