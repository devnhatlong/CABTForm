import React, { useState, useEffect, useRef } from 'react';
import { WrapperHeader } from './style';
import { Button, Form, Space, Row, Col } from "antd";
import InputComponent from '../InputComponent/InputComponent';
import ModalComponent from '../ModalComponent/ModalComponent';
import preJuly2022DigitizedService from '../../services/preJuly2022DigitizedService';
import administrativeProceduresForm1Service from '../../services/administrativeProceduresForm1Service';
import { SearchOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useMutationHooks } from '../../hooks/useMutationHook';
import { useSelector } from 'react-redux'
import * as message from '../Message/Message';
import { useQuery } from '@tanstack/react-query';
import TableComponent from '../TableComponent/TableComponent';
import Moment from 'react-moment';
import Loading from '../LoadingComponent/Loading';
import DrawerComponent from '../DrawerComponent/DrawerComponent';

export const PreJuly2022Digitized = () => {
    const [modalForm] = Form.useForm();
    const [drawerForm] = Form.useForm();
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState();
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isLoadingResetFilter, setIsLoadingResetFilter] = useState(false);
    const user = useSelector((state) => state?.user);
    const searchInput = useRef(null);
    const [columnFilters, setColumnFilters] = useState({});
    const [dataTable, setDataTable] = useState([]);
    const [filters, setFilters] = useState({});
    const [resetSelection, setResetSelection] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 5 // Số lượng mục trên mỗi trang
    });

    const [statePreJuly2022Digitized, setStatePreJuly2022Digitized] = useState({
        total_csgt_records_digitized: "",
        total_admin_records_digitized: "",
        total_firefighting_records_digitized: "",
        total_immigration_records_digitized: ""
    });

    const [stateDigitizedDocumentDetail, setStateDigitizedDocumentDetail] = useState({
        total_csgt_records_digitized: "",
        total_admin_records_digitized: "",
        total_firefighting_records_digitized: "",
        total_immigration_records_digitized: ""
    });

    const [stateInfoAdministrativeProceduresForm1, setStateInfoAdministrativeProceduresForm1] = useState({
        total_csgt_records: "",
        total_admin_records: "",
        total_firefighting_records: "",
        total_immigration_records: ""
    });

    const mutation = useMutationHooks(
        (data) => {
            const { 
                total_csgt_records_digitized,
                total_admin_records_digitized,
                total_firefighting_records_digitized,
                total_immigration_records_digitized
            } = data;

            const response = preJuly2022DigitizedService.importPreJuly2022Digitized({
                total_csgt_records_digitized,
                total_admin_records_digitized,
                total_firefighting_records_digitized,
                total_immigration_records_digitized
            });

            return response;
        }
    )

    const mutationUpdate = useMutationHooks(
        (data) => { 
            const { id, ...rests } = data;
            const response = preJuly2022DigitizedService.update(id, { ...rests });
            return response;
        }
    );

    const mutationDeleted = useMutationHooks(
        (data) => { 
          const { id } = data;
    
          const res = preJuly2022DigitizedService.deleteItem(id);
    
          return res;
        }
    );

    const mutationDeletedMultiple = useMutationHooks(
        (data) => { 
          const { ids } = data;
          const res = preJuly2022DigitizedService.deleteMultiple(ids);
    
          return res;
        }
    );

    const getInfoAdministrativeProceduresForm1 = async () => {
        // Gọi service với năm trước đó
        const response = await administrativeProceduresForm1Service.getInfoAdministrativeProceduresForm1();
        setStateInfoAdministrativeProceduresForm1({
            total_csgt_records: response?.data.total_csgt_records,
            total_admin_records: response?.data.total_admin_records,
            total_firefighting_records: response?.data.total_firefighting_records,
            total_immigration_records: response?.data.total_immigration_records
        });
        return response;
    };

    const queryInfoAdministrativeProceduresForm1 = useQuery({
        queryKey: ['infoAdministrativeProceduresForm1'],
        queryFn: () => getInfoAdministrativeProceduresForm1(),
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingInfoAdministrativeProceduresForm1, data: InfoAdministrativeProceduresForm1 } = queryInfoAdministrativeProceduresForm1;

    useEffect(() => {
        setStateInfoAdministrativeProceduresForm1({
            total_csgt_records: InfoAdministrativeProceduresForm1?.data.total_csgt_records,
            total_admin_records: InfoAdministrativeProceduresForm1?.data.total_admin_records,
            total_firefighting_records: InfoAdministrativeProceduresForm1?.data.total_firefighting_records,
            total_immigration_records: InfoAdministrativeProceduresForm1?.data.total_immigration_records
        });
    }, [isLoadingInfoAdministrativeProceduresForm1]);

    const handleCancel = () => {
        setIsModalOpen(false);
        setStatePreJuly2022Digitized({
            total_csgt_records_digitized: "",
            total_admin_records_digitized: "",
            total_firefighting_records_digitized: "",
            total_immigration_records_digitized: ""
        });

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;
    const { data: dataUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated, isPending: isPendingUpdated } = mutationUpdate;
    const { data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted, isPending: isLoadingDeleted } = mutationDeleted;
    const { data: dataDeletedMultiple, isSuccess: isSuccessDeletedMultiple, isError: isErrorDeletedMultiple, isPending: isLoadingDeletedMultiple } = mutationDeletedMultiple;

    const getAllDigitizedDocument = async (currentPage, pageSize, filters) => {
        const response = await preJuly2022DigitizedService.getAll(currentPage, pageSize, filters);
        return response;
    };

    const getAllDigitizedDocumentByAdmin = async (currentPage, pageSize, filters) => {
        const response = await preJuly2022DigitizedService.getAllByAdmin(currentPage, pageSize, filters);
        return response;
    };

    const queryDigitizedDocument = useQuery({
        queryKey: ['digitizedDocuments'],
        queryFn: () => user?.role === "admin" ? getAllDigitizedDocumentByAdmin(pagination.currentPage, pagination.pageSize, filters) : getAllDigitizedDocument(pagination.currentPage, pagination.pageSize, filters),
        retry: 3,
        retryDelay: 1000,
    });

    useEffect(() => {
        queryDigitizedDocument.refetch();
    }, [pagination]);

    const { isLoading: isLoadingDigitizedDocument, data: digitizedDocuments } = queryDigitizedDocument;

    useEffect(() => {
        if(isSuccess && data?.success) {
            message.success(data?.message);
            queryDigitizedDocument.refetch();
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
            message.success("Cập nhật thành công");
            queryDigitizedDocument.refetch();
            handleCloseDrawer();
        }
        else if (isError) {
            message.error("Có gì đó sai sai");
        }
        else if (isSuccess && !dataUpdated?.success) {
            message.error(dataUpdated?.message);
        }
    }, [isSuccessUpdated]);

    useEffect(() => {
        if(isSuccessDeleted && dataDeleted?.success) {
            message.success(`Xóa thành công`);
            queryDigitizedDocument.refetch();
            handleCancelDelete();
        }
        else if (isErrorDeleted) {
          message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeleted])

    useEffect(() => {
        if (isSuccessDeletedMultiple && dataDeletedMultiple) {
            if (dataDeletedMultiple.deletedData.deletedCount > 0) {
                message.success("Xóa data thành công");
                queryDigitizedDocument.refetch();
            } else {
                message.error("Không có data nào được xóa");
            }
        } else if (isErrorDeletedMultiple) {
            message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeletedMultiple, isErrorDeletedMultiple, dataDeletedMultiple]);

    const fetchGetDetailDigitizedDocument = async (rowSelected) => {
        const response = await preJuly2022DigitizedService.getDetail(rowSelected);
        
        if (response) {
            setStateDigitizedDocumentDetail({
                total_csgt_records_digitized: response.response[0].total_csgt_records_digitized,
                total_admin_records_digitized: response.response[0].total_admin_records_digitized,
                total_firefighting_records_digitized: response.response[0].total_firefighting_records_digitized,
                total_immigration_records_digitized: response.response[0].total_immigration_records_digitized
            })
        }
        setIsLoadingUpdate(false);
    }

    const validateRecords = () => {
        const { 
            total_csgt_records,
            total_admin_records,
            total_firefighting_records,
            total_immigration_records,
        } = stateInfoAdministrativeProceduresForm1;

        const {
            total_csgt_records_digitized,
            total_admin_records_digitized,
            total_firefighting_records_digitized,
            total_immigration_records_digitized
        } = statePreJuly2022Digitized;
        
        
        if (total_csgt_records && total_csgt_records_digitized) {
            if (parseInt(total_csgt_records, 10) < parseInt(total_csgt_records_digitized, 10)) {
                return {
                    valid: false,
                    message: `Tổng số hồ sơ CSGT: ${total_csgt_records}. Tổng số hồ sơ CSGT đã số hóa <= ${total_csgt_records}`
                };
            }
        }
    
        if (total_admin_records && total_admin_records_digitized) {
            if (parseInt(total_admin_records, 10) < parseInt(total_admin_records_digitized, 10)) {
                return {
                    valid: false,
                    message: `Tổng số hồ sơ hành chính: ${total_admin_records}. Tổng số hồ sơ hành chính đã số hóa <= ${total_admin_records}`
                };
            }
        }
    
        if (total_firefighting_records && total_firefighting_records_digitized) {
            if (parseInt(total_firefighting_records, 10) < parseInt(total_firefighting_records_digitized, 10)) {
                return {
                    valid: false,
                    message: `Tổng số hồ sơ PCCC: ${total_firefighting_records}. Tổng số hồ sơ PCCC đã số hóa <= ${total_firefighting_records}`
                };
            }
        }
    
        if (total_immigration_records && total_immigration_records_digitized) {
            if (parseInt(total_immigration_records, 10) < parseInt(total_immigration_records_digitized, 10)) {
                return {
                    valid: false,
                    message: `Tổng số hồ sơ xuất nhập cảnh: ${total_immigration_records}. Tổng số hồ sơ xuất nhập cảnh đã số hóa <= ${total_immigration_records}`
                };
            }
        }
    
        return { valid: true };
    };

    const onFinish = async () => {
        const validationResult = validateRecords();
        if (validationResult.valid) {
            mutation.mutate(statePreJuly2022Digitized);
        } else {
            message.error(validationResult.message);
        }
    }

    const onUpdateLetter = async () => {
        mutationUpdate.mutate(
            {
                id: rowSelected,
                ...stateDigitizedDocumentDetail
            }, 
            {
                onSettled: () => {
                    queryDigitizedDocument.refetch();
                }
            }
        );
    }

    const handleDeleteDigitizedDocument = () => {
        mutationDeleted.mutate(
          {
            id: rowSelected
          },
          {
            onSettled: () => {
                queryDigitizedDocument.refetch();
            }
          }
        )
    }

    const handleDeleteMultiple = (ids) => {
        mutationDeletedMultiple.mutate(
          {
            ids: ids,
          },
          {
            onSettled: () => {
                queryDigitizedDocument.refetch();
                setResetSelection(prevState => !prevState);
            }
          }
        )
    }

    useEffect(() => {
        if (digitizedDocuments?.digitizedDocuments) {
            const updatedDataTable = fetchDataForDataTable(digitizedDocuments);
            setDataTable(updatedDataTable);
        }
    }, [digitizedDocuments]);

    const fetchDataForDataTable = (digitizedDocumentData) => {
        return digitizedDocumentData?.digitizedDocuments?.map((digitizedDocument) => {
            return {
                ...digitizedDocument, 
                key: digitizedDocument._id,
                createdAt: <Moment format="DD/MM/YYYY HH:MM">{digitizedDocument.createdAt}</Moment>,
                updatedAt: <Moment format="DD/MM/YYYY HH:MM">{digitizedDocument.updatedAt}</Moment>
            };
        });
    };

    const handleOnChange = (name, value) => {
        setStatePreJuly2022Digitized({
            ...statePreJuly2022Digitized,
            [name]: value
        });
    };

    const handleOnChangeDetail = (name, value) => {
        setStateDigitizedDocumentDetail({
            ...stateDigitizedDocumentDetail,
            [name]: value
        });
    };

    useEffect(() => {
        drawerForm.setFieldsValue(stateDigitizedDocumentDetail)
    }, [stateDigitizedDocumentDetail, drawerForm])

    useEffect(() => {
        if (rowSelected) {
            setIsLoadingUpdate(true);
            fetchGetDetailDigitizedDocument(rowSelected);
        }
    }, [rowSelected])

    const handleDetailLetter = () => {
        setIsOpenDrawer(true);
    }

    useEffect(() => {
        queryDigitizedDocument.refetch();
        setIsLoadingResetFilter(false);
    }, [isLoadingResetFilter]);

    const handleResetAllFilter = () => {
        setIsLoadingResetFilter(true);
        setColumnFilters("");
        setFilters("");
    }

    const getColumnSearchProps = (dataIndex, placeholder) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <InputComponent
                    ref={searchInput}
                    placeholder={`Tìm kiếm ${placeholder}`}
                    value={columnFilters[dataIndex] || ''}
                    onChange={(e) => {
                        const newFilters = { ...columnFilters, [dataIndex]: e.target.value };
                        setColumnFilters(newFilters);
                        setSelectedKeys(e.target.value ? [e.target.value] : []);
                    }}
                    onPressEnter={() => handleSearch(columnFilters, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(columnFilters, confirm, dataIndex)}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{
                            width: 100,
                        }}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters, confirm, dataIndex)}
                            size="small"
                            style={{
                            width: 100,
                        }}
                    >
                        Xóa
                    </Button>
                </Space>
          </div>
        ),
        filterIcon: (filtered) => (
          <SearchOutlined
            style={{
              color: filtered ? '#1677ff' : undefined,
            }}
          />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
    });

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
            title: 'Đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('departmentName', 'đơn vị')
        },
        {
            title: 'Tổng số hồ sơ hệ lực lượng CSGT (Đã số hóa)',
            dataIndex: 'total_csgt_records_digitized',
            key: 'total_csgt_records_digitized',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            // ...getColumnSearchProps('total_csgt_records', 'năm')
        },
        {
            title: 'Tổng số hồ sơ hệ lực lượng Quản lý hành chính (Đã số hóa)',
            dataIndex: 'total_admin_records_digitized',
            key: 'total_admin_records_digitized',
            // sorter: (a, b) => a.year - b.year,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            // ...getColumnSearchProps('year', 'năm')
        },
        {
            title: 'Tổng số hồ sơ hệ lực lượng Phòng cháy chữa cháy (Đã số hóa)',
            dataIndex: 'total_firefighting_records_digitized',
            key: 'total_firefighting_records_digitized',
            // sorter: (a, b) => a.digitized_documents_count - b.digitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tổng số hồ sơ hệ lực lượng Xuất nhập cảnh (Đã số hóa)',
            dataIndex: 'total_immigration_records_digitized',
            key: 'total_immigration_records_digitized',
            // sorter: (a, b) => a.undigitized_documents_count - b.undigitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tổng',
            dataIndex: 'total_digitized',
            key: 'total_digitized',
            // sorter: (a, b) => a.undigitized_documents_count - b.undigitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Ngày nhập',
            dataIndex: 'createdAt',
            key: 'createdAt',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        }
    ];

    // Conditionally add the "action" column if the user's role is "admin"
    if (user?.role === "admin") {
        columns.push({
            title: buttonReloadTable,
            dataIndex: 'action',
            render: renderAction
        });
    }

    const handleSearch = async (selectedKeys, confirm, dataIndex) => {
        setFilters(prevFilters => {
            const updatedFilters = {
                ...prevFilters,
                [dataIndex]: selectedKeys[dataIndex]
            };
            return updatedFilters;
        });

        // Tiếp tục với cuộc gọi hàm getAllDigitizedDocument và truyền filters vào đó.
        getAllDigitizedDocument(pagination.currentPage, pagination.pageSize, filters)
        .then(response => {
            // Xử lý response...
            queryDigitizedDocument.refetch();
        })
        .catch(error => {
            message.error(error);
        });
        confirm();
    }; 
    
    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters();
        
        setColumnFilters(prevColumnFilters => {
            const updatedColumnFilters = { ...prevColumnFilters };
            delete updatedColumnFilters[dataIndex];
            return updatedColumnFilters;
        });
        setFilters(prevFilters => {
            const updatedFilters = { ...prevFilters };
            delete updatedFilters[dataIndex];
            return updatedFilters;
        });

        // Tiếp tục với cuộc gọi hàm getAllDigitizedDocument và truyền filters vào đó để xóa filter cụ thể trên server.
        getAllDigitizedDocument(pagination.currentPage, pagination.pageSize, filters)
            .then(response => {
                // Xử lý response nếu cần
                queryDigitizedDocument.refetch();
            })
            .catch(error => {
                // Xử lý lỗi nếu có
                message.error(error);
            });
        confirm();
    };

    const handlePageChange = (page, pageSize) => {
        setPagination({
            ...pagination,
            currentPage: page,
            pageSize: pageSize
        });
    };

    const handleKeyPress = (e) => {
        // Cho phép các phím số, phím mũi tên lên, xuống, và phím xóa
        const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ArrowUp', 'ArrowDown', 'Backspace', 'Tab'];
    
        if (!allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    }

    // Đóng DrawerComponent
    const handleCloseDrawer = () => {
        // fetchGetDetailDigitizedDocument(rowSelected);
        setIsOpenDrawer(false);
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setStatePreJuly2022Digitized({
            ...statePreJuly2022Digitized
        });
    };

    return (
        <div>
            <WrapperHeader style={{marginTop: "20px"}}>NHẬP SỐ LIỆU SỐ HÓA HỒ SƠ GIẢI QUYẾT THỦ TỤC HÀNH CHÍNH (ĐÃ SỐ HÓA)</WrapperHeader>
            <WrapperHeader style={{marginTop: "20px", color: "red"}}>*Lưu ý: Mỗi tháng sẽ phải cập nhật thông tin ở Form này</WrapperHeader>
            {user?.role !== "admin" && (
                <div style={{display: "flex", gap: "20px", marginTop: "10px" }}>
                    <Row gutter={[16, 16]}> {/* Tạo hàng mới với khoảng cách giữa các cột */}
                        <Col flex="1"> {/* Cột đầu tiên */}
                            <Button type="primary" style={{ display: "flex", alignItems: "center", height: "50px", borderRadius: "6px" }} onClick={() => handleOpenModal()}>
                                <strong>Nhập số liệu giai đoạn 01/07/2022 trở về trước còn hiệu lực</strong>
                            </Button>
                        </Col>
                    </Row>
                </div>
            )}
            <div style={{ marginTop: '20px' }}>
                <TableComponent handleDeleteMultiple={handleDeleteMultiple} columns={columns} data={dataTable} isLoading={isLoadingDigitizedDocument || isLoadingResetFilter} resetSelection={resetSelection}
                    pagination={{
                        current: pagination.currentPage,
                        pageSize: pagination.pageSize,
                        total: digitizedDocuments?.totalRecord,
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
            </div>
            <ModalComponent form={modalForm} forceRender width={1100} title="Nhập số liệu giai đoạn 01/07/2022 trở về trước còn hiệu lực" open={isModalOpen} onCancel={handleCancel} footer={null}>
                <Form
                    name="modalForm"
                    labelCol={{ span: 9 }}
                    wrapperCol={{ span: 20 }}
                    style={{ maxWidth: 1100 }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    autoComplete="on"
                    form={modalForm}
                >
                    <Form.Item
                        label="Tổng số hồ sơ hệ lực lượng CSGT đã số hóa"
                        name="total_csgt_records_digitized"
                        rules={[{ required: true, message: 'Vui lòng nhập số hồ sơ hệ lực lượng CSGT!' }]}
                    >
                        <InputComponent type="number" name="total_csgt_records_digitized" value={statePreJuly2022Digitized.total_csgt_records_digitized} onChange={(e) => handleOnChange('total_csgt_records_digitized', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                    </Form.Item>
                    <Form.Item
                        label="Tổng số hồ sơ hệ lực lượng Quản lý hành chính đã số hóa"
                        name="total_admin_records_digitized"
                        rules={[{ required: true, message: 'Vui lòng nhập số hồ sơ hệ lực lượng Quản lý hành chính!' }]}
                    >
                        <InputComponent type="number" name="total_admin_records_digitized" value={statePreJuly2022Digitized.total_admin_records_digitized} onChange={(e) => handleOnChange('total_admin_records_digitized', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                    </Form.Item>
                    <Form.Item
                        label="Tổng số hồ sơ hệ lực lượng Phòng cháy chữa cháy đã số hóa"
                        name="total_firefighting_records_digitized"
                        rules={[{ required: true, message: 'Vui lòng nhập số hồ sơ hệ lực lượng Phòng cháy chữa cháy!' }]}
                    >
                        <InputComponent type="number" name="total_firefighting_records_digitized" value={statePreJuly2022Digitized.total_firefighting_records_digitized} onChange={(e) => handleOnChange('total_firefighting_records_digitized', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                    </Form.Item>
                    <Form.Item
                        label="Tổng số hồ sơ hệ lực lượng Xuất nhập cảnh đã số hóa"
                        name="total_immigration_records_digitized"
                        rules={[{ required: true, message: 'Vui lòng nhập số hồ sơ hệ lực lượng Xuất nhập cảnh!' }]}
                    >
                        <InputComponent type="number" name="total_immigration_records_digitized" value={statePreJuly2022Digitized.total_immigration_records_digitized} onChange={(e) => handleOnChange('total_immigration_records_digitized', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 21, span: 24 }}>
                        <Button type="primary" htmlType="submit">Lưu số liệu</Button>
                    </Form.Item>
                </Form>
            </ModalComponent>
            <DrawerComponent form={drawerForm} title="Chi tiết" isOpen={isOpenDrawer} onClose={handleCloseDrawer} width="70%">
                <Loading isLoading = {isLoadingUpdate}>
                    <Form
                        name="drawerForm"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 15 }}
                        style={{ maxWidth: 1000 }}
                        initialValues={{ remember: true }}
                        onFinish={onUpdateLetter}
                        autoComplete="on"
                        form={drawerForm}
                    >
                        <Form.Item
                            label="Tổng số hồ sơ hệ lực lượng CSGT đã số hóa"
                            name="total_csgt_records_digitized"
                            rules={[{ required: true, message: 'Vui lòng nhập số hồ sơ hệ lực lượng CSGT!' }]}
                        >
                            <InputComponent type="number" name="total_csgt_records_digitized" value={stateDigitizedDocumentDetail.total_csgt_records_digitized} onChange={(e) => handleOnChangeDetail('total_csgt_records_digitized', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                        </Form.Item>
                        <Form.Item
                            label="Tổng số hồ sơ hệ lực lượng Quản lý hành chính đã số hóa"
                            name="total_admin_records_digitized"
                            rules={[{ required: true, message: 'Vui lòng nhập số hồ sơ hệ lực lượng Quản lý hành chính!' }]}
                        >
                            <InputComponent type="number" name="total_admin_records_digitized" value={stateDigitizedDocumentDetail.total_admin_records_digitized} onChange={(e) => handleOnChangeDetail('total_admin_records_digitized', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                        </Form.Item>
                        <Form.Item
                            label="Tổng số hồ sơ hệ lực lượng Phòng cháy chữa cháy đã số hóa"
                            name="total_firefighting_records_digitized"
                            rules={[{ required: true, message: 'Vui lòng nhập số hồ sơ hệ lực lượng Phòng cháy chữa cháy!' }]}
                        >
                            <InputComponent type="number" name="total_firefighting_records_digitized" value={stateDigitizedDocumentDetail.total_firefighting_records_digitized} onChange={(e) => handleOnChangeDetail('total_firefighting_records_digitized', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                        </Form.Item>
                        <Form.Item
                            label="Tổng số hồ sơ hệ lực lượng Xuất nhập cảnh đã số hóa"
                            name="total_immigration_records_digitized"
                            rules={[{ required: true, message: 'Vui lòng nhập số hồ sơ hệ lực lượng Xuất nhập cảnh!' }]}
                        >
                            <InputComponent type="number" name="total_immigration_records_digitized" value={stateDigitizedDocumentDetail.total_immigration_records_digitized} onChange={(e) => handleOnChangeDetail('total_immigration_records_digitized', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 19, span: 24 }}>
                            <Button type="primary" htmlType="submit">Cập nhật</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>
            <ModalComponent width={400} title="Xóa" open={isModalOpenDelete} onCancel={handleCancelDelete} onOk={handleDeleteDigitizedDocument}>
                <Loading isLoading={isLoadingDeleted}>
                    <div>Bạn có muốn xóa số liệu này không?</div>
                </Loading>
            </ModalComponent>
        </div>
    )
}