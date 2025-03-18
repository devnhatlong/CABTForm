import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';
import userService from './userService';

export const axiosDepartment = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosDepartment.interceptors.request.use(
    (config) => {
        const accessToken = getTokenFromCookie("accessToken");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to refresh the JWT token if it's expired
axiosDepartment.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosDepartment(originalRequest);
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
    document.cookie = "accessToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Redirect to login page
    window.location.href = "/login";
};

const departmentService = {
    getAllDepartment: async (currentPage, pageSize, filters = {}) => {
        try {
            const response = await axiosDepartment.get(`${process.env.REACT_APP_SERVER_URL}/department/get-all-department`, {
                params: {
                    filters,
                    currentPage,
                    pageSize
                }
            });

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getDetailDepartment: async (id) => {
        try {
            const response = await axiosDepartment.get(`${process.env.REACT_APP_SERVER_URL}/department/get-detail-department/${id}`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    createDepartment: async (data) => {
        try {
            const response = await axiosDepartment.post(`${process.env.REACT_APP_SERVER_URL}/department/create-department`, data);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    updateDepartment: async (id, data) => {
        try {
            const response = await axiosDepartment.put(`${process.env.REACT_APP_SERVER_URL}/department/update-department/${id}`, data);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    deleteDepartment: async (id) => {
        try {
            const response = await axiosDepartment.delete(`${process.env.REACT_APP_SERVER_URL}/department/delete-department/${id}`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    deleteMultipleDepartments: async (ids) => {
        try {
            const response = await axiosDepartment.delete(`${process.env.REACT_APP_SERVER_URL}/department/delete-multiple-departments`, { data: { ids } });
            return response.data;
        } catch (error) {
            console.log(error);
        }
    },
    importFromExcel: async (formData) => {
        try {
            const response = await axiosDepartment.post(`${process.env.REACT_APP_SERVER_URL}/department/import-from-excel`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }
};

export default departmentService;
