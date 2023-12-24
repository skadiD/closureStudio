// 似乎没有更好的方案 先采用全局变量的方式 可能会导致内存溢出
import { computed, ref } from "vue";
import QQBindDialog from "./QQBindDialog.vue";
import NetworkDialog from "./NetworkDialog.vue";
import RealNameDialog from "./RealNameDialog.vue";

let QQBindRef = ref();
let RealNameRef = ref();

export {
    QQBindDialog,
    NetworkDialog,
    RealNameDialog,
    QQBindRef,
    RealNameRef,
};
