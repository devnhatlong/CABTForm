import React, { useEffect, useState, useRef } from "react";
import { Button, message, Space } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import formService from "../../services/formService";
import { useSelector } from "react-redux";
import TableComponent from "../TableComponent/TableComponent";
import {
    FormListContainer,
    FormListHeader,
    CreateFormButton,
    CreateFormIcon,
    EmptyState
} from "./style"; // Import styled components
import InputComponent from "../InputComponent/InputComponent";

const FormList = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10
    });
    const user = useSelector((state) => state?.user);
    const searchInput = useRef(null);
    const [columnFilters, setColumnFilters] = useState({});

    useEffect(() => {
        fetchForms(pagination.currentPage, pagination.pageSize, columnFilters.title);
    }, [pagination.currentPage, pagination.pageSize, columnFilters.title]);

    const fetchForms = async (page, limit, title) => {
        setLoading(true);
        try {
            const data = await formService.getAllForms(page, limit, title);
            setForms(Array.isArray(data.data) ? data.data : []);
            setTotal(data.total);
        } catch (error) {
            message.error("Lỗi khi lấy danh sách form!");
            setForms([]);
        }
        setLoading(false);
    };

    const createForm = async () => {
        try {
            if (!user || !user._id) {
                message.error("Lỗi: Không tìm thấy thông tin người dùng.");
                return;
            }
    
            const newForm = await formService.createForm({
                createdBy: user._id,
            });

            if (!newForm || !newForm?.data?._id) {
                message.error("Lỗi khi tạo form: Không tìm thấy ID.");
                return;
            }
    
            navigate(`/admin/forms/create-forms/${newForm.data._id}`);
        } catch (error) {
            console.error("Lỗi tạo form:", error);
            message.error("Lỗi khi tạo form!");
        }
    };

    const handleSearch = async (selectedKeys, confirm, dataIndex) => {
        setColumnFilters(prevFilters => {
            const updatedFilters = {
                ...prevFilters,
                [dataIndex]: selectedKeys[0]
            };
            return updatedFilters;
        });
        confirm();
        fetchForms(pagination.currentPage, pagination.pageSize, selectedKeys[0]);
    };

    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters();
        setColumnFilters(prevFilters => {
            const updatedFilters = {
                ...prevFilters,
                [dataIndex]: ''
            };
            return updatedFilters;
        });
        confirm();
        fetchForms(pagination.currentPage, pagination.pageSize, '');
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
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
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
            record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
    });

    const columns = [
        {
            title: 'Tên form',
            dataIndex: 'title',
            key: 'title',
            ...getColumnSearchProps('title', 'tên form')
        },
        {
            title: 'Người tạo',
            dataIndex: 'createdBy',
            key: 'createdBy',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (text) => new Date(text).toLocaleString(),
        },
    ];

    const handlePageChange = (page, pageSize) => {
        setPagination({
            ...pagination,
            currentPage: page,
            pageSize: pageSize
        });
    };

    return (
        <FormListContainer>
            <FormListHeader>
                <CreateFormButton onClick={createForm}>
                    <div>Tạo form</div>
                    <CreateFormIcon>
                        <PlusOutlined />
                    </CreateFormIcon>
                </CreateFormButton>
            </FormListHeader>
            {forms.length === 0 && !loading ? (
                <EmptyState description="Chưa có form nào" />
            ) : (
                <div style={{ marginTop: '20px' }}>
                    <TableComponent
                        columns={columns}
                        data={forms.map(form => ({ ...form, key: form._id }))}
                        isLoading={loading}
                        pagination={{
                            current: pagination.currentPage,
                            pageSize: pagination.pageSize,
                            total: total,
                            onChange: handlePageChange,
                            showSizeChanger: false
                        }}
                        onRow={(record, rowIndex) => {
                            return {
                                onClick: (event) => {
                                    if (record._id) {
                                        navigate(`/admin/forms/edit-forms/${record._id}`);
                                    }
                                },
                            };
                        }}
                    />
                </div>
            )}
        </FormListContainer>
    );
};

export default FormList;