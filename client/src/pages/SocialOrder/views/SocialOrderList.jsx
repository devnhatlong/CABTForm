import React, { useEffect, useState } from 'react';
import { CreateFormButton, WrapperButton, WrapperHeader } from '../styles/style';
import { Table, Space, Button, Col, Form, Row, Select, DatePicker, ConfigProvider, Input, Checkbox, InputNumber } from "antd";
import { DeleteOutlined, EyeOutlined, EditOutlined, SearchOutlined, FileExcelOutlined, ExpandAltOutlined, ReloadOutlined } from '@ant-design/icons'

import { useSelector } from 'react-redux';
import moment from 'moment';
import viVN from 'antd/es/locale/vi_VN';
import 'dayjs/locale/vi';

import TableComponent from '../../../components/TableComponent/TableComponent';
import InputComponent from '../../../components/InputComponent/InputComponent';
import ModalComponent from '../../../components/ModalComponent/ModalComponent';
import Loading from '../../../components/LoadingComponent/Loading';
import * as message from '../../../components/Message/Message';
import DrawerComponent from '../../../components/DrawerComponent/DrawerComponent';
import { useMutationHooks } from '../../../hooks/useMutationHook';
import ImportExcel from "../../../components/ImportExcel/ImportExcel";
import BreadcrumbComponent from '../../../components/BreadcrumbComponent/BreadcrumbComponent';
import { ROLE } from '../../../constants/role';
import { LIMIT_RECORD } from '../../../constants/limit';
import fieldOfWorkService from '../../../services/fieldOfWorkService';
import provinceService from '../../../services/provinceService';
import districtService from '../../../services/districtService';
import communeService from '../../../services/communeService';
import CrimeService from '../../../services/crimeService';
import socialOrderService from '../../../services/socialOrderService';
import { useQuery } from '@tanstack/react-query';
import serverDateService from '../../../services/serverDateService';

