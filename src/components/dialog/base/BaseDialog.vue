<template>
    <dialog :id="props.dialogId" class="modal animate__animated" style="outline-width: 0">
        <slot></slot>
    </dialog>
</template>
<script lang="ts" setup>
import { watch, onMounted, onUnmounted, ref, Ref, computed, watchEffect } from "vue";
import { selectRandomElement } from "../../../plugins/common";
import { exitsArray } from "../../../plugins/animate/animate";

interface Props {
    dialogId: string;
}
const props = defineProps<Props>();
const isOpen = ref(false);
const exitsEffect = selectRandomElement(exitsArray);
const dialog = ref<HTMLDialogElement | null>(null);
onMounted(() => {
    const tempDialog: HTMLDialogElement | null = document.documentElement.querySelector(`#${props.dialogId}`);
    if (!tempDialog) return;
    dialog.value = tempDialog;
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "attributes" && mutation.attributeName === "open") {
                isOpen.value = (tempDialog as HTMLDialogElement).open;
            }
        });
    });
    observer.observe(tempDialog, { attributes: true });
    onUnmounted(() => {
        observer.disconnect();
    });
});

watch(
    () => isOpen.value,
    (isOpen) => {
        if (!dialog.value || !exitsEffect) return;
        if (!isOpen) {
            dialog.value?.classList.add(exitsEffect);
            dialog.value?.addEventListener(
                "animationend",
                () => {
                    dialog.value?.classList.remove(exitsEffect);
                },
                { once: true }
            );
        }
    }
);
</script>
