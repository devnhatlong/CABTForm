import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';
import userService from './userService';

export const axiosSocialOrder = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosSocialOrder.interceptors.request.use(
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
axiosSocialOrder.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken_SLCB");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken_SLCB=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosSocialOrder(originalRequest);
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

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/social-orders`;

const socialOrderService = {
    // Tạo mới vụ việc
    createSocialOrder: async (data) => {
        try {
            const response = await axiosSocialOrder.post(`${BASE_URL}/`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo vụ việc:", error);
            throw error;
        }
    },

    // Lấy danh sách vụ việc với phân trang và lọc
    getSocialOrders: async (page, limit, fields, sort) => {
        try {
            const response = await axiosSocialOrder.get(`${BASE_URL}/`, {
                params: { page, limit, fields, sort },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách vụ việc:", error);
            throw error;
        }
    },

    // Lấy chi tiết vụ việc theo ID
    getSocialOrderById: async (id) => {
        try {
            const response = await axiosSocialOrder.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết vụ việc:", error);
            throw error;
        }
    },

    // Cập nhật vụ việc
    updateSocialOrder: async (id, data) => {
        try {
            const response = await axiosSocialOrder.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật vụ việc:", error);
            throw error;
        }
    },

    // Xóa vụ việc
    deleteSocialOrder: async (id) => {
        try {
            const response = await axiosSocialOrder.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa vụ việc:", error);
            throw error;
        }
    },

    // Xóa nhiều vụ việc
    deleteMultipleRecords: async (ids) => {
        try {
            const response = await axiosSocialOrder.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids }, // Đảm bảo gửi đúng định dạng
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều vụ việc:", error);
            throw error;
        }
    },

    // Lấy lịch sử chỉnh sửa của một vụ việc theo ID
    getHistoryBySocialOrderId: async (id) => {
        try {
            const response = await axiosSocialOrder.get(`${BASE_URL}/${id}/history`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử chỉnh sửa vụ việc:", error);
            throw error;
        }
    },

    getHistoryDetailByHistoryId: async (id) => {
        try {
            const response = await axiosSocialOrder.get(`${BASE_URL}/${id}/history-detail`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử chỉnh sửa vụ việc:", error);
            throw error;
        }
    },

    sendToDepartment: async (id, note) => {
        try {
            const response = await axiosSocialOrder.put(`${BASE_URL}/${id}/send-to-department`, { note });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi gửi vụ việc lên phòng chức năng:", error);
            throw error;
        }
    },

    approveSocialOrder: async (id, note) => {
        try {
            const response = await axiosSocialOrder.put(`${BASE_URL}/${id}/approve`, { note });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi phê duyệt vụ việc:", error);
            throw error;
        }
    },

    returnSocialOrder: async (id, note) => {
        try {
            const response = await axiosSocialOrder.put(`${BASE_URL}/${id}/return`, { note });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi trả lại vụ việc:", error);
            throw error;
        }
    },

    sendToMinistry: async (id, note) => {
        try {
            const response = await axiosSocialOrder.put(`${BASE_URL}/${id}/send-to-ministry`, { note });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi gửi vụ việc lên Bộ:", error);
            throw error;
        }
    },
};

export default socialOrderService;