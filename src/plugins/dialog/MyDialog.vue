<template>
    <Teleport to="body">
        <dialog ref="myDialog" class="modal" style="outline-width: 0">
            <div ref="dialogContent"
                class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog animate__animated">
                <h2 v-if="props.title">{{ props.title }}</h2>
                <h2 v-else>你知道吗？</h2>
                <p v-if="props.content">{{ props.content }}</p>
                <button @click="handleCloseBtnOnClick" class="btn btn-info btn-block mb-3">我知道了</button>
            </div>
        </dialog>
    </Teleport>
</template>
<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
import "animate.css";
interface Props {
    title: string;
    content: string;
    onClick: () => void;
}
const randomEffect = ["animate__bounce", "animate__flash", "animate__pulse", "animate__rubberBand", "animate__shakeX", "animate__shakeY", "animate__headShake", "animate__swing", "animate__tada", "animate__wobble", "animate__jello", "animate__heartBeat"];
const randomEffectIndex = Math.floor(Math.random() * randomEffect.length);
const myDialog = ref();
const dialogContent = ref<HTMLElement | null>(null); // 明确指定引用类型


const props = withDefaults(defineProps<Props>(), {
    title: "",
    content: "",
    onClick: () => { }
});

onMounted(async () => {
    await nextTick(); // 确保DOM已经更新
    myDialog.value.showModal();
    dialogContent.value?.classList.add(randomEffect[randomEffectIndex]); // 动态添加随机动画效果
})


const handleCloseBtnOnClick = () => {
    props.onClick();
}


</script>