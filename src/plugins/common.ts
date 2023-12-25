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
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const isNight =
  new Date().getHours() >= 22 || new Date().getHours() <= 6;

export const YouMayKnowArray = [
  "可露希尔支持全自动搓玉。",
  "可露希尔会在周日使用快过期的理智药。",
  "可露希尔会全自动完成每日，每周等日常任务。",
  "可露希尔工作室是一个公益免费开源项目。",
  "可露希尔会自动使用无人机。",
  "当作战关卡关闭时，可露希尔是无法自动作战的！",
  "每个账号拥有24小时的试用时间。",
  "可露希尔5:00-8:00是休息时间。",
  "如果你有好的建议，可以在工单系统上提出来。",
  "为什么不会自动赠送线索？因为作者不会玩这个游戏。",
  "不允许使用可露希尔工作室进行任何违法行为。",
  "不允许滥用可露希尔工作室。",
  "可露希尔不负责网络问题。",
  "不要以为注册多个账号就可以滥用。可露希尔工作室可以检测到（隐私模式也可以）。",
  "不要询问为什么会作战失败。游戏日志已经给出了答案。",
  "不要询问为什么会作战失败，但是手机或者模拟器能正常作战。",
  "请向开发团队致以崇高的敬意。",
  "可露希尔工作室招募工程师，运维师。",
  "当你进行游玩时，请暂停托管。",
];

export function selectRandomElement<T>(arr: T[]): T | undefined {
  if (arr.length === 0) {
      return undefined;
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}
