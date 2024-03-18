<template>
    <div className="join p-1">

        <div v-for="(author, key) in user.getGames" :key="author.key">
            <input className="join-item btn btn-xs" type="radio" :checked="isSelectedAuthor(author.value.nickname)"
                @click="() => {
            setSelectAuthor(author.value, author.key);
        }
            " name="options" :aria-label="author.value.nickname" />
        </div>
        <div>
            <input className="join-item btn btn-xs" type="radio" :checked="isSelectedAuthor('匿名玩家')" @click="() => {
            setSelectAuthor(null, '')
        }" name="options" aria-label="匿名玩家" />
        </div>
    </div>
    <Tags v-if="!props.ticket" :tags="tags" @update:tags="updateTags" />
    <!-- // text input -->
    <input v-model="ticketTitle" v-if="!props.ticket" type="text" placeholder="标题"
        class="input input-bordered input-sm w-full my-2" />
    <textarea v-model="ticketContent" placeholder="请发表您的锐评"
        className="textarea textarea-bordered textarea-lg w-full my-2"></textarea>
    <div className="flex justify-start">
        <button class="m-2 btn btn-sm btn-info" @click="postTicket">
            <span v-if="isUpdating" class="loading loading-spinner"></span>
            发表锐评
        </button>
    </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { defaultAuthor, setMsg } from "../../../plugins/common";
import { userStore } from "../../../store/user";
import { Type } from "../../toast/enmu";
import { PostTicket, ReplyTicket } from "../../../plugins/axios";
import Tags from "./Tags.vue";
import showDialog from "../../../plugins/dialog/dialog";
import { checkEmail, checkMobile } from "../../../utils/regex";
interface Props {
    ticket?: TicketSystem.Ticket | null;
    refresh?: () => Promise<void> | undefined;
}
const props = withDefaults(defineProps<Props>(), {
    ticket: null,
    refresh: undefined
});
const user = userStore();
const selectedAuthor = ref<TicketSystem.Author | null>(defaultAuthor());
const selectedGame = ref<string>("");
const ticketTitle = ref<string>("");
const ticketContent = ref<string>("");
const isUpdating = ref(false);
const tags = ref<string[]>([]);


// const handleTestBtnOnClick = () => {
//     showDialog("test", "test", () => { console.log("test") });
// }

const updateTags = (newTags: string[]) => {
    tags.value = newTags;
};

const setSelectAuthor = (author: TicketSystem.Author | null, gameAccount: string) => {
    if (!author) {
        selectedAuthor.value = defaultAuthor();
        return;
    }
    selectedAuthor.value = author;
    selectedGame.value = gameAccount;
};

const privateInfoCheck = () => {
    if (checkEmail(ticketContent.value)) {
        setMsg("请不要在帖子中透露私人信息", Type.Warning);
        return true;
    }
    if (checkEmail(ticketTitle.value)) {
        setMsg("请不要在帖子中透露私人信息", Type.Warning);
        return true;
    }
    if (checkMobile(ticketContent.value)) {
        setMsg("请不要在帖子中透露私人信息", Type.Warning);
        return true;
    }
    if (checkMobile(ticketTitle.value)) {
        setMsg("请不要在帖子中透露私人信息", Type.Warning);
        return true;
    }
    return false;
};


const createTicketData = () => {
    if (!selectedAuthor.value) {
        setMsg("请选择一个游戏账号", Type.Warning);
        return;
    }
    if (privateInfoCheck()) {
        showDialog("噢,天啊", "请不要在帖子中透露私人信息", () => { });
        return;
    }
    const data: TicketSystem.createTicket = {
        replyTo: "",
        tags: [],
        attachments: [],
        isPinned: false,
        author: null,
        content: {
            id: "",
            title: "",
            content: ""
        },
        isAnonymous: false,
        gameAccount: ""
    };
    const tempAuthor = selectedAuthor.value;
    tempAuthor.uuid = user.info.uuid;
    data.content.content = ticketContent.value;
    data.content.title = ticketTitle.value;
    data.author = tempAuthor;
    data.tags = tags.value;
    data.gameAccount = selectedGame.value;
    if (props.ticket) {
        data.replyTo = props.ticket.id;
    }
    return data;
};


const postTicket = async () => {
    if (!ticketContent.value) {
        setMsg("请输入内容", Type.Warning);
        return;
    }
    if (!selectedAuthor.value) {
        setMsg("请选择一个游戏账号", Type.Warning);
        return;
    }
    if (!props.ticket && !ticketTitle.value) {
        // too long
        if (ticketTitle.value.length > 16) {
            setMsg("标题太长了", Type.Warning);
            return;
        }
        setMsg("请输入标题", Type.Warning);
        return;
    }
    const data = createTicketData();
    if (!data) {
        return;
    }
    if (props.ticket) {
        // reply
        await replyTicket(props.ticket.id, data);
    }
    if (!props.ticket) {
        // create
        await createTicket(data);
    }
    if (props.refresh) {
        await props.refresh();
    }
    isUpdating.value = false;
}

const replyTicket = async (id: string, data: TicketSystem.createTicket) => {
    try {
        isUpdating.value = true;
        const result = await ReplyTicket(id, data);
        if (result.code === 0) {
            setMsg(result.message, Type.Warning);
            throw new Error(result.message);
        }
        setMsg("大成功", Type.Success);
    } catch (error) {
        const err = error as Error;
        setMsg(err.message, Type.Warning);
    } finally {
        resetForm()
    }
};
const createTicket = async (data: TicketSystem.createTicket) => {
    try {
        isUpdating.value = true;
        const result = await PostTicket(data);
        if (result.code === 0) {
            setMsg(result.message, Type.Warning);
            throw new Error(result.message);
        }

        setMsg("大成功", Type.Success);
    } catch (error) {
        const err = error as Error;
        setMsg(err.message, Type.Warning);
    } finally {
        resetForm()
    }
};

const resetForm = () => {
    ticketContent.value = "";
    selectedAuthor.value = defaultAuthor();
    selectedGame.value = "";
    ticketTitle.value = "";
    tags.value = [];
};
const setDefaultAuthor = () => {
    if (user.getGames.length > 0) {
        const game = user.getGames[0];
        setSelectAuthor(game.value, game.key);
    } else {
        setSelectAuthor(null, '');
    }

};
const isSelectedAuthor = (nickName: string) => {
    return selectedAuthor.value?.nickname === nickName;
};
// start

setDefaultAuthor()
</script>
