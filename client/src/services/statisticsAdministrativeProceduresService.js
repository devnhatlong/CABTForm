import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';
import userService from './userService';

export const axiosJWTStatisticsAdministrativeProcedures = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosJWTStatisticsAdministrativeProcedures.interceptors.request.use(
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
axiosJWTStatisticsAdministrativeProcedures.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosJWTStatisticsAdministrativeProcedures(originalRequest);
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

const statisticsAdministrativeProceduresService = {
    getPreJuly2022Digitized: async (data) => {
        try {
            // Gửi yêu cầu POST với FormData
            const response = await axiosJWTStatisticsAdministrativeProcedures.get(`${process.env.REACT_APP_SERVER_URL}/pre-july-2022-digitized/get-pre-july-2022-digitized`, data);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getPostJuly2022Digitized: async (data) => {
        try {
            // Gửi yêu cầu POST với FormData
            const response = await axiosJWTStatisticsAdministrativeProcedures.get(`${process.env.REACT_APP_SERVER_URL}/post-july-2022-digitized/get-post-july-2022-digitized`, data);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getAdministrativeProceduresTargetStatistics: async () => {
        try {
            // Gửi yêu cầu POST với FormData
            const response = await axiosJWTStatisticsAdministrativeProcedures.get(`${process.env.REACT_APP_SERVER_URL}/administrative-procedures-target/get-administrative-procedures-target-statistics`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
};

export default statisticsAdministrativeProceduresService;