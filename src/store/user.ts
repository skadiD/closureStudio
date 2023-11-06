import { defineStore } from "pinia";

export const userStore = defineStore("user", {
    state: () => ({
        user: {
            isLogin: false,
            max_slot: 0,
            Token: "",
            Info: {
                uuid: '',
                email: '',
                permission: 0,
                status: -1,
                isAdmin: false,
                exp: 0,
                slot: 0
            } as ApiUser.Info
        },
    }),
    actions: {
        login(slot: number, token: string) {
            this.user.isLogin = true;
            this.user.max_slot = slot;
            this.user.Token = token;
            this.user.Info = JSON.parse(atob(token.split('.')[1]));
        },
        logout() {
            this.$reset();
        },
    },
    getters: {
        isLogin: (state) => state.user.isLogin,
        Token: (state) => state.user.Token,
    }
});
