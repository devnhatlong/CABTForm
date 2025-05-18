import React, { useEffect, useState } from 'react';
import { WrapperHeader } from '../styles/style';
import { Table, Button, Col, Form, Row, Select, DatePicker, ConfigProvider, Input, Checkbox, InputNumber } from "antd";
import { DeleteOutlined, SendOutlined } from '@ant-design/icons'

import { useSelector } from 'react-redux';
import moment from 'moment';
import viVN from 'antd/es/locale/vi_VN';
import 'dayjs/locale/vi';

import InputComponent from '../../../components/InputComponent/InputComponent';
import BreadcrumbComponent from '../../../components/BreadcrumbComponent/BreadcrumbComponent';
import * as message from '../../../components/Message/Message';
import { LIMIT_RECORD } from '../../../constants/limit';
import { preventNonNumericInput } from '../../../utils/utils';
import fieldOfWorkService from '../../../services/fieldOfWorkService';
import provinceService from '../../../services/provinceService';
import districtService from '../../../services/districtService';
import communeService from '../../../services/communeService';
import CrimeService from '../../../services/crimeService';

export const SocialOrderNew = () => {
    const user = useSelector((state) => state?.user);
    const [modalForm] = Form.useForm();
    const [fieldOfWorks, setFieldOfWorks] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [communes, setCommunes] = useState([]);
    const [crimes, setCrimes] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [annexData, setAnnexData] = useState({
        commonAnnex: {
            numberOfDeaths: "", // Số người chết
            numberOfInjuries: "", // Số người bị thương
            numberOfChildrenAbused: "", // Số trẻ em bị xâm hại
            propertyDamage: "", // Tài sản thiệt hại (tr đồng)
            propertyRecovered: "", // Tài sản thu hồi (tr đồng)
            gunsRecovered: "", // Súng (thu hồi)
            explosivesRecovered: "", // Thuốc nổ (kg) thu hồi
        },
        drugAnnex: {
            heroin: "", // Heroin (g)
            opium: "", // Thuốc phiện (g)
            cannabis: "", // Cần sa (g)
            drugPlants: "", // Cây có chứa chất ma túy (g)
            syntheticDrugs: "", // Ma túy tổng hợp (g)
            syntheticDrugPills: "", // Ma túy tổng hợp (viên)
            otherDrugsWeight: "", // Loại ma túy khác (g)
            otherDrugsVolume: "", // Loại ma túy khác (ml)
        },
    });

    const commonAnnexData = [annexData.commonAnnex];
    const drugAnnexData = [annexData.drugAnnex]; // Dữ liệu cho phụ lục ma túy

    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 5 // Số lượng mục trên mỗi trang
    });

    const breadcrumbItems = [
        { label: 'Trang chủ', path: '/dashboard' },
        { label: 'Vụ việc về TTXH' },
        { label: 'Thêm mới vụ việc' },
    ];

    const { Option } = Select;
    

    useEffect(() => {
        if (user?.userName) {
            modalForm.setFieldsValue({ userName: user.userName });
        }
    }, [user, modalForm]);
    
    useEffect(() => {
        const fetchFieldOfWorks = async () => {
            try {
                const response = await fieldOfWorkService.getFieldOfWorks(1, LIMIT_RECORD.ALL);
                if (response?.data) {
                    setFieldOfWorks(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách lĩnh vực vụ việc:", error);
            }
        };

        const fetchDistricts = async () => {
            try {
                const response = await districtService.getDistricts(1, LIMIT_RECORD.ALL);
                if (response?.data) {
                    setDistricts(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách quận/huyện:", error);
            }
        };

        const fetchProvinces = async () => {
            try {
                const response = await provinceService.getProvinces(1, LIMIT_RECORD.ALL);
                if (response?.data) {
                    setProvinces(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách quận/huyện:", error);
            }
        };

        const fetchCommunes = async () => {
            try {
                const response = await communeService.getCommunes(1, LIMIT_RECORD.ALL);
                if (response?.data) {
                    setCommunes(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách xã, phường, thị trấn:", error);
            }
        };

        const fetchCrimes = async () => {
            try {
                const response = await CrimeService.getCrimes(1, LIMIT_RECORD.ALL);
                if (response?.data) {
                    setCrimes(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách tội danh:", error);
            }
        };

        fetchFieldOfWorks();
        fetchProvinces();
        fetchDistricts();
        fetchCommunes();
        fetchCrimes();
    }, []);

    const columns = [
        {
            title: "Họ tên",
            dataIndex: "fullName",
            render: (text, record, index) => (
                <Input
                    value={text}
                    onChange={(e) => handleInputChange(index, "fullName", e.target.value)}
                />
            ),
            width: 200,
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Ngày sinh (dd/mm/yyyy)",
            dataIndex: "birthDate",
            render: (text, record, index) => (
                <DatePicker
                    format="DD/MM/YYYY"
                    value={text ? moment(text, "DD/MM/YYYY") : null}
                    onChange={(date) =>
                        handleInputChange(index, "birthDate", date ? date.format("DD/MM/YYYY") : "")
                    }
                />
            ),
            width: 180,
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Tội danh",
            dataIndex: "crime",
            render: (value, record, index) => (
                <Select
                    showSearch
                    placeholder="Chọn tội danh"
                    value={value}
                    onChange={(val) => handleInputChange(index, "crime", val)}
                    style={{ width: "100%" }}
                    optionFilterProp="children"
                >
                {crimes.map((crime) => (
                    <Option key={crime._id} value={crime._id}>
                        {crime.crimeName}
                    </Option>
                ))}
                </Select>
            ),
            width: 220,
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Tỉnh HKTT",
            dataIndex: "province",
            render: (value, record, index) => (
                <Select
                    showSearch
                    placeholder="Chọn tỉnh"
                    value={value}
                    onChange={(val) => handleInputChange(index, "province", val)}
                    style={{ width: "100%" }}
                    optionFilterProp="children"
                >
                {provinces.map((province) => (
                    <Option key={province._id} value={province._id}>
                        {province.provinceName}
                    </Option>
                ))}
                </Select>
            ),
            width: 200,
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Huyện HKTT",
            dataIndex: "district",
            render: (value, record, index) => (
                <Select
                    showSearch
                    placeholder="Chọn huyện"
                    value={value}
                    onChange={(val) => handleInputChange(index, "district", val)}
                    style={{ width: "100%" }}
                    optionFilterProp="children"
                >
                    {districts.map((district) => (
                        <Option key={district._id} value={district._id}>
                            {district.districtName}
                        </Option>
                    ))}
                </Select>
            ),
            width: 200,
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Xã HKTT",
            dataIndex: "commune",
            render: (value, record, index) => (
                <Select
                    showSearch
                    placeholder="Chọn xã"
                    value={value}
                    onChange={(val) => handleInputChange(index, "commune", val)}
                    style={{ width: "100%" }}
                    optionFilterProp="children"
                >
                    {communes.map((commune) => (
                        <Option key={commune._id} value={commune._id}>
                        {commune.communeName}
                        </Option>
                    ))}
                </Select>
            ),
            width: 200,
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Nghề nghiệp",
            dataIndex: "job",
            render: (text, record, index) => (
                <Input
                    value={text}
                    onChange={(e) => handleInputChange(index, "job", e.target.value)}
                />
            ),
            width: 150,
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Nữ giới",
            dataIndex: "isFemale",
            render: (checked, record, index) => (
                <Checkbox
                    checked={checked}
                    onChange={(e) => handleInputChange(index, "isFemale", e.target.checked)}
                />
            ),
            width: 80,
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
            onCell: () => ({
                style: {
                    textAlign: 'center', // Căn giữa nội dung ô
                },
            }),
        },
        {
            title: "Nghiện ma túy",
            dataIndex: "isDrugAddict",
            render: (checked, record, index) => (
                <Checkbox
                    checked={checked}
                    onChange={(e) => handleInputChange(index, "isDrugAddict", e.target.checked)}
                />
            ),
            width: 100,
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
            onCell: () => ({
                style: {
                    textAlign: 'center', // Căn giữa nội dung ô
                },
            }),
        },
        {
            title: "Tiền án tiền sự",
            dataIndex: "criminalRecord",
            render: (checked, record, index) => (
                <Checkbox
                    checked={checked}
                    onChange={(e) => handleInputChange(index, "criminalRecord", e.target.checked)}
                />
            ),
            width: 100,
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
            onCell: () => ({
                style: {
                    textAlign: 'center', // Căn giữa nội dung ô
                },
            }),
        },
        {
            title: "Khởi tố",
            dataIndex: "prosecution",
            render: (checked, record, index) => (
                <Checkbox
                    checked={checked}
                    onChange={(e) => handleInputChange(index, "prosecution", e.target.checked)}
                />
            ),
            width: 80,
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
            onCell: () => ({
                style: {
                    textAlign: 'center', // Căn giữa nội dung ô
                },
            }),
        },
        {
            title: "XLHC",
            dataIndex: "administrativeHandling",
            render: (checked, record, index) => (
                <Checkbox
                    checked={checked}
                    onChange={(e) => handleInputChange(index, "administrativeHandling", e.target.checked)}
                />
            ),
            width: 80,
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
            onCell: () => ({
                style: {
                    textAlign: 'center', // Căn giữa nội dung ô
                },
            }),
        },
        {
            title: "Tiền phạt (triệu đồng)",
            dataIndex: "fine",
            render: (value, record, index) => (
                <>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <InputNumber
                            value={value}
                            onChange={(val) => handleInputChange(index, "fine", val)}
                            min={0}
                            onKeyDown={preventNonNumericInput}
                            style={{ width: "100%" }}
                        />
                        <span> VNĐ</span>
                    </div>
                </>
            ),
            width: 180,
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Xóa",
            dataIndex: "delete",
            render: (text, record, index) => (
                <Button
                    type="text"
                    icon={<DeleteOutlined style={{ color: "red" }} />}
                    onClick={() => handleDeleteRow(index)}
                />
            ),
            width: 80,
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
            onCell: () => ({
                style: {
                    textAlign: 'center', // Căn giữa nội dung ô
                },
            }),
        },
    ];

    const handleInputChange = (index, field, value) => {
        const newData = [...tableData];
        newData[index][field] = value;
        setTableData(newData);
    };    

    const handleAddRow = () => {
        setTableData([
            ...tableData,
            {
                fullName: "",
                birthDate: "",
                crime: "",
                province: "",
                district: "",
                commune: "",
                job: "",
                isFemale: false,
                isDrugAddict: false,
                criminalRecord: false,
                prosecution: false,
                administrativeHandling: false,
                fine: "",
            },
        ]);
    };
    
    const handleDeleteRow = (index) => {
        const newData = [...tableData];
        newData.splice(index, 1);
        setTableData(newData);
    };

    const commonAnnexColumns = [
        {
            title: "Số người chết",
            dataIndex: "numberOfDeaths",
            render: (value) => (
                <InputNumber
                    value={value}
                    onChange={(val) =>
                        setAnnexData({
                            ...annexData,
                            commonAnnex: { ...annexData.commonAnnex, numberOfDeaths: val },
                        })
                    }
                    min={0}
                    onKeyDown={preventNonNumericInput}
                    style={{ width: "100%" }}
                />
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Số người bị thương",
            dataIndex: "numberOfInjuries",
            render: (value) => (
                <InputNumber
                    value={value}
                    onChange={(val) =>
                        setAnnexData({
                            ...annexData,
                            commonAnnex: { ...annexData.commonAnnex, numberOfInjuries: val },
                        })
                    }
                    min={0}
                    onKeyDown={preventNonNumericInput}
                    style={{ width: "100%" }}
                />
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Số trẻ em bị xâm hại",
            dataIndex: "numberOfChildrenAbused",
            render: (value) => (
                <InputNumber
                    value={value}
                    onChange={(val) =>
                        setAnnexData({
                            ...annexData,
                            commonAnnex: { ...annexData.commonAnnex, numberOfChildrenAbused: val },
                        })
                    }
                    min={0}
                    onKeyDown={preventNonNumericInput}
                    style={{ width: "100%" }}
                />
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Tài sản thiệt hại (tr đồng)",
            dataIndex: "propertyDamage",
            render: (value) => (
                <InputNumber
                    value={value}
                    onChange={(val) =>
                        setAnnexData({
                            ...annexData,
                            commonAnnex: { ...annexData.commonAnnex, propertyDamage: val },
                        })
                    }
                    min={0}
                    onKeyDown={preventNonNumericInput}
                    style={{ width: "100%" }}
                />
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Tài sản thu hồi (tr đồng)",
            dataIndex: "propertyRecovered",
            render: (value) => (
                <InputNumber
                    value={value}
                    onChange={(val) =>
                        setAnnexData({
                            ...annexData,
                            commonAnnex: { ...annexData.commonAnnex, propertyRecovered: val },
                        })
                    }
                    min={0}
                    onKeyDown={preventNonNumericInput}
                    style={{ width: "100%" }}
                />
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Số lượng súng (thu hồi)",
            dataIndex: "gunsRecovered",
            render: (value) => (
                <InputNumber
                    value={value}
                    onChange={(val) =>
                        setAnnexData({
                            ...annexData,
                            commonAnnex: { ...annexData.commonAnnex, gunsRecovered: val },
                        })
                    }
                    min={0}
                    onKeyDown={preventNonNumericInput}
                    style={{ width: "100%" }}
                />
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Thuốc nổ (kg) thu hồi",
            dataIndex: "explosivesRecovered",
            render: (value) => (
                <InputNumber
                    value={value}
                    onChange={(val) =>
                        setAnnexData({
                            ...annexData,
                            commonAnnex: { ...annexData.commonAnnex, explosivesRecovered: val },
                        })
                    }
                    min={0}
                    onKeyDown={preventNonNumericInput}
                    style={{ width: "100%" }}
                />
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
    ];

    const drugAnnexColumns = [
        {
            title: "Heroin (g)",
            dataIndex: "heroin",
            render: (value) => (
                <InputNumber
                    value={value}
                    onChange={(val) =>
                        setAnnexData({
                            ...annexData,
                            drugAnnex: { ...annexData.drugAnnex, heroin: val },
                        })
                    }
                    min={0}
                    onKeyDown={preventNonNumericInput} // Chặn ký tự không hợp lệ
                    style={{ width: "100%" }}
                />
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Thuốc phiện (g)",
            dataIndex: "opium",
            render: (value) => (
                <InputNumber
                    value={value}
                    onChange={(val) =>
                        setAnnexData({
                            ...annexData,
                            drugAnnex: { ...annexData.drugAnnex, opium: val },
                        })
                    }
                    min={0}
                    onKeyDown={preventNonNumericInput}
                    style={{ width: "100%" }}
                />
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Cần sa (g)",
            dataIndex: "cannabis",
            render: (value) => (
                <InputNumber
                    value={value}
                    onChange={(val) =>
                        setAnnexData({
                            ...annexData,
                            drugAnnex: { ...annexData.drugAnnex, cannabis: val },
                        })
                    }
                    min={0}
                    onKeyDown={preventNonNumericInput}
                    style={{ width: "100%" }}
                />
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Cây có chứa chất ma túy (g)",
            dataIndex: "drugPlants",
            render: (value) => (
                <InputNumber
                    value={value}
                    onChange={(val) =>
                        setAnnexData({
                            ...annexData,
                            drugAnnex: { ...annexData.drugAnnex, drugPlants: val },
                        })
                    }
                    min={0}
                    onKeyDown={preventNonNumericInput}
                    style={{ width: "100%" }}
                />
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Ma túy tổng hợp (g)",
            dataIndex: "syntheticDrugs",
            render: (value) => (
                <InputNumber
                    value={value}
                    onChange={(val) =>
                        setAnnexData({
                            ...annexData,
                            drugAnnex: { ...annexData.drugAnnex, syntheticDrugs: val },
                        })
                    }
                    min={0}
                    onKeyDown={preventNonNumericInput}
                    style={{ width: "100%" }}
                />
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Ma túy tổng hợp (viên)",
            dataIndex: "syntheticDrugPills",
            render: (value) => (
                <InputNumber
                    value={value}
                    onChange={(val) =>
                        setAnnexData({
                            ...annexData,
                            drugAnnex: { ...annexData.drugAnnex, syntheticDrugPills: val },
                        })
                    }
                    min={0}
                    onKeyDown={preventNonNumericInput}
                    style={{ width: "100%" }}
                />
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Loại ma túy khác (g)",
            dataIndex: "otherDrugsWeight",
            render: (value) => (
                <InputNumber
                    value={value}
                    onChange={(val) =>
                        setAnnexData({
                            ...annexData,
                            drugAnnex: { ...annexData.drugAnnex, otherDrugsWeight: val },
                        })
                    }
                    min={0}
                    onKeyDown={preventNonNumericInput}
                    style={{ width: "100%" }}
                />
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Loại ma túy khác (ml)",
            dataIndex: "otherDrugsVolume",
            render: (value) => (
                <InputNumber
                    value={value}
                    onChange={(val) =>
                        setAnnexData({
                            ...annexData,
                            drugAnnex: { ...annexData.drugAnnex, otherDrugsVolume: val },
                        })
                    }
                    min={0}
                    onKeyDown={preventNonNumericInput}
                    style={{ width: "100%" }}
                />
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
    ];

    const handleSubmit = () => {
        // Xử lý logic gửi vụ việc
        console.log("Gửi vụ việc");
    };
    
    const handleGoToList = () => {
        // Điều hướng đến danh sách vụ việc
        console.log("Đi đến danh sách vụ việc");
    };

    return (
        <ConfigProvider locale={viVN}>
            <WrapperHeader>Thêm vụ việc mới</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />

            <Form form={modalForm} name="modalForm">
                <Row gutter={16}>
                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Đơn vị thụ lý"
                            name="userName"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <InputComponent 
                                name="userName"
                                placeholder="Đơn vị thụ lý" 
                                disabled
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Lĩnh vực vụ việc"
                            name="fieldOfWork"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn lĩnh vực vụ việc"
                                style={{ height: 36 }}
                                onChange={(value) => {
                                    modalForm.setFieldsValue({ fieldOfWork: value });
                                }}
                                filterOption={(input, option) =>
                                    option?.children?.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {fieldOfWorks.map((field) => (
                                    <Select.Option key={field._id} value={field._id}>
                                        {field.fieldName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Ngày xảy ra"
                            name="date" // Đặt tên phù hợp cho trường
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <DatePicker
                                format="DD/MM/YYYY"
                                style={{ width: "100%" }}
                                onChange={(date) =>
                                    modalForm.setFieldsValue({ incidentDate: date ? date.format("DD/MM/YYYY") : null })
                                }
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Địa bàn Huyện, TX, TP"
                            name="district"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn địa bàn Huyện, TX, TP"
                                style={{ height: 36 }}
                                onChange={(value) => {
                                    modalForm.setFieldsValue({ district: value });
                                }}
                                filterOption={(input, option) =>
                                    option?.children?.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {districts.map((field) => (
                                    <Select.Option key={field._id} value={field._id}>
                                        {field.districtName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Địa bàn Phường, xã, thị trấn"
                            name="commune"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn địa bàn Phường, xã, thị trấn"
                                style={{ height: 36 }}
                                onChange={(value) => {
                                    modalForm.setFieldsValue({ commune: value });
                                }}
                                filterOption={(input, option) =>
                                    option?.children?.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {communes.map((field) => (
                                    <Select.Option key={field._id} value={field._id}>
                                        {field.communeName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Tội danh"
                            name="crime"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn tội danh"
                                style={{ height: 36 }}
                                onChange={(value) => {
                                    modalForm.setFieldsValue({ crime: value });
                                }}
                                filterOption={(input, option) =>
                                    option?.children?.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {crimes.map((field) => (
                                    <Select.Option key={field._id} value={field._id}>
                                        {field.crimeName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24}>
                            <Form.Item
                                label="Nội dung vụ việc"
                                name="reportContent"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                            >
                                <Input.TextArea
                                    name="reportContent"
                                    // value={stateReport.reportContent}
                                    // onChange={(e) => handleOnChange('reportContent', e.target.value)}
                                    rows={4}
                                    placeholder="Nhập nội dung vụ việc..."
                                />
                            </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Kết quả điều tra"
                            name="sentStatus"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                placeholder="Chọn kết quả điều tra"
                                style={{ height: 36 }}
                            >
                                <Select.Option value="Đã điều tra làm rõ">Đã điều tra làm rõ</Select.Option>
                                <Select.Option value="Đang điều tra">Đang điều tra</Select.Option>
                                <Select.Option value="Đình chỉ">Đình chỉ</Select.Option>
                                <Select.Option value="Tạm đình chỉ">Tạm đình chỉ</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Kết quả xử lý"
                            name="sentStatus"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                placeholder="Chọn kết quả xử lý"
                                style={{ height: 36 }}
                            >
                                <Select.Option value="Đã khởi tố">Đã khởi tố</Select.Option>
                                <Select.Option value="Đã xử lý hành chính">Đã xử lý hành chính</Select.Option>
                                <Select.Option value="Chuyển cơ quan khác">Chuyển cơ quan khác</Select.Option>
                                <Select.Option value="Chưa có kết quả">Chưa có kết quả</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Mức độ vụ việc"
                            name="sentStatus"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                placeholder="Chọn mức độ vụ việc"
                                style={{ height: 36 }}
                            >
                                <Select.Option value="Nghiêm trọng và ít nghiêm trọng">Nghiêm trọng và ít nghiêm trọng</Select.Option>
                                <Select.Option value="Rất nghiêm trọng">Rất nghiêm trọng</Select.Option>
                                <Select.Option value="Đặc biệt nghiêm trọng">Đặc biệt nghiêm trọng</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: 20, marginBottom: 20 }}>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <Checkbox style={{ fontSize: "18px", color: "#012970" }} value="option1">Cấp xã thụ lý ban đầu</Checkbox>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <Checkbox style={{ fontSize: "18px", color: "#012970" }} value="option2">Án mở rộng</Checkbox>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <Checkbox style={{ fontSize: "18px", color: "#012970" }} value="option3">Băng ổ nhóm</Checkbox>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <Checkbox style={{ fontSize: "18px", color: "#012970" }} value="option4">QĐ phân công (Hồ sơ AD)</Checkbox>
                    </Col>
                </Row>

                <WrapperHeader style={{ display: "flex", justifyContent: "center" }}>Chi tiết đối tượng</WrapperHeader>
                <Row gutter={16}>
                    <Col span={24}>
                        <Table
                            columns={columns}
                            dataSource={tableData}
                            pagination={false}
                            scroll={{ x: "max-content" }}
                            rowKey={(record, index) => index}
                            bordered
                            footer={() => (
                                <div style={{ textAlign: "center" }}>
                                    <Button type="primary" onClick={handleAddRow}>
                                        Thêm đối tượng
                                    </Button>
                                </div>
                            )}
                        />
                    </Col>
                </Row>

                <WrapperHeader style={{ display: "flex", justifyContent: "center" }}>Phụ lục chung</WrapperHeader>
                <Row gutter={16}>
                    <Col span={24}>
                        <Table
                            columns={commonAnnexColumns}
                            dataSource={commonAnnexData}
                            pagination={false}
                            bordered
                            rowKey={() => "commonAnnex"}
                        />
                    </Col>
                </Row>
                
                <WrapperHeader style={{ display: "flex", justifyContent: "center" }}>Phụ lục ma túy</WrapperHeader>
                <Row gutter={16}>
                    <Col span={24} style={{ overflowX: "auto" }}>
                        <Table
                            columns={drugAnnexColumns}
                            dataSource={drugAnnexData}
                            pagination={false}
                            bordered
                            rowKey={() => "drugAnnex"}
                        />
                    </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: 40, marginBottom: 40, display: "flex", justifyContent: "flex-end" }}>
                    <Col>
                        <Button type="primary" style={{ width: "150px", display: 'flex', justifyContent: "center", alignItems: 'center' }} onClick={handleSubmit}>
                            <SendOutlined style={{fontSize: '16px'}}/>
                            Gửi vụ việc
                        </Button>
                    </Col>
                </Row>
            </Form>
        </ConfigProvider>
    )
}
