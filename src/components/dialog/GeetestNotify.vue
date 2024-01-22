<template>
    <dialog id="geetestNotify" class="modal" style="outline-width: 0">
        <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
            <h2>你知道吗？</h2>
            <p>请耐心等待，还需要完成一次滑块验证，不要走开哦</p>
            <button @click="dialogClose('geetestNotify')" class="btn btn-info btn-block mb-3">我会耐心等待</button>
        </div>
    </dialog>
</template>
<script lang="ts" setup>
import { dialogClose } from ".";
</script>
