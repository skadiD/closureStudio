import { computed, ref } from "vue";
import { fetchUserSlots } from "../axios";

const userQuotaData = ref<Registry.UserInfo>();

export const userQuota = computed(() => {
    const queryMe = async () => {
        try {
            const resp = await fetchUserSlots();
            if (resp.data) {
                resp.data.slots = quotaSlotsSort(resp.data.slots);
                return resp.data;
            }
        } catch (error) {
            console.error("Error during queryMe:", error);
        }
    };
    return {
        data: userQuotaData,
        queryMe: queryMe
    };
});

const quotaSlotsSort = (slotArray: Registry.Slot[]) => {
    // 分离gameAccount不为null的元素
    const gameAccountNotNull = slotArray.filter((item) => item.gameAccount !== null);
    // 分离gameAccount为null的元素
    const gameAccountNull = slotArray.filter((item) => item.gameAccount === null);
    gameAccountNotNull.sort((a, b) => a.createdAt - b.createdAt);
    gameAccountNull.sort((a, b) => {
        const aContainsBothFlags = a.ruleFlags.includes("slot_account_format_is_phone") && a.ruleFlags.includes("slot_account_sms_verified");
        const bContainsBothFlags = b.ruleFlags.includes("slot_account_format_is_phone") && b.ruleFlags.includes("slot_account_sms_verified");

        if (aContainsBothFlags === bContainsBothFlags) {
            return a.createdAt - b.createdAt; // 如果两者都有或都没有这两个标志，则按 createdAt 排序
        }
        return aContainsBothFlags ? -1 : 1; // 如果a包含这两个标志，而b不包含，则a应该排在前面，反之则b排在前面
    });
    return [...gameAccountNotNull, ...gameAccountNull];
};
export const getSMSSlot = (slotArray: Registry.Slot[]) => {
    //  "slot_account_format_is_phone",
    // "slot_account_sms_verified"
    return slotArray.find((item) => item.ruleFlags.includes("slot_account_format_is_phone") && item.ruleFlags.includes("slot_account_sms_verified"));
};
