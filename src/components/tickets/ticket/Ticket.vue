<template>
    <div class="flex" v-if="props.ticket">
        <Avatar :author="props.ticket.author" :updatedAt="props.ticket.updatedAt" />
        <div className="divider divider-horizontal m-0 p-1"></div>
        <Content :ticket="props.ticket" :refresh="props.refresh" :getTickets="props.getTickets" />
    </div>
    <div class="divider p-1 m-1"></div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Avatar from "./Avatar.vue";
import Content from "./Content.vue";
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

const myTicket = ref<TicketSystem.Ticket | null>(null);
</script>
