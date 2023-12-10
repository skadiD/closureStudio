import {ref} from "vue";
import {setMsg} from "../plugins/common";
import {Type} from "../components/toast/enmu";

const config = ref<ApiSystem.Config>({} as ApiSystem.Config)

let event: EventSource | null = null
const gameList = ref<ApiUser.Game[]>([])
const startSSE = (token: string) => {
    if (event !== null) {
        return true
    }
    if (typeof (EventSource) === 'undefined') {
        setMsg('你的浏览器不支持 SSE 特性，访问托管列表将受到影响', Type.Warning)
        return false
    } else {
        event = new EventSource(`https://api.arknights.host/sse/games?token=${token}`);
        event.onopen = (e) => {
            setMsg('链接到服务器成功', Type.Success)
        }
        // 根据收到的消息解析操作：更新游戏列表 & 掐断链接
        event.addEventListener("game", (event) => {
            gameList.value = JSON.parse(event.data)
            console.log(JSON.parse(event.data))
        })
        event.addEventListener("close", () => {
            setMsg('你已在其他窗口或设备访问，本页面暂停更新', Type.Warning)
            event?.close()
        })
        event.onerror = (e) => {
            setMsg('与服务器通信中断', Type.Alert)
        }
    }
}
export { config, gameList, startSSE }