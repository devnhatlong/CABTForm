import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';
import userService from './userService';

export const axiosJWTStatisticsByAdmin = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosJWTStatisticsByAdmin.interceptors.request.use(
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
axiosJWTStatisticsByAdmin.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosJWTStatisticsByAdmin(originalRequest);
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

const digitizedDocumentService = {
    getDigitizedDocumentFrom2018To2023: async () => {
        try {
            // Gửi yêu cầu POST với FormData
            const response = await axiosJWTStatisticsByAdmin.get(`${process.env.REACT_APP_SERVER_URL}/statistics-admin/get-digitized-document-from-2018-to-2023`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getDigitizedDocumentInCurrentYear: async () => {
        try {
            // Gửi yêu cầu POST với FormData
            const response = await axiosJWTStatisticsByAdmin.get(`${process.env.REACT_APP_SERVER_URL}/statistics-admin/get-digitized-document-in-current-year`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getDigitizedDocumentFrom2018To2024: async () => {
        try {
            // Gửi yêu cầu POST với FormData
            const response = await axiosJWTStatisticsByAdmin.get(`${process.env.REACT_APP_SERVER_URL}/statistics-admin/get-digitized-document-from-2018-to-2024`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getTargetFromPolice: async () => {
        try {
            // Gửi yêu cầu POST với FormData
            const response = await axiosJWTStatisticsByAdmin.get(`${process.env.REACT_APP_SERVER_URL}/statistics-admin/get-target-from-police`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getTargetFromPoliceDetail: async () => {
        try {
            // Gửi yêu cầu POST với FormData
            const response = await axiosJWTStatisticsByAdmin.get(`${process.env.REACT_APP_SERVER_URL}/statistics-admin/get-target-from-police-detail`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getAdministrativeProceduresPre: async () => {
        try {
            // Gửi yêu cầu POST với FormData
            const response = await axiosJWTStatisticsByAdmin.get(`${process.env.REACT_APP_SERVER_URL}/statistics-admin/get-administrative-procedures-pre`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getAdministrativeProceduresPost: async () => {
        try {
            // Gửi yêu cầu POST với FormData
            const response = await axiosJWTStatisticsByAdmin.get(`${process.env.REACT_APP_SERVER_URL}/statistics-admin/get-administrative-procedures-post`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
};

export default digitizedDocumentService;