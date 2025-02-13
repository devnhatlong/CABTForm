import React, { useState, useEffect, useRef } from 'react';
import { WrapperHeader } from './style';
import { Button, Form, Space, Row, Col } from "antd";
import TableComponent from '../TableComponent/TableComponent';
import InputComponent from '../InputComponent/InputComponent';
import ModalComponent from '../ModalComponent/ModalComponent';
import updateDigitizedDocumentFixService from '../../services/updateDigitizedDocumentFixService';
import digitizedDocumentFixService from '../../services/digitizedDocumentFixService';
import { useMutationHooks } from '../../hooks/useMutationHook';
import { SearchOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import * as message from '../Message/Message';
import { useQuery } from '@tanstack/react-query';
import DrawerComponent from '../DrawerComponent/DrawerComponent';
import Loading from '../LoadingComponent/Loading';
import Moment from 'react-moment';

export const UpdateDigitizedDocumentFix = () => {
    const [modalForm] = Form.useForm();
    const [drawerForm] = Form.useForm();
    const currentYear = new Date().getFullYear();
    // const lastYear = currentYear - 1;
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

    const [stateDigitizedDocumentInitial, setStateDigitizedDocumentInitial] = useState({
        year: "",
        total_documents_count: "",
        digitized_documents_count: "",
        digitized_documents_count_current: ""
    });

    const [stateDigitizedDocument, setStateDigitizedDocument] = useState({
        year: "",
        total_documents_count: "",
        digitized_documents_count: "",
        digitized_documents_count_current: ""
    });

    const [stateUpdateDigitizedDocument, setStateUpdateDigitizedDocument] = useState({
        year: "",
        total_documents_count: "",
        digitized_documents_count: "",
        digitized_documents_count_current: ""
    });

    const [stateDigitizedDocumentDetail, setStateDigitizedDocumentDetail] = useState({
        year: "",
        total_documents_count: "",
        digitized_documents_count: "",
        digitized_documents_count_current: ""
    });

    useEffect(() => {
        modalForm.setFieldsValue({
            year: stateDigitizedDocumentInitial ? stateDigitizedDocumentInitial.year : stateDigitizedDocument.year,
            total_documents_count: stateDigitizedDocumentInitial ? stateDigitizedDocumentInitial.total_documents_count : stateDigitizedDocument.total_documents_count,
            digitized_documents_count: stateDigitizedDocumentInitial.digitized_documents_count_current ? stateDigitizedDocumentInitial.digitized_documents_count_current : stateDigitizedDocumentInitial.digitized_documents_count
        });
    }, [isModalOpen]);

    const mutation = useMutationHooks(
        (data) => {
            const { 
                year,
                total_documents_count,
                digitized_documents_count,
                digitized_documents_count_current
            } = data;

            const response = updateDigitizedDocumentFixService.importDigitizedDocumentByYear({
                year,
                total_documents_count,
                digitized_documents_count,
                digitized_documents_count_current
            });

            return response;
        }
    )

    const mutationUpdate = useMutationHooks(
        (data) => { 
            const { id, ...rests } = data;
            const response = updateDigitizedDocumentFixService.updateDigitizedDocument(id, { ...rests });
            return response;
        }
    );

    const mutationDeleted = useMutationHooks(
        (data) => { 
          const { id } = data;
    
          const res = updateDigitizedDocumentFixService.deleteDigitizedDocument(id);
    
          return res;
        }
    );

    const mutationDeletedMultiple = useMutationHooks(
        (data) => { 
          const { ids } = data;
          const res = updateDigitizedDocumentFixService.deleteMultipleDigitizedDocument(ids);
    
          return res;
        }
    );

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateDigitizedDocument({
            year: "",
            total_documents_count: "",
            digitized_documents_count: "",
            digitized_documents_count_current: "",
        });

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;
    const { data: dataUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated, isPending: isPendingUpdated } = mutationUpdate;
    const { data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted, isPending: isLoadingDeleted } = mutationDeleted;
    const { data: dataDeletedMultiple, isSuccess: isSuccessDeletedMultiple, isError: isErrorDeletedMultiple, isPending: isLoadingDeletedMultiple } = mutationDeletedMultiple;

    const getAllDigitizedDocument = async (currentPage, pageSize, filters) => {
        const response = await digitizedDocumentFixService.getAllDigitizedDocument(currentPage, pageSize, filters);
        setStateDigitizedDocumentInitial(response?.digitizedDocuments[response.digitizedDocuments.length - 1]); // luôn lấy thằng mới nhất trong mảng
        return response;
    };
    
    const getAllUpdateDigitizedDocument = async (currentPage, pageSize, filters) => {
        const response = await updateDigitizedDocumentFixService.getAllUpdateDigitizedDocument(currentPage, pageSize, filters);
        setStateUpdateDigitizedDocument(response?.digitizedDocuments[0]);
        return response;
    };

    const getAllDigitizedDocumentByAdmin = async (currentPage, pageSize, filters) => {
        const response = await updateDigitizedDocumentFixService.getAllDigitizedDocumentByAdmin(currentPage, pageSize, filters);
        return response;
    };

    const queryDigitizedDocument = useQuery({
        queryKey: ['digitizedDocuments'],
        queryFn: () => user?.role === "admin" ? getAllDigitizedDocumentByAdmin(pagination.currentPage, pagination.pageSize, filters) : getAllDigitizedDocument(pagination.currentPage, pagination.pageSize, filters),
        retry: 3,
        retryDelay: 1000,
    });

    const queryUpdateDigitizedDocument = useQuery({
        queryKey: ['updateDigitizedDocuments'],
        queryFn: () => user?.role === "admin" ? getAllDigitizedDocumentByAdmin(pagination.currentPage, pagination.pageSize, filters) : getAllUpdateDigitizedDocument(pagination.currentPage, pagination.pageSize, filters),
        retry: 3,
        retryDelay: 1000,
    });

    useEffect(() => {
        queryUpdateDigitizedDocument.refetch();
    }, [pagination]);

    const { isLoading: isLoadingDigitizedDocument, data: digitizedDocuments } = queryDigitizedDocument;
    const { isLoading: isLoadingUpdateDigitizedDocument, data: updateDigitizedDocuments } = queryUpdateDigitizedDocument;

    useEffect(() => {
        if(isSuccess && data?.success) {
            message.success(data?.message);
            queryDigitizedDocument.refetch();
            queryUpdateDigitizedDocument.refetch();
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
            queryUpdateDigitizedDocument.refetch();
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
            queryUpdateDigitizedDocument.refetch();
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
                queryUpdateDigitizedDocument.refetch();
            } else {
                message.error("Không có data nào được xóa");
            }
        } else if (isErrorDeletedMultiple) {
            message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeletedMultiple, isErrorDeletedMultiple, dataDeletedMultiple]);

    const fetchGetDetailDigitizedDocument = async (rowSelected) => {
        const response = await updateDigitizedDocumentFixService.getDetailDigitizedDocument(rowSelected);
        
        if (response) {
            setStateDigitizedDocumentDetail({
                year: response.response[0].year,
                total_documents_count: response.response[0].total_documents_count,
                digitized_documents_count: response.response[0].digitized_documents_count,
                digitized_documents_count_current: response.response[0].digitized_documents_count_current
            })
        }
        setIsLoadingUpdate(false);
    }

    const onFinish = async () => {
        if (validateRecords()) {
            mutation.mutate(stateDigitizedDocument);
        }
        else {
            message.error('tổng số hồ sơ đã số hóa <= tổng số hồ sơ đã số hóa thời điểm hiện tại <= tổng số hồ sơ');
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
                    queryUpdateDigitizedDocument.refetch();
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
                queryUpdateDigitizedDocument.refetch();
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
                queryUpdateDigitizedDocument.refetch();
                setResetSelection(prevState => !prevState);
            }
          }
        )
    }

    useEffect(() => {
        if (updateDigitizedDocuments?.digitizedDocuments) {
            // setStateDigitizedDocumentInitial(updateDigitizedDocuments?.digitizedDocuments);
            const updatedDataTable = fetchDataForDataTable(updateDigitizedDocuments);
            setDataTable(updatedDataTable);
        }
    }, [isLoadingUpdateDigitizedDocument, updateDigitizedDocuments]);

    // useEffect(() => {
    //     if (digitizedDocuments?.digitizedDocuments) {
    //         setStateDigitizedDocumentInitial(digitizedDocuments?.digitizedDocuments[0]);
    //     }
    // }, [isLoadingDigitizedDocument]);

    const fetchDataForDataTable = (digitizedDocumentData) => {
        return digitizedDocumentData?.digitizedDocuments?.map((digitizedDocument) => {
            return {
                ...digitizedDocument, 
                key: digitizedDocument._id,
                digitization_percentage: `${digitizedDocument.digitization_percentage}%`,
                createdAt: <Moment format="DD/MM/YYYY HH:MM">{digitizedDocument.createdAt}</Moment>,
                updatedAt: <Moment format="DD/MM/YYYY HH:MM">{digitizedDocument.updatedAt}</Moment>
            };
        });
    };

    const handleOnChange = (name, value) => {
        setStateDigitizedDocument({
            ...stateDigitizedDocument,
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
        queryUpdateDigitizedDocument.refetch();
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
            ...getColumnSearchProps('departmentName', 'năm')
        },
        {
            title: 'Năm',
            dataIndex: 'year',
            key: 'year',
            sorter: (a, b) => a.year - b.year,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('year', 'năm')
        },
        {
            title: 'Số tài liệu đã số hóa',
            dataIndex: 'digitized_documents_count_current',
            key: 'digitized_documents_count_current',
            sorter: (a, b) => a.digitized_documents_count_current - b.digitized_documents_count_current,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Số tài liệu chưa số hóa ',
            dataIndex: 'undigitized_documents_count',
            key: 'undigitized_documents_count',
            sorter: (a, b) => a.undigitized_documents_count - b.undigitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tổng số tài liệu',
            dataIndex: 'total_documents_count',
            key: 'total_documents_count',
            sorter: (a, b) => a.total_documents_count - b.total_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tỉ lệ đã số hóa',
            dataIndex: 'digitization_percentage',
            key: 'digitization_percentage',
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
            queryUpdateDigitizedDocument.refetch();
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
                queryUpdateDigitizedDocument.refetch();
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

    const handleOpenModal = (year) => {
        setIsModalOpen(true);
        setStateDigitizedDocument({
            ...stateDigitizedDocument,
            year: year,
            total_documents_count: stateDigitizedDocumentInitial.total_documents_count,
            digitized_documents_count: stateDigitizedDocumentInitial.digitized_documents_count
        });
    };

    // Đóng DrawerComponent
    const handleCloseDrawer = () => {
        // fetchGetDetailDigitizedDocument(rowSelected);
        setIsOpenDrawer(false);
    };

    const validateRecords = () => {
        const { total_documents_count, digitized_documents_count, digitized_documents_count_current } = stateDigitizedDocument;
        if (total_documents_count && digitized_documents_count && digitized_documents_count_current) {
            const totalDocumentsCount = parseInt(total_documents_count, 10);
            const digitizedDocumentsCount = parseInt(digitized_documents_count, 10);
            const digitizedDocumentsCountCurrent = parseInt(digitized_documents_count_current, 10);

            return (
                digitizedDocumentsCountCurrent >= digitizedDocumentsCount &&
                digitizedDocumentsCountCurrent <= totalDocumentsCount
            );
        }
        return true;
    };

    return (
        <div>
            <WrapperHeader style={{marginTop: "20px"}}>Cập nhật số liệu số hóa từ năm 2018 - 2023 đến thời điểm hiện tại</WrapperHeader>
            <WrapperHeader style={{marginTop: "20px", color: "red"}}>*Lưu ý: Mỗi tháng vô form này để cập nhật</WrapperHeader>
            {user?.role !== "admin" && (
                <div style={{display: "flex", gap: "20px", marginTop: "10px" }}>
                    <Row gutter={[16, 16]}> {/* Tạo hàng mới với khoảng cách giữa các cột */}
                        <Col flex="1"> {/* Cột đầu tiên */}
                            <Button type="primary" style={{ display: "flex", alignItems: "center", height: "50px", borderRadius: "6px" }} onClick={() => handleOpenModal("2018-2023")}
                            disabled={digitizedDocuments?.totalRecord === 0}>
                                <strong>Nhập số liệu số hóa từ năm 2018 - 2023 đến thời điểm hiện tại</strong>
                            </Button>
                        </Col>
                    </Row>
                </div>
            )}
            <ModalComponent form={modalForm} forceRender width={1300} title="Nhập số liệu từ năm 2018 - 2023" open={isModalOpen} onCancel={handleCancel} footer={null}>
                <Form
                    name="modalForm"
                    labelCol={{ span: 9 }}
                    wrapperCol={{ span: 20 }}
                    style={{ maxWidth: 1300 }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    autoComplete="on"
                    form={modalForm}
                >
                    <Form.Item
                            label="Năm"
                            name="year"
                            rules={[{ required: true, message: 'Vui lòng nhập năm!' }]}
                        >
                            <InputComponent type="text" name="year" value={stateDigitizedDocument.year} disabled/>
                        </Form.Item>
                    <Form.Item
                        label="Tổng số tài liệu (từ năm 2018 - 2023)"
                        name="total_documents_count"
                        rules={[{ required: true, message: 'Vui lòng nhập tổng số tài liệu!' }]}
                    >
                        <InputComponent type="number" name="total_documents_count" value={stateDigitizedDocument?.total_documents_count} disabled/>
                    </Form.Item>
                    <Form.Item
                        label="Tổng số tài liệu đã số hóa (từ năm 2018 - 2023)"
                        name="digitized_documents_count"
                        rules={[{ required: true, message: 'Vui lòng nhập số tài liệu đã số hóa!' }]}
                    >
                        <InputComponent type="number" name="digitized_documents_count" value={stateDigitizedDocument.digitized_documents_count} disabled/>
                    </Form.Item>
                    <Form.Item
                        label="Tổng số tài liệu đã số hóa (từ năm 2018 - 2023) đến thời điểm hiện tại"
                        name="digitized_documents_count_current"
                        rules={[{ required: true, message: 'Vui lòng nhập số tài liệu đã số hóa!' }]}
                    >
                        <InputComponent type="number" name="digitized_documents_count_current" value={stateDigitizedDocument.digitized_documents_count_current} onChange={(e) => handleOnChange('digitized_documents_count_current', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 22, span: 24 }}>
                        <Button type="primary" htmlType="submit">Lưu số liệu</Button>
                    </Form.Item>
                </Form>
            </ModalComponent>
            <div style={{ marginTop: '20px' }}>
                <TableComponent handleDeleteMultiple={handleDeleteMultiple} columns={columns} data={dataTable} isLoading={isLoadingUpdateDigitizedDocument || isLoadingResetFilter} resetSelection={resetSelection}
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
                            label="Năm"
                            name="year"
                            rules={[{ required: true, message: 'Vui lòng nhập năm!' }]}
                        >
                            <InputComponent type="text" name="year" value={stateDigitizedDocumentDetail.year} onChange={(e) => handleOnChangeDetail('year', e.target.value)} disabled/>
                        </Form.Item>
                        <Form.Item
                            label="Tổng số hồ sơ"
                            name="total_documents_count"
                            rules={[{ required: true, message: 'Vui lòng nhập tổng số hồ sơ!' }]}
                        >
                            <InputComponent type="number" name="total_documents_count" value={stateDigitizedDocumentDetail.total_documents_count} onChange={(e) => handleOnChangeDetail('total_documents_count', e.target.value)} disabled/>
                        </Form.Item>
                        <Form.Item
                            label="Số tài liệu đã số hóa"
                            name="digitized_documents_count"
                            rules={[{ required: true, message: 'Vui lòng nhập số tài liệu đã số hóa!' }]}
                        >
                            <InputComponent type="number" name="digitized_documents_count" value={stateDigitizedDocumentDetail.digitized_documents_count} onChange={(e) => handleOnChangeDetail('digitized_documents_count', e.target.value)} disabled/>
                        </Form.Item>
                        <Form.Item
                        label="Tổng số tài liệu đã số hóa đến thời điểm hiện tại"
                        name="digitized_documents_count_current"
                        rules={[{ required: true, message: 'Vui lòng nhập số tài liệu đã số hóa!' }]}
                    >
                        <InputComponent type="number" name="digitized_documents_count_current" value={stateDigitizedDocumentDetail.digitized_documents_count_current} onChange={(e) => handleOnChangeDetail('digitized_documents_count_current', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
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