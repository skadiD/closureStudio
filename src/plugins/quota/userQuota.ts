import { computed, ref } from "vue";
import { fetchUserSlots } from "../axios";

const userQuotaData = ref<Registry.UserInfo>();

export const userQuota = computed(() => {
  const queryMe = () => {
    fetchUserSlots().then((res) => {
      if (res.data) userQuotaData.value = res.data;
    });
  }
  return {
    data: userQuotaData,
    queryMe: queryMe,
  };
});
