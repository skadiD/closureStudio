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
import { defineComponent, ref } from "vue";
import axios from "axios";
export default defineComponent({
  name: "QaSseClient",
  setup() {
    const messages = ref<Array<{ id: number; type: string; data: string }>>([]);
    const sendRequest = () => {
      const user = localStorage.getItem("closureV3_user");
      if (!user) return;
      axios
        .post(
          "https://api.chat.ltsc.vip/api/chat/query",
          { query: "可露西尔云平台支持自动打肉鸽吗？", stream: true },
          {
            headers: {
              Accept: "text/event-stream",
              Authorization: "Bearer " + JSON.parse(user)?.user?.Token,
            },
            responseType: "stream",
            adapter: "fetch", // <- this option can also be set in axios.create()
          }
        )
        .then(async (response) => {
          console.log("axios got a response");
          const stream = response.data;
          // consume response
          const reader = stream
            .pipeThrough(new TextDecoderStream())
            .getReader();
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            console.log(value);
          }
        });
      // catch/etc.
    };

    return { messages, sendRequest };
  },
});
</script>
