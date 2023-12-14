import { ref } from "vue";
import { setMsg } from "./common";
import { Type } from "../components/toast/enmu";
import { load } from "./axios";

const stages = ref<Gamedata.Stages>({});

const loadStage = () => {
  load<Gamedata.Stages>("stages").then((stagesData) => {
    stages.value = stagesData;
    setMsg("关卡数据加载大成功", Type.Success);
  });
};
export { stages, loadStage };
