import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from 'react-router-dom';
import { UserOutlined, IdcardOutlined, CarOutlined, FireOutlined, SnippetsOutlined } from '@ant-design/icons';
import { Menu, Layout } from 'antd';
import { useSelector } from 'react-redux';

import '../styles/style.css';
import { NavbarLoginComponent } from "../../../components/NavbarLoginComponent/NavbarLoginComponent";
import { getItem } from "../../../utils/utils";
import { AdminUser } from "../../AdminUser/views/AdminUser";
import { AdminDepartment } from "../../AdminDepartment/views/AdminDepartment";
import { FieldOfWork } from "../../Category/FieldOfWork/views/FieldOfWork";
import { Crime } from "../../Category/Crime/views/Crime";
import { PATHS } from '../../../constants/path';

const { Sider, Content } = Layout;

export const Dashboard = () => {
    const user = useSelector((state) => state.user);
    const [collapsed, setCollapsed] = useState(true);
    const [openKeys, setOpenKeys] = useState([]); // State to manage open keys

    const navigate = useNavigate();

    const menuItemStyle = {
        whiteSpace: 'normal',
        lineHeight: 'normal',
        fontSize: "16px",
        fontWeight: "600",
    };

    const menuChildrenItemStyle = {
        display: "flex",
        alignItems: "center",
        fontSize: "16px",
        fontWeight: "600",
    };
    
    const items = [
        {
            key: 'social_order',
            label: 'Vụ việc về TTXH',
            icon: <IdcardOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Danh sách vụ việc TTXH', 'social-order-list', null, null, menuChildrenItemStyle),
                getItem('Tra cứu đối tượng', 'criminal-lookup', null, null, menuChildrenItemStyle),
                getItem('Thống kê số liệu', 'social-order-stats', null, null, menuChildrenItemStyle),
            ]
        },

        {
            key: 'traffic',
            label: 'Giao thông',
            icon: <CarOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Danh sách TNGT', 'traffic-incidents', null, null, menuChildrenItemStyle),
                getItem('Thống kê vụ TNGT', 'traffic-stats', null, null, menuChildrenItemStyle),
            ]
        },

        {
            key: 'fire-explosions',
            label: 'Phòng cháy chữa cháy',
            icon: <FireOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Danh sách vụ cháy/nổ', 'fire-explosions-list', null, null, menuChildrenItemStyle),
                getItem('Thống kê vụ cháy/nổ', 'fire-explosions-stats', null, null, menuChildrenItemStyle),
            ]
        },

        {
            key: 'category',
            label: 'Quản lý danh mục',
            icon: <SnippetsOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Lĩnh vực vụ việc', 'field-of-work', null, null, menuChildrenItemStyle),
                getItem('Tội danh', 'crime', null, null, menuChildrenItemStyle),
            ]
        },

        user?.role === "admin" && {
            key: 'admin',
            label: <span style={menuItemStyle}>Quản trị</span>,
            icon: <UserOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Tài khoản', 'user', null, null, menuChildrenItemStyle),
                getItem('Đơn vị / Phòng ban', 'department', null, null, menuChildrenItemStyle),
            ]
        },
    ].filter(Boolean);  // Remove null items

    const handleOnClick = ({ key }) => {
        switch (key) {
            case 'user':
                navigate(PATHS.ADMIN.USER);
                break;
            case 'department':
                navigate(PATHS.ADMIN.DEPARTMENT);
                break;
            case 'social-order-list':
                navigate(PATHS.SOCIAL_ORDER.LIST);
                break;
            case 'criminal-lookup':
                navigate(PATHS.SOCIAL_ORDER.LOOKUP);
                break;
            case 'social-order-stats':
                navigate(PATHS.SOCIAL_ORDER.STATS);
                break;
            case 'traffic-incidents':
                navigate(PATHS.TRAFFIC.INCIDENTS);
                break;
            case 'traffic-stats':
                navigate(PATHS.TRAFFIC.STATS);
                break;
            case 'fire-explosions-list':
                navigate(PATHS.FIRE_EXPLOSIONS.LIST);
                break;
            case 'fire-explosions-stats':
                navigate(PATHS.FIRE_EXPLOSIONS.STATS);
                break;
            case 'field-of-work':
                navigate(PATHS.CATEGORY.FIELD_OF_WORK);
                break;
            case 'crime':
                navigate(PATHS.CATEGORY.CRIME);
                break;
            default:
                break;
        }
    };

    const onOpenChange = (keys) => {
        // Only keep the last opened key
        const latestOpenKey = keys.find(key => !openKeys.includes(key));
        setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
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
            <Layout style={{ marginTop: "40px" }}>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={toggleCollapsed}
                    width={300}
                    style={{
                        background: '#fff',
                        boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
                        height: '100vh', // Chiều cao toàn màn hình
                        position: 'fixed', // Đứng yên so với toàn trang
                        left: 0, // Đặt ở bên trái
                        overflowY: 'auto', // Hiển thị thanh cuộn dọc nếu nội dung dài
                    }}
                >
                    <Menu
                        mode="inline"
                        style={{ borderRight: 0 }}
                        items={items}
                        onClick={handleOnClick}
                        openKeys={openKeys} // Controlled open keys
                        onOpenChange={onOpenChange} // Handle open/close
                        defaultSelectedKeys={['1']}
                    />
                </Sider>
                <Content
                    style={{
                        marginLeft: collapsed ? 100 : 310, // Đẩy nội dung sang phải tùy thuộc vào trạng thái của Sider
                        margin: '0px 12px',
                        padding: 18,
                        background: '#fff',
                        minHeight: '280px',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Thêm shadow
                        borderRadius: '8px', // Tùy chọn: Thêm bo góc nếu cần
                    }}
                >
                    <Routes>
                        <Route path={PATHS.CATEGORY.FIELD_OF_WORK} element={<FieldOfWork />} />
                        <Route path={PATHS.CATEGORY.CRIME} element={<Crime />} />
                        <Route path={PATHS.ADMIN.USER} element={<AdminUser />} />
                        <Route path={PATHS.ADMIN.DEPARTMENT} element={<AdminDepartment />} />
                        <Route
                            path="*"
                            element={(
                                <div style={{ padding: '24px', background: '#fff', minHeight: '280px' }}>
                                    <h1>Số Liệu Cơ Bản</h1>
                                    <p>Sản phẩm của Đội Công nghệ thông tin - Phòng Tham mưu - Bình Thuận.</p>
                                    <p>Vui lòng chọn một tùy chọn từ menu để bắt đầu.</p>
                                </div>
                            )}
                        />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
};