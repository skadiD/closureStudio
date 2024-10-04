<template>
    <div class="flex h-full">
        <div class="w-full flex-col max-w-4xl 2xl:max-w-6xl xl:mr-auto s-margin md:!flex"
            :class="show ? 'xl:ml-0 !hidden' : 'lg:ml-[calc((100vw-56rem)/2)] 2xl:ml-[calc((100vw-72rem)/2)]'">
            <div class="bg-base-300 shadow-lg rounded-lg px-4 py-1 blog relative">
                <div class="text-2xl md:text-4xl font-bold text-info mt-3">📢 今日特价</div>
                <p v-for="k in config.announcement?.split('\n') || ['可露希尔逃跑了']">
                    {{ k }}
                </p>
                <div class="divider mt-0">个人信息</div>
                <StatusMessage />

            </div>
            <IndexStatus />
            <div class="text-2xl font-bold">我的托管（{{ userQuota.data.value?.slots.filter((slot) => slot.gameAccount !==
                null)?.length }} 已用 / {{ userQuota.data.value?.slots?.length }} 可用）</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div v-for="(slot, key) in userQuota.data.value?.slots" :key="key">
                    <GameAddCard v-if="!slot.gameAccount" :slot="slot" :userQuota="userQuota.data.value" :key="key"
                        @click="createGameButtonOnClick(slot, slot.uuid)" />
                    <GameAccount v-else :game="findGame(slot.gameAccount)" @click="openGameConf(slot.gameAccount)">
                        <div class="divider mt-2 mb-3 text-info font-arknigths text-xl">START</div>
                        <div class="grid gap-4 grid-cols-2 mt-2">
                            <button class="btn btn-outline btn-sm btn-block btn-primary"
                                v-if="isUpdateStatus(slot.gameAccount)" :disabled="isLoading"
                                @click.stop="updatePasswdOnClick(slot)">更新</button>

                            <button class="btn btn-outline btn-sm btn-block btn-primary"
                                v-else-if="isSuspendStatus(slot.gameAccount)" @click="suspendOnClick(slot.gameAccount)"
                                :disabled="isLoading">暂停</button>

                            <button class="btn btn-outline btn-sm btn-block btn-info" v-else
                                @click="loginOnClick(slot.gameAccount)"
                                :disabled="isLoginBtnDisabled(slot.gameAccount)">启动</button>

                            <button :disabled="isLoading" class="btn btn-outline btn-sm btn-block btn-error"
                                @click.stop="deleteOnClick(slot.uuid, slot.gameAccount)">删除</button>
                        </div>
                    </GameAccount>
                </div>
            </div>
        </div>
        <div class="bg-base-300 flex-1 flex flex-col md:ml-8 max-w-xl p-4 shadow-lg rounded-lg items-center animate__animated"
            v-show="show" :class="show ? 'animate__fadeInRight' : 'animate__fadeOutRight'">
            <GamePanel :account="selectGame" />
        </div>
    </div>
</template>
<script setup lang="ts">
import "animate.css";
import { onMounted, ref, watch } from "vue";
import { GameAccount, GameAddCard, GamePanel, IndexStatus } from "../../components/card/index";
import { StatusMessage } from "../../components/dashboard/user";
import GeeTestNotify from "../../components/dialog/GeeTestNotify.vue";
import UpdateGamePasswd from "../../components/dialog/UpdateGamePasswd.vue";
import YouMayKnow from "../../components/dialog/YouMayKnow.vue";
import { Type } from "../../components/toast/enum";
import { Auth_Send_SMS, doDelGame, doGameLogin, doUpdateGameConf } from "../../plugins/axios";
import { getRealGameAccount, setMsg } from "../../plugins/common";
import { NOTIFY } from "../../plugins/config";
import showDialog from "../../plugins/dialog/dialog";
import updateCaptchaHandler from "../../plugins/geeTest/captcha";
import { allowGameCreate, canDeleteGame } from "../../plugins/quota/quota";
import { userQuota } from "../../plugins/quota/userQuota";
import { config, findGame, getFirstGame } from "../../plugins/gamesInfo/data";
import { userStore } from "../../store/user";
import { queryGamesInfo } from "../../plugins/gamesInfo/net";
import CreateGame from "../../components/dialog/CreateGame.vue";
const show = ref(false);
const user = userStore();
const selectedSlotUUID = ref("");
const selectedRegisterForm = ref({} as Registry.AddGameForm); // for update password

// start
queryGamesInfo();
const firstGame = getFirstGame;
// 补发验证码
watch(firstGame, (value) => {
    if (user.isVerify) {
        return;
    }
    if (!value) {
        return;
    }
    if (value.status.created_at > 0) {
        let phone = value.status.account;
        // account is G18319999999
        // if the first character is not a number, split it
        if (isNaN(parseInt(phone[0]))) {
            phone = phone.slice(1);
        }
        Auth_Send_SMS({ phone: phone });
    }
});

onMounted(async () => {
    showDialog(YouMayKnow);
});

const createGameButtonOnClick = (slot: Registry.Slot, slotUUID: string) => {
    if (!userQuota.value.data.value) {
        setMsg("游戏托管槽位数据异常，无法提交", Type.Warning);
        return;
    }
    const response = allowGameCreate(
        slot,
        userQuota.value.data.value,
        user.isVerify // status code == 1 || 2
    );
    if (response.isLocked) {
        setMsg(response.message, Type.Warning);
        return;
    }
    showDialog(CreateGame, {
        slotUUID: slotUUID,
        isFirst: !user.isVerify,
        loginFunc: gameLogin
    });
};

