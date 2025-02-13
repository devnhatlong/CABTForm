import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';
import userService from './userService';

export const axiosJWTPreJuly2022Digitized = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosJWTPreJuly2022Digitized.interceptors.request.use(
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
axiosJWTPreJuly2022Digitized.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosJWTPreJuly2022Digitized(originalRequest);
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

const preJuly2022DigitizedService = {
    importPreJuly2022Digitized: async (data) => {
        try {
            // Gửi yêu cầu POST với FormData
            const response = await axiosJWTPreJuly2022Digitized.post(`${process.env.REACT_APP_SERVER_URL}/pre-july-2022-digitized/create-pre-july-2022-digitized`, data);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getAll: async (currentPage, pageSize, filters = {}) => {
        try {
            const response = await axiosJWTPreJuly2022Digitized.get(`${process.env.REACT_APP_SERVER_URL}/pre-july-2022-digitized/get-all`, {
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
    getAllByAdmin: async (currentPage, pageSize, filters = {}) => {
        try {
            const response = await axiosJWTPreJuly2022Digitized.get(`${process.env.REACT_APP_SERVER_URL}/pre-july-2022-digitized/get-all-by-admin`, {
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
    getDetail: async (id) => {
        try {
            const response = await axiosJWTPreJuly2022Digitized.get(`${process.env.REACT_APP_SERVER_URL}/pre-july-2022-digitized/get-detail/${id}`);

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    update: async (id, data) => {
        try {
            const response = await axiosJWTPreJuly2022Digitized.put(`${process.env.REACT_APP_SERVER_URL}/pre-july-2022-digitized/update/${id}`, data);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    deleteItem: async (id) => {
        try {
            const response = await axiosJWTPreJuly2022Digitized.delete(`${process.env.REACT_APP_SERVER_URL}/pre-july-2022-digitized/delete-item/${id}`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    deleteMultiple: async (ids) => {
        try {
            const response = await axiosJWTPreJuly2022Digitized.delete(`${process.env.REACT_APP_SERVER_URL}/pre-july-2022-digitized/delete-multiple`, { data: { ids } });
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }
};

export default preJuly2022DigitizedService;