import { RootStore } from './root.store';
import { observable, action } from 'mobx';
export default class ModalStore {
  
  constructor(public rootStore: RootStore) { }

  // observables default to deep observe, but we want it to observe only one property deep
  // so it doesnt care about changes to the body content component. Change to shallow to solve
  @observable.shallow modal = {
    open: false,
    body: null,
  }

  @action openModal = (content: any) => {
    this.modal.open = true;
    this.modal.body = content;
  }

  @action closeModal = () => {
    this.modal.open = false;
    this.modal.body = null;
  }
}