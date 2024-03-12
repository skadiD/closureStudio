<template>
    <div class="h-full">
        <!-- for loop tickets -->
        <div v-for="(ticket, key) in tickets" :key="key">
            <Ticket :tiket="ticket" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { userStore } from "../../store/user";
import { GetTickets } from "../../plugins/axios";
import Ticket from "./TIcket.vue";
const user = userStore();
const tickets = ref<TicketSystem.Ticket[]>([]);
GetTickets().then((res) => {
    if (res.data) {
        tickets.value = res.data;
        console.log(res.data);
    }
});




</script>
