import QQBindDialog from "./QQBindDialog.vue";
import NetworkDialog from "./NetworkDialog.vue";
import RealNameDialog from "./RealNameDialog.vue";
import BattleScreenShotsDialog from "./BattleScreenShotsDialog.vue";
import ConfigDialog from "./ConfigDialog.vue";
import UpdateGamePasswdDialog from "./UpdateGamePasswdDialog.vue";
import YouMayKnowDialog from "./YouMayKnowDialog.vue";
export const dialogClose = (name: string) => {
  const dialog: HTMLDialogElement | null = document.documentElement.querySelector(`#${name}`)
  if (dialog) dialog.close()
}
export const dialogOpen = (name: string) => {
    const dialog: HTMLDialogElement | null = document.documentElement.querySelector(`#${name}`)
    if (dialog) dialog.showModal()
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
