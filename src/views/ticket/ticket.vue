<template>
    <div class="flex h-full">
        <div class="w-full flex-col max-w-4xl 2xl:max-w-6xl xl:mr-auto s-margin md:!flex" :class="show ? 'xl:ml-0 !hidden' : 'lg:ml-[calc((100vw-56rem)/2)] 2xl:ml-[calc((100vw-72rem)/2)]'">
            <div class="bg-base-300 shadow-lg rounded-lg px-4 py-1 blog relative">
                <div class="text-2xl md:text-4xl font-bold text-info mt-3">💊 在线工单</div>
                <p>我们认真倾听您的意见与问题</p>
                <div class="divider mt-0">您的每一句话都非常重要</div>
                <p>我们认真记录下您的每一句话</p>
            </div>
            <div class="h-12"></div>
            <div class="bg-base-300 shadow-lg rounded-lg pl-4 py-1 blog relative">
                <Table> </Table>
            </div>
        </div>
    </div>
    <YouMayKnowDialog />
</template>
<script setup lang="ts">
import { ref } from "vue";
import { userStore } from "../../store/user";
import Table from "../../components/tickets/Table.vue";
import { startSSE } from "../../plugins/sse";
import "animate.css";
import { YouMayKnowDialog } from "../../components/dialog";
const show = ref(false);
const user = userStore();
startSSE(user);
</script>

<style>
div,
img {
    user-select: none;
    -webkit-user-drag: none;
}
</style>
