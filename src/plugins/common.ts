import { Store } from "../components/toast/store";
import { ref } from "vue";
export const { setMsg } = Store();
export const isLarge = ref(false);
export const formatTime = (value: number, details = false) => {
  let date = new Date(value * 1000);
  let y: string = date.getFullYear().toString(),
    m: any = date.getMonth() + 1,
    d: any = date.getDate();
  let h, min;
  if (details) {
    h = date.getHours();
    min = date.getMinutes();
    if (h < 10) {
      h = "0" + h;
    }
    if (min < 10) {
      min = "0" + min;
    }
  }
  if (m < 10) {
    m = "0" + m;
  }
  if (d < 10) {
    d = "0" + d;
  }
  y = y.substring(y.length - 2);
  let str = y + "-" + m + "-" + d + " ";
  return details ? str + h + ":" + min : str;
};

export function loadTheme() {
  const theme = localStorage.getItem("theme") || "halloween";
  document.documentElement.setAttribute("data-theme", theme);
}
export function SetTheme(name: string) {
  localStorage.setItem("theme", name);
  document.documentElement.setAttribute("data-theme", name);
}
export function getTheme() {
  return localStorage.getItem("theme");
}
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isNight =
  new Date().getHours() >= 22 || new Date().getHours() <= 6;

export const YouMayKnowArray = [
  "可露希尔可是支持全自动搓玉的哦~",
  "周日快过期的理智药，可露希尔都会帮你用掉的呢！",
  "每日每周的日常任务，都交给可露希尔，可露希尔会全自动帮你完成的~",
  "可露希尔工作室其实是一个公益免费开源项目哦，大家可以安心使用。",
  "如果目标作战关卡关闭了，可露希尔就没法帮你代理目标关卡啦！",
  "每个账号都有24小时的试用时间哦，尽情享用吧！",
  "可露希尔也是需要休息的！UTC+8 5:00-8:00是可露希尔的休息时间~",
  "有好的建议的话，记得在工单系统上告诉可露希尔哦，可露希尔会很开心的！",
  "为什么不会自动赠送线索？因为开发者也送不明白啦。",
  "可露希尔工作室是个好孩子，可露希尔们不允许进行任何违法行为哦。",
  "不要滥用可露希尔哦~",
  "如果有网络问题，可露希尔是帮不上忙的呢。",
  "别以为注册多个账号就可以滥用哦，小可露希尔工作室可是会检测到的，连隐私模式也不行呢。",
  "作战失败的原因，游戏日志已经告诉你啦，不要再问可露希尔啦。",
  "为什么会作战失败，但是手机或者模拟器能正常作战？这个问题，可露希尔也不知道呢。",
  "请向开发团队致以崇高的敬意，他们真的很棒呢！",
  "想要成为可露希尔们的一员吗？可露希尔工作室正在招募运维和开发工程师！别错过这个机会，快来投递简历吧！",
  "可露希尔是不会收集任何用户信息的，大家可以放心使用。",
];

export function selectRandomElement<T>(arr: T[]): T | undefined {
  if (arr.length === 0) {
    return undefined;
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}
