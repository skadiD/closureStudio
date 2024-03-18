<template>
    <div class="w-full" v-if="myTicket">
        <div class="flex flex-col justify-between h-full">
            <div class="relative">
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
import { setMsg } from "../../../plugins/common";
import { UpdateTicketById } from "../../../plugins/axios";
import { userStore } from "../../../store/user";
import { Type } from "../../toast/enmu";
import Tags from "./Tags.vue";
const user = userStore();
const myTicket = ref<TicketSystem.Ticket | null>(null);
const isUpdating = ref(false);
const isAuthor = ref(false);
watch(
    () => props.ticket,
    (newVal, oldVal) => {
        isAuthor.value = newVal?.authorUUID === user.info.uuid;
        myTicket.value = newVal;
    },
    {
        deep: true,
        immediate: true
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
myTicket.value = props.ticket;
</script>
