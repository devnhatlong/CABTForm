import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { WrapperHeader } from './style';
import { Button, Form, Select, Space } from "antd";
import TableComponent from '../TableComponent/TableComponent';
import InputComponent from '../InputComponent/InputComponent';
import ModalComponent from '../ModalComponent/ModalComponent';
import digitizedDocumentTargetService from '../../services/digitizedDocumentTargetService';
import departmentService from '../../services/departmentService';
import Loading from '../LoadingComponent/Loading';
import * as message from '../Message/Message';
import { useMutationHooks } from '../../hooks/useMutationHook';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux'
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons'
import DrawerComponent from '../DrawerComponent/DrawerComponent';
import ExcelJS from 'exceljs';

export const DigitizedDocumentTarget = () => {
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
    const [departmentList, setDepartmentList] = useState([]);
    const { Option } = Select;
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 5 // Số lượng mục trên mỗi trang
    });

    const [stateDigitizedDocumentTarget, setStateDigitizedDocumentTarget] = useState({
        departmentCode: "",
        departmentName: "",
        digitized_documents_target: ""
    });

    const [stateDigitizedDocumentTargetDetail, setStateDigitizedDocumentTargetDetail] = useState({
        departmentCode: "",
        departmentName: "",
        digitized_documents_target: ""
    });

    const mutation = useMutationHooks(
        (data) => {
            const { 
                departmentCode,
                departmentName,
                digitized_documents_target
            } = data;

            const response = digitizedDocumentTargetService.createDigitizedDocumentTarget({
                departmentCode,
                departmentName,
                digitized_documents_target
            });

            return response;
        }
    )

    const mutationUpdate = useMutationHooks(
        (data) => { 
            const { id, ...rests } = data;
            const response = digitizedDocumentTargetService.updateDigitizedDocumentTarget(id, { ...rests });
            return response;
        }
    );
    
    const mutationDeleted = useMutationHooks(
        (data) => { 
          const { id } = data;
    
          const res = digitizedDocumentTargetService.deleteDigitizedDocumentTarget(id);
    
          return res;
        }
    );

    const mutationDeletedMultiple = useMutationHooks(
        (data) => { 
          const { ids } = data;
          const res = digitizedDocumentTargetService.deleteMultipleDigitizedDocumentTargets(ids);
    
          return res;
        }
    );

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateDigitizedDocumentTarget({
            departmentCode: "",
            departmentName: "",
            digitized_documents_target: ""
        });

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;
    const { data: dataUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated, isPending: isPendingUpdated } = mutationUpdate;
    const { data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted, isPending: isLoadingDeleted } = mutationDeleted;
    const { data: dataDeletedMultiple, isSuccess: isSuccessDeletedMultiple, isError: isErrorDeletedMultiple, isPending: isLoadingDeletedMultiple } = mutationDeletedMultiple;

    const getAllDigitizedDocumentTarget = async (currentPage, pageSize, filters) => {
        const response = await digitizedDocumentTargetService.getAllDigitizedDocumentTarget(currentPage, pageSize, filters);
        return response;
    };

    const fetchGetDetailDigitizedDocumentTarget = async (rowSelected) => {
        const response = await digitizedDocumentTargetService.getDetailDigitizedDocumentTarget(rowSelected);
        
        if (response?.digitizedDocumentTarget) {

            setStateDigitizedDocumentTargetDetail({
                departmentCode: response?.digitizedDocumentTarget?.departmentCode,
                departmentName: response?.digitizedDocumentTarget?.departmentName,
                digitized_documents_target: response?.digitizedDocumentTarget?.digitized_documents_target
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
        drawerForm.setFieldsValue(stateDigitizedDocumentTargetDetail)
    }, [stateDigitizedDocumentTargetDetail, drawerForm])

    useEffect(() => {
        if (rowSelected) {
            setIsLoadingUpdate(true);
            fetchGetDetailDigitizedDocumentTarget(rowSelected);
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
        queryKey: ['digitizedDocumentTargets'],
        queryFn: () => getAllDigitizedDocumentTarget(pagination.currentPage, pagination.pageSize, filters),
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingLetter, data: digitizedDocumentTargets } = queryLetter;

    const queryDepartmentList = useQuery({
        queryKey: ['departmentLists'],
        queryFn: () => departmentService.getAllDepartment(0,0),
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingDepartmentList, data: departmentLists } = queryDepartmentList;

    useEffect(() => {
        if(isSuccess && data?.success) {
            message.success("Tạo chỉ tiêu số hóa thành công");
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
            message.success("Cập nhật chỉ tiêu số hóa thành công");
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
            message.success(`Đã xóa chỉ tiêu số hóa thành công`);
            handleCancelDelete();
        }
        else if (isErrorDeleted) {
          message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeleted])

    useEffect(() => {
        if (isSuccessDeletedMultiple && dataDeletedMultiple) {
            if (dataDeletedMultiple.deletedDigitizedDocumentTarget.deletedCount > 0) {
                message.success("Xóa chỉ tiêu số hóa thành công");
            } else {
                message.error("Không có chỉ tiêu số hóa nào được xóa");
            }
        } else if (isErrorDeletedMultiple) {
            message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeletedMultiple, isErrorDeletedMultiple, dataDeletedMultiple]);

    useEffect(() => {
        queryLetter.refetch();
    }, [pagination]);

    useEffect(() => {
        // Ensure the form's initial value is set when the component mounts
        drawerForm.setFieldsValue({
            donvi: stateDigitizedDocumentTargetDetail.departmentCode,
        });
    }, [stateDigitizedDocumentTargetDetail, drawerForm]);

    const onFinish = async () => {
        mutation.mutate(stateDigitizedDocumentTarget, {
            onSettled: () => {
                queryLetter.refetch();
            }
        });
    }

    useEffect(() => {
        if (departmentLists?.departments) {
            const departmentList = departmentLists?.departments;
            setDepartmentList(departmentList);
        }
    }, [departmentLists]);

    const onUpdateLetter = async () => {
        mutationUpdate.mutate(
            {
                id: rowSelected,
                ...stateDigitizedDocumentTargetDetail
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
        if (digitizedDocumentTargets?.digitizedDocumentTargets) {
            const updatedDataTable = fetchDataForDataTable(digitizedDocumentTargets);
            setDataTable(updatedDataTable);
        }
    }, [digitizedDocumentTargets]);

    const fetchDataForDataTable = (digitizedDocumentTargetData) => {
        return digitizedDocumentTargetData?.digitizedDocumentTargets?.map((digitizedDocumentTarget) => {
            return {
                ...digitizedDocumentTarget, 
                key: digitizedDocumentTarget._id,
                createdAt: new Date(digitizedDocumentTarget.createdAt),
                updatedAt: new Date(digitizedDocumentTarget.updatedAt),
            };
        });
    };

    const handleOnChange = (name, value) => {
        setStateDigitizedDocumentTarget({
            ...stateDigitizedDocumentTarget,
            [name]: value
        });
    };

    const handleOnChangeDetail = (name, value) => {
        setStateDigitizedDocumentTargetDetail({
            ...stateDigitizedDocumentTargetDetail,
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
            title: 'Chỉ tiêu số hóa',
            dataIndex: 'digitized_documents_target',
            key: 'digitized_documents_target',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
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

        // Tiếp tục với cuộc gọi hàm getAllDigitizedDocumentTarget và truyền filters vào đó.
        getAllDigitizedDocumentTarget(pagination.currentPage, pagination.pageSize, filters)
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

        // Tiếp tục với cuộc gọi hàm getAllDigitizedDocumentTarget và truyền filters vào đó để xóa filter cụ thể trên server.
        getAllDigitizedDocumentTarget(pagination.currentPage, pagination.pageSize, filters)
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
        fetchGetDetailDigitizedDocumentTarget(rowSelected);
        setIsOpenDrawer(false);
    };

    const handleKeyPress = (e) => {
        // Cho phép các phím số, phím mũi tên lên, xuống, và phím xóa
        const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ArrowUp', 'ArrowDown', 'Backspace', 'Tab'];
    
        if (!allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    };

    return (
        <div>
            <WrapperHeader>Quản lý chỉ tiêu số hóa</WrapperHeader>
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
                        total: digitizedDocumentTargets?.totalRecord,
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
            <ModalComponent form={modalForm} forceRender width={500} title="Tạo chỉ tiêu số hóa" open={isModalOpen} onCancel={handleCancel} footer={null}>
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
                            label="Đơn vị"
                            name="donvi"
                            rules={[{ required: true, message: 'Vui lòng nhập đơn vị!' }]}
                        >
                            <Select
                                showSearch
                                onChange={(value, option) => setStateDigitizedDocumentTarget({
                                    ...stateDigitizedDocumentTarget,
                                    departmentCode: value,
                                    departmentName: option.children
                                })}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {departmentList.map((department) => (
                                    <Option key={department._id} value={department.departmentCode}>
                                        {department.departmentName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Chỉ tiêu số hóa"
                            name="digitized_documents_target"
                            rules={[{ required: true, message: 'Vui lòng nhập chỉ tiêu số hóa!' }]}
                        >
                            <InputComponent type="number" name="digitized_documents_target" value={stateDigitizedDocumentTarget.digitized_documents_target} onChange={(e) => handleOnChange('digitized_documents_target', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 14, span: 24 }}>
                            <Button type="primary" htmlType="submit">Tạo chỉ tiêu số hóa</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </ModalComponent>
            <DrawerComponent form={drawerForm} title="Chi tiết chỉ tiêu số hóa" isOpen={isOpenDrawer} onClose={handleCloseDrawer} width="40%">
                <Loading isLoading = {isLoadingUpdate}>
                    <Form
                        name="drawerForm"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 15 }}
                        style={{ maxWidth: 1000 }}
                        initialValues={{
                            donvi: stateDigitizedDocumentTargetDetail.departmentCode,
                        }}
                        onFinish={onUpdateLetter}
                        autoComplete="on"
                        form={drawerForm}

                    >
                        <Form.Item
                            label="Đơn vị"
                            name="donvi"
                            rules={[{ required: true, message: 'Vui lòng nhập đơn vị!' }]}
                        >
                            <Select
                                showSearch
                                value={stateDigitizedDocumentTargetDetail?.departmentCode}
                                onChange={(value, option) => setStateDigitizedDocumentTargetDetail({
                                    ...stateDigitizedDocumentTargetDetail,
                                    departmentCode: value,
                                    departmentName: option.children
                                })}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {departmentList.map((department) => (
                                    <Option key={department._id} value={department.departmentCode}>
                                        {department.departmentName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Chỉ tiêu số hóa"
                            name="digitized_documents_target"
                            rules={[{ required: true, message: 'Vui lòng nhập chỉ tiêu số hóa!' }]}
                        >
                            <InputComponent type="number" name="digitized_documents_target" value={stateDigitizedDocumentTargetDetail.digitized_documents_target} onChange={(e) => handleOnChangeDetail('digitized_documents_target', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 14, span: 24 }}>
                            <Button type="primary" htmlType="submit">Cập nhật chỉ tiêu số hóa</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>
            <ModalComponent width={400} title="Xóa chỉ tiêu số hóa" open={isModalOpenDelete} onCancel={handleCancelDelete} onOk={handleDeleteLetter}>
                <Loading isLoading={isLoadingDeleted}>
                    <div>Bạn có muốn xóa chỉ tiêu số hóa?</div>
                </Loading>
            </ModalComponent>
        </div>
    )
}
