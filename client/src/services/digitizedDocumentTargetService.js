import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';
import userService from './userService';

export const axiosDigitizedDocumentTarget = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosDigitizedDocumentTarget.interceptors.request.use(
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
axiosDigitizedDocumentTarget.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosDigitizedDocumentTarget(originalRequest);
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

const digitizedDocumentTargetService = {
    getAllDigitizedDocumentTarget: async (currentPage, pageSize, filters = {}) => {
        try {
            const response = await axiosDigitizedDocumentTarget.get(`${process.env.REACT_APP_SERVER_URL}/digitized-document-target/get-all-digitized-document-target`, {
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
    getDetailDigitizedDocumentTarget: async (id) => {
        try {
            const response = await axiosDigitizedDocumentTarget.get(`${process.env.REACT_APP_SERVER_URL}/digitized-document-target/get-detail-digitized-document-target/${id}`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    createDigitizedDocumentTarget: async (data) => {
        try {
            const response = await axiosDigitizedDocumentTarget.post(`${process.env.REACT_APP_SERVER_URL}/digitized-document-target/create-digitized-document-target`, data);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    updateDigitizedDocumentTarget: async (id, data) => {
        try {
            const response = await axiosDigitizedDocumentTarget.put(`${process.env.REACT_APP_SERVER_URL}/digitized-document-target/update-digitized-document-target/${id}`, data);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    deleteDigitizedDocumentTarget: async (id) => {
        try {
            const response = await axiosDigitizedDocumentTarget.delete(`${process.env.REACT_APP_SERVER_URL}/digitized-document-target/delete-digitized-document-target/${id}`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    deleteMultipleDigitizedDocumentTargets: async (ids) => {
        try {
            const response = await axiosDigitizedDocumentTarget.delete(`${process.env.REACT_APP_SERVER_URL}/digitized-document-target/delete-multiple-digitized-document-targets`, { data: { ids } });
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }
};

export default digitizedDocumentTargetService;
