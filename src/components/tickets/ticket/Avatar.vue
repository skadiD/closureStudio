<template>
    <div class="flex flex-col items-center w-24">
        <div class="indicator avatar">
            <div class="w-16 mask mask-squircle">
                <img :src="`https://assets.closure.setonink.com/dst/avatar/${props.author?.avatar?.type || 'DEFAULT'}/${props.author?.avatar?.id?.replace('@', '_').replace('#', '_') || 'avatar_activity_GK'}.webp`" alt="斯卡蒂" />
            </div>
        </div>
        <div class="my-2 btn btn-xs">{{ props.author?.nickname }}</div>
        <div class="text-xs">
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
