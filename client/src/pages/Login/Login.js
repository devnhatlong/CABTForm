import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../assets/images/bg.png";
import userService from '../../services/userService';
import { setUser } from '../../redux/userSlice';
import Loading from '../../components/LoadingComponent/Loading';
import * as message from '../../components/Message/Message';
import './style.css';
import { UserOutlined, LockOutlined, RightOutlined } from '@ant-design/icons';
import platform from 'platform';

export const Login = () => {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate(); 

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
            navigate('/');
        }
    }, [user, navigate]);

    return (
        <div className="outer-container" style={{backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh', width: "100%"}}>
            <div className="container">
                <div className="screen">
                    <div className="screen__content">
                        <form className="login" onSubmit={handleSubmit}>
                            <div className="login__field">
                                <UserOutlined />
                                <input type="text" className="login__input" id="username" name="username" placeholder="Tên đăng nhập" autoComplete="username" 
                                    onChange={(e) => setValues({...values, userName: e.target.value})}
                                />
                            </div>
                            <div className="login__field">
                                <LockOutlined />
                                <input type="password" className="login__input" id="password" name="password" placeholder="Mật khẩu" autoComplete="new-password" 
                                    onChange={(e) => setValues({...values, password: e.target.value})}
                                />
                            </div>
                            <button className="button login__submit" style={{ display: "flex", justifyContent: "space-between" }} >
                                <span className="button__text">Đăng nhập</span>
                                <RightOutlined />
                            </button>
                        </form>
                    </div>
                    <div className="screen__background">
                    <span className="screen__background__shape screen__background__shape4" />
                    <span className="screen__background__shape screen__background__shape3" />
                    <span className="screen__background__shape screen__background__shape2" />
                    <span className="screen__background__shape screen__background__shape1" />
                    </div>
                </div>
            </div>  
        </div>
    )
}