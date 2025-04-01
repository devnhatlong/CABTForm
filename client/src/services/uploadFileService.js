import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';
import userService from './userService';

export const axiosUploadFile = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosUploadFile.interceptors.request.use(
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
axiosUploadFile.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken_SLCB");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken_SLCB=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosUploadFile(originalRequest);
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
    document.cookie = "accessToken_SLCB=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken_SLCB=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Redirect to login page
    window.location.href = "/login";
};

const uploadFileService = {
    create: async (data) => {
        try {
            const formData = new FormData();
    
            // Thêm các trường dữ liệu khác vào FormData
            Object.keys(data).forEach(key => {
                if (key !== 'uploadedFiles') {
                    formData.append(key, data[key]);
                }
            });
    
            // Thêm các file vào FormData
            data.uploadedFiles.forEach(file => {
                formData.append('uploadedFiles', file);
            });
            
            // Gửi yêu cầu POST với FormData
            const response = await axiosUploadFile.post(`${process.env.REACT_APP_SERVER_URL}/upload-file/create`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    createSoftware: async (data) => {
        try {
            const formData = new FormData();
    
            // Thêm các trường dữ liệu khác vào FormData
            Object.keys(data).forEach(key => {
                if (key !== 'uploadedFiles') {
                    formData.append(key, data[key]);
                }
            });
    
            // Thêm các file vào FormData
            data.uploadedFiles.forEach(file => {
                formData.append('uploadedFiles', file);
            });
            
            // Gửi yêu cầu POST với FormData
            const response = await axiosUploadFile.post(`${process.env.REACT_APP_SERVER_URL}/upload-file/create-software`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getFile: async (id) => {
        try {
            const response = await axiosUploadFile.get(`${process.env.REACT_APP_SERVER_URL}/upload-file/get-file/${id}`, {
                responseType: 'arraybuffer'
            });
            return response.data;
        } catch (error) {
            console.log(error);
        }
    },
    getFileSoftware: async (id) => {
        try {
            const response = await axiosUploadFile.get(`${process.env.REACT_APP_SERVER_URL}/upload-file/get-file-software/${id}`, {
                responseType: 'arraybuffer'
            });
            return response.data;
        } catch (error) {
            console.log(error);
        }
    },
    getAll: async (currentPage, pageSize, filters = {}) => {
        try {
            const response = await axiosUploadFile.get(`${process.env.REACT_APP_SERVER_URL}/upload-file/get-all`, {
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
            const response = await axiosUploadFile.get(`${process.env.REACT_APP_SERVER_URL}/upload-file/get-all-by-admin`, {
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
    getAllFileSoftwareByAdmin: async (currentPage, pageSize, filters = {}) => {
        try {
            const response = await axiosUploadFile.get(`${process.env.REACT_APP_SERVER_URL}/upload-file/get-all-file-software-by-admin`, {
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
            const response = await axiosUploadFile.get(`${process.env.REACT_APP_SERVER_URL}/upload-file/get-detail/${id}`);
            return response.data;
        } catch (error) {
            console.log(error);
        }
    },
    getDetailByAdmin: async (id) => {
        try {
            const response = await axiosUploadFile.get(`${process.env.REACT_APP_SERVER_URL}/upload-file/get-detail-by-admin/${id}`);
            return response.data;
        } catch (error) {
            console.log(error);
        }
    },
    getDetailFileSoftwareByAdmin: async (id) => {
        try {
            const response = await axiosUploadFile.get(`${process.env.REACT_APP_SERVER_URL}/upload-file/get-detail-file-software-by-admin/${id}`);
            return response.data;
        } catch (error) {
            console.log(error);
        }
    },
    update: async (id, data) => {
        try {
            const formData = new FormData();
            // Thêm các trường dữ liệu khác vào FormData
            Object.keys(data).forEach(key => {
                if (key !== 'files') {
                    formData.append(key, data[key]);
                }
            });

            // Thêm các file vào FormData
            data.files.forEach(file => {
                formData.append('files', file);
            });

            const response = await axiosUploadFile.put(`${process.env.REACT_APP_SERVER_URL}/upload-file/update/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.log(error);
        }
    },
    delete: async (id) => {
        try {
            const response = await axiosUploadFile.delete(`${process.env.REACT_APP_SERVER_URL}/upload-file/delete/${id}`);
            return response.data;
        } catch (error) {
            console.log(error);
        }
    },
    deleteMultiple: async (ids) => {
        try {
            const response = await axiosUploadFile.delete(`${process.env.REACT_APP_SERVER_URL}/upload-file/delete-multiple`, { data: { ids } });
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }
};

export default uploadFileService;
