import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';
import userService from './userService';

export const axiosJWTDigitizedDocument = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosJWTDigitizedDocument.interceptors.request.use(
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
axiosJWTDigitizedDocument.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosJWTDigitizedDocument(originalRequest);
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
    importDigitizedDocumentByYear: async (data) => {
        try {
            // Gửi yêu cầu POST với FormData
            const response = await axiosJWTDigitizedDocument.post(`${process.env.REACT_APP_SERVER_URL}/digitized-document/import-digitized-document-by-year`, data);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getAllDigitizedDocument: async (currentPage, pageSize, filters = {}) => {
        try {
            const response = await axiosJWTDigitizedDocument.get(`${process.env.REACT_APP_SERVER_URL}/digitized-document/get-all-digitized-document`, {
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
            const response = await axiosJWTDigitizedDocument.get(`${process.env.REACT_APP_SERVER_URL}/digitized-document/get-all-digitized-document-by-admin`, {
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
            const response = await axiosJWTDigitizedDocument.get(`${process.env.REACT_APP_SERVER_URL}/digitized-document/get-all-year`);

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getDocumentStatisticsUntilLastYear: async (year) => {
        try {
            const response = await axiosJWTDigitizedDocument.get(`${process.env.REACT_APP_SERVER_URL}/digitized-document/get-document-statistics/${year}`);

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getDocumentStatisticsUntilCurrentYear: async (year) => {
        try {
            const response = await axiosJWTDigitizedDocument.get(`${process.env.REACT_APP_SERVER_URL}/digitized-document/get-document-statistics-until-current-year/${year}`);

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getDocumentStatisticsThisYear: async (year) => {
        try {
            const response = await axiosJWTDigitizedDocument.get(`${process.env.REACT_APP_SERVER_URL}/digitized-document/get-document-statistics-this-year/${year}`);

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getDocumentTargetStatisticsThisYear: async () => {
        try {
            const response = await axiosJWTDigitizedDocument.get(`${process.env.REACT_APP_SERVER_URL}/digitized-document/get-document-target-statistics-this-year/`);

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getDetailDigitizedDocument: async (id) => {
        try {
            const response = await axiosJWTDigitizedDocument.get(`${process.env.REACT_APP_SERVER_URL}/digitized-document/get-detail-digitized-document/${id}`);

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    updateDigitizedDocument: async (id, data) => {
        try {
            const response = await axiosJWTDigitizedDocument.put(`${process.env.REACT_APP_SERVER_URL}/digitized-document/update-digitized-document/${id}`, data);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    deleteDigitizedDocument: async (id) => {
        try {
            const response = await axiosJWTDigitizedDocument.delete(`${process.env.REACT_APP_SERVER_URL}/digitized-document/delete-digitized-document/${id}`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    deleteMultipleDigitizedDocument: async (ids) => {
        try {
            const response = await axiosJWTDigitizedDocument.delete(`${process.env.REACT_APP_SERVER_URL}/digitized-document/delete-multiple-digitized-document`, { data: { ids } });
            return response.data;
        } catch (error) {
            console.log(error);
        }
    },
};

export default digitizedDocumentService;