import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { WrapperHeader } from '../styles/style';
import { Button, Col, Form, Row, Select, Space, DatePicker, ConfigProvider, Input } from "antd";
import { SearchOutlined } from '@ant-design/icons'

import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import moment from 'moment';
import viVN from 'antd/es/locale/vi_VN';
import 'dayjs/locale/vi';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";

import TableComponent from '../../../components/TableComponent/TableComponent';
import InputComponent from '../../../components/InputComponent/InputComponent';
import BreadcrumbComponent from '../../../components/BreadcrumbComponent/BreadcrumbComponent';
import Loading from '../../../components/LoadingComponent/Loading';
import * as message from '../../../components/Message/Message';
import { LIMIT_RECORD } from '../../../constants/limit';
import fieldOfWorkService from '../../../services/fieldOfWorkService';
import districtService from '../../../services/districtService';
import communeService from '../../../services/communeService';
import CrimeService from '../../../services/crimeService';

export const SocialOrderNew = () => {
    const user = useSelector((state) => state?.user);
    const [modalForm] = Form.useForm();
    const [fieldOfWorks, setFieldOfWorks] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [communes, setCommunes] = useState([]);
    const [crimes, setCrimes] = useState([]);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 5 // Số lượng mục trên mỗi trang
    });

    const breadcrumbItems = [
        { label: 'Trang chủ', path: '/dashboard' },
        { label: 'Vụ việc về TTXH' },
        { label: 'Thêm mới vụ việc' },
    ];

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

        const fetchCommunes = async () => {
            try {
                const response = await communeService.getCommunes(1, LIMIT_RECORD.ALL);
                if (response?.data) {
                    setCommunes(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách quận/huyện:", error);
            }
        };

        const fetchCrimes = async () => {
            try {
                const response = await CrimeService.getCrimes(1, LIMIT_RECORD.ALL);
                if (response?.data) {
                    setCrimes(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách quận/huyện:", error);
            }
        };

        fetchFieldOfWorks();
        fetchDistricts();
        fetchCommunes();
        fetchCrimes();
    }, []);

    return (
        <ConfigProvider locale={viVN}>
            <WrapperHeader>Thêm vụ việc mới</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />

            <Form form={modalForm} name="modalForm">
                <Row gutter={16}>
                    <Col xs={24} sm={24} md={24} lg={6}>
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

                    <Col xs={24} sm={24} md={24} lg={6}>
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

                    <Col xs={24} sm={24} md={24} lg={6}>
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

                    <Col xs={24} sm={24} md={24} lg={6}>
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

                    <Col xs={24} sm={24} md={24} lg={6}>
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

                    <Col xs={24} sm={24} md={24} lg={6}>
                        <Form.Item
                            label="Ngày báo cáo"
                            name="sentStatus"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                placeholder="Chọn trạng thái"
                                style={{ height: 36 }}
                            >
                                <Select.Option value="">Đã gửi báo cáo</Select.Option>
                                <Select.Option value="notSent">Chưa gửi báo cáo</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={6}>
                        <Form.Item
                            label="Ngày xảy ra"
                            name="sentStatus"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                placeholder="Chọn trạng thái"
                                style={{ height: 36 }}
                            >
                                <Select.Option value="">Đã gửi báo cáo</Select.Option>
                                <Select.Option value="notSent">Chưa gửi báo cáo</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={6}>
                        <Form.Item
                            label="Ghi chú"
                            name="sentStatus"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                placeholder="Chọn trạng thái"
                                style={{ height: 36 }}
                            >
                                <Select.Option value="">Đã gửi báo cáo</Select.Option>
                                <Select.Option value="notSent">Chưa gửi báo cáo</Select.Option>
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
                                placeholder="Chọn trạng thái"
                                style={{ height: 36 }}
                            >
                                <Select.Option value="">Đã gửi báo cáo</Select.Option>
                                <Select.Option value="notSent">Chưa gửi báo cáo</Select.Option>
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
                                placeholder="Chọn trạng thái"
                                style={{ height: 36 }}
                            >
                                <Select.Option value="">Đã gửi báo cáo</Select.Option>
                                <Select.Option value="notSent">Chưa gửi báo cáo</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Mức độ vụ viêc"
                            name="sentStatus"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                placeholder="Chọn trạng thái"
                                style={{ height: 36 }}
                            >
                                <Select.Option value="">Đã gửi báo cáo</Select.Option>
                                <Select.Option value="notSent">Chưa gửi báo cáo</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </ConfigProvider>
    )
}
