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
        <div className="dropdown dropdown-hover w-full">
            <div tabIndex={0} role="button" className="btn btn-outline btn-xs w-full h-8">{{
                Object.values(assets.filteredStages(stageKeyWord)).length > 0 ?
                Object.values(assets.filteredStages(stageKeyWord))[0].name :
                "未知地图" }}</div>
            <ul tabIndex={0}
                className="dropdown-content z-[1] menu shadow bg-base-100 rounded-box w-full h-96 overflow-y-auto">
                <li v-for="(stage, key) in assets.filteredStages(stageKeyWord)" :key="key" @click="addStageToConfig(key)">
                    <div class="flex items-center space-x-2">
                        <span>{{ stage.code }} {{ stage.name }}</span>
                        <template v-for="(itemKey, itemIndex) in stage.items" :key="itemIndex">
                            <!-- 仅显示最多三个图片 -->
                            <img v-if="itemIndex < 2" :src="assets.getItemLink(itemKey)" alt="Item Image" class="w-6 h-6" />
                        </template>
                    </div>
                </li>
            </ul>
        </div>

    </div>
    <div className="divider h-0">作战队列</div>
    <div class="flex flex-wrap">
        <button @click="removeBattleMap(battleMap)" v-for="battleMap in config.battle_maps" :key="battleMap"
            class="btn btn-outline btn-warning btn-xs m-1">
            {{ assets.getStageName(battleMap) }}
        </button>
    </div>


    <a className="btn btn-block btn-info mt-4" @click="submit">递交</a>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import {
    doUpdateGameConf,
} from "../../plugins/axios";
import { formatTime, setMsg } from "../../plugins/common";
import { Type } from "../toast/enmu";
import { gameList } from "../../plugins/sse";
import { computed } from "vue";
import { assets } from "../../plugins/assets/assets";

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



const addStageToConfig = (code: string | number) => {
    // if code is number 
    if (typeof code === "number") {
        code = code.toString();
    }
    if (!config.value.battle_maps.includes(code)) {
        config.value.battle_maps.push(code);
    }
};

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
