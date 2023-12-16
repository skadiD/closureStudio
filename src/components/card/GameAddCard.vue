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
import { computed, ref, watch } from 'vue'
interface Props {
  slot: Registry.Slot,
  userQuota: Registry.UserInfo,
}
const props = withDefaults(defineProps<Props>(), {
  slot: undefined,
  userQuota: undefined,
});

const isLocked = ref(false);

const message = computed(() => {
  if (!props.userQuota) {
    isLocked.value = true;
    return '添加游戏托管';
  }

  if (props.slot.ruleFlags.includes("slot_account_format_is_phone") && props.slot.ruleFlags.includes("slot_account_sms_verified")) {
    return '添加第一个托管';
  }

  if (props.slot.ruleFlags.includes("slot_user_sms_verified")) {
    if (props.userQuota.idServerPhone) {
      return '添加游戏托管';
    }
    isLocked.value = true;
    return '请完成绑定';
  }

  if (props.slot.ruleFlags.includes("slot_user_qq_verified")) {
    if (props.userQuota.idServerPhone && props.userQuota.idServerQQ) {
      return '添加游戏托管';
    }
    isLocked.value = true;
    if (!props.userQuota.idServerPhone) {
      return '请完成绑定';
    }
    if (!props.userQuota.idServerQQ) {
      return '请完成QQ绑定';
    }
  }
}
);
</script>