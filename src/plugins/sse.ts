import { computed, ref } from "vue";
import { setMsg } from "./common";
import { Type } from "../components/toast/enmu";
import { userStore } from "../store/user";
import { router } from "./router";
import { userQuota } from "./quota/userQuota";
import { gameCaptcha } from "./geetest/captcha";
import showDialog from "./dialog/dialog";
import NewSSRNotice from "../components/dialog/NewSSRNotice.vue";

const config = ref<ApiSystem.Config>({} as ApiSystem.Config);
const gameList = ref<ApiGame.Game[]>([]);
const globalSSR = ref<ApiGame.SSR[]>([]);

let event: EventSource | null = null;
let timer: ReturnType<typeof setTimeout>;

const startSSE = (user: any) => {
  if (event !== null) {
    return true;
  }
  if (user.isLogin === false) {
    setMsg("请先登录", Type.Warning);
    return false;
  }
  // check this token is expired or not?
  if (user.user.Info && user.user.Info.exp < Math.floor(Date.now() / 1000)) {
    setMsg("登录已过期，请重新登录", Type.Warning);
    user.logout();
    router.push("/");
    return false;
  }
  if (typeof EventSource === "undefined") {
    setMsg("你的浏览器不支持 SSE 特性，访问托管列表将受到影响", Type.Warning);
    return false;
  }

  event = new EventSource(`https://api.ltsc.vip/sse/games?token=${user.token}`);
  event.onopen = () => {
    clearTimeout(timer); // 清除超时定时器
    setMsg("链接到服务器成功", Type.Success);
  };

  timer = setTimeout(sseTimeOutWarn, 3000);

  // 根据收到的消息解析操作：更新游戏列表 & 掐断链接
  event.addEventListener("game", (event) => {
    const pinaUser = userStore();
    gameList.value = JSON.parse(event.data) ?? [];
    gameList.value.forEach((game) => {
      if (game.status.code === 2) {
        pinaUser.setGame(
          game.game_config.account,
          game.status.nick_name,
          game.status.avatar
        );
      }
      if (game.status.code === 999 && game.captcha_info.challenge) {
        gameCaptcha(game.status.account, game.captcha_info);
      }
    });
    userQuota.value.queryMe();
  });
  event.addEventListener("close", () => {
    setMsg("你已在其他窗口或设备访问，本页面暂停更新", Type.Warning);
    event?.close();
  });
  event.addEventListener("ssr", (event) => {
    globalSSR.value = JSON.parse(event.data) ?? [];
    const lastReadTs = Number(localStorage.getItem("lastReadTs")) || 0;
    globalSSR.value = globalSSR.value.filter(
      (item) => item.createdAt > lastReadTs
    );
    if (globalSSR.value.length > 0) {
      setMsg("可露希尔又双叒叕抽到 6 星干员啦!!!", Type.Info);
      showDialog(NewSSRNotice, { users: globalSSR.value });
    }
  });
  // 刷新后会弹出错误
  // event.onerror = (e) => {
  //   console.log(e)
  //   setMsg("与服务器通信中断", Type.Alert);
  // };
};

const getFirstGame = computed(() => {
  if (gameList.value.length === 0) {
    return null;
  }
  return gameList.value[0];
});

const findGame = (gameAccount: string) => {
  return gameList.value.find((game) => game.status.account === gameAccount);
};

const sseTimeOutWarn = () => {
  if (event === null) return;
  if (event.readyState !== EventSource.OPEN) {
    event.close();
    setMsg("服务器链接失败，请刷新网页", Type.Warning);
  }
};

export { config, startSSE, findGame, gameList, getFirstGame, globalSSR };
