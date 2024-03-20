<template>
    <div class="w-full" v-if="myTicket">
        <div class="flex flex-col justify-between h-full">
            <div class="relative whitespace-pre-line">
                {{ myTicket.content.content }}
                <img v-if="myTicket.author.title"
                    class="absolute right-4 top-0 w-28 md:w-36 opacity-10 md:opacity-50 rounded-t-full rounded-bl-full"
                    src="../../../assets/1.png" alt="start">
            </div>
            <div>

                <div v-if="(isAuthor || user.isAdmin) && !myTicket.replyTo">
                    <div class="divider divider-info p-1 m-1"></div>
                    <div v-if="isUpdating">
                        <span class="loading loading-bars"> </span>
                        <span class="loading loading-bars"> </span>
                        <span class="loading loading-bars"> </span>
                    </div>
                    <div v-else>
                        <div v-if="myTicket.status === 0" class="text-danger">如果该问题已解决, 您可以<span
                                class="underline font-bold cursor-pointer" @click="ticketOperation">关闭</span>该ticket
                        </div>
                        <div v-if="myTicket.status === 1" class="text-danger">天啊, 这个Ticket已经关闭,不管没关系,您可以<span
                                class="underline font-bold cursor-pointer" @click="ticketOperation">重新打开</span>这个Ticket
                        </div>
                    </div>
                </div>
                <div class="flex">
                    <Tags v-if="(user.isAdmin || isAuthor) && !myTicket.replyTo" :refresh="props.refresh"
                        :tags="myTicket.tags" :ticketId="myTicket.id" @update:tags="updateTags" />
                    <button v-if="user.isAdmin && !myTicket.replyTo && !myTicket.isPinned"
                        class="btn btn-outline btn-xs m-1">置顶</button>
                    <button v-if="user.isAdmin && !myTicket.replyTo && myTicket.isPinned"
                        class="btn btn-outline btn-xs m-1">取消置顶</button>
                    <button v-if="user.isAdmin" :onClick="hiddenTicket" class="btn btn-outline btn-xs m-1">隐藏</button>
                    <button v-if="user.isAdmin" @click="() => isDisplayMoreInfo = !isDisplayMoreInfo"
                        class="btn btn-outline btn-xs m-1">更多</button>
                </div>
                <div class="divider" v-if="isDisplayMoreInfo && user.isAdmin">更多详细信息</div>
                <div v-if="isDisplayMoreInfo && user.isAdmin">
                    <div v-if="isLoading">
                        <span class="loading loading-bars"> </span>
                        <span class="loading loading-bars"> </span>
                        <span class="loading loading-bars"> </span>
                    </div>
                    <div v-if="!isLoading && authorInfo">
                        <div @click="copyToClipboard(myTicket.authorUUID)">
                            UUID: {{ myTicket.authorUUID }}
                        </div>

                        <div @click="copyToClipboard(authorInfo.UserEmail)">
                            email: {{ authorInfo.UserEmail }}
                        </div>

                        <div>
                            <span v-if="authorInfo.Phone"> phone: {{ authorInfo.Phone }}</span>
                            <span v-if="!authorInfo.Phone"> phone: 未绑定 <button v-if="user.isAdmin"
                                    @click="sendSMS(myTicket.authorUUID, smsSendPhone)"
                                    class="btn btn-outline btn-xs m-1">发送SMS{{ smsSendPhone }}</button></span>
                        </div>
                        <div @click="copyToClipboard(authorInfo.QQ)">
                            QQ: {{ authorInfo.QQ }}
                        </div>
                        <div @click="copyToClipboard(String(authorInfo.Permission))">
                            permission: {{ authorInfo.Permission }}
                        </div>
                        <div @click="copyToClipboard(authorInfo.IP)">
                            IP: {{ String(authorInfo.IP) }}
                        </div>
                        <div>
                            创建时间: {{ new Date(authorInfo.CreatedTs * 1000).toLocaleString() }}
                        </div>
                        <div>
                            更新时间: {{ new Date(authorInfo.UpdateTs * 1000).toLocaleString() }}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
interface Props {
    ticket: TicketSystem.Ticket | null;
    refresh: () => void;
    getTickets: () => void;
}

