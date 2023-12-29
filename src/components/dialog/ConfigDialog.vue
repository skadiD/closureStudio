<template>
    <BaseDialog :dialogId="dialogId">
        <div class="modal-box">
            <h3 class="font-bold text-2xl">托管配置</h3>
            <div role="alert" class="rounded border-s-4 border-warning bg-warning/10 p-4 space-y-2 my-4">当前配置界面为究极无敌盖中盖版本，请在专家指导下使用</div>
            <div class="flex">
                <label class="form-control w-full max-w-xs mr-4">
                    <div class="label">
                        <span class="label-text">理智保留</span>
                    </div>
                    <input v-model="config.keeping_ap" type="number" class="input input-sm input-bordered w-full max-w-xs" />
                </label>
                <label class="form-control w-full max-w-xs">
                    <div class="label">
                        <span class="label-text">招募卷保留</span>
                    </div>
                    <input v-model="config.recruit_reserve" type="number" class="input input-sm input-bordered w-full max-w-xs" />
                </label>
            </div>
            <div class="divider h-0">智能开关</div>
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

            <div class="grid grid-cols-2 gap-4 h-8">
                <label class="label cursor-pointer mb-4">
                    <span class="label-text">忽略机器人</span>
                    <input v-model="config.recruit_ignore_robot" type="checkbox" class="toggle toggle-sm" />
                </label>

                <label class="label cursor-pointer mb-4">
                    <span class="label-text">允许他人协助登录</span>
                    <input v-model="config.allow_login_assist" type="checkbox" class="toggle toggle-sm" />
                </label>
            </div>

            <div class="divider h-2">作战地图</div>

            <div class="flex py-2">
                <input v-model="stageKeyWord" class="input input-sm input-bordered w-full max-w-xs mr-4" placeholder="-- 请输入代号\名称 --" />
                <select class="select select-sm select-warning w-full max-w-xs" @change="addStageToConfig">
                    <option key="-- 请选择地图 --" value="-- 请选择地图 --">-- 请选择地图 --</option>
                    <option v-for="(stage, key) in assets.filteredStages(stageKeyWord)" :key="key" :value="key">{{ stage.code }} {{ stage.name }}</option>
                </select>
            </div>
            <div class="divider h-0">作战队列</div>
            <div class="flex flex-wrap">
                <button @click="removeBattleMap(battleMap)" v-for="battleMap in config.battle_maps" :key="battleMap" class="btn btn-outline btn-warning btn-xs m-1">
                    {{ assets.getStageName(battleMap) }}
                </button>
            </div>
            <div class="grid gap-4 grid-cols-2 mt-2">
                <button class="btn btn-error btn-outline btn-block mt-4" @click="close()">
                    <span v-if="isLoading" className="loading loading-bars loading-md"></span>
                    关闭
                </button>
                <button class="btn btn-info btn-block mt-4" @click="onSubmit">
                    <span v-if="isLoading" className="loading loading-bars loading-md"></span>
                    递交
                </button>
            </div>
        </div>
    </BaseDialog>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import { doUpdateGameConf } from "../../plugins/axios";
import { setMsg } from "../../plugins/common";
import { Type } from "../toast/enmu";
import { findGame } from "../../plugins/sse";
import { assets } from "../../plugins/assets/assets";
import { dialogClose } from "./index";
import BaseDialog from "./base/BaseDialog.vue";
interface Props {
    account: string;
    // statusCode: number // 当前用户状态，-1=登陆失败 0=未开启/未初始化/正在初始化但未登录 1=登录中 2=登陆完成/运行中 3=游戏错误
}
const props = withDefaults(defineProps<Props>(), {
    account: ""
});

const isDisabled = ref(true);
const isLoading = ref(false);
const stageKeyWord = ref("");
const dialogId = ref("configModel");
const config = ref<ApiGame.GameConfig>({
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
    allow_login_assist: false
});

const addStageToConfig = (event: Event) => {
    const selectElement = event.target as HTMLSelectElement;
    const selectedKey = selectElement.value;
    if (selectedKey === "-- 请选择地图 --") {
        return;
    }
    if (!config.value.battle_maps.includes(selectedKey)) {
        config.value.battle_maps.push(selectedKey);
    }
};

watch(
    () => {
        return findGame(props.account);
    },
    (newGame) => {
        if (newGame) {
            config.value = newGame.game_config;
            isDisabled.value = true;
        } else {
            isDisabled.value = false;
        }
    }
);

const removeBattleMap = (battleMap: string) => {
    config.value.battle_maps = config.value.battle_maps.filter((item: string) => item !== battleMap);
};
const onSubmit = () => {
    if (config.value.keeping_ap < 0) {
        setMsg("理智保留不能小于0", Type.Warning);
        return;
    }
    if (config.value.recruit_reserve < 0) {
        setMsg("招募卷保留不能小于0", Type.Warning);
        return;
    }
    const copyConfig = JSON.parse(JSON.stringify(config.value));
    delete copyConfig.is_stopped;
    delete copyConfig.map_id;
    delete copyConfig.accelerate_slot_cn;
    delete copyConfig.account;
    isLoading.value = true;
    doUpdateGameConf(props.account, copyConfig)
        .then((res) => {
            setMsg(res.message, Type.Info);
        })
        .finally(() => {
            isLoading.value = false;
            close();
        });
};
const close = () => {
    dialogClose(dialogId.value);
};
</script>
