import ActivityStore from "./activities.store";
import UserStore from "./user.store";
import { createContext } from "react";
import { configure } from "mobx";
import CommonStore from "./common.store";
import ModalStore from "./modal.store";
import ProfileStore from "./profile.store";

configure({enforceActions: "always"});

export class RootStore {
  activityStore: ActivityStore;
  userStore: UserStore;
  commonStore: CommonStore;
  modalStore: ModalStore;
  profileStore: ProfileStore;

  constructor() {
    this.activityStore = new ActivityStore(this);
    this.userStore = new UserStore(this);
    this.commonStore = new CommonStore(this);
    this.modalStore = new ModalStore(this);
    this.profileStore = new ProfileStore(this);
  }
}

export const RootStoreContext = createContext(new RootStore());