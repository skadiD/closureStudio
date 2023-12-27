<template>
  <dialog id="RealName" class="modal" style="outline-width: 0">
    <div class="modal-box">
      <div class="text-3xl text-info font-bold text-center">归属验证</div>
      <div class="s-combo mb-6 mt-4">
        <input class="s-input peer focus:ring-info" v-model="smsCode"/>
        <label class="s-label peer-focus:text-info">请输入收到的验证码</label>
      </div>
      <button class="btn btn-block btn-info mt-2" @click="smsBtn">
        确认
      </button>
    </div>
  </dialog>
</template>
<script lang="ts" setup>
import {ref} from "vue";
import {Auth_Refresh, Auth_Verify} from "../../plugins/axios";
import {setMsg} from "../../plugins/common";
import {Type} from "../toast/enmu";
import {userStore} from "../../store/user";
import {dialogClose} from "./index";

// 短信验证码
const smsCode = ref("");
const user = userStore();
const smsBtn = () => {
  if (smsCode.value !== "") {
    Auth_Verify(smsCode.value).then((res) => {
      if (res.code === 1) {
        setMsg("认证成功", Type.Success);
        Auth_Refresh().then((res) => {
          if (res.data) user.login(res.data.token);
          dialogClose('RealName')
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