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
                <!-- <p v-if="user.info.status === 0">
          o(╥﹏╥)o 你的账号已被封禁，如有疑问请联系管理员
        </p> -->
                <p v-if="user.info.status <= 0 && gameList?.length === 0">
                    <!-- 你的账号没有完成
          <span class="text-info font-bold">【真实玩家认证】</span>，请先添加第一个游戏账号后完成绑定～(∠・ω&lt; )⌒★ -->
                    好极了!!! 你完成了注册!!! 请添加第一个游戏账号并进行托管～(∠・ω&lt; )⌒★
                </p>

                <p
                    v-else-if="user.info.status === -1 && userQuota.data.value?.idServerPhone.length === 0 && gameList[0]?.status.created_at == 0">
                    了不起!!! 你添加了一个游戏!!! 现在你可以启动游戏进行托管!!!</p>

                <p
                    v-else-if="user.info.status === -1 && userQuota.data.value?.idServerPhone.length === 0 && gameList[0]?.status.created_at != 0">
                    非常棒!!! 你托管了一个游戏!!! 手机验证码已经发送， 完成【手机号：{{ gameList[0]?.status.account?.replace(/(\d{3})\d{6}(\d{2})/,
                        "$1****$2") }}】绑定认证<b class="cursor-pointer"
                        @click="handleRealNameDialogOpen">👉点我解锁👈</b>不限时游戏托管，并提升托管数量。 剩余托管体验时间 <b>【{{
                            calc(gameList[0]?.status.created_at, now) }}】</b>。<br />
                </p>
                <p v-if="user.isVerify && userQuota.data.value?.idServerQQ.length === 0">完成QQ账号验证解锁更多槽位。<b
                        class="cursor-pointer" @click="handleQQBindDialogOpen()">👉点我解锁👈</b>提升托管数量</p>
                <p>如果博士遇到问题(验证码没有收到，游戏异常等等)，使用<b class="cursor-pointer" @click="navigateToTicket">👉工单系统👈</b>请求协助。</p>
                <p v-if="!isQueryWxPusher && !wxPuhser">博士！！！你怎么还没有<b class="cursor-pointer"
                        @click="navigateToWXPusher">👉绑定微信👈</b></p>

            </div>
            <IndexStatus />
            <div class="text-2xl font-bold">我的托管（{{ userQuota.data.value?.slots.filter((slot) => slot.gameAccount !==
                null)?.length }} 已用 / {{ userQuota.data.value?.slots?.length }} 可用）</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div v-for="(slot, key) in userQuota.data.value?.slots" :key="key">
                    <GameAddCard v-if="!slot.gameAccount" :slot="slot" :userQuota="userQuota.data.value" :key="key"
                        @click="addGameOnClick(slot, slot.uuid)" />
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
            <input type="checkbox" id="addModel" class="modal-toggle" v-model="addModel" />
            <div v-if="addModel" class="modal" role="dialog">
                <div class="bg-base-100 mx-4 p-6 shadow-lg max-w-xl rounded-lg">
                    <GameAdd :is-first="!user.isVerify" :uuid="selectedSlotUUID" @close="addModel = false" />
                </div>
            </div>
            <!-- <UpdateGamePasswdDialog :slotUUID="selectedSlotUUID" :form="selectedRegisterForm" /> -->
        </div>
        <div class="bg-base-300 flex-1 flex flex-col md:ml-8 max-w-xl p-4 shadow-lg rounded-lg items-center animate__animated"
            v-show="show" :class="show ? 'animate__fadeInRight' : 'animate__fadeOutRight'">
            <GamePanel :account="selectGame" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { config, findGame, gameList, globalSSR, startSSE } from "../../plugins/sse";
