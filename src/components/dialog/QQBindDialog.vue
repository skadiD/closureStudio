<template>
    <BaseDialog :dialogId="dialogId">
        <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
            <h2>QQ 绑定</h2>
            <div class="divider divider-warning"></div>
            <div class="flex justify-center">
                <span v-if="isLoading" class="loading loading-bars" />
            </div>
            <div v-if="!isLoading">
                <div role="alert" class="rounded border-s-4 border-warning bg-warning/10 p-4 space-y-2 my-4">请点击下方QQ进行复制, 并发送到QQ官方群组中。</div>
                <div>
                    <div class="flex justify-center p-2 mb-3">
                        <a target="_blank" @click="copyQQCodeAndOpenLink" href="https://qm.qq.com/cgi-bin/qm/qr?k=YNU1S-_hVFD89w3cj8-ewkPFXXSiBRbY&jump_from=webapi&authKey=BU70QS4whXzJIi62KWNd9h8HZB5Vl2FSnjlrqYYf08RL5tbxnZhf2NMr9uLJNoYu">
                            <Icon icon="basil:qq-outline" width="48" height="48" />
                        </a>
                        <a target="_blank" @click="copyQQCodeAndOpenLink" href="https://qm.qq.com/cgi-bin/qm/qr?k=y4He1C5OYZQPzojywTh_wlCywlfR5r-M&jump_from=webapi&authKey=13UJLWzqSVhwTXI9BPksnM7c9eogNcIdX/TC3xo6ShTAOJPgU2vlFR2rt3DxhJ2d">
                            <Icon icon="basil:qq-outline" width="48" height="48" />
                        </a>
                    </div>
                    <!-- <button @click="copyQQCode" class="btn btn-outline btn-info mb-3">{{ qqCode }}</button> -->
                </div>
            </div>
            <button
                @click="
                    dialogClose('qqBind');
                    $emit('close');
                "
                class="btn btn-info btn-block mb-3 btn-sm"
            >
                关闭
            </button>
        </div>
    </BaseDialog>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { fetchQQBindCode } from "../../plugins/axios";
import { userQuota } from "../../plugins/quota/userQuota";
import { NOTIFY } from "../../plugins/config";
import { setMsg, sleep } from "../../plugins/common";
import { Type } from "../toast/enmu";
import { Icon } from "@iconify/vue";
import { dialogClose, dialogOpen } from "./index";
import BaseDialog from "./base/BaseDialog.vue";
const qqCode = ref("");
const isLoading = ref(true);
const quota = userQuota.value.data.value;
const dialogId = ref("qqBind");
let intervalId: number | null = null;
onMounted(() => {
    dialogOpen("qqBind");
    fetchQQBindCode();
    intervalId = window.setInterval(getQQBindCode, 5000);
});
onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
});
const copyQQCodeAndOpenLink = async (event: MouseEvent) => {
    event.preventDefault();
    const target = event.currentTarget as HTMLAnchorElement;
    await copyQQCode();
    await sleep(2000);
    window.open(target.href, "_blank");
};

const copyQQCode = async () => {
    try {
        // 复制 qqcode 的值到剪贴板
        const code = "verifyCode:" + qqCode.value;
        await navigator.clipboard.writeText(code);
        setMsg("绑定代码已复制到剪贴板", Type.Success);
        await sleep(500);
        setMsg("准备打开QQ群组", Type.Success);
    } catch (err) {
        setMsg("复制失败", Type.Warning);
    }
};

const getQQBindCode = () => {
    if (quota?.idServerQQ) {
        qqCode.value = quota.idServerQQ;
        return;
    }
    fetchQQBindCode()
        .then((res) => {
            if (res.code === 1) {
                qqCode.value = res.data as string;
                return;
            }
            if (res.code === 2) {
                qqCode.value = NOTIFY.ALREADY_BIND_QQ;
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                return;
            }
        })
        .finally(() => {
            isLoading.value = false;
        });
};
</script>
