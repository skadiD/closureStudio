import { computed, ref } from "vue";
import { setMsg } from "./common";
import { Type } from "../components/toast/enmu";
import { userStore } from "../store/user";
import { router } from "./router";
import { userQuota } from "./quota/userQuota";
import {gameCaptcha} from "./geetest/captcha";
const config = ref<ApiSystem.Config>({} as ApiSystem.Config);
const gameList = ref<ApiGame.Game[]>([]);
let event: EventSource | null = null;

const startSSE = (user: any) => {
  if (event !== null) {
    return true;
  }
  if (user.isLogin === false) {
    setMsg("请先登录", Type.Warning);
    return false;
  }
  // check this token is expired or not?
  if (user.user.Info) {
    // check user.user.exp is expired or not? this is utc time 1703262578
    if (user.user.Info.exp < Math.floor(Date.now() / 1000)) {
      setMsg("登录已过期，请重新登录", Type.Warning);
      user.logout()
      router.push("/");
      return false;
    }
  }
  if (typeof EventSource === "undefined") {
    setMsg("你的浏览器不支持 SSE 特性，访问托管列表将受到影响", Type.Warning);
    return false;
  } else {
    event = new EventSource(
        `https://api.arknights.host/sse/games?token=${user.token}`
    );
    event.onopen = (e) => {
      setMsg("链接到服务器成功", Type.Success);
    };
    // 根据收到的消息解析操作：更新游戏列表 & 掐断链接
    event.addEventListener("game", (event) => {
      gameList.value = JSON.parse(event.data) ?? [];
      gameList.value.forEach((game) => {
        console.log(game.status.code, game.captcha_info)
        if (game.status.code === 999 && game.captcha_info.challenge) {
          gameCaptcha(game.status.account, game.captcha_info);
        }
      })
      userQuota.value.queryMe();
    });
    event.addEventListener("close", () => {
      setMsg("你已在其他窗口或设备访问，本页面暂停更新", Type.Warning);
      event?.close();
    });
    event.onerror = (e) => {
      setMsg("与服务器通信中断", Type.Alert);
    };
  }
};
const findGame = (gameAccount: string) => {
  return gameList.value.find(
      (game) => game.status.account === gameAccount
  );
};

export { config, startSSE, findGame, gameList  };
