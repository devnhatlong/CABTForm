import React, { useState } from "react";
import { NavbarLoginComponent } from "../../components/NavbarLoginComponent/NavbarLoginComponent";
import { FooterComponent } from "../../components/FooterComponent/FooterComponent";
import { UserOutlined, FormOutlined, AreaChartOutlined, GroupOutlined, 
        FileTextOutlined, OrderedListOutlined, UploadOutlined, WarningOutlined } from '@ant-design/icons';
import { getItem } from "../../utils/utils";
import { DigitizedDocument } from "../../components/DigitizedDocument/DigitizedDocument";
import { Menu } from 'antd';
import { AdminUser } from "../../components/AdminUser/AdminUser";
import { useSelector } from 'react-redux';
import { StatisticsDigitizedDocument } from "../../components/StatisticsDigitizedDocument/StatisticsDigitizedDocument";
import { DigitizedDocumentByMonth } from "../../components/DigitizedDocumentByMonth/DigitizedDocumentByMonth";
import { DigitizedDocumentTarget } from "../../components/DigitizedDocumentTarget/DigitizedDocumentTarget";
import { AdminDepartment } from "../../components/AdminDepartment/AdminDepartment";
import { AdministrativeProceduresForm1 } from "../../components/AdministrativeProceduresForm1/AdministrativeProceduresForm1";
import { PreJuly2022Digitized } from "../../components/PreJuly2022Digitized/PreJuly2022Digitized";
import { AdministrativeProceduresForm2 } from "../../components/AdministrativeProceduresForm2/AdministrativeProceduresForm2";
import { PostJuly2022Digitized } from "../../components/PostJuly2022Digitized/PostJuly2022Digitized";
import { StatisticsAdministrativeProcedures } from "../../components/StatisticsAdministrativeProcedures/StatisticsAdministrativeProcedures";
import { UpdateDigitizedDocument } from "../../components/UpdateDigitizedDocument/UpdateDigitizedDocument";
import { AdministrativeProceduresTarget } from "../../components/AdministrativeProceduresTarget/AdministrativeProceduresTarget";
import { StatisticsByAdmin } from "../../components/StatisticsByAdmin/StatisticsByAdmin";
import { DigitizedDocumentFix } from "../../components/DigitizedDocumentFix/DigitizedDocumentFix";
import { UpdateDigitizedDocumentFix } from "../../components/UpdateDigitizedDocumentFix/UpdateDigitizedDocumentFix";
import { StatisticsByUser } from "../../components/StatisticsByUser/StatisticsByUser";
import { UploadFile } from "../../components/UploadFile/UploadFile";
import { UploadFileSoftware } from "../../components/UploadFileSoftware/UploadFileSoftware";
import { WarningByAdmin } from "../../components/WarningByAdmin/WarningByAdmin";

