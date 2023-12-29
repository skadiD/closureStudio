// 似乎没有更好的方案 先采用全局变量的方式 可能会导致内存溢出
import { ref } from "vue";
import QQBindDialog from "./QQBindDialog.vue";
import NetworkDialog from "./NetworkDialog.vue";
import RealNameDialog from "./RealNameDialog.vue";
import BattleScreenShotsDialog from "./BattleScreenShotsDialog.vue";
import ConfigDialog from "./ConfigDialog.vue";
import UpdateGamePasswdDialog from "./UpdateGamePasswdDialog.vue";
import YouMayKnowDialog from "./YouMayKnowDialog.vue";
import { selectRandomElement } from "../../plugins/common";
import { exitsArray } from "../../plugins/animate/animate";


export const dialogClose = (name: string) => {
  const dialog: HTMLDialogElement | null = document.documentElement.querySelector(`#${name}`);
  if (dialog) {
    dialog.close();
  }
}

export const dialogOpen = (name: string) => {
  const dialog: HTMLDialogElement | null = document.documentElement.querySelector(`#${name}`);
  if (dialog) {
    dialog.showModal();
    dialog.classList.add('animate__fadeIn');
    dialog.addEventListener('animationend', () => {
      dialog.classList.remove('animate__fadeIn');
    }, { once: true });
  }
}

export const dialogIsOpen = (name: string) => {
  const dialog: HTMLDialogElement | null = document.documentElement.querySelector(`#${name}`)
  if (dialog) return dialog.open
  return false
}
export {
  QQBindDialog,
  NetworkDialog,
  RealNameDialog,
  BattleScreenShotsDialog,
  ConfigDialog,
  UpdateGamePasswdDialog,
  YouMayKnowDialog,
};
