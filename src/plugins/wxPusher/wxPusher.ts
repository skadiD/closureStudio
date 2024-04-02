import { ref } from "vue";
import { CreateWXPusherQRCode, QueryWXPusher } from "../axios";
import { setMsg } from "../common";
import { Type } from "../../components/toast/enmu";

export const useWXPusher = () => {
    const isLoading = ref(false);
    const wxPuhser = ref<ApiUser.WXPusher>();
    const QRCode = ref<ApiUser.WXPusherQRCode>();
    const queryWxPusher = async () => {
        if (isLoading.value) return;
        isLoading.value = true;
        try {
            const res = await QueryWXPusher();
            if (res.code == 1 && res.data) {
                wxPuhser.value = res.data;
            }
        } catch (error) {
            console.error(error);
        } finally {
            isLoading.value = false;
        }
    };

    const createQRCodes = async () => {
        try {
            const res = await CreateWXPusherQRCode();
            if (res.code == 1 && res.data) {
                QRCode.value = res.data;
            } else {
                setMsg(res.message, Type.Error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return { isLoading, wxPuhser, QRCode, queryWxPusher, createQRCodes };
};
