import React, { useState } from "react";
import { NavbarLoginComponent } from "../../components/NavbarLoginComponent/NavbarLoginComponent";
import { UserOutlined, GroupOutlined, ProfileOutlined, FormOutlined } from '@ant-design/icons';
import { getItem } from "../../utils/utils";
import { Menu, Button, Layout } from 'antd';
import { AdminUser } from "../../components/AdminUser/AdminUser";
import { useSelector } from 'react-redux';
import { AdminDepartment } from "../../components/AdminDepartment/AdminDepartment";
import FormBuilder from "../../components/FormBuilder/FormBuilder";

const { Sider, Content } = Layout;

export const Dashboard = () => {
    const user = useSelector((state) => state.user);
    const [collapsed, setCollapsed] = useState(true);
    const [keySelected, setKeySelected] = useState('');

    const menuItemStyle = {
        whiteSpace: 'normal',
        lineHeight: 'normal',
    };

    const items = [
        user?.role === "admin" && {
            key: 'admin',
            label: 'Admin',
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
                getItem('Tạo form', 'create-form', <FormOutlined />, null, null, menuItemStyle),
            ]
        },
    ].filter(Boolean);  // Remove null items

    const renderPage = (key) => {
        switch (key) {
            case 'user':
                return <AdminUser />;

            case 'department':
                return <AdminDepartment />;

            case 'create-form':
                return <FormBuilder />;

            default:
                return (
                    <div style={{ padding: '24px', background: '#fff', minHeight: '280px' }}>
                        <h1>Chào mừng đến với Dashboard</h1>
                        <p>Sản phẩm của Đội Công nghệ thông tin - Phòng Tham mưu - Bình Thuận.</p>
                        <p>Vui lòng chọn một tùy chọn từ menu để bắt đầu.</p>
                    </div>
                );
        }
    };

    const handleOnClick = ({ key }) => {
        setKeySelected(key);
    };

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

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
                    {renderPage(keySelected)}
                </Content>
            </Layout>
        </Layout>
    );
};