export const SocialOrderList = () => {
    const { Option } = Select;
    const [modalForm] = Form.useForm();
    const [drawerForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState();
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [isLoadingResetFilter, setIsLoadingResetFilter] = useState(false);
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const user = useSelector((state) => state?.user);
    const [serverDate, setServerDate] = useState([]);
    const [columnFilters, setColumnFilters] = useState({});
    const [dataTable, setDataTable] = useState([]);
    const [fieldOfWorks, setFieldOfWorks] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [communes, setCommunes] = useState([]);
    const [crimes, setCrimes] = useState([]);
    const [filters, setFilters] = useState({
        reportContent: "",
        fieldOfWork: "",
        district: "",
        crime: "",
        fromDate: null,
        toDate: null,
        dateType: "",
        investigationResult: "",
        handlingResult: "",
        severityLevel: "",
    });
    const [resetSelection, setResetSelection] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10 // Số lượng mục trên mỗi trang
    });

    const breadcrumbItems = [
        { label: 'Trang chủ', path: '/dashboard' },
        { label: 'Vụ việc về TTXH' },
        { label: 'Danh sách vụ việc' },
    ];

    useEffect(() => {
        const defaultValues = {
          fieldOfWork: "all",
          district: "all",
          crime: "all",
          dateType: "all",
          investigationResult: "all",
          handlingResult: "all",
          severityLevel: "all"
        };
      
        modalForm.setFieldsValue(defaultValues);
        setFilters(prev => ({ ...prev, ...defaultValues }));
    }, [modalForm]);

    useEffect(() => {
        const fetchServerDate = async () => {
            try {
                const response = await serverDateService.getServerDate();
                if (response?.formattedDate) {
                    setServerDate(response.formattedDate);
                }
            } catch (error) {
                console.error("Lỗi khi lấy ngày giờ từ server", error);
            }
        };

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

        fetchServerDate();
        fetchFieldOfWorks();
        fetchProvinces();
        fetchDistricts();
        fetchCommunes();
        fetchCrimes();
    }, []);

    const [stateDistrict, setStateDistrict] = useState({
        districtName: "",
        districtCode: "",
        provinceId: "",
    });

    const [stateDistrictDetail, setStateDistrictDetail] = useState({
        districtName: "",
        districtCode: "",
        provinceId: "",
    });

    const mutation = useMutationHooks(
        (data) => {
            const { districtName, districtCode, provinceId } = data;
            const response = districtService.createDistrict({ districtName, districtCode, provinceId });
            return response;
        }
    )

    const mutationUpdate = useMutationHooks(
        (data) => { 
            const { id, ...rests } = data;
            const response = districtService.updateDistrict(id, { ...rests });
            return response;
        }
    );
    
    const mutationDeleted = useMutationHooks(
        (data) => { 
            const { id } = data;
            const response = districtService.deleteDistrict(id);
            return response;
        }
    );

    const mutationDeletedMultiple = useMutationHooks(
        (data) => { 
          const { ids } = data;
          const response = districtService.deleteMultipleRecords(ids);
    
          return response;
        }
    );

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateDistrict({
            districtName: "",
            districtCode: "",
            provinceId: "",
        });

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;
    const { data: dataUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated, isPending: isPendingUpdated } = mutationUpdate;
    const { data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted, isPending: isLoadingDeleted } = mutationDeleted;
    const { data: dataDeletedMultiple, isSuccess: isSuccessDeletedMultiple, isError: isErrorDeletedMultiple, isPending: isLoadingDeletedMultiple } = mutationDeletedMultiple;

    const getAllRecords = async (currentPage, pageSize, filters) => {
        const response = await socialOrderService.getSocialOrders(currentPage, pageSize, filters);
        console.log("response", response);
        return response;
    };

    const fetchGetDetailRecord = async (rowSelected) => {
        const response = await districtService.getDistrictById(rowSelected);

        if (response?.data) {
            setStateDistrictDetail({
                districtName: response?.data?.districtName,
                districtCode: response?.data?.districtCode,
                provinceId: response?.data?.provinceId,
            })
        }
        setIsLoadingUpdate(false);
    }

    useEffect(() => {
        drawerForm.setFieldsValue(stateDistrictDetail)
    }, [stateDistrictDetail, drawerForm])

    useEffect(() => {
        if (rowSelected) {
            setIsLoadingUpdate(true);
            fetchGetDetailRecord(rowSelected);
        }
    }, [rowSelected])

    const handleDetailLetter = () => {
        setIsOpenDrawer(true);
    }

    useEffect(() => {
        query.refetch();
        setIsLoadingResetFilter(false);
    }, [isLoadingResetFilter]);

    const handleResetAllFilter = () => {
        setIsLoadingResetFilter(true);
        setColumnFilters("");
        setFilters("");
    }

    const query = useQuery({
        queryKey: ['allRecords'],
        queryFn: () => getAllRecords(pagination.currentPage, pagination.pageSize, filters),
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingAllRecords, data: allRecords } = query;

    useEffect(() => {
        if(isSuccess && data?.success) {
            message.success(data?.message);
            handleCancel();
        }
        else if (isError) {
            message.error("Có gì đó sai sai");
        }
        else if (isSuccess && !data?.success) {
            message.error(data?.message);
        }
    }, [isSuccess]);

    useEffect(() => {
        if(isSuccessUpdated && dataUpdated?.success) {
            message.success(dataUpdated?.message);
            handleCloseDrawer();
        }
        else if (isError) {
            message.error("Có gì đó sai sai");
        }
        else if (isSuccessUpdated && !dataUpdated?.success) {
            message.error(dataUpdated?.message);
        }
    }, [isSuccessUpdated]);

    useEffect(() => {
        if(isSuccessDeleted && dataDeleted?.success) {
            message.success(dataDeleted?.message);
            handleCancelDelete();
        }
        else if (isErrorDeleted) {
          message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeleted])

    useEffect(() => {
        if (isSuccessDeletedMultiple && dataDeletedMultiple) {
            if (dataDeletedMultiple.deletedCount > 0) {
                message.success(dataDeletedMultiple.message);
            } else {
                message.error(dataDeletedMultiple.message);
            }
        } else if (isErrorDeletedMultiple) {
            message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeletedMultiple, isErrorDeletedMultiple, dataDeletedMultiple]);

    useEffect(() => {
        query.refetch();
    }, [pagination]);

    const onFinish = async () => {
        query.refetch();
    }

    const onUpdate = async () => {
        mutationUpdate.mutate(
            {
                id: rowSelected,
                ...stateDistrictDetail
            }, 
            {
                onSettled: () => {
                    query.refetch();
                }
            }
        );
    }

    const handleDeleteLetter = () => {
        mutationDeleted.mutate(
          {
            id: rowSelected
          },
          {
            onSettled: () => {
                query.refetch();
            }
          }
        )
    }

    const handleDeleteMultipleRecords = (ids) => {
        mutationDeletedMultiple.mutate(
          {
            ids: ids,
          },
          {
            onSettled: () => {
                query.refetch();
                setResetSelection(prevState => !prevState);
            }
          }
        )
    }

    useEffect(() => {
        if (allRecords?.data) {
            const updatedDataTable = fetchDataForDataTable(allRecords);
            setDataTable(updatedDataTable);
        }
    }, [allRecords]);

    const fetchDataForDataTable = (allRecords) => {
        return allRecords?.data?.map((record) => {
            return {
                ...record, 
                key: record._id,
                userName: record?.user?.userName,
                fieldOfWork: record?.fieldOfWork?.fieldName,
                district: record?.district?.districtName,
                commune: record?.commune?.communeName,
                crime: record?.crime?.crimeName,
                provinceName: record?.provinceId?.provinceName,
                createdAt: new Date(record.createdAt),
                updatedAt: new Date(record.updatedAt),
            };
        });
    };

    const buttonReloadTable = () => {
        return (
            <div style={{display: "flex", justifyContent: "center"}}>
                <ReloadOutlined style={{color: '#1677ff', fontSize: '18px', cursor: 'pointer'}} onClick={handleResetAllFilter}/>
            </div>
        )
    }

    const renderAction = () => {
        return (
            <div style={{display: "flex", justifyContent: "center", gap: "10px"}}>
                <EditOutlined style={{color: 'orange', fontSize: '18px', cursor: 'pointer'}} onClick={handleDetailLetter}/>
                <DeleteOutlined style={{color: 'red', fontSize: '18px', cursor: 'pointer'}} onClick={() => setIsModalOpenDelete(true)}/>
            </div>
        )
    }

    const columns = [
        {
            title: "Đơn vị thụ lý",
            dataIndex: "userName",
            key: "userName",
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
            title: "Huyện, TX, TP",
            dataIndex: "district",
            key: "district",
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
            title: "Ngày báo cáo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => date ? moment(date).format('DD/MM/YYYY HH:mm') : '',
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
            title: "Ngày xảy ra",
            dataIndex: "incidentDate",
            key: "incidentDate",
            render: (date) => date ? moment(date).format('DD/MM/YYYY') : '',
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
            key: "crime",
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
            title: "Nội dung vụ việc",
            dataIndex: "reportContent",
            key: "reportContent",
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
            title: "Số đối tượng",
            dataIndex: "numberOfSubjects",
            key: "numberOfSubjects",
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
            title: "Phê duyệt của đơn vị",
            dataIndex: "approvalStatus",
            key: "approvalStatus",
            render: (status) => (status ? "Đã phê duyệt" : "Chưa phê duyệt"),
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
            title: "Chi tiết",
            key: "details",
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    // onClick={() => handleViewDetails(record)}
                >
                    Xem
                </Button>
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
            title: "Thao tác",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        // onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        danger
                        // onClick={() => handleDelete(record)}
                    >
                        Xóa
                    </Button>
                </Space>
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

    const handlePageChange = (page, pageSize) => {
        setPagination({
            ...pagination,
            currentPage: page,
            pageSize: pageSize
        });
    };

    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    }

    // Đóng DrawerComponent
    const handleCloseDrawer = () => {
        fetchGetDetailRecord(rowSelected);
        setIsOpenDrawer(false);
    };

    const handleFilterChange = (key, value) => {
        setFilters((prevFilter) => ({
            ...prevFilter,
            [key]: value,
        }));
    };

    return (
        <ConfigProvider locale={viVN}>
            <WrapperHeader>Danh sách vụ việc</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />

            <Form 
                form={modalForm} 
                name="modalForm"
                onFinish={onFinish}
                
            >
                <Row gutter={16}>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item
                            label="Nội dung tìm kiếm"
                            name="reportContent"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <InputComponent 
                                name="reportContent"
                                placeholder="Nội dung tìm kiếm"
                                onChange={(e) => handleFilterChange("reportContent", e.target.value)}
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
                                placeholder="Chọn lĩnh vực vụ việc"
                                style={{ height: 36 }}
                                onChange={(value) => handleFilterChange("fieldOfWork", value)}
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
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
                                onChange={(value) => handleFilterChange("district", value)}
                                filterOption={(input, option) =>
                                    option?.children?.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
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
                                onChange={(value) => handleFilterChange("crime", value)}
                                filterOption={(input, option) =>
                                    option?.children?.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
                                {crimes.map((field) => (
                                    <Select.Option key={field._id} value={field._id}>
                                        {field.crimeName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Từ ngày"
                            name="fromDate" // Đặt tên phù hợp cho trường
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <DatePicker
                                format="DD/MM/YYYY"
                                style={{ width: "100%", height: 36 }}
                                disabledDate={(current) => current && current > moment().endOf('day')}
                                onChange={(value) => handleFilterChange("fromDate", value)}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Đến ngày"
                            name="toDate"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <DatePicker
                                format="DD/MM/YYYY"
                                style={{ width: "100%", height: 36 }}
                                disabledDate={(current) => current && current > moment().endOf('day')}
                                onChange={(value) => handleFilterChange("toDate", value)}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Loại ngày tìm kiếm"
                            name="dateType"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                placeholder="Chọn loại ngày tìm kiếm"
                                style={{ height: 36 }}
                                onChange={(value) => handleFilterChange("dateType", value)}
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
                                <Select.Option value="createdAt">Ngày báo cáo</Select.Option>
                                <Select.Option value="incidentDate">Ngày xảy ra vụ việc</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Kết quả điều tra"
                            name="investigationResult"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                placeholder="Chọn kết quả điều tra"
                                style={{ height: 36 }}
                                onChange={(value) => handleFilterChange("investigationResult", value)}
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
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
                            name="handlingResult"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                placeholder="Chọn kết quả xử lý"
                                style={{ height: 36 }}
                                onChange={(value) => handleFilterChange("handlingResult", value)}
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
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
                            name="severityLevel"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                placeholder="Chọn mức độ vụ việc"
                                style={{ height: 36 }}
                                onChange={(value) => handleFilterChange("severityLevel", value)}
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
                                <Select.Option value="Nghiêm trọng và ít nghiêm trọng">Nghiêm trọng và ít nghiêm trọng</Select.Option>
                                <Select.Option value="Rất nghiêm trọng">Rất nghiêm trọng</Select.Option>
                                <Select.Option value="Đặc biệt nghiêm trọng">Đặc biệt nghiêm trọng</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                
                <div style={{ marginTop: 20, marginBottom: 20, gap: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <WrapperButton type="primary" htmlType="submit" icon={<SearchOutlined />}>Tìm kiếm</WrapperButton>
                    <WrapperButton type="default" icon={<ExpandAltOutlined />}>Tìm kiếm mở rộng</WrapperButton>
                    <WrapperButton style={{ backgroundColor: '#1D6B40', color: '#fff' }} icon={<FileExcelOutlined />}>Xuất Excel</WrapperButton>
                </div>
                

                <Row gutter={16}>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <TableComponent handleDeleteMultiple={handleDeleteMultipleRecords} columns={columns} data={dataTable} isLoading={isLoadingAllRecords || isLoadingResetFilter} resetSelection={resetSelection}
                            pagination={{
                                current: pagination.currentPage,
                                pageSize: pagination.pageSize,
                                total: allRecords?.total,
                                onChange: handlePageChange,
                                showSizeChanger: false
                            }}
                            onRow={(record, rowIndex) => {
                                return {
                                    onClick: (event) => {
                                        if (record._id) {
                                            setRowSelected(record._id);
                                        }
                                    },
                                };
                            }}
                        />
                    </Col>
                </Row>
            </Form>
        </ConfigProvider>
    )
}