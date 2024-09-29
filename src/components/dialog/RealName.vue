<template>
  <div class="modal-box">
    <div class="text-3xl text-info font-bold text-center">归属验证</div>
    <div class="s-combo mb-6 mt-4">
      <input class="s-input peer focus:ring-info" v-model="smsCode" />
      <label class="s-label peer-focus:text-info">请输入收到的验证码</label>
    </div>
    <button class="btn btn-block btn-info mt-2" @click="handleCloseBtnOnClick">
      取消
    </button>
    <button class="btn btn-block btn-info mt-2" @click="smsBtn">
      确认
    </button>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { Auth_Refresh, Auth_Verify } from "../../plugins/axios";
import { setMsg } from "../../plugins/common";
import { Type } from "../toast/enmu";
import { userStore } from "../../store/user";
import { DialogComponentProps } from "../../plugins/dialog/dialog";

const props = withDefaults(defineProps<DialogComponentProps>(), {
  dialogClose: () => { }
});
const { dialogClose } = props;

const smsCode = ref("");
const user = userStore();

const handleCloseBtnOnClick = () => {
  dialogClose();
}
const smsBtn = () => {
  if (smsCode.value !== "") {
    Auth_Verify(smsCode.value).then((res) => {
      if (res.code === 1) {
        setMsg("认证成功,请重新登录", Type.Success);
        Auth_Refresh().then((res) => {
          if (res.data) {
            user.login(res.data.token);
          }
          window.location.reload();
          dialogClose();
        });
        return;
      }
      setMsg(res.message, Type.Warning);
    });
    return;
  }
  setMsg("请输入验证码", Type.Warning);
};
</script>