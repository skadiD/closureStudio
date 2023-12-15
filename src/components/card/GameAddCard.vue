<template>
  <div
    class="hover:scale-105 hover:shadow-lg hover:bg-info/10 active:bg-info/10 active:scale-95 duration-300 shadow-lg rounded-2xl p-3 s-pro flex justify-center min-h-[8rem]">
    <div class="text-center flex justify-center flex-col">
      <div class="text-4xl font-bold">+</div>
      <div class="text-xl text-info">{{ message }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
interface Props {
  slot: Registry.Slot,
  userInfo: Registry.UserInfo,
}
const props = withDefaults(defineProps<Props>(), {
  slot: undefined,
  userInfo: undefined,
});

const message = ref('')
const isLocked = ref(true)
watch([() => props.slot, () => props.userInfo], ([slot, userInfo]) => {
  if (!slot || !userInfo) {
    message.value = '添加托管'
  }
  if (slot.ruleFlags.includes("slot_account_format_is_phone") && slot.ruleFlags.includes("slot_account_sms_verified")) {
    message.value = '添加第一个托管';
    isLocked.value = false;
  } else if (slot.ruleFlags.includes("slot_user_sms_verified")) {
    if (userInfo.idServerPhone) {
      message.value = '添加游戏托管';
      isLocked.value = false;
    } else {
      message.value = '请完成绑定';
      isLocked.value = true;
    }
  } else if (slot.ruleFlags.includes("slot_user_qq_verified")) {
    if (!userInfo.idServerPhone) {
      message.value = '添加游戏托管';
      isLocked.value = false;
    } else if (!userInfo.idServerQQ) {
      message.value = '请完成QQ绑定';
      isLocked.value = false;
    } else {
      message.value = '添加游戏托管';
      isLocked.value = true;
    }
  }
})



</script>