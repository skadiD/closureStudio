<template>
    <div>
        <h1>问答服务</h1>
        <button @click="sendRequest">开始问答</button>
        <div v-for="message in messages" :key="message.id">
            {{ message.type }}: {{ message.data }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref } from 'vue';
import axios from 'axios';
import fs from 'fs'
export default defineComponent({
    name: 'QaSseClient',
    setup() {
        const messages = ref<Array<{ id: number; type: string; data: string }>>([]);
        async function sendRequest() {
            const response = axios({
                method: 'post',
                url: 'https://inference.ltsc.vip/api/chat/query',
                data: { query: '可露西尔云平台支持自动打肉鸽吗？', stream: true },
                headers: {
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGFya25pZ2h0cy5ob3N0IiwiZXhwIjoxNzIwMzQzMjA1LCJpc0FkbWluIjpmYWxzZSwicGVybWlzc2lvbiI6MSwic3RhdHVzIjoyLCJ1dWlkIjoiNDkyZjYwMjUtZTVkYS00YWQwLTljZWQtZGUyYTY0MTgxNmQ3In0.pFRSDhW6vGMz9MVEuxjT2Ra-RMnL96mpKOtSXSGyJLw'
                },
                responseType: 'stream'
            })

            // const stream = response.data;
            // // `progress`, `set_text`, `delta`, `end`

            // stream.on('delta', (data: any) => {
            //     console.log(data);
            // });

            // stream.on('end', () => {
            //     console.log("stream done");
            // });
        }

        return { messages, sendRequest };
    },
});
</script>