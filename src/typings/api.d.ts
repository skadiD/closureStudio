declare namespace ApiSystem {
    interface Config {
        isUnderMaintenance: boolean;
        isDebugMode: boolean;
        announcement: string;
        allowGameLogin: boolean;
        allowGameCreate: boolean;
        allowGameUpdate: boolean;
        allowGameDelete: boolean;
    }
    interface Hall {
        Account: string;
        nickName: string;
        totalAPCosts: number;
        level: number;
        avatar: {
            type: string,
            id: string
        }
    }
}
declare namespace ApiUser {
    interface Auth {
        available_slot: number
        token: string;
    }
    interface Info {
        uuid: string;
        email: string;
        permission: number;
        status: number;
        isAdmin: boolean;
        exp: number;
        slot: number
    }
    interface GameStatus {
        account: string;
        platform: number;
        uuid: string;
        code: number;
        text: string;
        nick_name: string;
        level: number;
        avatar: {
            type: string,
            id: string
        },
        createdAt: number,
        is_verify: boolean;
        ap: number
    }
    interface CaptchaInfo {
        challenge: string;
        gt: string;
        created: number;
        captcha_type: string;
    }
    interface GameConfig {
        account: string;
        accelerate_slot: string;
        accelerate_slot_cn: string;
        battle_maps: string[];
        enable_building_arrange: boolean;
        is_auto_battle: boolean;
        is_stopped: boolean;
        keeping_ap: number;
        recruit_ignore_robot: boolean;
        recruit_reserve: number;
        map_id: string;
    }
    interface Game {
        status: GameStatus;
        captcha_info: CaptchaInfo;
        game_config: GameConfig;
    }
}