const props = withDefaults(defineProps<Props>(), {
    ticket: null,
    refresh: () => { },
    getTickets: () => { }
});
import { nextTick, ref, watch } from "vue";
import { getRealGameAccount, setMsg } from "../../../plugins/common";
import { QueryUser, SendSMS, UpdateTicketById, fetchUserSlotsAdmin } from "../../../plugins/axios";
import { userStore } from "../../../store/user";
import { Type } from "../../toast/enmu";
import Tags from "./Tags.vue";
import { getSMSSlot } from "../../../plugins/quota/userQuota";
import { set } from "date-fns";
import { checkMobile } from "../../../utils/regex";
const user = userStore();
const myTicket = ref<TicketSystem.Ticket | null>(null);
const authorInfo = ref<ApiUser.User | null>(null);
const authorSolts = ref<Registry.Slot[]>([]);
const isUpdating = ref(false);
const isLoading = ref(false);
const smsSendPhone = ref('');
const isAuthor = ref(false);
const isDisplayMoreInfo = ref(false);

watch(
    () => props.ticket,
    (newVal) => {
        isAuthor.value = newVal?.authorUUID === user.info.uuid;
        myTicket.value = newVal;
    },
    {
        deep: true,
        immediate: true
    }
);

watch(
    () => isDisplayMoreInfo.value,
    async (newVal) => {
        if (newVal && myTicket.value?.authorUUID) {
            isLoading.value = true;
            // use async method to fetch QueryUser and fetchUserSlotsAdmin
            const [usersInfo, usersSolts] = await Promise.all([QueryUser(myTicket.value?.authorUUID), fetchUserSlotsAdmin(myTicket.value?.authorUUID)]);
            if (usersInfo.code === 1) {
                const user = findAuthorInfo(myTicket.value?.authorUUID, usersInfo.data);
                if (user) {
                    authorInfo.value = user;
                }
            }
            console.log("usersSolts", usersSolts);
            if (usersSolts.data && usersSolts.data?.length > 0) {
                authorSolts.value = usersSolts.data;
                const phone = getSMSSendPhone(usersSolts.data);
                if (phone) {
                    smsSendPhone.value = phone;
                }
            }
            if (usersInfo.code != 1) {
                authorInfo.value = null;
                setMsg("获取用户信息失败: " + usersInfo.message, Type.Warning);
            }
            if (!usersSolts.data) {
                setMsg("获取用户托管槽失败: " + usersSolts.message, Type.Warning);
            }
            isLoading.value = false;
        }
    },
    {
        deep: true,
        immediate: false
    }
);

const hiddenTicket = async () => {
    if (!myTicket.value) {
        return;
    }
    try {
        isUpdating.value = true;
        const updateResult = await UpdateTicketById(myTicket.value.id, { isHidden: true });
        if (updateResult.code === 0) {
            throw new Error(updateResult.message);
        }
        await props.getTickets();
        setMsg("大成功", Type.Success);
    } catch (error) {
        const err = error as Error;
        setMsg(err.message, Type.Warning);
        console.log(err);
    } finally {
        isUpdating.value = false;
    }
};
const ticketOperation = async () => {
    await nextTick();
    if (isUpdating.value || !myTicket.value) {
        return;
    }
    try {
        isUpdating.value = true;
        const updateResult = await UpdateTicketById(myTicket.value.id, { status: myTicket.value.status === 0 ? 1 : 0 });
        if (updateResult.code === 0) {
            throw new Error(updateResult.message);
        }
        await props.refresh();
        setMsg("大成功", Type.Success);
    } catch (error) {
        const err = error as Error;
        setMsg(err.message, Type.Warning);
        console.log(err);
    } finally {
        isUpdating.value = false;
    }
};
const updateTags = (newTags: string[]) => {
    if (!myTicket.value) {
        return;
    }
    myTicket.value.tags = newTags;
};

const sendSMS = async (uuid: string, phone: string) => {
    if (!uuid || !phone) {
        return;
    }
    const param = {
        uuid: uuid,
        phone: phone
    };
    const resp = await SendSMS(param);
    if (resp.code === 1) {
        setMsg("发送成功 验证码: " + resp.data, Type.Success);
        return;
    }
    setMsg("发送失败 " + resp.message, Type.Warning);
    return;
};

const getSMSSendPhone = (slots: Registry.Slot[]) => {
    const slot = getSMSSlot(slots);
    if (!slot) {
        return;
    }
    const gameAccount = slot.gameAccount;
    if (!gameAccount) {
        return;
    }
    const phone = getRealGameAccount(gameAccount);
    if (!checkMobile(phone)) {
        return;
    }
    return phone;
};

const findAuthorInfo = (uuid: string, users: ApiUser.User[] | null) => {
    if (!users) {
        return null;
    }
    return users.find((user) => user.UUID === uuid) || null;
};

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        setMsg("复制成功", Type.Success);
    } catch (err) {
        console.error('复制到剪贴板失败', err);
    }
};

myTicket.value = props.ticket;
</script>
