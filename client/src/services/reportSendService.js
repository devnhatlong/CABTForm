import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';
import userService from './userService';

export const axiosReport = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosReport.interceptors.request.use(
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
axiosReport.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken_SLCB");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken_SLCB=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosReport(originalRequest);
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

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/report`;

const reportSendService = {
    // Tạo báo cáo mới
    createReport: async (data) => {
        try {
            const response = await axiosReport.post(`${BASE_URL}/`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi gửi báo cáo:", error);
            throw error.response?.data || { message: "Lỗi không xác định" };
        }
    },

    // Lấy danh sách báo cáo với phân trang và lọc
    getReports: async (page, limit, fields, sort) => {
        try {
            const response = await axiosReport.get(`${BASE_URL}/`, {
                params: { page, limit, fields, sort }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách báo cáo:", error);
            throw error;
        }
    },

    // Lấy chi tiết báo cáo theo ID
    getReportById: async (id) => {
        try {
            const response = await axiosReport.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết báo cáo:", error);
            throw error;
        }
    },

    // Cập nhật báo cáo (chỉ admin)
    updateReport: async (id, data) => {
        try {
            const response = await axiosReport.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật báo cáo:", error);
            throw error;
        }
    },

    // Xóa báo cáo (chỉ admin)
    deleteReport: async (id) => {
        try {
            const response = await axiosReport.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa báo cáo:", error);
            throw error;
        }
    },

    deleteMultipleRecords: async (ids) => {
        try {
            const response = await axiosReport.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids }, // Đảm bảo gửi đúng định dạng
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều báo cáo:", error);
            throw error;
        }
    },
};

export default reportSendService;