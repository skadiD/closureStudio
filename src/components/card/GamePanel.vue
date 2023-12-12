<template>
  <a class="text-3xl mt-2 text-info font-bold">托管详情</a>
  <div class="divider">账号信息</div>
  <div class="w-full grid grid-cols-3 justify-items-center">
    <div class="flex flex-col" v-for="m in 3">
      <span class="text-base-content/70 text-xl font-extrabold">{{ ['龙门币', '合成玉', '源石'][m - 1] }}</span>
      <span class="text-3xl text-center mt-2 font-en">
        {{ [details?.status?.gold, details?.status?.diamondShard, details?.status?.androidDiamond][m - 1] }}
      </span>
    </div>
  </div>
  <div class="divider text-info text-lg font-bold"> 理智溢出: {{ formatTime(
    ((details?.status.maxAp || 0) - (Math.floor((Date.now() / 1000 - (details?.status.lastApAddTime || 0)) / 360) +
      (details?.status.ap || 0))) * 360 + Math.ceil(Date.now() / 1000)
    , true) }} </div>
  <a class="btn btn-info btn-outline btn-block my-1" @click="configModel.showModal()">托管配置</a>
  <div class="divider">不实时日志</div>
  <div class="h-[calc(100vh-32rem)] overflow-hidden">
    <table class="text-[1rem]">
      <tbody>
        <tr v-for="k in 10">
          <td class="text-info whitespace-nowrap">07-29 11:13</td>
          <td class="pl-2">[泠夭v2] 下次基建排班将在 2023-07-29 14:13:17 自动进行</td>
        </tr>
      </tbody>
    </table>
  </div>
  <a class="btn btn-block btn-info mt-2">查看托管截图</a>
  <dialog ref="configModel" class="modal" style="outline-width: 0">
    <div class="modal-box">
      <h3 class="font-bold text-2xl">托管配置</h3>
      <div role="alert" class="rounded border-s-4 border-warning bg-warning/10 p-4 space-y-2 my-4">
        当前配置界面为究极无敌盖中盖版本，请在专家指导下使用
      </div>
      <div class="s-combo">
        <input class="s-input peer focus:ring-info" v-model="editConfig.battle_maps">
        <label class="s-label peer-focus:text-info">托管地图队列</label>
        <div>
          <button class="btn btn-info m-1" v-for="(mapId, mapName) in battleMaps" :key="mapId"
            @click="addToBattleMaps(mapId)">
            {{ mapName }}
          </button>
        </div>
      </div>
      <a class="btn btn-block btn-info mt-4" @click="submit">递交</a>
    </div>
  </dialog>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import { doUpdateGameConf, fetchGameDetails } from "../../plugins/axios";
import { formatTime, setMsg } from "../../plugins/common";
import { Type } from "../toast/enmu";
interface Props {
  account: string
}
const props = withDefaults(defineProps<Props>(), {
  account: ''
});
const details = ref<ApiGame.Detail>()
const configModel = ref()
const editConfig = ref<ApiGame.Config>({
  accelerate_slot: '',
  accelerate_slot_cn: '',
  account: '',
  allow_login_assist: false,
  battle_maps: [],
  enable_building_arrange: false,
  is_auto_battle: false,
  is_stopped: false,
  keeping_ap: 0,
  map_id: '',
  recruit_ignore_robot: false,
  recruit_reserve: 0,
})
watch(() => props.account, (val) => {
  if (val == '') return
  fetchGameDetails(val).then(res => {
    if (res.data) {
      details.value = res.data
      editConfig.value = res.data.config
      editConfig.value.battle_maps = JSON.stringify(editConfig.value.battle_maps)
      return
    }
    setMsg("请求数据失败", Type.Warning)
  })
})
const battleMaps = {
  "清空": "清空",
  "1-7": "main_01-07",
  "活动1图": "act30side_01",
  "活动2图": "act30side_02",
  "活动3图": "act30side_03",
  "活动4图": "act30side_04",
  "活动5图": "act30side_05",
  "活动6图": "act30side_06",
  "活动7图": "act30side_07",
  "活动8图": "act30side_08",
}
const addToBattleMaps = (mapId: string) => {
  let battleMapsArray: string[];

  // 尝试解析 battle_maps 作为 JSON。如果失败，初始化为空数组。
  try {
    battleMapsArray = JSON.parse(editConfig.value.battle_maps as string);
    if (!Array.isArray(battleMapsArray)) {
      battleMapsArray = [];
    }
  } catch (e) {
    battleMapsArray = [];
  }

  // 如果 mapId 是 "清空"，则清空数组。否则，正常处理 mapId。
  if (mapId === "清空") {
    battleMapsArray = [];
  } else {
    // 检查 mapId 是否已经存在于数组中，如果不存在，则添加它。
    if (!battleMapsArray.includes(mapId)) {
      battleMapsArray.push(mapId);
    }
  }

  // 更新 editConfig.value.battle_maps 为字符串形式的 JSON。
  editConfig.value.battle_maps = JSON.stringify(battleMapsArray);

  console.log("After push or clear:", editConfig.value.battle_maps);
};




const submit = () => {
  editConfig.value.battle_maps = JSON.parse(<string>editConfig.value.battle_maps)
  doUpdateGameConf(props.account, editConfig.value).then(res => {
    setMsg(res.message, Type.Info)
  })
}
</script>
