<template>
    <div class="h-full w-full collapse" v-if="props.tiket">
        <input type="checkbox" class="w-full" />
        <div class="collapse-title flex w-full">
            <div class="text-base font-bold text-center">💉 {{ props.tiket.content.title }}</div>
            <div v-for="(tag, key) in props.tiket.tags" :key="key">
                <button class="btn btn-warning  btn-xs px-2 mx-4">{{ tag }}</button>
            </div>
            <div class="text-base font-bold text-center">💉 {{ props.tiket.createdAt }}</div>
            <div class="indicator avatar">
                <div class="w-4 mask mask-squircle">
                    <img :src="`https://assets.closure.setonink.com/dst/avatar/${props.tiket.author?.avatar?.type || 'DEFAULT'}/${props.tiket.author?.avatar?.id?.replace('@', '_').replace('#', '_') || 'avatar_activity_GK'}.webp`"
                        alt="斯卡蒂" />
                </div>
            </div>
        </div>
        <div class="collapse-content w-full">
            {{ props.tiket.content.content }}
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
import { ref } from "vue";
import { userStore } from "../../store/user";
import { GetTickets } from "../../plugins/axios";
import ticket from "../../views/ticket/ticket.vue";

const user = userStore();
</script>
