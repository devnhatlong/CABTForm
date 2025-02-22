import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from "react-router-dom";
import userService from '../../services/userService';
import { setUser } from '../../redux/userSlice';
import * as message from '../../components/Message/Message';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import platform from 'platform';
import './style.css';

export const Login = () => {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    const [values, setValues] = useState({
        userName: '',
        password: '',
        browser: ''
    });

    useEffect(() => {
        const browser = platform.description ? platform.description : 'Unknown Browser';
        setValues((prevValues) => ({ ...prevValues, browser }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await userService.login(values);
            
            if (response.success) {
                await dispatch(setUser(response.message.userData));
                document.cookie = `accessToken=${response.accessToken}; path=/`;
                document.cookie = `refreshToken=${response.newRefreshToken}; path=/`;
            } else {
                message.error("Sai tài khoản hoặc mật khẩu");
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        if (user._id) {
            message.success("Đăng nhập thành công");
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    return (
        <div className="login-container">
            <div className="login-box">
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Tên đăng nhập:</label>
                        <div className="input-wrapper">
                            <UserOutlined className="input-icon" />
                            <input type="text" className="login-input" id="username" name="username" placeholder="Nhập tên đăng nhập" autoComplete="username" 
                                onChange={(e) => setValues({...values, userName: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Mật khẩu:</label>
                        <div className="input-wrapper">
                            <LockOutlined className="input-icon" />
                            <input type="password" className="login-input" id="password" name="password" placeholder="Nhập mật khẩu" autoComplete="new-password" 
                                onChange={(e) => setValues({...values, password: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="login-options">
                        <button className="login-button" type="submit">Đăng nhập</button>
                    </div>
                </form>
            </div>
        </div>
    )
}