import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';
import userService from './userService';

export const axiosFieldOfWork = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosFieldOfWork.interceptors.request.use(
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
axiosFieldOfWork.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken_SLCB");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken_SLCB=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosFieldOfWork(originalRequest);
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

const BASE_URL = `${process.env.REACT_APP_SERVER_URL}/field-of-work`;

const fieldOfWorkService = {
    // Tạo lĩnh vực công việc mới
    createFieldOfWork: async (data) => {
        try {
            const response = await axiosFieldOfWork.post(`${BASE_URL}/`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo lĩnh vực công việc:", error);
            throw error;
        }
    },

    // Lấy danh sách lĩnh vực công việc với phân trang và lọc
    getFieldOfWorks: async (page, limit, fields, sort ) => {
        try {
            const response = await axiosFieldOfWork.get(`${BASE_URL}/`, {
                params: { page, limit, fields, sort }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lĩnh vực công việc:", error);
            throw error;
        }
    },

    // Lấy chi tiết lĩnh vực công việc theo ID
    getFieldOfWorkById: async (id) => {
        try {
            const response = await axiosFieldOfWork.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết lĩnh vực công việc:", error);
            throw error;
        }
    },

    // Cập nhật lĩnh vực công việc (chỉ admin)
    updateFieldOfWork: async (id, data) => {
        try {
            const response = await axiosFieldOfWork.put(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật lĩnh vực công việc:", error);
            throw error;
        }
    },

    updateFieldDepartment: async (id, data) => {
        try {
            const response = await axiosFieldOfWork.put(`${BASE_URL}/update-field-department/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật lĩnh vực công việc:", error);
            throw error;
        }
    },

    // Xóa lĩnh vực công việc (chỉ admin)
    deleteFieldOfWork: async (id) => {
        try {
            const response = await axiosFieldOfWork.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa lĩnh vực công việc:", error);
            throw error;
        }
    },

    deleteMultipleRecords: async (ids) => {
        try {
            const response = await axiosFieldOfWork.delete(`${BASE_URL}/delete-multiple`, {
                data: { ids }, // Đảm bảo gửi đúng định dạng
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhiều lĩnh vực công việc:", error);
            throw error;
        }
    },

    importFromExcel: async (formData) => {
        try {
            const response = await axiosFieldOfWork.post(`${BASE_URL}/import-from-excel`, formData,
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

export default fieldOfWorkService;