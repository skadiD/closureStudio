<template>
    <div class="h-full w-full collapse overflow-visible" v-if="myTicket">
        <input type="checkbox" class="w-full" v-model="isExpanded" />
        <div class="collapse-title w-full flex justify-between">
            <div>
                <div :class="['text-base', 'font-bold', { 'line-clamp-1': !isExpanded }]">
                    <span v-if="myTicket.status === 0">🍡</span> <span v-if="myTicket.status === 1">💤</span>{{ myTicket.content.title }}
                    <div v-if="!isExpanded" class="indicator avatar">
                        <div class="w-4 mask mask-squircle">
                            <img
                                :src="`https://assets.closure.setonink.com/dst/avatar/${myTicket.author?.avatar?.type || 'DEFAULT'}/${myTicket.author?.avatar?.id?.replace('@', '_').replace('#', '_') || 'avatar_activity_GK'}.webp`"
                                alt="斯卡蒂"
                            />
                        </div>
                    </div>
                </div>
                <div class="flex">
                    <div v-for="(tag, key) in myTicket.tags" :key="key">
                        <button class="btn btn-warning btn-xs px-2 m-2">{{ tag }}</button>
                    </div>
                </div>
            </div>
            <div class="dropdown dropdown-hover z-50">
                <div tabindex="0" role="button" class="btn btn-outline border-none m-1">...</div>
                <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow rounded-box w-16">
                    <li>
                        <a>{{ getTicketOperation() }}</a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="collapse-content w-full">
            <div class="flex">
                <div class="flex">
                    <div class="flex-col">
                        <div class="indicator avatar">
                            <div class="w-12 mask mask-squircle">
                                <img
                                    :src="`https://assets.closure.setonink.com/dst/avatar/${myTicket.author?.avatar?.type || 'DEFAULT'}/${myTicket.author?.avatar?.id?.replace('@', '_').replace('#', '_') || 'avatar_activity_GK'}.webp`"
                                    alt="斯卡蒂"
                                />
                            </div>
                        </div>
                        <div>
                            {{ formatTime(myTicket.updatedAt, "MM-dd") }}
                        </div>
                    </div>
                    <div className="divider divider-horizontal"></div>
                </div>
                <div class="w-full">
                    <div class="flex">
                        {{ myTicket.content.content }}
                    </div>
                    <div v-if="isAuthor || user.isAdmin">
                        <div className="divider divider-info">工单</div>
                        <div v-if="isUpdating">
                            <span class="loading loading-bars"> </span>
                            <span class="loading loading-bars"> </span>
                            <span class="loading loading-bars"> </span>
                        </div>
                        <div v-else>
                            <div v-if="myTicket.status === 0" class="text-danger">如果该问题已解决, 您可以<span class="underline font-bold cursor-pointer" @click="ticketOperation">关闭</span>该ticket</div>
                            <div v-if="myTicket.status === 1" class="text-danger">天啊, 这个Ticket已经关闭,不管没关系,您可以<span class="underline font-bold cursor-pointer" @click="ticketOperation">重新打开</span>这个Ticket</div>
                        </div>
                    </div>
                    <div v-if="user.isAdmin">
                        <div className="divider divider-info">更多选项</div>
                        <div class="flex">
                            <button class="btn btn-outline btn-sm m-2">置顶</button>
                            <button class="btn btn-outline btn-sm m-2">隐藏</button>
                        </div>
                    </div>
                </div>
                
            </div>
            <div className="h-2"></div>
            <div className="divider"></div>
            <!-- // text input -->
            <div className="divider"></div>
        </div>
    </div>
</template>
<script setup lang="ts">
interface Props {
    tiket: TicketSystem.Ticket | null;
}
const props = withDefaults(defineProps<Props>(), {
    tiket: null
});
import { nextTick, onMounted, ref, watch } from "vue";
import { userStore } from "../../store/user";
import { GetTicketById, GetTickets, UpdateTicketById } from "../../plugins/axios";
import { formatTime, setMsg } from "../../plugins/common";
import { Type } from "../toast/enmu";
const user = userStore();
const isExpanded = ref(false);
const isUpdating = ref(false);
const isAuthor = ref(false);
const myTicket = ref<TicketSystem.Ticket | null>(null);
onMounted(() => {
    myTicket.value = props.tiket;
});
watch(
    () => myTicket,
    (newVal) => {
        if (newVal.value) {
            isAuthor.value = newVal.value.authorUUID === user.info.uuid;
        }
    }
);

const getTicketOperation = () => {
    //0表示未解决，1表示已解决
    if (props.tiket?.status === 0) {
        return "Close";
    }
    if (props.tiket?.status === 1) {
        return "Reopen";
    }
    return "Unknow";
};

const refreshTicket = async () => {
    if (!myTicket.value) {
        return;
    }
    const result = await GetTicketById(myTicket.value.id);
    if (result.code === 0) {
        throw new Error(result.message);
    }
    if (result.data) {
        console.log(result.data);
        myTicket.value = result.data;
    }
};

const ticketOperation = async () => {
    await nextTick();
    try {
        if (isUpdating.value || !myTicket.value) {
            console.log("isUpdating.value", isUpdating.value);
            console.log("ticket.value", myTicket.value);
            return;
        }
        isUpdating.value = true;
        const updateResult = await UpdateTicketById(myTicket.value.id, { status: myTicket.value.status === 0 ? 1 : 0 });
        if (updateResult.code === 0) {
            throw new Error(updateResult.message);
        }
        await refreshTicket();
        setMsg("大成功", Type.Success);
    } catch (error) {
        const err = error as Error;
        setMsg(err.message, Type.Warning);
        console.log(err);
    } finally {
        isUpdating.value = false;
    }
};
</script>
