<template>
    <div class="h-full w-full collapse overflow-visible bg-base-300 shadow-lg rounded-lg blog" v-if="myTicket">
        <input type="checkbox" class="w-full" v-model="isExpanded" />
        <div class="collapse-title w-full flex justify-between">
            <div class="flex space-x-1">
                <div class="flex justify-center items-center text-2xl md:text-4xl font-bold"><span
                        v-if="myTicket.status === 0">🍡</span> <span v-if="myTicket.status === 1">💤</span></div>
                <div class="flex flex-col">
                    <div :class="['text-base', 'font-bold', { 'line-clamp-1': !isExpanded }]">
                        {{ myTicket.content.title }}
                    </div>

                    <div class="flex">
                        <div v-for="(tag, key) in myTicket.tags" :key="tag">
                            <button class="btn btn-warning btn-xs m-1">{{ tag }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="isExpanded" class="collapse-content w-full">
            <Ticket :ticket="myTicket" :refresh="refreshTicket" :getTickets="props.getTickets" />
            <div v-for="(reply, key) in myReplys" :key="reply.id">
                <Ticket :ticket="reply" :refresh="refreshTicket" :getTickets="props.getTickets" />
            </div>
            <div v-if="isLoading" class="flex justify-center w-full">
                <span className="loading loading-bars loading-md text-primary"></span>
                <span className="loading loading-bars loading-md text-primary"></span>
                <span className="loading loading-bars loading-md text-primary"></span>
            </div>
            <Reply :ticket="myTicket" :refresh="refreshTicket" />
        </div>
    </div>
</template>
<script setup lang="ts">
interface Props {
    ticket: TicketSystem.Ticket | null;
    getTickets: () => void;
}
const props = withDefaults(defineProps<Props>(), {
    ticket: null,
    getTickets: () => { }
});
import { nextTick, ref, watch } from "vue";
import { userStore } from "../../store/user";
import { GetReplys, GetTicketById, UpdateTicketById } from "../../plugins/axios";
import { setMsg } from "../../plugins/common";
import { Type } from "../toast/enum";
import Ticket from "./ticket/Ticket.vue";
import Reply from "./ticket/Reply.vue";
const user = userStore();
const isExpanded = ref(false);
const isLoading = ref(false);
const isAuthor = ref(false);
const myTicket = ref<TicketSystem.Ticket | null>(null);
const myReplys = ref<TicketSystem.Ticket[]>([]);

watch(
    () => myTicket,
    (newVal) => {
        if (newVal.value) {
            isAuthor.value = newVal.value.authorUUID === user.info.uuid;
        }
    }
);

watch(
    () => isExpanded.value,
    async (newVal) => {
        if (newVal) {
            await refreshTicket();
        }
    },
);

const refreshTicket = async () => {
    if (!myTicket.value) {
        return;
    }
    if (isLoading.value) {
        return;
    }
    isLoading.value = true;

    const respGetTicket = await GetTicketById(myTicket.value.id);
    if (respGetTicket.code === 0) {
        setMsg(respGetTicket.message, Type.Error);
        isLoading.value = false;
        throw new Error(respGetTicket.message);
    }
    if (respGetTicket.data) {
        myTicket.value = respGetTicket.data;
    }
    const respGetReplys = await GetReplys(myTicket.value.id);
    if (respGetReplys.code === 0) {
        setMsg(respGetReplys.message, Type.Error);
        isLoading.value = false;
        throw new Error(respGetReplys.message);
    }
    if (respGetReplys.data) {
        myReplys.value = respGetReplys.data;
    }
    isLoading.value = false;
};

// init
myTicket.value = props.ticket;
</script>
