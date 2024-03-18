<template>
    <dialog id="UpdateGamePasswd" class="modal" style="outline-width: 0">
        <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
            <div class="text-3xl text-info font-bold text-center">修改密码</div>
            <div class="divider">账号信息</div>
            <div class="w-full mb-3">
                <div class="s-combo mb-6">
                    <input class="s-input peer focus:ring-info" disabled v-model="props.form.account">
                    <label class="s-label peer-focus:text-info">登录账号</label>
                </div>
                <div class="s-combo">
                    <input class="s-input peer focus:ring-info" v-model="form.password">
                    <label class="s-label peer-focus:text-info">密码（请确认无误）</label>
                </div>
            </div>
            <div class="divider my-4">服务器选择</div>
            <div class="w-full mb-3">
                <label class="label cursor-pointer">
                    <span class="text-xl">BiliBili服</span>
                    <input disabled type="radio" :value="2" v-model="form.platform" id="bili"
                        class="radio checked:bg-blue-500" />
                </label>
                <label class="label cursor-pointer">
                    <span class="text-xl">官服（安卓 / IOS）</span>
                    <input disabled type="radio" :value="1" v-model="form.platform" id="official"
                        class="radio checked:bg-red-500" />
                </label>
            </div>
            <div class="flex justify-center space-x-4 mb-3">
                <button @click="dialogClose('UpdateGamePasswd')" class="btn btn-error btn-outline w-24">
                    <span v-if="isLoading" class="loading loading-bars" />
                    关闭
                </button>
                <button class="btn btn-info w-24" @click="updateGamePasswdOnBtnClick">
                    <span v-if="isLoading" class="loading loading-bars" />
                    更新
                </button>
            </div>
        </div>
    </dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { setMsg } from '../../plugins/common';
import { Type } from '../toast/enmu';
import { doUpdateGamePasswd } from '../../plugins/axios';
import updateCaptchaHandler from '../../plugins/geetest/captcha';
import {dialogClose} from "./index";


interface Props {
    slotUUID: string;
    form: Registry.AddGameForm;
}

const props = withDefaults(defineProps<Props>(), {
    slotUUID: "",
    form: () => {
        return {
            account: "",
            password: "",
            platform: 1,
        } as Registry.AddGameForm;
    },
});

const form = ref<Registry.AddGameForm>(props.form)
const isLoading = ref(false);

const updateGamePasswdOnBtnClick = () => {
    if (props.slotUUID === '') {
        setMsg('请刷新页面后重试', Type.Warning)
        return;
    }
    if (form.value.password.length === 0 || form.value.password.length > 32) {
        setMsg('请刷新页面后重试', Type.Warning)
        return;
    }

    updateCaptchaHandler(geetestUpdateGamePasswdOnSuccess(props.slotUUID));
    isLoading.value = true;
    dialogClose('UpdateGamePasswd');
    window.grecaptcha?.ready(async () => {
        const token = await window.grecaptcha.execute('6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN', { action: 'submit' })
        if (token === "") {
            setMsg("pirnt（'图灵测试エロ,请检查你的 Network\")", Type.Warning);
            isLoading.value = false;
            return;
        }
        updatePasswd(token, props.slotUUID);
    })
}

const updatePasswd = async (token: string, slotUUID: string) => {
    doUpdateGamePasswd(slotUUID, token, form.value)
        .then((res) => {
            if (res.code === 1) {
                setMsg("修改密码成功", Type.Success);
                return;
            } else {
                setMsg(res.message, Type.Warning);
                window.captchaObj.showCaptcha();
            }
        }).finally(() => {
            isLoading.value = false;
        })
};

const geetestUpdateGamePasswdOnSuccess = (uuid: string) => {
    return (geetestToken: string) => {
        doUpdateGamePasswd(uuid, geetestToken, form.value)
    }
}

</script>
    