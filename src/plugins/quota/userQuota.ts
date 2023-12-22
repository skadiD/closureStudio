import { computed, ref } from "vue";
import { fetchUserSlots } from "../axios";

const userQuotaData = ref<Registry.UserInfo>();

export const userQuota = computed(() => {
  const queryMe = () => {
    fetchUserSlots().then((res) => {
      if (res.data) {
        res.data.slots = quotaSlotsSort(res.data.slots);
        userQuotaData.value = res.data;
      }
    });
  };
  return {
    data: userQuotaData,
    queryMe: queryMe,
  };
});

const quotaSlotsSort = (slotArray: Registry.Slot[]) => {
  // 分离gameAccount不为null的元素
  const gameAccountNotNull = slotArray.filter(
    (item) => item.gameAccount !== null
  );
  // 分离gameAccount为null的元素
  const gameAccountNull = slotArray.filter((item) => item.gameAccount === null);
  gameAccountNotNull.sort((a, b) => a.createdAt - b.createdAt);
  gameAccountNull.sort((a, b) => {
    const aContainsBothFlags =
      a.ruleFlags.includes("slot_account_format_is_phone") &&
      a.ruleFlags.includes("slot_account_sms_verified");
    const bContainsBothFlags =
      b.ruleFlags.includes("slot_account_format_is_phone") &&
      b.ruleFlags.includes("slot_account_sms_verified");

    if (aContainsBothFlags === bContainsBothFlags) {
      return a.createdAt - b.createdAt; // 如果两者都有或都没有这两个标志，则按 createdAt 排序
    }
    return aContainsBothFlags ? -1 : 1; // 如果a包含这两个标志，而b不包含，则a应该排在前面，反之则b排在前面
  });
  return [...gameAccountNotNull, ...gameAccountNull];
};
