import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from 'react-router-dom';
import { UserOutlined, GroupOutlined, ProfileOutlined, FormOutlined } from '@ant-design/icons';
import { Menu, Layout } from 'antd';
import { useSelector } from 'react-redux';

import { NavbarLoginComponent } from "../../../components/NavbarLoginComponent/NavbarLoginComponent";
import { getItem } from "../../../utils/utils";
import { AdminUser } from "../../AdminUser/views/AdminUser";
import { AdminDepartment } from "../../AdminDepartment/views/AdminDepartment";

const { Sider, Content } = Layout;

export const Dashboard = () => {
    const user = useSelector((state) => state.user);
    const [collapsed, setCollapsed] = useState(true);

    const navigate = useNavigate();

    const menuItemStyle = {
        whiteSpace: 'normal',
        lineHeight: 'normal',
        fontSize: "14px",
        fontWeight: "700"
    };
    
    const items = [
        user?.role === "admin" && {
            key: 'admin',
            label: <span style={menuItemStyle}>Quản trị</span>,
            icon: <UserOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Người dùng', 'user', <UserOutlined />, null, null, menuItemStyle),
                getItem('Đơn vị / Phòng ban', 'department', <GroupOutlined />, null, null, menuItemStyle),
            ]
        },

        user?.role === "admin" && {
            key: 'form',
            label: 'Form',
            icon: <ProfileOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Danh sách form', 'forms', <FormOutlined />, null, null, menuItemStyle),
            ]
        },
    ].filter(Boolean);  // Remove null items

    const handleOnClick = ({ key }) => {
        if (key === 'user') navigate('/admin/user');
        else if (key === 'department') navigate('/admin/department');
        else if (key === 'forms') navigate('/forms');
    };

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setCollapsed(true);
            } else {
                setCollapsed(false);
            }
        };

        window.addEventListener('resize', handleResize);

        // Set initial state
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <NavbarLoginComponent />
            <Layout style={{ marginTop: "2%" }}>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={toggleCollapsed}
                    width={250}
                    style={{ background: '#fff', boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)' }}
                >
                    <Menu
                        mode="inline"
                        style={{ borderRight: 0 }}
                        items={items}
                        onClick={handleOnClick}
                        defaultSelectedKeys={['1']}
                        defaultOpenKeys={collapsed ? [] : ['admin']}
                    />
                </Sider>
                <Content style={{ margin: '0px 12px', padding: 18, background: '#fff', minHeight: '280px' }}>
                    <Routes>
                        <Route path="/admin/user" element={<AdminUser />} />
                        <Route path="/admin/department" element={<AdminDepartment />} />
                        <Route path="*" element={(
                            <div style={{ padding: '24px', background: '#fff', minHeight: '280px' }}>
                                <h1>Số Liệu Cơ Bản</h1>
                                <p>Sản phẩm của Đội Công nghệ thông tin - Phòng Tham mưu - Bình Thuận.</p>
                                <p>Vui lòng chọn một tùy chọn từ menu để bắt đầu.</p>
                            </div>
                        )} />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
};