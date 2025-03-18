import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { CreateFormButton, CreateFormIcon, FormListHeader, WrapperButtonName, WrapperHeader } from './style';
import { Button, Form, Select, Space, Popover, Upload } from "antd";
import TableComponent from '../TableComponent/TableComponent';
import InputComponent from '../InputComponent/InputComponent';
import ModalComponent from '../ModalComponent/ModalComponent';
import userService from '../../services/userService';
import Loading from '../LoadingComponent/Loading';
import * as message from '../../components/Message/Message';
import { useMutationHooks } from '../../hooks/useMutationHook';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux'
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, ReloadOutlined, MenuOutlined, ImportOutlined } from '@ant-design/icons'
import DrawerComponent from '../DrawerComponent/DrawerComponent';
import { WrapperContentPopup } from '../NavbarLoginComponent/style';
import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';
import { useNavigate } from 'react-router';

export const AdminUser = () => {
    const [modalForm] = Form.useForm();
    const [modalChangePasswordForm] = Form.useForm();
    const [drawerForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalChangePasswordOpen, setIsModalChangePasswordOpen] = useState(false);
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
    const navigate = useNavigate();

    useEffect(() => {
        if(user?.role !== "admin") {
            navigate(`/dashboard`);
        }
    }, [user]);

    const [passwordChangedByAdmin, setPasswordChangedByAdmin] = useState({
        password: "",
    });

    const [stateUser, setStateUser] = useState({
        userName: "",
        password: "",
        departmentCode: "",
        departmentName: "",
        role: ""
    });

    const [stateUserDetail, setStateUserDetail] = useState({
        userName: "",
        password: "",
        departmentCode: "",
        departmentName: "",
        role: ""
    });

    const mutationPasswordChangedByAdmin = useMutationHooks(
        (data) => {
            const { id, ...rests } = data;
            const response = userService.passwordChangedByAdmin(id, {...rests});

            return response;
        }
    );

    const mutation = useMutationHooks(
        (data) => {
            const { 
                userName,
                password,
                departmentCode,
                departmentName,
                role
            } = data;

            const response = userService.register({
                userName,
                password,
                departmentCode,
                departmentName,
                role
            });

            return response;
        }
    )

    const mutationUpdate = useMutationHooks(
        (data) => { 
            const { id, ...rests } = data;
            const response = userService.updateUserByAdmin(id, { ...rests });
            return response;
        }
    );
    
    const mutationDeleted = useMutationHooks(
        (data) => { 
          const { id } = data;
    
          const res = userService.deleteUser(id);
    
          return res;
        }
    );

    const mutationDeletedMultiple = useMutationHooks(
        (data) => { 
          const { ids } = data;
          const res = userService.deleteMultipleUsers(ids);
    
          return res;
        }
    );

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateUser({
            userName: "",
            password: "",
            departmentCode: "",
            departmentName: "",
            role: ""
        });

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;
    const { data: dataUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated, isPending: isPendingUpdated } = mutationUpdate;
    const { data: dataPasswordChangedByAdmin, isSuccess: isSuccessPasswordChangedByAdmin, isError: isErrorPasswordChangedByAdmin, isPending: isPendingPasswordChangedByAdmin } = mutationPasswordChangedByAdmin;
    const { data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted, isPending: isLoadingDeleted } = mutationDeleted;
    const { data: dataDeletedMultiple, isSuccess: isSuccessDeletedMultiple, isError: isErrorDeletedMultiple, isPending: isLoadingDeletedMultiple } = mutationDeletedMultiple;

    const getAllUser = async (currentPage, pageSize, filters) => {
        const response = await userService.getAllUser(currentPage, pageSize, filters);
        return response;
    };

    const fetchGetDetailUser = async (rowSelected) => {
        const response = await userService.getDetailUser(rowSelected);

        if (response?.user) {

            setStateUserDetail({
                userName: response?.user?.userName,
                departmentCode: response?.user?.departmentCode,
                departmentName: response?.user?.departmentName,
                role: response?.user?.role
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
        drawerForm.setFieldsValue(stateUserDetail)
    }, [stateUserDetail, drawerForm])

    useEffect(() => {
        if (rowSelected) {
            setIsLoadingUpdate(true);
            fetchGetDetailUser(rowSelected);
        }
    }, [rowSelected])

    const handleDetailLetter = () => {
        setIsOpenDrawer(true);
    }

    const handleOnChangePasswordByAdmin = (name, value) => {
        setPasswordChangedByAdmin({
            ...passwordChangedByAdmin,
            [name]: value
        });
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
        queryKey: ['users'],
        queryFn: () => getAllUser(pagination.currentPage, pagination.pageSize, filters),
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingLetter, data: users } = queryLetter;

    useEffect(() => {
        if(isSuccess && data?.success) {
            message.success("Tạo người dùng thành công");
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
            message.success("Cập nhật người dùng thành công");
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
        if(isSuccessPasswordChangedByAdmin && dataPasswordChangedByAdmin?.success) {
            message.success("Cập nhật mật khẩu thành công");
            handleCloseChangePassword();
        }
        else if (isError) {
            message.error("Có gì đó sai sai");
        }
        else if (isSuccess && !dataUpdated?.success) {
            message.error(dataUpdated?.message);
        }
    }, [isSuccessPasswordChangedByAdmin]);

    useEffect(() => {
        if(isSuccessDeleted && dataDeleted?.success) {
            message.success(`Đã xóa user: ${dataDeleted.deletedUser.userName}`);
            handleCancelDelete();
        }
        else if (isErrorDeleted) {
          message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeleted])

    useEffect(() => {
        if (isSuccessDeletedMultiple && dataDeletedMultiple) {
            if (dataDeletedMultiple.deletedLetter.deletedCount > 0) {
                message.success("Xóa người dùng thành công");
            } else {
                message.error("Không có người dùng nào được xóa");
            }
        } else if (isErrorDeletedMultiple) {
            message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeletedMultiple, isErrorDeletedMultiple, dataDeletedMultiple]);

    useEffect(() => {
        queryLetter.refetch();
    }, [pagination]);

    const handleChangePasswordByAdmin = async () => {
        mutationPasswordChangedByAdmin.mutate(
            {
                id: rowSelected,
                ...passwordChangedByAdmin
            }, 
            {
            onSettled: () => {
                queryLetter.refetch();
            }
        });
    }

    const onFinish = async () => {
        mutation.mutate(stateUser, {
            onSettled: () => {
                queryLetter.refetch();
            }
        });
    }

    const onUpdateLetter = async () => {
        mutationUpdate.mutate(
            {
                id: rowSelected,
                ...stateUserDetail
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
        if (users?.users) {
            const updatedDataTable = fetchDataForDataTable(users);
            setDataTable(updatedDataTable);
        }
    }, [users]);

    const fetchDataForDataTable = (usersData) => {
        return usersData?.users?.map((user) => {
            return {
                ...user, 
                key: user._id,
                passwordChangedAt: user.passwordChangedAt ? moment(parseInt(user.passwordChangedAt)).format('DD/MM/YYYY HH:MM') : "",
                createdAt: <Moment format="DD/MM/YYYY HH:MM">{user.createdAt}</Moment>,
                updatedAt: <Moment format="DD/MM/YYYY HH:MM">{user.createdAt}</Moment>,
            };
        });
    };

    const handleOnChange = (name, value) => {
        setStateUser({
            ...stateUser,
            [name]: value
        });
    };

    const handleOnChangeDetail = (name, value) => {
        setStateUserDetail({
            ...stateUserDetail,
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

    const content = (
        <div>
            <WrapperContentPopup onClick={() => setIsModalChangePasswordOpen(true)}>Đổi mật khẩu</WrapperContentPopup>
        </div>
    );

    const renderAction = () => {
        return (
            <div style={{display: "flex", justifyContent: "center", gap: "10px"}}>
                <EditOutlined style={{color: 'orange', fontSize: '18px', cursor: 'pointer'}} onClick={handleDetailLetter}/>
                <DeleteOutlined style={{color: 'red', fontSize: '18px', cursor: 'pointer'}} onClick={() => setIsModalOpenDelete(true)}/>
                <Popover placement="bottom" content={content}><MenuOutlined style={{color: '#1677ff', fontSize: '18px', cursor: 'pointer'}}/></Popover>
            </div>
        )
    }

    const columns = [
        {
            title: 'Tên đăng nhập',
            dataIndex: 'userName',
            key: 'userName',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('userName', 'tên đăng nhập')
        },
        {
            title: 'Mã phòng',
            dataIndex: 'departmentCode',
            key: 'departmentCode',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('departmentCode', 'mã phòng')
        },
        {
            title: 'Tên đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('departmentName', 'tên đơn vị')
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('role', 'vai trò')
        },
        {
            title: 'Lịch sử đăng nhập',
            dataIndex: 'loginInfo',
            key: 'loginInfo',
            render: loginInfo => (
                <ul>
                  {loginInfo.slice(-5).map((info, index) => (
                    <li key={index}>
                      IP: {info.ip} <br />
                      Browser: {info.browser} <br />
                      Thời gian: <Moment format="DD/MM/YYYY HH:mm" tz="Asia/Ho_Chi_Minh">{info.timestamp}</Moment>
                    </li>
                  ))}
                </ul>
            )
        },
        {
            title: 'Thời gian thay đổi mật khẩu',
            dataIndex: 'passwordChangedAt',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            // ...getColumnSearchProps('role', 'vai trò')
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

        // Tiếp tục với cuộc gọi hàm getAllUser và truyền filters vào đó.
        getAllUser(pagination.currentPage, pagination.pageSize, filters)
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

        // Tiếp tục với cuộc gọi hàm getAllUser và truyền filters vào đó để xóa filter cụ thể trên server.
        getAllUser(pagination.currentPage, pagination.pageSize, filters)
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
        fetchGetDetailUser(rowSelected);
        setIsOpenDrawer(false);
    };

    const handleCloseChangePassword = () => {
        setIsModalChangePasswordOpen(false);
        modalChangePasswordForm.resetFields();
    }

    const handleUpload = async ({ file, onSuccess, onError }) => {
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await userService.importUsersFromExcel(formData);
    
            if (response.success) {
                message.success('Import thành công');
                queryLetter.refetch(); // Refresh the user list
            } else {
                message.error(response.message || 'Import thất bại');
            }
        } catch (error) {
            console.error('Error importing users:', error);
            message.error('Import thất bại');
            onError(error);
        }
    };

    return (
        <div>
            <WrapperHeader>Quản lý người dùng</WrapperHeader>
            <div style={{display: "flex", gap: "20px", marginTop: "10px" }}>
                <FormListHeader>
                    <CreateFormButton onClick={() => setIsModalOpen(true)}>
                        <WrapperButtonName>Thêm tài khoản</WrapperButtonName>
                        <PlusOutlined style={{fontSize: "40px", color: "#1677ff"}} />
                    </CreateFormButton>
                </FormListHeader>
                <FormListHeader>
                    <Upload
                        name="file"
                        accept=".xlsx, .xls"
                        showUploadList={false}
                        customRequest={handleUpload}
                    >
                        <CreateFormButton>
                            <WrapperButtonName>Import Excel</WrapperButtonName>
                            <ImportOutlined style={{ fontSize: "40px", color: "#5eb12b" }} />
                        </CreateFormButton>
                    </Upload>
                </FormListHeader>
            </div>
            <div style={{ marginTop: '20px' }}>
                <TableComponent handleDeleteMultiple={handleDeleteMultipleUsers} columns={columns} data={dataTable} isLoading={isLoadingLetter || isLoadingResetFilter} resetSelection={resetSelection}
                    pagination={{
                        current: pagination.currentPage,
                        pageSize: pagination.pageSize,
                        total: users?.totalRecord,
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
            <ModalComponent form={modalForm} forceRender width={500} title="Tạo người dùng" open={isModalOpen} onCancel={handleCancel} footer={null}>
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
                            label="Tên tài khoản"
                            name="userName"
                            rules={[{ required: true, message: 'Vui lòng nhập userName!' }]}
                        >
                            <InputComponent name="userName" autoComplete="userName" value={stateUser.userName} onChange={(e) => handleOnChange('userName', e.target.value)} />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <InputComponent type="password" autoComplete="current-password" name="password" value={stateUser.password} onChange={(e) => handleOnChange('password', e.target.value)} />
                        </Form.Item>

                        <Form.Item
                            label="Mã phòng"
                            name="departmentCode"
                            rules={[{ required: true, message: 'Vui lòng nhập mã phòng!' }]}
                        >
                            <InputComponent name="departmentCode" value={stateUser.departmentCode} onChange={(e) => handleOnChange('departmentCode', e.target.value)} />
                        </Form.Item>

                        <Form.Item
                            label="Tên phòng"
                            name="departmentName"
                            rules={[{ required: true, message: 'Vui lòng nhập tên phòng!' }]}
                        >
                            <InputComponent name="departmentName" value={stateUser.departmentName} onChange={(e) => handleOnChange('departmentName', e.target.value)} />
                        </Form.Item>

                        <Form.Item
                            label="Vai trò"
                            name="role"
                            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                        >
                            <Select 
                                value={stateUser.role} 
                                onChange={(value) => handleOnChange('role', value)} 
                                onTouchStart={(e) => e.stopPropagation()} 
                                onTouchMove={(e) => e.stopPropagation()}
                            >
                                <Select.Option value="admin">Admin</Select.Option>
                                <Select.Option value="user">User</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 16, span: 24 }}>
                            <Button type="primary" htmlType="submit">Tạo người dùng</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </ModalComponent>
            <ModalComponent form={modalChangePasswordForm} forceRender width={500} title="Đổi mật khẩu" open={isModalChangePasswordOpen} onCancel={handleCloseChangePassword} footer={null}>
                <Loading isLoading = {isPending}>
                    <Form
                        name="modalChangePasswordForm"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 16 }}
                        style={{ maxWidth: 1000 }}
                        initialValues={{ remember: true }}
                        onFinish={handleChangePasswordByAdmin}
                        autoComplete="on"
                        form={modalChangePasswordForm}
                    >
                        <Form.Item
                            label="Tên người dùng"
                            name="username"
                            style={{ display: 'none' }} // Ẩn trường tên người dùng
                        >
                            <InputComponent type="text" name="username" autoComplete="username"/>
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu mới"
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <InputComponent type="password" autoComplete="current-password" name="password" onChange={(e) => handleOnChangePasswordByAdmin('password', e.target.value)} />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 16, span: 24 }}>
                            <Button type="primary" htmlType="submit">Đổi mật khẩu</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </ModalComponent>
            <DrawerComponent form={drawerForm} title="Chi tiết người dùng" isOpen={isOpenDrawer} onClose={handleCloseDrawer} width="40%">
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
                            label="Tên tài khoản"
                            name="userName"
                            rules={[{ required: true, message: 'Vui lòng nhập userName!' }]}
                        >
                            <InputComponent name="userName" autoComplete="userName" value={stateUserDetail.userName} onChange={(e) => handleOnChangeDetail('userName', e.target.value)} />
                        </Form.Item>

                        <Form.Item
                            label="Mã phòng"
                            name="departmentCode"
                            rules={[{ required: true, message: 'Vui lòng nhập mã phòng!' }]}
                        >
                            <InputComponent name="departmentCode" value={stateUserDetail.departmentCode} onChange={(e) => handleOnChangeDetail('departmentCode', e.target.value)} />
                        </Form.Item>

                        <Form.Item
                            label="Tên phòng"
                            name="departmentName"
                            rules={[{ required: true, message: 'Vui lòng nhập tên phòng!' }]}
                        >
                            <InputComponent name="departmentName" value={stateUserDetail.departmentName} onChange={(e) => handleOnChangeDetail('departmentName', e.target.value)} />
                        </Form.Item>

                        <Form.Item
                            label="Vai trò"
                            name="role"
                            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                        >
                            <Select 
                                value={stateUserDetail.role} 
                                onChange={(value) => handleOnChangeDetail('role', value)}
                                onTouchStart={(e) => e.stopPropagation()} 
                                onTouchMove={(e) => e.stopPropagation()}
                            >
                                <Select.Option value="admin">Admin</Select.Option>
                                <Select.Option value="user">User</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item wrapperCol={{ offset: 16, span: 24 }}>
                            <Button type="primary" htmlType="submit">Cập nhật người dùng</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>
            <ModalComponent width={400} title="Xóa người dùng" open={isModalOpenDelete} onCancel={handleCancelDelete} onOk={handleDeleteLetter}>
                <Loading isLoading={isLoadingDeleted}>
                    <div>Bạn có muốn xóa người dùng này không?</div>
                </Loading>
            </ModalComponent>
        </div>
    )
}
