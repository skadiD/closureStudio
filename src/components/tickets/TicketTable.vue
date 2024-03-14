<template>
    <div v-if="tickets">
        <div v-for="(ticket, key) in props.tickets" :key="ticket.id">
            <Ticket :ticket="ticket" :getTickets="props.getTickets" />
            <div class="h-2"></div>
        </div>
    </div>
</template>
<script setup lang="ts">
import Ticket from "./Ticket.vue";
interface Props {
    tickets: TicketSystem.Ticket[] | null;
    getTickets: () => void;
}
const props = withDefaults(defineProps<Props>(), {
    tickets: null,
    getTickets: () => { }
});


</script>
