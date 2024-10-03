import { computed, ref } from "vue";
import { userStore } from "../../store/user";
import { gameCaptcha } from "../geetest/captcha";

export const config = ref<ApiSystem.Config>({} as ApiSystem.Config);
export const gameList = ref<ApiGame.Game[]>([]);
export const globalSSR = ref<ApiGame.SSR[]>([]);


export const findGame = (gameAccount: string) => {
    return gameList.value.find((game) => game.status.account === gameAccount);
};

export const getFirstGame = computed(() => {
    if (gameList.value.length === 0) {
        return null;
    }
    return gameList.value[0];
});

export const updateGameList = (data: ApiGame.Game[]) => {
    const pinaUser = userStore();
    gameList.value = data;
  
    gameList.value.forEach((game) => {
      if (game.status.code === 2) {
        pinaUser.setGame(game.game_config.account, game.status.nick_name, game.status.avatar);
      }
      if (game.status.code === 999 && game.captcha_info.challenge) {
        gameCaptcha(game.status.account, game.captcha_info);
      }
    });
  };