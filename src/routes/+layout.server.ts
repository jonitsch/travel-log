import type { PageServerLoad } from "./protected/$types";

export const load: PageServerLoad = (async ({locals}) => {
    const user = locals.user;
    return {
        user: user,
    };
})