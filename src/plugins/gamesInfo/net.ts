import { ref } from "vue";
import NewSSRNotice from "../../components/dialog/NewSSRNotice.vue";
import { Type } from "../../components/toast/enum";
import { userStore } from "../../store/user";
import { fetchGameList } from "../axios";
import { setMsg } from "../common";
import showDialog from "../dialog/dialog";
import { userQuota } from "../quota/userQuota";
import { router } from "../router";
import { globalSSR, setIsLoading, updateGameList } from "./data";

const isStarted = ref(false);

const startSSE = async () => {
  const user = userStore();
  if (!user) {
    setMsg("userStore 未初始化", Type.Warning);
    return false;
  }
  if (typeof EventSource === "undefined") {
    setMsg("你的浏览器不支持 SSE 特性，访问托管列表将受到影响", Type.Warning);
    return false;
  }
  if (user.isLogin === false) {
    setMsg("请先登录", Type.Warning);
    return false;
  }

  // 检查 token 是否过期
  if (user.user.Info && user.user.Info.exp < Math.floor(Date.now() / 1000)) {
    setMsg("登录已过期，请重新登录", Type.Warning);
    user.logout();
    router.push("/");
    return false;
  }

  // 设置连接超时
  const connectionTimeout = 5000; // 超时设定为5秒

  try {
    const event = await new Promise<EventSource>((resolve, reject) => {
      // 创建 EventSource 实例
      const eventSource = new EventSource(`https://api.ltsc.vip/sse/games?token=${user.token}`);

      // 设置超时逻辑
      const timer = setTimeout(() => {
        eventSource.close();
        reject(new Error("连接超时"));
      }, connectionTimeout);

      // 连接成功时
      eventSource.onopen = () => {
        clearTimeout(timer);
        resolve(eventSource);
      };

      // 连接错误时
      eventSource.onerror = () => {
        clearTimeout(timer);
        eventSource.close();
        reject(new Error("EventSource 连接失败"));
      };
    });

    // 连接成功，监听事件
    event.addEventListener("game", (event) => {
      if (!event.data) return;
      const data = JSON.parse(event.data) as ApiGame.Game[];
      updateGameList(data);
      userQuota.value.queryMe();
    });
    event.addEventListener("log", (event) => {
      if (!event.data) return;
      const parsedData = JSON.parse(event.data) as ApiGame.LogEvent;
      setMsg(parsedData.content, Type.Success);
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

    return true; // 连接成功，返回 true
  } catch (error) {
    setMsg(error, Type.Warning);
    return false; // 连接失败，返回 false
  }
};


const startAxios = () => {
  const user = userStore();
  if (!user) {
    setMsg("userStore 未初始化", Type.Warning);
    return false;
  }
  if (user.isLogin === false) {
    setMsg("请先登录", Type.Warning);
    return false;
  }
  // 检查 token 是否过期
  if (user.user.Info && user.user.Info.exp < Math.floor(Date.now() / 1000)) {
    setMsg("登录已过期，请重新登录", Type.Warning);
    user.logout();
    router.push("/");
    return false;
  }

  // 定义轮询的间隔时间（毫秒）
  const intervalTime = 5000; // 10秒

  // 轮询函数
  const poll = async () => {
    try {
      // 通过 Promise.all 同时发起两个请求
      const [response, queryMeResp] = await Promise.all([
        fetchGameList(), // 请求游戏列表
        userQuota.value.queryMe() // 请求用户配额数据
      ]);
      // 处理 fetchGameList 的结果
      if (response && response.code === 1 && response.data) {
        updateGameList(response.data);
      }
      // 处理 queryMe 的结果
      if (queryMeResp) {
        userQuota.value.data.value = queryMeResp;
      }
    } catch (error) {
      console.error("Error during polling:", error);
    } finally {
      setIsLoading(false);
      // 在 poll 完成后，等待指定时间再进行下一次轮询
      setTimeout(poll, intervalTime);
    }
  };

  poll();
  return true;
};

const queryGamesInfo = async () => {
  // const sseResult = await startSSE();
  // if (sseResult) {
  //   setMsg("链接到服务器成功", Type.Success);
  //   return;
  // }
  // setMsg("链接到服务器失败，将使用轮询模式", Type.Warning);
  // startAxios();
  if (isStarted.value) {
    return;
  }
  isStarted.value = true;
  startSSE();
  startAxios();
};

export { queryGamesInfo };

