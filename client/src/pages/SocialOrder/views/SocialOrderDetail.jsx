import React, { useEffect, useState } from "react";
import moment from 'moment';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import socialOrderService from "../../../services/socialOrderService";
import socialOrderAnnexService from "../../../services/socialOrderAnnexService";
import BreadcrumbComponent from '../../../components/BreadcrumbComponent/BreadcrumbComponent';
import { WrapperHeader } from '../styles/style';
import { Spin, Table, Button, Checkbox } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import criminalService from "../../../services/criminalService";

export const SocialOrderDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [record, setRecord] = useState(location.state?.record || null);
    const [annexData, setAnnexData] = useState({});
    const [criminalData, setCriminalData] = useState([]);

    const breadcrumbItems = [
        { label: 'Trang chủ', path: '/dashboard' },
        { label: 'Danh sách vụ việc về TTXH' },
        { label: 'Chi tiết vụ việc' },
    ];
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [socialOrderResponse, socialOrderAnnexResponse, criminalResponse] = await Promise.all([
                    socialOrderService.getSocialOrderById(id),
                    socialOrderAnnexService.getAnnexBySocialOrderId(id),
                    criminalService.getCriminalBySocialOrderId(id)
                ]);

                if (socialOrderResponse?.data) {
                    setRecord(socialOrderResponse.data);
                }

                if (socialOrderAnnexResponse?.data) {
                    setAnnexData(socialOrderAnnexResponse.data);
                }

                if (criminalResponse?.data) {
                    setCriminalData(criminalResponse.data.flat());
                }
            } catch (error) {
                console.error("Lỗi khi tải chi tiết vụ việc:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading || !record) return <Spin tip="Đang tải dữ liệu..." />;

    const headerStyle = {
        backgroundColor: '#27567e',
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    };

    const renderCheckbox = (value) => <Checkbox checked={value} disabled />;

    const viewColumns = [
        {
            title: "Họ tên",
            dataIndex: "fullName",
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Ngày sinh",
            dataIndex: "birthDate",
            render: (date) => date ? moment(date).format("DD/MM/YYYY") : "",
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Tội danh",
            dataIndex: ["crime", "crimeName"],
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Tỉnh",
            dataIndex: ["province", "provinceName"],
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Huyện",
            dataIndex: ["district", "districtName"],
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Xã",
            dataIndex: ["commune", "communeName"],
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Nghề nghiệp",
            dataIndex: "job",
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Nữ giới",
            dataIndex: "isFemale",
            render: (value) => <Checkbox checked={value} disabled />,
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Nghiện ma túy",
            dataIndex: "isDrugAddict",
            render: (value) => <Checkbox checked={value} disabled />,
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Tiền án tiền sự",
            dataIndex: "criminalRecord",
            render: (value) => <Checkbox checked={value} disabled />,
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Khởi tố",
            dataIndex: "prosecution",
            render: (value) => <Checkbox checked={value} disabled />,
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "XLHC",
            dataIndex: "administrativeHandling",
            render: (value) => <Checkbox checked={value} disabled />,
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Tiền phạt",
            dataIndex: "fine",
            render: (value) => value ? `${value.toLocaleString('vi-VN')} VNĐ` : "",
            onHeaderCell: () => ({ style: headerStyle }),
        }
    ];

    const detailColumns = [
        {
            dataIndex: "fieldName",
            key: "fieldName",
            render: (text) => <strong style={{ color: "#012970" }}>{text}</strong>,
        },
        {
            dataIndex: "value",
            key: "value",
        },
    ];

    const detailTableData = [
        { key: "1", fieldName: "Đơn vị thụ lý", value: record.user.departmentId.departmentName },
        {
            key: "2",
            fieldName: "Địa bàn xảy ra",
            value: `${record.commune.communeName || "N/A"} - ${record.district.districtName || "N/A"}`
        },
        { key: "3", fieldName: "Ngày báo cáo", value: moment(record.createdAt).format("DD/MM/YYYY") },
        { key: "4", fieldName: "Ngày xảy ra", value: moment(record.incidentDate).format("DD/MM/YYYY") },
        { key: "5", fieldName: "Tội danh", value: record.crime.crimeName },
        { key: "6", fieldName: "Lĩnh vực vụ việc", value: record.fieldOfWork.fieldName },
        { key: "7", fieldName: "Nội dung vụ việc", value: record.reportContent },
        { key: "8", fieldName: "Kết quả điều tra", value: record.investigationResult },
        { key: "9", fieldName: "Kết quả xử lý", value: record.handlingResult },
        { key: "10", fieldName: "Mức độ vụ việc", value: record.severityLevel },
        { key: "11", fieldName: "Cấp xã thụ lý ban đầu", value: renderCheckbox(record.isHandledByCommune) },
        { key: "12", fieldName: "Án mở rộng", value: renderCheckbox(record.isExtendedCase) },
        { key: "13", fieldName: "Băng ổ nhóm", value: renderCheckbox(record.isGangRelated) },
        { key: "14", fieldName: "QĐ phân công (Hồ sơ AD)", value: renderCheckbox(record.hasAssignmentDecision) },
    ];

    const annexColumns = [
        {
            dataIndex: "fieldName",
            key: "fieldName",
            render: (text) => <strong style={{ color: "#012970" }}>{text}</strong>,
        },
        {
            dataIndex: "value",
            key: "value",
        },
    ];

    const annexTableData = [
        { key: "1", fieldName: "Số người chết", value: annexData?.commonAnnex?.numberOfDeaths || "N/A" },
        { key: "2", fieldName: "Số người bị thương", value: annexData?.commonAnnex?.numberOfInjuries || "N/A" },
        { key: "3", fieldName: "Số trẻ em bị xâm hại", value: annexData?.commonAnnex?.numberOfChildrenAbused || "N/A" },
        { key: "4", fieldName: "Tài sản thiệt hại (triệu đồng)", value: `${annexData?.commonAnnex?.propertyDamage || "N/A"} (VNĐ)` },
        { key: "5", fieldName: "Tài sản thu hồi (triệu đồng)", value: `${annexData?.commonAnnex?.propertyRecovered || "N/A"} (VNĐ)` },
        { key: "6", fieldName: "Số lượng súng thu hồi", value: `${annexData?.commonAnnex?.gunsRecovered || "N/A"} (chiếc)` },
        { key: "7", fieldName: "Số thuốc nổ thu hồi (kg)", value: `${annexData?.commonAnnex?.explosivesRecovered || "N/A"} (kg)` },

        { key: "8", fieldName: "Heroin (g)", value: `${annexData?.drugAnnex?.heroin || "N/A"} (g)` },
        { key: "9", fieldName: "Thuốc phiện (g)", value: `${annexData?.drugAnnex?.opium || "N/A"} (g)` },
        { key: "10", fieldName: "Cần sa (g)", value: `${annexData?.drugAnnex?.cannabis || "N/A"} (g)` },
        { key: "11", fieldName: "Cây có chứa chất ma túy (g)", value: `${annexData?.drugAnnex?.drugPlants || "N/A"} (g)` },
        { key: "12", fieldName: "Ma túy tổng hợp (g)", value: `${annexData?.drugAnnex?.syntheticDrugs || "N/A"} (g)` },
        { key: "13", fieldName: "Ma túy tổng hợp (viên)", value: `${annexData?.drugAnnex?.syntheticDrugPills || "N/A"} (viên)` },
        { key: "14", fieldName: "Loại ma túy khác (g)", value: `${annexData?.drugAnnex?.otherDrugsWeight || "N/A"} (g)` },
        { key: "15", fieldName: "Loại ma túy khác (ml)", value: `${annexData?.drugAnnex?.otherDrugsVolume || "N/A"} (ml)` },
    ];

    return (
        <div>
            <WrapperHeader>Chi tiết vụ việc</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />
            <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1 }}>
                    <WrapperHeader style={{ textAlign: "center" }}>Tổng quan</WrapperHeader>
                    <Table
                        columns={detailColumns}
                        dataSource={detailTableData}
                        pagination={false}
                        bordered
                        rowKey="key"
                        showHeader={false}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <WrapperHeader style={{ textAlign: "center" }}>Phụ lục</WrapperHeader>
                    <Table
                        columns={annexColumns}
                        dataSource={annexTableData}
                        pagination={false}
                        bordered
                        rowKey="key"
                        showHeader={false}
                    />
                </div>
            </div>

            <div style={{ marginTop: 40 }}>
                <WrapperHeader style={{ textAlign: "center" }}>Danh sách tội phạm</WrapperHeader>
                <Table
                    columns={viewColumns}
                    dataSource={criminalData}
                    pagination={false}
                    rowKey="_id"
                    bordered
                    scroll={{ x: "max-content" }}
                />
            </div>

            <div
                style={{
                    marginTop: 20,
                    marginBottom: 20,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Button
                    type="primary"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/social-order/list")}
                >
                    Quay lại danh sách
                </Button>

                <div style={{ display: "flex", gap: 10 }}>
                    <Button
                        type="primary"
                        style={{ backgroundColor: "#faad14", borderColor: "#faad14" }}
                        onClick={() => navigate(`/social-order/edit/${id}`)}
                    >
                        Sửa vụ việc
                    </Button>

                    <Button
                        type="primary"
                        style={{ backgroundColor: "#722ed1", borderColor: "#722ed1" }}
                        onClick={() => navigate(`/social-order/history/${id}`)}
                    >
                        Xem lịch sử chỉnh sửa
                    </Button>
                </div>
            </div>
        </div>
    );
};