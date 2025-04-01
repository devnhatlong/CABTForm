import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';
import userService from './userService';

export const axiosJWT = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosJWT.interceptors.request.use(
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
axiosJWT.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken_SLCB");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken_SLCB=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosJWT(originalRequest);
            } catch (refreshError) {
                // Handle refresh token error
                console.error(refreshError);
                // You may want to redirect to login page or handle this in your application accordingly
                // Redirect to login page or handle accordingly
                redirectToLogin();
                return Promise.reject(error);
            }
        }

        // If error is 401 and no refresh token, assume user needs to logout
        if (error.response.status === 401 && !refreshToken) {
            // Redirect to login page and clear tokens
            redirectToLogin();
        }

        return Promise.reject(error);
    }
);

const redirectToLogin = () => {
    // Clear tokens from cookie
    document.cookie = "accessToken_SLCB=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken_SLCB=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Redirect to login page
    window.location.href = "/login";
};

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/forms`;

const formService = {
    // Tạo form mới (chỉ admin)
    createForm: async (data) => {
        try {
            const response = await axiosJWT.post(`${BASE_URL}/`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo form:", error);
            throw error;
        }
    },

    // Lấy danh sách form với phân trang và lọc
    getAllForms: async (page, limit, title) => {
        try {
            const response = await axiosJWT.get(`${BASE_URL}/`, {
                params: { page, limit, title }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách form:", error);
            throw error;
        }
    },

    // Lấy chi tiết form theo ID
    getFormById: async (id) => {
        try {
            const response = await axiosJWT.get(`${BASE_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết form:", error);
            throw error;
        }
    },

    // Cập nhật form (chỉ admin)
    updateForm: async (id, data) => {
        try {
            const response = await axiosJWT.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật form:", error);
            throw error;
        }
    },

    // Xóa form (chỉ admin)
    deleteForm: async (id) => {
        try {
            const response = await axiosJWT.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa form:", error);
            throw error;
        }
    }
};

export default formService;