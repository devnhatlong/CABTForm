import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';
import userService from './userService';

export const axiosGeneralSetting = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosGeneralSetting.interceptors.request.use(
    (config) => {
        const accessToken = getTokenFromCookie("accessToken_SLCB");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to refresh the JWT token if it's expired
axiosGeneralSetting.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken_SLCB");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken_SLCB=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosGeneralSetting(originalRequest);
            } catch (refreshError) {
                console.error(refreshError);
                redirectToLogin();
                return Promise.reject(error);
            }
        }

        if (error.response.status === 401 && !refreshToken) {
            redirectToLogin();
        }

        return Promise.reject(error);
    }
);

const redirectToLogin = () => {
    document.cookie = "accessToken_SLCB=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken_SLCB=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
};

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/general-setting`;

const GeneralSettingService = {
    // Tạo cài đặt mới
    createGeneralSetting: async (data) => {
        try {
            const response = await axiosGeneralSetting.post(`${BASE_URL}/`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo cài đặt:", error);
            throw error;
        }
    },

    // Lấy danh sách cài đặt
    getGeneralSettings: async () => {
        try {
            const response = await axiosGeneralSetting.get(`${BASE_URL}/`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách cài đặt:", error);
            throw error;
        }
    },

    // Lấy chi tiết cài đặt theo ID
    getGeneralSettingById: async (id) => {
        try {
            const response = await axiosGeneralSetting.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết cài đặt:", error);
            throw error;
        }
    },

    // Cập nhật cài đặt (chỉ admin)
    updateGeneralSetting: async (key, value, time) => {
        try {
            const response = await axiosGeneralSetting.put(`${BASE_URL}`, { key, value, time });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật cài đặt với key "${key}":`, error);
            throw error;
        }
    },
};

export default GeneralSettingService;