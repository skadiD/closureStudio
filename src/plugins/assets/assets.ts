import { computed, ref } from "vue";
import { setMsg } from "../common";
import { Type } from "../../components/toast/enmu";
import { load } from "../axios";
import constants from "../constants";

const itemData = ref<Gamedata.Items>({});
const stageData = ref<Gamedata.Stages>({});

const assets = computed(() => {
  const getStageName = (stageId: string) => {
    const stage = stageData.value[stageId];
    return stage ? stage.name : "未知关卡";
  };

  const getItemName = (itemId: string) => {
    const item = itemData.value[itemId];
    return item ? item.name : "未知物品";
  };

  const getItemIcon = (itemId: string) => {
    const item = itemData.value[itemId];
    return item ? item.icon : "";
  };

  const filteredStages = (keyword: string) => {
    if (!keyword.trim()) {
      return Object.keys(stageData.value).reduce((acc, key, index) => {
        if (index < 10) {
          acc[key] = stageData.value[key];
        }
        return acc;
      }, {} as Gamedata.Stages);
    }

    let count = 0;
    return Object.entries(stageData.value).reduce((acc, [key, value]) => {
      if (
        count < 10 &&
        (key.includes(keyword) ||
          value.code.includes(keyword.toUpperCase()) ||
          value.name.includes(keyword))
      ) {
        acc[key] = value;
        count++;
      }
      return acc;
    }, {} as Gamedata.Stages);
  };

  const getItemLink = (key: string) => {
    const item = itemData.value[key];
    if (!item) {
      return "";
    }
    // https://assets.closure.setonink.com/dst/items/LIMITED_TKT_GACHA_10_2501.webp
    return `${constants.AssetsHost}/dst/items/${item.icon}.webp`;

  };

  return {
    getStageName,
    getItemName,
    getItemIcon,
    filteredStages,
    getItemLink,
    stages: stageData,
    items: itemData,
  };
});

const loadItems = async () => {
  try {
    const itemsData = await load<Gamedata.Items>("items");
    itemData.value = itemsData;
  } catch (error) {
    console.error("Error loading items data:", error);
    throw error;
  }
};

const loadStages = async () => {
  try {
    const stagesData = await load<Gamedata.Stages>("stages");
    stageData.value = stagesData;
  } catch (error) {
    console.error("Error loading stages data:", error);
    throw error;
  }
};

const loadAssets = async () => {
  try {
    await Promise.all([loadItems(), loadStages()]);
    setMsg("数据加载成功", Type.Success);
  } catch (error) {
    setMsg("数据加载失败", Type.Warning);
    console.error("Error loading data:", error);
    throw error; // 抛出错误以便上游代码捕获
  }
};

export { assets, loadAssets };
