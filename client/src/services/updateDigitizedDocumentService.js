import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';
import userService from './userService';

export const axiosJWTUpdateDigitizedDocument = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosJWTUpdateDigitizedDocument.interceptors.request.use(
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
axiosJWTUpdateDigitizedDocument.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosJWTUpdateDigitizedDocument(originalRequest);
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

const updateDigitizedDocumentService = {
    importDigitizedDocumentByYear: async (data) => {
        try {
            // Gửi yêu cầu POST với FormData
            const response = await axiosJWTUpdateDigitizedDocument.post(`${process.env.REACT_APP_SERVER_URL}/update-digitized-document/import-digitized-document-by-year`, data);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getAllDigitizedDocument: async (currentPage, pageSize, filters = {}) => {
        try {
            const response = await axiosJWTUpdateDigitizedDocument.get(`${process.env.REACT_APP_SERVER_URL}/digitized-document/get-all-digitized-document`, {
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
    getAllDigitizedDocumentByAdmin: async (currentPage, pageSize, filters = {}) => {
        try {
            const response = await axiosJWTUpdateDigitizedDocument.get(`${process.env.REACT_APP_SERVER_URL}/digitized-document/get-all-digitized-document-by-admin`, {
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
    getAllYear: async () => {
        try {
            const response = await axiosJWTUpdateDigitizedDocument.get(`${process.env.REACT_APP_SERVER_URL}/digitized-document/get-all-year`);

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getDocumentStatisticsUntilLastYear: async (year) => {
        try {
            const response = await axiosJWTUpdateDigitizedDocument.get(`${process.env.REACT_APP_SERVER_URL}/digitized-document/get-document-statistics/${year}`);

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getDocumentStatisticsThisYear: async (year) => {
        try {
            const response = await axiosJWTUpdateDigitizedDocument.get(`${process.env.REACT_APP_SERVER_URL}/digitized-document/get-document-statistics-this-year/${year}`);

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getDocumentTargetStatisticsThisYear: async (data) => {
        try {
            const response = await axiosJWTUpdateDigitizedDocument.post(`${process.env.REACT_APP_SERVER_URL}/digitized-document/get-document-target-statistics-this-year/`, data);

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
};

export default updateDigitizedDocumentService;