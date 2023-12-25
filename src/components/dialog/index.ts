// 似乎没有更好的方案 先采用全局变量的方式 可能会导致内存溢出
import { ref } from "vue";
import QQBindDialog from "./QQBindDialog.vue";
import NetworkDialog from "./NetworkDialog.vue";
import RealNameDialog from "./RealNameDialog.vue";
import BattleScreenShotsDialog from "./BattleScreenShotsDialog.vue";
import ConfigDialog from "./ConfigDialog.vue";
import UpdateGamePasswdDialog from "./UpdateGamePasswdDialog.vue";
let QQBindRef = ref();
let BattleScreenShotsRef = ref();
let RealNameRef = ref();
let ConfigModelRef = ref();
let UpdateGamePasswdRef = ref();
export {
  QQBindDialog,
  NetworkDialog,
  RealNameDialog,
  BattleScreenShotsDialog,
  ConfigDialog,
  UpdateGamePasswdDialog,
  QQBindRef,
  RealNameRef,
  BattleScreenShotsRef,
  ConfigModelRef,
  UpdateGamePasswdRef,
};
