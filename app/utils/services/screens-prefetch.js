import { router } from "expo-router";
import { routes } from '../settings/constants'

export function prefetchAuthenticationScreens() {
    router.prefetch(routes.INTRODUCTION);
    router.prefetch(routes.LOGIN);
    router.prefetch(routes.REGISTER);
    router.prefetch(routes.RECOVERY);
}

export function prefetchMainScreens() {
    router.prefetch(routes.HOMEPAGE);
    router.prefetch(routes.COACHES);
    router.prefetch(routes.PROFILE);
}