const isUpdateStatus = (gameAccount: string) => {
    const game = findGame(gameAccount);
    if (!game) return false;
    return game.status.code === -1 && game.status.text.indexOf("密码错误") != -1;
};

const isSuspendStatus = (gameAccount: string) => {
    const game = findGame(gameAccount);
    if (!game) return false;
    return game.status.code === 2;
};

const isLoginBtnDisabled = (gameAccount: string) => {
    const game = findGame(gameAccount);
    if (isLoading.value) return true;
    if (!game) return false;
    return game.status.code === 1;
};

const suspendOnClick = (gameAccount: string) => {
    show.value = !show.value;
    suspend(gameAccount);
};
const loginOnClick = (gameAccount: string) => {
    show.value = !show.value;
    gameLogin(gameAccount);
};

const isLoading = ref(false);

const gameLogin = async (account: string) => {
    isLoading.value = true;
    // 先通过 recaptcha 加载失败的时候直接降级到 geeTest
    if (!window.grecaptcha) {
        await startCaptcha(geeTestLoginGameOnSuccess(account));
        isLoading.value = false;
        return;
    }

    // 使用 Promise 包装 grecaptcha.ready 和 execute 操作
    const token = await new Promise<string>((resolve) => {
        window.grecaptcha.ready(() => {
            window.grecaptcha
                .execute("6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN", { action: "submit" })
                .then((res) => resolve(res || "")); // 确保返回值为字符串，即使为空也返回 ""
        });
    });

    // 检查 token 是否为空
    if (token === "") {
        setMsg("图灵测试エロ,请检查你的 Network", Type.Warning);
        isLoading.value = false;
        return;
    }
    // 进行登录
    await login(token, account);
    isLoading.value = false;
};


const suspend = (account: string) => {
    isLoading.value = true;
    const config: ApiGame.Config = {
        is_stopped: true
    };
    doUpdateGameConf(account, config).then((res) => {
        isLoading.value = false;
        setMsg(res.message, Type.Info);
    });
};

const login = async (token: string, account: string) => {
    try {
        isLoading.value = false;
        const resp = await doGameLogin(token, account);
        if (resp.code === -1100) {
            setMsg("请继续完成滑块验证", Type.Info);
            updateCaptchaHandler(geeTestLoginGameOnSuccess(account));
            return;
        }
        if (resp.code === 1) {
            setMsg("启动成功", Type.Success);
            showDialog(GeeTestNotify);
        } else {
            setMsg(resp.message, Type.Warning);
        }
    } catch (e) {
    } finally {
        isLoading.value = false;
    }
};

const deleteGame = async (token: string, slotUUID: string) => {
    doDelGame(slotUUID, token)
        .then((res) => {
            if (res.code === -1100) { // 通过 geeTest
                setMsg('请继续完成滑块验证', Type.Info)
                updateCaptchaHandler(geeTestDeleteGameOnSuccess(slotUUID))
                return
            }
            if (res.code === 1) {
                setMsg("删除成功", Type.Success);
                return;
            }
            setMsg(res.message, Type.Warning);
        })
        .finally(() => {
            isLoading.value = false;
        });
};

const deleteOnClick = async (slotUUID: string, gameAccount: string) => {
    // can you delete it?
    if (userQuota.value.data.value === undefined) {
        setMsg("游戏托管槽位数据异常，无法提交", Type.Warning);
        return;
    }

    if (!canDeleteGame(userQuota.value.data.value, gameAccount)) {
        setMsg(NOTIFY.NOT_ALLOW_DELETE_GAME, Type.Warning);
        return;
    }
    isLoading.value = true;
    if (!window.grecaptcha) {
        updateCaptchaHandler(geeTestDeleteGameOnSuccess(slotUUID));
        return;
    }
    window.grecaptcha.ready(async () => {
        const token = await window.grecaptcha.execute("6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN", { action: "submit" });
        if (token === "") {
            setMsg("pirnt（'图灵测试エロ,请检查你的 Network\")", Type.Warning);
            return;
        }
        await deleteGame(token, slotUUID);
        // window.captchaObj.showCaptcha();
    });
};

const updatePasswdOnClick = async (slot: Registry.Slot) => {
    // can you delete it?
    if (!slot.gameAccount) return;
    const game = findGame(slot.gameAccount);
    if (!game) return;
    selectedSlotUUID.value = slot.uuid;
    selectedRegisterForm.value.account = getRealGameAccount(game.status.account);
    selectedRegisterForm.value.platform = game.status.platform;
    selectedRegisterForm.value.password = "";
    showDialog(UpdateGamePasswd, {
        slotUUID: slot.uuid,
        form: selectedRegisterForm.value
    });
};

// geeTest
const geeTestDeleteGameOnSuccess = (slotUUID: string) => {
    return (geeTestToken: string) => {
        deleteGame(geeTestToken, slotUUID);
    };
};
const geeTestLoginGameOnSuccess = (gameAccount: string) => {
    return async (geeTestToken: string) => {
        await doGameLogin(geeTestToken, gameAccount);
    };
};

// 账号配置面板
const selectGame = ref("");
const openGameConf = (account: string) => {
    const game = findGame(account);
    if (!game) return;
    // 这些感觉可以再优化下
    selectGame.value = show.value ? "" : game.status.account;
    show.value = !show.value;
};


function startCaptcha(arg0: (geeTestToken: string) => void) {
    throw new Error("Function not implemented.");
}
</script>
<style>
div,
img {
    user-select: none;
    -webkit-user-drag: none;
}
</style>
