import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from 'react-router-dom';
import { UserOutlined, GroupOutlined, ProfileOutlined, FormOutlined, IdcardOutlined, CarOutlined, FireOutlined, SnippetsOutlined } from '@ant-design/icons';
import { Menu, Layout } from 'antd';
import { useSelector } from 'react-redux';

import { NavbarLoginComponent } from "../../../components/NavbarLoginComponent/NavbarLoginComponent";
import { getItem } from "../../../utils/utils";
import { AdminUser } from "../../AdminUser/views/AdminUser";
import { AdminDepartment } from "../../AdminDepartment/views/AdminDepartment";
import { FieldOfWork } from "../../FieldOfWork/views/FieldOfWork";
import '../styles/style.css';

const { Sider, Content } = Layout;

export const Dashboard = () => {
    const user = useSelector((state) => state.user);
    const [collapsed, setCollapsed] = useState(true);
    const [openKeys, setOpenKeys] = useState([]); // State to manage open keys

    const navigate = useNavigate();

    const menuItemStyle = {
        whiteSpace: 'normal',
        lineHeight: 'normal',
        fontSize: "15px",
        fontWeight: "600",
    };

    const menuChildrenItemStyle = {
        display: "flex",
        alignItems: "center",
        fontSize: "15px",
        fontWeight: "600",
    };
    
    const items = [
        {
            key: 'social_order',
            label: 'Vụ việc về TTXH',
            icon: <IdcardOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Danh sách vụ việc TTXH', 'social_order_list', null, null, menuChildrenItemStyle),
                getItem('Tra cứu đối tượng', 'criminal_information_lookup', null, null, menuChildrenItemStyle),
                getItem('Thống kê số liệu', 'statistics_social_order_incident', null, null, menuChildrenItemStyle),
            ]
        },

        {
            key: 'traffic',
            label: 'Giao thông',
            icon: <CarOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Danh sách TNGT', 'traffic_incident_list', null, null, menuChildrenItemStyle),
                getItem('Thống kê vụ TNGT', 'statistics_traffic_incident', null, null, menuChildrenItemStyle),
            ]
        },

        {
            key: 'fire_protection_and_prevention',
            label: 'Phòng cháy chữa cháy',
            icon: <FireOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Danh sách vụ cháy/nổ', 'fires_and_explosions_list', null, null, menuChildrenItemStyle),
                getItem('Thống kê vụ cháy/nổ', 'statistics_fires_and_explosions', null, null, menuChildrenItemStyle),
            ]
        },

        {
            key: 'manage_category',
            label: 'Quản lý danh mục',
            icon: <SnippetsOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Lĩnh vực vụ việc', 'field_of_work', null, null, menuChildrenItemStyle),
                getItem('Tội danh', 'crime', null, null, menuChildrenItemStyle),
            ]
        },

        user?.role === "admin" && {
            key: 'admin',
            label: <span style={menuItemStyle}>Quản trị</span>,
            icon: <UserOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Người dùng', 'user', null, null, menuChildrenItemStyle),
                getItem('Đơn vị / Phòng ban', 'department', null, null, menuChildrenItemStyle),
            ]
        },
    ].filter(Boolean);  // Remove null items

    const handleOnClick = ({ key }) => {
        if (key === 'user') navigate('/admin/user');
        else if (key === 'department') navigate('/admin/department');

        // social_order
        else if (key === 'social_order_list') navigate('/social_order/social_order_list');
        else if (key === 'criminal_information_lookup') navigate('/social_order/criminal_information_lookup');
        else if (key === 'statistics_social_order_incident') navigate('/social_order/statistics_social_order_incident');

        // traffic
        else if (key === 'traffic_incident_list') navigate('/traffic/traffic_incident_list');
        else if (key === 'statistics_traffic_incident') navigate('/traffic/statistics_traffic_incident');

        // fire_protection_and_prevention
        else if (key === 'fires_and_explosions_list') navigate('/fire_protection_and_prevention/fires_and_explosions_list');
        else if (key === 'statistics_fires_and_explosions') navigate('/fire_protection_and_prevention/statistics_fires_and_explosions');

        // manage_category
        else if (key === 'field_of_work') navigate('/manage_category/field_of_work');
        else if (key === 'crime') navigate('/manage_category/crime');
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
            <Layout style={{ marginTop: "2%" }}>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={toggleCollapsed}
                    width={250}
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
                        marginLeft: collapsed ? 100 : 260, // Đẩy nội dung sang phải tùy thuộc vào trạng thái của Sider
                        margin: '0px 12px',
                        padding: 18,
                        background: '#fff',
                        minHeight: '280px',
                    }}
                >
                    <Routes>
                        <Route path="/manage_category/field_of_work" element={<FieldOfWork />} />
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