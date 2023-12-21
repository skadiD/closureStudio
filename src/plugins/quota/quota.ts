export interface canAddGameResult {
  message: string;
  isLocked: boolean;
}

export const allowGameCreate = (
  slot: Registry.Slot,
  userQuota: Registry.UserInfo,
  isVerify: boolean
) => {
  let response: canAddGameResult = {
    message: "请完成手机绑定",
    isLocked: true,
  };
  if (!userQuota) {
    return response;
  }

  if (
    slot.ruleFlags.includes("slot_account_format_is_phone") &&
    slot.ruleFlags.includes("slot_account_sms_verified")
  ) {
    response.message = "添加第一个托管";
    response.isLocked = false;
    return response;
  }

  if (slot.ruleFlags.includes("slot_user_sms_verified") && isVerify) {
    response.message = "添加游戏托管";
    response.isLocked = false;
    return response;
  }

  if (slot.ruleFlags.includes("slot_user_qq_verified") && isVerify) {
    if (!userQuota.idServerQQ) {
      response.message = "请完成QQ绑定";
      return response;
    }
  }
  return response;
};
