import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { WrapperHeader } from './style';
import { Button, Form, Space, Upload } from "antd";
import TableComponent from '../TableComponent/TableComponent';
import InputComponent from '../InputComponent/InputComponent';
import ModalComponent from '../ModalComponent/ModalComponent';
import departmentService from '../../services/departmentService';
import Loading from '../LoadingComponent/Loading';
import * as message from '../Message/Message';
import { useMutationHooks } from '../../hooks/useMutationHook';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux'
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons'
import DrawerComponent from '../DrawerComponent/DrawerComponent';
import ExcelJS from 'exceljs';

export const AdminDepartment = () => {
    const [modalForm] = Form.useForm();
    const [drawerForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState();
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [isLoadingResetFilter, setIsLoadingResetFilter] = useState(false);
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
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

    const [stateDepartment, setStateDepartment] = useState({
        departmentCode: "",
        departmentName: "",
    });

    const [stateDepartmentDetail, setStateDepartmentDetail] = useState({
        departmentCode: "",
        departmentName: "",
    });

    const mutation = useMutationHooks(
        (data) => {
            const { 
                departmentCode,
                departmentName
            } = data;

            const response = departmentService.createDepartment({
                departmentCode,
                departmentName
            });

            return response;
        }
    )

    const mutationUpdate = useMutationHooks(
        (data) => { 
            const { id, ...rests } = data;
            const response = departmentService.updateDepartment(id, { ...rests });
            return response;
        }
    );
    
    const mutationDeleted = useMutationHooks(
        (data) => { 
          const { id } = data;
    
          const res = departmentService.deleteDepartment(id);
    
          return res;
        }
    );

    const mutationDeletedMultiple = useMutationHooks(
        (data) => { 
          const { ids } = data;
          const res = departmentService.deleteMultipleDepartments(ids);
    
          return res;
        }
    );

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateDepartment({
            departmentCode: "",
            departmentName: ""
        });

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;
    const { data: dataUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated, isPending: isPendingUpdated } = mutationUpdate;
    const { data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted, isPending: isLoadingDeleted } = mutationDeleted;
    const { data: dataDeletedMultiple, isSuccess: isSuccessDeletedMultiple, isError: isErrorDeletedMultiple, isPending: isLoadingDeletedMultiple } = mutationDeletedMultiple;

    const getAllDepartment = async (currentPage, pageSize, filters) => {
        const response = await departmentService.getAllDepartment(currentPage, pageSize, filters);
        return response;
    };

    const fetchGetDetailDepartment = async (rowSelected) => {
        const response = await departmentService.getDetailDepartment(rowSelected);
        
        if (response?.department) {
            setStateDepartmentDetail({
                departmentCode: response?.department?.departmentCode,
                departmentName: response?.department?.departmentName
            })
        }
        setIsLoadingUpdate(false);
    }

    useLayoutEffect(() => {
        const handleTouchStart = (e) => {
            // Xử lý sự kiện touchstart ở đây
            e.preventDefault();
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
        };
    }, []);

    useEffect(() => {
        drawerForm.setFieldsValue(stateDepartmentDetail)
    }, [stateDepartmentDetail, drawerForm])

    useEffect(() => {
        if (rowSelected) {
            setIsLoadingUpdate(true);
            fetchGetDetailDepartment(rowSelected);
        }
    }, [rowSelected])

    const handleDetailLetter = () => {
        setIsOpenDrawer(true);
    }

    useEffect(() => {
        queryLetter.refetch();
        setIsLoadingResetFilter(false);
    }, [isLoadingResetFilter]);

    const handleResetAllFilter = () => {
        setIsLoadingResetFilter(true);
        setColumnFilters("");
        setFilters("");
    }

    const queryLetter = useQuery({
        queryKey: ['departments'],
        queryFn: () => getAllDepartment(pagination.currentPage, pagination.pageSize, filters),
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingLetter, data: departments } = queryLetter;

    useEffect(() => {
        if(isSuccess && data?.success) {
            message.success("Tạo đơn vị / phòng ban thành công");
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
            message.success("Cập nhật đơn vị / phòng ban thành công");
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
            message.success(`Đã xóa đơn vị / phòng ban: ${dataDeleted.deletedUser.userName}`);
            handleCancelDelete();
        }
        else if (isErrorDeleted) {
          message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeleted])

    useEffect(() => {
        if (isSuccessDeletedMultiple && dataDeletedMultiple) {
            if (dataDeletedMultiple.deletedLetter.deletedCount > 0) {
                message.success("Xóa đơn vị / phòng ban thành công");
            } else {
                message.error("Không có đơn vị / phòng ban nào được xóa");
            }
        } else if (isErrorDeletedMultiple) {
            message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeletedMultiple, isErrorDeletedMultiple, dataDeletedMultiple]);

    useEffect(() => {
        queryLetter.refetch();
    }, [pagination]);

    const onFinish = async () => {
        mutation.mutate(stateDepartment, {
            onSettled: () => {
                queryLetter.refetch();
            }
        });
    }

    const onUpdateLetter = async () => {
        mutationUpdate.mutate(
            {
                id: rowSelected,
                ...stateDepartmentDetail
            }, 
            {
                onSettled: () => {
                    queryLetter.refetch();
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
                queryLetter.refetch();
            }
          }
        )
    }

    const handleDeleteMultipleUsers = (ids) => {
        mutationDeletedMultiple.mutate(
          {
            ids: ids,
          },
          {
            onSettled: () => {
                queryLetter.refetch();
                setResetSelection(prevState => !prevState);
            }
          }
        )
    }

    useEffect(() => {
        if (departments?.departments) {
            const updatedDataTable = fetchDataForDataTable(departments);
            setDataTable(updatedDataTable);
        }
    }, [departments]);

    const fetchDataForDataTable = (departmentData) => {
        return departmentData?.departments?.map((department) => {
            return {
                ...department, 
                key: department._id,
                createdAt: new Date(department.createdAt),
                updatedAt: new Date(department.updatedAt),
            };
        });
    };

    const handleOnChange = (name, value) => {
        setStateDepartment({
            ...stateDepartment,
            [name]: value
        });
    };

    const handleOnChangeDetail = (name, value) => {
        setStateDepartmentDetail({
            ...stateDepartmentDetail,
            [name]: value
        });
    };

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
            title: 'Mã phòng',
            dataIndex: 'departmentCode',
            key: 'departmentCode',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('departmentCode', 'mã phòng')
        },
        {
            title: 'Tên phòng',
            dataIndex: 'departmentName',
            key: 'departmentName',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('departmentName', 'tên phòng')
        },
        {
          title: buttonReloadTable,
          dataIndex: 'action',
          render: renderAction
        },
    ];

    const handleSearch = async (selectedKeys, confirm, dataIndex) => {
        setFilters(prevFilters => {
            const updatedFilters = {
                ...prevFilters,
                [dataIndex]: selectedKeys[dataIndex]
            };
            return updatedFilters;
        });

        // Tiếp tục với cuộc gọi hàm getAllDepartment và truyền filters vào đó.
        getAllDepartment(pagination.currentPage, pagination.pageSize, filters)
        .then(response => {
            // Xử lý response...
            queryLetter.refetch();
        })
        .catch(error => {
            message.error(error);
        });
        confirm();
    }; 
    
    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters();
        
        if (dataIndex === "ngayDen") {
            setColumnFilters(prevColumnFilters => {
                const updatedColumnFilters = { ...prevColumnFilters };
                return updatedColumnFilters;
            });

            setFilters(prevFilters => {
                const updatedFilters = { ...prevFilters };
                return updatedFilters;
            });
        }
        else {
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
        }

        // Tiếp tục với cuộc gọi hàm getAllDepartment và truyền filters vào đó để xóa filter cụ thể trên server.
        getAllDepartment(pagination.currentPage, pagination.pageSize, filters)
            .then(response => {
                // Xử lý response nếu cần
                queryLetter.refetch();
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

    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    }

    // Đóng DrawerComponent
    const handleCloseDrawer = () => {
        fetchGetDetailDepartment(rowSelected);
        setIsOpenDrawer(false);
    };

    return (
        <div>
            <WrapperHeader>Quản lý đơn vị / phòng ban</WrapperHeader>
            <div style={{display: "flex", gap: "20px", marginTop: "10px" }}>
                <Button style={{height: "90px", width: "90px", borderRadius: "6px", borderStyle: "dashed"}} onClick={() => setIsModalOpen(true)}>
                    <div>Thêm</div>
                    <PlusOutlined style={{fontSize: "40px", color: "#1677ff"}} />
                </Button>
                {/* <Upload
                    beforeUpload={(file) => {
                        handleExcelUpload(file);
                        return false; // Prevent default Ant Design upload behavior
                    }}
                    showUploadList={false} // Hide default upload list
                >
                    <Button icon={<UploadOutlined />} type="primary">Upload Excel</Button>
                </Upload> */}
            </div>
            <div style={{ marginTop: '20px' }}>
                <TableComponent handleDeleteMultiple={handleDeleteMultipleUsers} columns={columns} data={dataTable} isLoading={isLoadingLetter || isLoadingResetFilter} resetSelection={resetSelection}
                    pagination={{
                        current: pagination.currentPage,
                        pageSize: pagination.pageSize,
                        total: departments?.totalRecord,
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
            <ModalComponent form={modalForm} forceRender width={500} title="Tạo đơn vị / phòng ban" open={isModalOpen} onCancel={handleCancel} footer={null}>
                <Loading isLoading = {isPending}>
                    <Form
                        name="modalForm"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 17 }}
                        style={{ maxWidth: 1000 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        autoComplete="on"
                        form={modalForm}
                    >
                        <Form.Item
                            label="Mã phòng"
                            name="departmentCode"
                            rules={[{ required: true, message: 'Vui lòng nhập mã phòng!' }]}
                        >
                            <InputComponent name="departmentCode" value={stateDepartment.departmentCode} onChange={(e) => handleOnChange('departmentCode', e.target.value)} />
                        </Form.Item>

                        <Form.Item
                            label="Tên phòng"
                            name="departmentName"
                            rules={[{ required: true, message: 'Vui lòng nhập tên phòng!' }]}
                        >
                            <InputComponent name="departmentName" value={stateDepartment.departmentName} onChange={(e) => handleOnChange('departmentName', e.target.value)} />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 14, span: 24 }}>
                            <Button type="primary" htmlType="submit">Tạo đơn vị / phòng ban</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </ModalComponent>
            <DrawerComponent form={drawerForm} title="Chi tiết đơn vị / phòng ban" isOpen={isOpenDrawer} onClose={handleCloseDrawer} width="40%">
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
                            label="Mã phòng"
                            name="departmentCode"
                            rules={[{ required: true, message: 'Vui lòng nhập mã phòng!' }]}
                        >
                            <InputComponent name="departmentCode" value={stateDepartmentDetail.departmentCode} onChange={(e) => handleOnChangeDetail('departmentCode', e.target.value)} />
                        </Form.Item>

                        <Form.Item
                            label="Tên phòng"
                            name="departmentName"
                            rules={[{ required: true, message: 'Vui lòng nhập tên phòng!' }]}
                        >
                            <InputComponent name="departmentName" value={stateDepartmentDetail.departmentName} onChange={(e) => handleOnChangeDetail('departmentName', e.target.value)} />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 14, span: 24 }}>
                            <Button type="primary" htmlType="submit">Cập nhật đơn vị / phòng ban</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>
            <ModalComponent width={400} title="Xóa đơn vị / phòng ban" open={isModalOpenDelete} onCancel={handleCancelDelete} onOk={handleDeleteLetter}>
                <Loading isLoading={isLoadingDeleted}>
                    <div>Bạn có muốn xóa đơn vị / phòng ban?</div>
                </Loading>
            </ModalComponent>
        </div>
    )
}
