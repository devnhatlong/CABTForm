const ROOTS_DASHBOARD = '/dashboard';
const ROOTS_ADMIN= '/admin';
const ROOTS_CATEGORY= '/category';
const ROOTS_SOCIAL_ORDER= '/social-order';
const ROOTS_TRAFFIC= '/traffic';
const ROOTS_FIRE_EXPLOSIONS= '/fire-explosion';
const ROOTS_SETTING = '/setting';

export const PATHS = {
    ROOT: ROOTS_DASHBOARD,
    ADMIN: {
        USER: `${ROOTS_ADMIN}/user`,
        DEPARTMENT: `${ROOTS_ADMIN}/department`,
    },
    CATEGORY: {
        FIELD_OF_WORK: `${ROOTS_CATEGORY}/field-of-work/list`,
        CRIME: `${ROOTS_CATEGORY}/crime/list`,
    },
    SOCIAL_ORDER: {
        LIST: `${ROOTS_SOCIAL_ORDER}/list`,
        LOOKUP: `${ROOTS_SOCIAL_ORDER}/lookup`,
        STATS: `${ROOTS_SOCIAL_ORDER}/stats`,
    },
    TRAFFIC: {
        INCIDENTS: `${ROOTS_TRAFFIC}/list`,
        STATS: `${ROOTS_TRAFFIC}/stats`,
    },
    FIRE_EXPLOSIONS: {
        LIST: `${ROOTS_FIRE_EXPLOSIONS}/list`,
        STATS: `${ROOTS_FIRE_EXPLOSIONS}/stats`,
    },
    SETTING: {
        PERMISSION_FUNCTION: `${ROOTS_SETTING}/permission-function`,
        PERMISSION_FIELD: `${ROOTS_SETTING}/permission-field`,
    },
};