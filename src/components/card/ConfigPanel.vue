<template>
    <h3 className="font-bold text-2xl">托管配置</h3>
    <div role="alert" className="rounded border-s-4 border-warning bg-warning/10 p-4 space-y-2 my-4">
        当前配置界面为究极无敌盖中盖版本，请在专家指导下使用
    </div>


    <div className="flex">
        <label className="form-control w-full max-w-xs mr-4">
            <div className="label">
                <span className="label-text">理智保留</span>
            </div>
            <input v-model="config.keeping_ap" type="text" className="input input-sm input-bordered w-full max-w-xs" />
        </label>
        <label className="form-control w-full max-w-xs">
            <div className="label">
                <span className="label-text">招募卷保留</span>
            </div>
            <input v-model="config.recruit_reserve" type="text" className="input input-sm input-bordered w-full max-w-xs" />
        </label>
    </div>
    <div className="divider h-0">智能开关</div>
    <div class="grid grid-cols-2 gap-4 h-8">
        <label class="label cursor-pointer mb-4">
            <span class="label-text">自动基建</span>
            <input v-model="config.enable_building_arrange" type="checkbox" class="toggle toggle-sm" />
        </label>

        <label class="label cursor-pointer mb-4">
            <span class="label-text">自动作战</span>
            <input v-model="config.is_auto_battle" type="checkbox" class="toggle toggle-sm" />
        </label>
    </div>

    <div className="grid grid-cols-2 gap-4 h-8">
        <label className="label cursor-pointer mb-4">
            <span className="label-text">忽略机器人</span>
            <input v-model="config.recruit_ignore_robot" type="checkbox" className="toggle toggle-sm" />
        </label>

        <label className="label cursor-pointer mb-4">
            <span className="label-text">允许他人协助登录</span>
            <input v-model="config.allow_login_assist" type="checkbox" className="toggle toggle-sm" />
        </label>
    </div>

    <div className="divider h-2">作战地图</div>

    <div className="flex py-2">
        <input v-model="stageKeyWord" className="input input-sm input-bordered w-full max-w-xs mr-4" placeholder="暴君" />
        <select className="select select-sm select-warning w-full max-w-xs" @change="addStageToConfig">
            <option v-for="(stage, key) in filteredStages" :key="key" :value="key">
                {{ stage.code }} {{ stage.name }}
            </option>
        </select>
    </div>
    <div className="divider h-0">作战队列</div>
    <div class="flex flex-wrap">
        <button @click="removeBattleMap(battleMap)" v-for="battleMap in config.battle_maps" :key="battleMap"
            class="btn btn-outline btn-warning btn-xs m-1">
            {{ getStageName(battleMap) }}
        </button>
    </div>


    <a className="btn btn-block btn-info mt-4" @click="submit">递交</a>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import {
    doUpdateGameConf,
    fetchGameLogs,
} from "../../plugins/axios";
import { formatTime, setMsg } from "../../plugins/common";
import { Type } from "../toast/enmu";
import { gameList } from "../../plugins/sse";
import { computed } from "vue";
import { stages } from "../../plugins/stage";
interface Props {
    account: string;
    // statusCode: number // 当前用户状态，-1=登陆失败 0=未开启/未初始化/正在初始化但未登录 1=登录中 2=登陆完成/运行中 3=游戏错误
}
const props = withDefaults(defineProps<Props>(), {
    account: "",
});

const isDisabled = ref(true);
const stageKeyWord = ref("");
const config = ref<ApiUser.GameConfig>({
    account: "",
    accelerate_slot: "",
    accelerate_slot_cn: "",
    battle_maps: [],
    enable_building_arrange: false,
    is_auto_battle: false,
    is_stopped: false,
    keeping_ap: 0,
    recruit_ignore_robot: false,
    recruit_reserve: 0,
    map_id: "",
    allow_login_assist: false,
});



const addStageToConfig = (event: Event) => {
    const selectElement = event.target as HTMLSelectElement;
    const selectedKey = selectElement.value;
    if (!config.value.battle_maps.includes(selectedKey)) {
        config.value.battle_maps.push(selectedKey);
    }
};
const getStageName = (stageId: string) => {
    return stages.value[stageId].name;
};

const filteredStages = computed(() => {
    // 如果 stageKeyWord 为空，则返回所有 stage（但最多 10 个）
    if (!stageKeyWord.value.trim()) {
        return Object.keys(stages.value).reduce((acc, key, index) => {
            if (index < 10) {
                acc[key] = stages.value[key];
            }
            return acc;
        }, {} as Gamedata.Stages);
    }

    // 过滤并返回匹配关键词的 stage（但最多 10 个）
    let count = 0;
    return Object.entries(stages.value).reduce((acc, [key, value]) => {
        if (count < 10 && (key.includes(stageKeyWord.value) || value.code.includes(stageKeyWord.value.toUpperCase()) || value.name.includes(stageKeyWord.value))) {
            acc[key] = value;
            count++;
        }
        return acc;
    }, {} as Gamedata.Stages);
});

watch(() => {
    return gameList.value.find(game => game.status.account === props.account);
}, (newGame) => {
    if (newGame) {
        config.value = newGame.game_config;
        isDisabled.value = true
    } else {
        isDisabled.value = false
    }
});
const removeBattleMap = (battleMap: string) => {
    config.value.battle_maps = config.value.battle_maps.filter(item => item !== battleMap);
};
const submit = () => {
    const copyConfig = JSON.parse(JSON.stringify(config.value));
    delete copyConfig.is_stopped;
    delete copyConfig.map_id;
    delete copyConfig.accelerate_slot_cn;
    delete copyConfig.account;
    doUpdateGameConf(props.account, copyConfig).then(res => {
        setMsg(res.message, Type.Info)
    })
}
</script>
