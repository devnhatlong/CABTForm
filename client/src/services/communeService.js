import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';
import userService from './userService';

export const axiosCommune = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosCommune.interceptors.request.use(
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
axiosCommune.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken_SLCB");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken_SLCB=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosCommune(originalRequest);
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

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/commune`;

const communeService = {
    // Tạo xã, phường, thị trấn mới
    createCommune: async (data) => {
        try {
            const response = await axiosCommune.post(`${BASE_URL}/`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo xã, phường, thị trấn:", error);
            throw error;
        }
    },

    // Lấy danh sách xã, phường, thị trấn với phân trang và lọc
    getCommunes: async (page, limit, fields, sort ) => {
        try {
            const response = await axiosCommune.get(`${BASE_URL}/`, {
                params: { page, limit, fields, sort }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách xã, phường, thị trấn:", error);
            throw error;
        }
    },

    // Lấy chi tiết xã, phường, thị trấn theo ID
    getCommuneById: async (id) => {
        try {
            const response = await axiosCommune.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết xã, phường, thị trấn:", error);
            throw error;
        }
    },

    // Cập nhật xã, phường, thị trấn (chỉ admin)
    updateCommune: async (id, data) => {
        try {
            const response = await axiosCommune.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật xã, phường, thị trấn:", error);
            throw error;
        }
    },

    // Xóa xã, phường, thị trấn (chỉ admin)
    deleteCommune: async (id) => {
        try {
            const response = await axiosCommune.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa xã, phường, thị trấn:", error);
            throw error;
        }
    },

    deleteMultipleRecords: async (ids) => {
        try {
            const response = await axiosCommune.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids }, // Đảm bảo gửi đúng định dạng
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều xã, phường, thị trấn:", error);
            throw error;
        }
    },

    importFromExcel: async (formData) => {
        try {
            const response = await axiosCommune.post(`${BASE_URL}/import-from-excel`, formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Lỗi khi import file Excel:", error);
            throw error.response?.data || { message: "Lỗi không xác định" };
        }
    },
};

export default communeService;