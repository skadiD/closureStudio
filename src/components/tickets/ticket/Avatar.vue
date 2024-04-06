<template>
    <div class="flex flex-col items-center w-24">
        <div class="indicator avatar">
            <div class="w-16 mask mask-squircle">
                <img :src="`https://assets.ltsc.vip/avatar/${props.author?.avatar?.type || 'DEFAULT'}/${props.author?.avatar?.id?.replace('@', '_').replace('#', '_') || 'avatar_activity_GK'}.png`"
                    alt="斯卡蒂" />
            </div>
        </div>
        <div class="my-1 bg-base-300 btn btn-xs">{{ props.author?.nickname }}</div>
        <button v-if="props.author?.title"
            class="relative border-0 rounded-md bg-transparent overflow-hidden z-0 p-[1px]">
            <div class="block bg-base-300 rounded-md p-1 text-xs">{{ props.author?.title }}</div>
        </button>
        <div class="text-xs my-1">
            {{ formatTime(props.updatedAt, "MM-dd") }}
        </div>
    </div>
</template>
<script setup lang="ts">
interface Props {
    author: TicketSystem.Author | null;
    updatedAt: number;
}
const props = withDefaults(defineProps<Props>(), {
    author: null
});
import { formatTime } from "../../../plugins/common";


</script>
<style scoped>
button::after {
    content: "";
    position: absolute;
    background: conic-gradient(from 180deg at 50% 50%, #00D1FF 0deg, #EE27FF 106.88deg, #205EFF 206.25deg, #00F0FF 286.87deg, #00D1FF 360deg);
    inset: -50px;
    z-index: -1;
    animation: 5s rotate linear infinite;
}

@keyframes rotate {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