export const Dashboard = () => {
    const user = useSelector((state) => state.user);

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
                getItem('Thống kê', 'statistics_by_admin', <AreaChartOutlined />, null, null, menuItemStyle),
                getItem('Danh sách chưa nhập số liệu', 'warning_by_admin', <WarningOutlined />, null, null, menuItemStyle)
            ]
        },

        {
            key: 'tai_lieu_hinh_thanh_pho_bien',
            label: 'Tài liệu hình thành phổ biến',
            icon: <FileTextOutlined />,
            style: menuItemStyle,
            children: [
                user?.role === "admin" && getItem('Nhập chỉ tiêu', 'digitized_document_target', <FormOutlined />, null, null, menuItemStyle),
                // getItem('Cập nhật theo tháng từ 01/01/2024 đến nay', 'digitized_document_by_month', <FormOutlined />, null, null, menuItemStyle),
                getItem('Cập nhật theo tháng từ 01/01/2025 đến nay', 'digitized_document_by_month', <FormOutlined />, null, null, menuItemStyle),
                // getItem('Nhập theo năm từ 2018 - 2023', 'digitized_document_by_year', <FormOutlined />, null, null, menuItemStyle), -- năm 2025 enable lại code
                // getItem('Cập nhật số liệu số hóa theo tháng từ 2018 - 2023', 'update_digitized_document_by_year', <FormOutlined />, null, null, menuItemStyle), -- năm 2025 enable lại code
                getItem('Tổng số liệu từ năm 2018 - 2023', 'digitized_document_fix', <FormOutlined />, null, null, menuItemStyle),
                getItem('Cập nhật số liệu số hóa theo tháng từ năm 2018 - 2023', 'update_digitized_document_fix', <FormOutlined />, null, null, menuItemStyle),
                user?.role !== "admin" && getItem('Thống kê', 'statistics', <AreaChartOutlined />, null, null, menuItemStyle)
            ]
        },

        (user?.userName === "admin" ||
            user?.userName === "pa08" || user?.userName === "pc06" ||
            user?.userName === "pc07" || user?.userName === "pc08" ||
            user?.userName === "phanthiet" || user?.userName === "tuyphong" ||
            user?.userName === "bacbinh" || user?.userName === "hamthuanbac" ||
            user?.userName === "hamthuannam" || user?.userName === "hamtan" ||
            user?.userName === "lagi" || user?.userName === "tanhlinh" ||
            user?.userName === "duclinh" || user?.userName === "phuquy") && {
            key: 'thu_tuc_hanh_chinh',
            label: 'Thủ tục hành chính',
            icon: <FileTextOutlined />,
            style: menuItemStyle,
            children: [
                user?.role === "admin" && getItem('Nhập chỉ tiêu', 'administrative_procedures_target', <FormOutlined />, null, null, menuItemStyle),
                getItem('1/7/2022 trở về trước', 'administrative_procedures_form_1', <FormOutlined />, null, null, menuItemStyle),
                getItem('1/7/2022 trở về trước (Đã số hóa)', 'pre_july_2022_digitized', <FormOutlined />, null, null, menuItemStyle),
                getItem('1/7/2022 đến nay', 'administrative_procedures_form_2', <FormOutlined />, null, null, menuItemStyle),
                // getItem('1/7/2022 đến nay (Đã số hóa)', 'post_july_2022_digitized', <FormOutlined />, null, null, menuItemStyle),
                user?.role !== "admin" && getItem('Thống kê', 'statistics_administrative_procedures', <AreaChartOutlined />, null, null, menuItemStyle)
            ]
        },

        user?.role !== "admin" && getItem('In báo cáo', 'statistics_by_user', <OrderedListOutlined />),

        getItem('Gửi báo cáo', 'upload_file', <UploadOutlined />, null, null, menuItemStyle),

        // user?.role === "admin" && getItem('Tải file software', 'upload_file_software', <UploadOutlined />, null, null, menuItemStyle)
        
    ].filter(Boolean);  // Remove null items

    const [keySelected, setKeySelected] = useState('');

    const renderPage = (key) => {
        switch (key) {
            case 'user':
                return <AdminUser />;

            case 'department':
                return <AdminDepartment />;

            case 'statistics_by_admin':
                return <StatisticsByAdmin />;

            case 'warning_by_admin':
                return <WarningByAdmin />;

            case 'digitized_document_target':
                return <DigitizedDocumentTarget />;

            case 'digitized_document_by_month':
                return <DigitizedDocumentByMonth />;

            case 'digitized_document_by_year':
                return <DigitizedDocument />;

            case 'digitized_document_fix':
                return <DigitizedDocumentFix />;

            case 'update_digitized_document_fix':
                return <UpdateDigitizedDocumentFix />;

            case 'update_digitized_document_by_year':
                return <UpdateDigitizedDocument />;

            case 'statistics':
                return <StatisticsDigitizedDocument />;

            case 'administrative_procedures_target':
                return <AdministrativeProceduresTarget />;

            case 'administrative_procedures_form_1':
                return <AdministrativeProceduresForm1 />;

            case 'pre_july_2022_digitized':
                return <PreJuly2022Digitized />;

            case 'administrative_procedures_form_2':
                return <AdministrativeProceduresForm2 />;

            case 'post_july_2022_digitized':
                return <PostJuly2022Digitized />;

            case 'statistics_administrative_procedures':
                return <StatisticsAdministrativeProcedures />;

            case 'statistics_by_user':
                return <StatisticsByUser />;

            case 'upload_file':
                return <UploadFile />;

            case 'upload_file_software':
                return <UploadFileSoftware />;

            default:
                return <></>;
        }
    };

    const handleOnClick = ({ key }) => {
        setKeySelected(key);
    };

    return (
        <>
            <div style={{ display: "flex", position: "absolute", zIndex: "1", top: "75px", width: "100%" }}>
                <Menu
                    mode="inline"
                    style={{ width: '304px', boxShadow: '1px 1px 2px #ccc', height: "90vh", position: "fixed", overflowY: "scroll" }}
                    items={items}
                    onClick={handleOnClick}
                />
                <div style={{ padding: '15px', flex: '1', marginLeft: "304px", overflowY: "scroll" }}>
                    {renderPage(keySelected)}
                </div>
            </div>

            <NavbarLoginComponent />
            {/* <FooterComponent /> */}
        </>
    );
};