import "animate.css";
import { userStore } from "../../store/user";
import { doDelGame, doGameLogin, doUpdateGameConf } from "../../plugins/axios";
import { getRealGameAccount, setMsg } from "../../plugins/common";
import { Type } from "../../components/toast/enmu";
import { GameAccount, GameAdd, GameAddCard, GamePanel, IndexStatus } from "../../components/card/index";
import { allowGameCreate } from "../../plugins/quota/quota";
import updateCaptchaHandler from "../../plugins/geetest/captcha";
import { userQuota } from "../../plugins/quota/userQuota";
import { canDeleteGame } from "../../plugins/quota/quota";
import { NOTIFY } from "../../plugins/config";
import NewSSRNotice from "../../components/dialog/NewSSRNotice.vue";
import { router } from "../../plugins/router";
import { useWXPusher } from "../../plugins/wxPusher/wxPusher";
import showDialog from "../../plugins/dialog/dialog";
import YouMayKnow from "../../components/dialog/YouMayKnow.vue";
import UpdateGamePasswd from "../../components/dialog/UpdateGamePasswd.vue";
import GeetestNotify from "../../components/dialog/GeetestNotify.vue";
import QQBind from "../../components/dialog/QQBind.vue";
import RealName from "../../components/dialog/RealName.vue";
const show = ref(false);
const user = userStore();
const selectedSlotUUID = ref("");
const selectedRegisterForm = ref({} as Registry.AddGameForm); // for update password

// start
startSSE(user);
const addModel = ref(false);
const { isQueryWxPusher, wxPuhser, queryWxPusher } = useWXPusher();



onMounted(() => {
    showDialog(YouMayKnow);
    queryWxPusher();
});

const addGameOnClick = (slot: Registry.Slot, slotUUID: string) => {
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
    selectedSlotUUID.value = slotUUID;
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

// 计算到期时间
const calc = (ts1: number, ts2: number) => {
    if (!ts1) return "24小时";
    ts1 += 86400;
    const during = ts1 - ts2;
    if (during <= 0) return "请先启动游戏托管";
    const hours = Math.floor(during / (60 * 60));
    const minutes = Math.abs(Math.floor((during % (60 * 60)) / 60));
    return `${hours}小时${minutes}分钟`;
};
const now = Math.round(Date.now() / 1000);
const isLoading = ref(false);

const gameLogin = (account: string) => {
    isLoading.value = true;
    // 先通过 recaptcha 加载失败的时候直接降级到 geetest
    if (!window.grecaptcha) {
        updateCaptchaHandler(geetestLoginGameOnSuccess(account));
        return;
    }
    window.grecaptcha.ready(async () => {
        const token = await window.grecaptcha.execute("6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN", { action: "submit" });
        if (token === "") {
            setMsg("pirnt（'图灵测试エロ,请检查你的 Network\")", Type.Warning);
            isLoading.value = false;
            return;
        }
        login(token, account);
        // window.captchaObj.showCaptcha();
    });
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

const login = (token: string, account: string) => {
    doGameLogin(token, account).then((res) => {
        isLoading.value = false;
        if (res.code === -1100) { // 通过 geetest
            setMsg('请继续完成滑块验证', Type.Info)
            updateCaptchaHandler(geetestLoginGameOnSuccess(account))
            return
        }
        if (res.code === 1) {
            setMsg("启动成功", Type.Success);
            showDialog(GeetestNotify);
        } else {
            setMsg(res.message, Type.Warning);
        }
    });
};

const deleteGame = async (token: string, slotUUID: string) => {
    doDelGame(slotUUID, token)
        .then((res) => {
            if (res.code === -1100) { // 通过 geetest
                setMsg('请继续完成滑块验证', Type.Info)
                updateCaptchaHandler(geetestDeleteGameOnSuccess(slotUUID))
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
        updateCaptchaHandler(geetestDeleteGameOnSuccess(slotUUID));
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

const handleQQBindDialogOpen = () => {
    showDialog(QQBind);
};

const handleRealNameDialogOpen = () => {
    showDialog(RealName);
};

const navigateToTicket = () => {
    // using vue-router
    router.push("/ticket");
};
const navigateToWXPusher = () => {
    // using vue-router
    router.push("/profile/wechat");
};
// geetest
const geetestDeleteGameOnSuccess = (slotUUID: string) => {
    return (geetestToken: string) => {
        deleteGame(geetestToken, slotUUID);
    };
};
const geetestLoginGameOnSuccess = (gameAccount: string) => {
    return (geetestToken: string) => {
        doGameLogin(geetestToken, gameAccount);
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

</script>
<style>
div,
img {
    user-select: none;
    -webkit-user-drag: none;
}
</style>
