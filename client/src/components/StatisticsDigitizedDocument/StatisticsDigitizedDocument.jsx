import React, { useEffect, useState, useRef } from 'react';
import { WrapperHeader } from './style';
import { Button, Form, Space, Row, Col, Card, Progress } from "antd";
import TableComponent from '../TableComponent/TableComponent';
import InputComponent from '../InputComponent/InputComponent';
import ModalComponent from '../ModalComponent/ModalComponent';
import digitizedDocumentService from '../../services/digitizedDocumentService';
import Loading from '../LoadingComponent/Loading';
import * as message from '../Message/Message';
import { useMutationHooks } from '../../hooks/useMutationHook';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux'
import { PlusOutlined, SearchOutlined, FileExcelOutlined } from '@ant-design/icons'
import Moment from 'react-moment';
import moment from 'moment';
import * as ExcelJS from 'exceljs';

export const StatisticsDigitizedDocument = () => {
    const [modalForm] = Form.useForm();
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState();
    const [isLoadingResetFilter, setIsLoadingResetFilter] = useState(false);
    const user = useSelector((state) => state?.user);
    const searchInput = useRef(null);
    const [columnFilters, setColumnFilters] = useState({});
    const [dataTable, setDataTable] = useState([]);
    const [filters, setFilters] = useState({});
    const [resetSelection, setResetSelection] = useState(false);
    const [tuNgayMoment, setTuNgayMoment] = useState(null);
    const [denNgayMoment, setDenNgayMoment] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 5 // Số lượng mục trên mỗi trang
    });

    const [stateDigitizedDocument, setStateDigitizedDocument] = useState({
        year: "",
        digitized_documents_count: "",
        undigitized_documents_count: "",
        total_documents_count: "",
        digitization_percentage: ""
    });

    const [stateDocumentStatisticsUntilLastYear, setStateDocumentStatisticsUntilLastYear] = useState({
        totalDocuments: "",
        totalDigitizedDocuments: "",
        totalUndigitizedDocuments: "",
        totalPercentage: ""
    });

    const [stateDocumentStatisticsUntilCurrentYear, setStateDocumentStatisticsUntilCurrentYear] = useState({
        totalDocuments: "",
        totalDigitizedDocuments: "",
        totalUndigitizedDocuments: "",
        totalPercentage: ""
    });

    const [stateDocumentStatisticsUntilThisYear, setStateDocumentStatisticsUntilThisYear] = useState({
        totalDocuments: "",
        totalDigitizedDocuments: "",
        totalUndigitizedDocuments: "",
        totalPercentage: ""
    });

    const [stateDocumentTargetStatisticsUntilThisYear, setStateDocumentTargetStatisticsUntilThisYear] = useState({
        digitized_documents_target: "",
        totalDigitizedDocuments: "",
        totalUndigitizedDocuments: "",
        totalPercentage: ""
    });

    const mutation = useMutationHooks(
        (data) => {
            const { 
                year,
                digitized_documents_count,
                undigitized_documents_count,
                total_documents_count,
                digitization_percentage
            } = data;

            const response = digitizedDocumentService.importDigitizedDocumentByYear({
                year,
                digitized_documents_count,
                undigitized_documents_count,
                total_documents_count,
                digitization_percentage
            });

            return response;
        }
    )

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateDigitizedDocument({
            year: "",
            digitized_documents_count: "",
            undigitized_documents_count: "",
            total_documents_count: "",
            digitization_percentage: ""
        });

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;

    const getAllDigitizedDocument = async (currentPage, pageSize, filters) => {
        const response = await digitizedDocumentService.getAllDigitizedDocument(currentPage, pageSize, filters);
        return response;
    };

    const getAllDigitizedDocumentByAdmin = async (currentPage, pageSize, filters) => {
        const response = await digitizedDocumentService.getAllDigitizedDocumentByAdmin(currentPage, pageSize, filters);
        return response;
    };

    const getDocumentStatisticsUntilLastYear = async () => {
        // Gọi service với năm trước đó
        const response = await digitizedDocumentService.getDocumentStatisticsUntilLastYear(lastYear);
        setStateDocumentStatisticsUntilLastYear(response?.response);
        return response;
    };

    const getDocumentStatisticsUntilCurrentYear = async () => {
        const response = await digitizedDocumentService.getDocumentStatisticsUntilCurrentYear(currentYear);
        setStateDocumentStatisticsUntilCurrentYear(response?.response);
        return response;
    };

    const getDocumentStatisticsThisYear = async () => {
        const response = await digitizedDocumentService.getDocumentStatisticsThisYear(currentYear);
        setStateDocumentStatisticsUntilThisYear(response?.response);
        return response;
    };

    const getDocumentTargetStatisticsThisYear = async () => {
        const response = await digitizedDocumentService.getDocumentTargetStatisticsThisYear();
        setStateDocumentTargetStatisticsUntilThisYear(response?.response);
        return response;
    };

    useEffect(() => {
        queryDigitizedDocument.refetch();
        setIsLoadingResetFilter(false);
    }, [isLoadingResetFilter]);

    const queryDigitizedDocument = useQuery({
        queryKey: ['digitizedDocuments'],
        queryFn: () => getAllDigitizedDocument(pagination.currentPage, pagination.pageSize, filters),
        retry: 3,
        retryDelay: 1000,
    });

    const queryDocumentStatisticsUntilLastYear = useQuery({
        queryKey: ['documentStatisticsUntilLastYear'],
        queryFn: () => getDocumentStatisticsUntilLastYear(),
        retry: 3,
        retryDelay: 1000,
    });

    const queryDocumentStatisticsUntilCurrentYear = useQuery({
        queryKey: ['documentStatisticsUntilCurrentYear'],
        queryFn: () => getDocumentStatisticsUntilCurrentYear(),
        retry: 3,
        retryDelay: 1000,
    });

    const queryDocumentStatisticsThisYear = useQuery({
        queryKey: ['documentStatisticsThisYear'],
        queryFn: () => getDocumentStatisticsThisYear(),
        retry: 3,
        retryDelay: 1000,
    });

    const queryDocumentTargetStatisticsThisYear = useQuery({
        queryKey: ['documentTargetStatisticsThisYear'],
        queryFn: () => getDocumentTargetStatisticsThisYear(),
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingDigitizedDocument, data: digitizedDocuments } = queryDigitizedDocument;
    const { isLoading: isLoadingDocumentStatisticsUntilLastYear, data: documentStatisticsUntilLastYear } = queryDocumentStatisticsUntilLastYear;
    const { isLoading: isLoadingDocumentStatisticsUntilCurrentYear, data: documentStatisticsUntilCurrentYear } = queryDocumentStatisticsUntilCurrentYear;
    const { isLoading: isLoadingDocumentStatisticsThisYear, data: documentStatisticsThisYear } = queryDocumentStatisticsThisYear;
    const { isLoading: isLoadingDocumentTargetStatisticsThisYear, data: documentTargetStatisticsThisYear } = queryDocumentTargetStatisticsThisYear;

    useEffect(() => {
        queryDigitizedDocument.refetch();
        setStateDocumentStatisticsUntilLastYear(documentStatisticsUntilLastYear?.response);
    }, [isLoadingDocumentStatisticsUntilLastYear]);

    useEffect(() => {
        queryDigitizedDocument.refetch();
        setStateDocumentStatisticsUntilCurrentYear(documentStatisticsUntilCurrentYear?.response);
    }, [isLoadingDocumentStatisticsUntilCurrentYear]);

    useEffect(() => {
        queryDigitizedDocument.refetch();
        setStateDocumentStatisticsUntilThisYear(documentStatisticsThisYear?.response);
    }, [isLoadingDocumentStatisticsThisYear]);

    useEffect(() => {
        queryDigitizedDocument.refetch();
        setStateDocumentTargetStatisticsUntilThisYear(documentTargetStatisticsThisYear?.response);
    }, [isLoadingDocumentTargetStatisticsThisYear]);

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
        queryDigitizedDocument.refetch();
    }, [pagination]);

    const onFinish = async () => {
        mutation.mutate(stateDigitizedDocument, {
            onSettled: () => {
              queryDigitizedDocument.refetch();
            }
        });
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
                digitization_percentage: `${digitizedDocument.digitization_percentage}%`,
                createdAt: new Date(digitizedDocument.createdAt),
                updatedAt: new Date(digitizedDocument.updatedAt),
            };
        });
    };

    const handleOnChange = (name, value) => {
        setStateDigitizedDocument({
            ...stateDigitizedDocument,
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

    const columns = [
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
            dataIndex: 'digitized_documents_count',
            key: 'digitized_documents_count',
            sorter: (a, b) => a.digitized_documents_count - b.digitized_documents_count,
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
            sorter: (a, b) => a.digitization_percentage - b.digitization_percentage,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
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

    const handleExportExcel = async () => {
        const response = await digitizedDocumentService.getAllDigitizedDocument(0, 0, filters);

        const columns = ['Số đến', 'Ngày đến', 'Số VB', 'Ngày Đơn', 'Người gửi', "Địa chỉ", "Lãnh đạo", "Nội dung trích yếu", "Chuyển 1", "Chuyển 2", "Ghi chú"];
        const data = response.digitizedDocuments;
    
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        const fromDate = tuNgayMoment ? moment(new Date(tuNgayMoment.startOf('day'))).format("DD/MM/YYYY") : "....."
        const toDate = denNgayMoment ? moment(new Date(denNgayMoment.startOf('day'))).format("DD/MM/YYYY") : "....."

        // Add headers
        const headerRow1 = worksheet.addRow(['THEO DÕI ĐƠN CÔNG DÂN']);
        const headerRow2 = worksheet.addRow([`(Từ ngày ${fromDate} đến ${toDate})`]);
        const headerRow = worksheet.addRow(columns);
    
        // Style header rows
        [headerRow1, headerRow2, headerRow].forEach(row => {
            row.eachCell(cell => {
                cell.alignment = { horizontal: 'center' };
                cell.font = { bold: true, size: 14, name: 'Times New Roman' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });
    
        // Add data
        data.forEach(item => {
            const row = worksheet.addRow([
                item.soDen || '',
                item.ngayDen ? moment(item.ngayDen).format("DD/MM/YYYY") : '',
                item.soVanBan || '',
                item.ngayDon ? moment(item.ngayDon).format("DD/MM/YYYY") : '',
                item.nguoiGui || '',
                item.diaChi || '',
                item.lanhDao || '',
                item.trichYeu || '',
                item.chuyen1 || '',
                item.chuyen2 || '',
                item.ghiChu || ''
            ]);
            row.eachCell(cell => {
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.font = { size: 14, name: 'Times New Roman' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });
    
        // Merge cells
        worksheet.mergeCells('A1:K1');
        worksheet.mergeCells('A2:K2');
    
        // Set column widths
        worksheet.columns.forEach((column, index) => {
            column.width = columnWidths[index].wch;
        });
    
        // Generate buffer
        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Đơn Công Dân.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };
    
    const columnWidths = [
        { wch: 10 }, // Độ rộng cột số đến
        { wch: 15 }, // Độ rộng cột ngày đến
        { wch: 10 }, // Độ rộng cột số vb
        { wch: 15 }, // Độ rộng cột ngày đơn
        { wch: 20 }, // Độ rộng cột người gửi
        { wch: 30 }, // Độ rộng cột địa chỉ
        { wch: 20 }, // Độ rộng cột nội dung trích yếu
        { wch: 30 }, // Độ rộng cột lãnh đạo
        { wch: 15 }, // Độ rộng cột chuyển 1
        { wch: 15 }, // Độ rộng cột chuyển 2
        { wch: 20 }  // Độ rộng cột ghi chú
    ];

    return (
        <div>
            <WrapperHeader>Thống kê số liệu số hóa hàng năm</WrapperHeader>
            {user?.role === "admin" ? 
                <></> : 
                <>
                    <div className="mt-4" style={{ padding: "20px", backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 8px 12px rgba(0,0,0,0.1)' }}>
                        <Row gutter={[16, 16]}>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-success shadow h-100 py-2">
                                    <div className="font-weight-bold text-success text-uppercase mb-1">
                                        Tổng số tài liệu từ năm 2018-{lastYear}
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentStatisticsUntilLastYear?.totalDocuments}</div>
                                </Card>
                            </Col>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-success shadow h-100 py-2">
                                    <div className="font-weight-bold text-success text-uppercase mb-1">
                                        Tổng số tài liệu đã số hóa từ năm 2018-{lastYear}
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentStatisticsUntilLastYear?.totalDigitizedDocuments}</div>
                                </Card>
                            </Col>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-success shadow h-100 py-2">
                                    <div className="font-weight-bold text-success text-uppercase mb-1">
                                        Tổng số tài liệu chưa số hóa từ năm 2018-{lastYear}
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentStatisticsUntilLastYear?.totalUndigitizedDocuments}</div>
                                </Card>
                            </Col>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-success shadow h-100 py-2">
                                    <div className="font-weight-bold text-success text-uppercase mb-1">
                                        Tỉ lệ đã số hóa
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentStatisticsUntilLastYear?.totalPercentage}%</div>
                                    <Progress percent={stateDocumentStatisticsUntilLastYear?.totalPercentage} status="active" />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                    <div className="mt-4" style={{ padding: "20px", backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 8px 12px rgba(0,0,0,0.1)' }}>
                        <Row gutter={[16, 16]}>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-info shadow h-100 py-2">
                                    <div className="font-weight-bold text-info text-uppercase mb-1">
                                        Tổng số tài liệu từ năm 2018-{currentYear}
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentStatisticsUntilCurrentYear?.totalDocuments}</div>
                                </Card>
                            </Col>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-info shadow h-100 py-2">
                                    <div className="font-weight-bold text-info text-uppercase mb-1">
                                        Tổng số tài liệu đã số hóa từ năm 2018-{currentYear}
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentStatisticsUntilCurrentYear?.totalDigitizedDocuments}</div>
                                </Card>
                            </Col>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-info shadow h-100 py-2">
                                    <div className="font-weight-bold text-info text-uppercase mb-1">
                                        Tổng số tài liệu chưa số hóa từ năm 2018-{currentYear}
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentStatisticsUntilCurrentYear?.totalUndigitizedDocuments}</div>
                                </Card>
                            </Col>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-info shadow h-100 py-2">
                                    <div className="font-weight-bold text-info text-uppercase mb-1">
                                        Tỉ lệ đã số hóa
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentStatisticsUntilCurrentYear?.totalPercentage}%</div>
                                    <Progress percent={stateDocumentStatisticsUntilCurrentYear?.totalPercentage} status="active" />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                    <div className="mt-4" style={{ padding: "20px", backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 8px 12px rgba(0,0,0,0.1)' }}>
                        <Row gutter={[16, 16]}>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-warning shadow h-100 py-2">
                                    <div className="font-weight-bold text-warning text-uppercase mb-1">
                                        Tổng số tài liệu trong năm {currentYear}
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentStatisticsUntilThisYear?.totalDocuments}</div>
                                </Card>
                            </Col>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-warning shadow h-100 py-2">
                                    <div className="font-weight-bold text-warning text-uppercase mb-1">
                                        Tổng số tài liệu đã số hóa từ 01/01/{currentYear} - nay
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentStatisticsUntilThisYear?.totalDigitizedDocuments}</div>
                                </Card>
                            </Col>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-warning shadow h-100 py-2">
                                    <div className="font-weight-bold text-warning text-uppercase mb-1">
                                        Tổng số tài liệu chưa số hóa từ 01/01/{currentYear} - nay
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentStatisticsUntilThisYear?.totalUndigitizedDocuments}</div>
                                </Card>
                            </Col>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-warning shadow h-100 py-2">
                                    <div className="font-weight-bold text-warning text-uppercase mb-1">
                                        Tỉ lệ đã số hóa
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentStatisticsUntilThisYear?.totalPercentage}%</div>
                                    <Progress percent={stateDocumentStatisticsUntilThisYear?.totalPercentage} status="active" />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                    <div className="mt-4" style={{ padding: "20px", backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 8px 12px rgba(0,0,0,0.1)' }}>
                        <Row gutter={[16, 16]}>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-danger shadow h-100 py-2">
                                    <div className="font-weight-bold text-danger text-uppercase mb-1">
                                        Chỉ tiêu Công an tỉnh giao
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentTargetStatisticsUntilThisYear?.digitized_documents_target}</div>
                                </Card>
                            </Col>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-danger shadow h-100 py-2">
                                    <div className="font-weight-bold text-danger text-uppercase mb-1">
                                        Đã số hóa được
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentTargetStatisticsUntilThisYear?.totalDigitizedDocuments}</div>
                                </Card>
                            </Col>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-danger shadow h-100 py-2">
                                    <div className="font-weight-bold text-danger text-uppercase mb-1">
                                        Còn lại
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentTargetStatisticsUntilThisYear?.totalUndigitizedDocuments}</div>
                                </Card>
                            </Col>
                            <Col xl={6} md={12} sm={24}>
                                <Card bordered={false} className="border-left-danger shadow h-100 py-2">
                                    <div className="font-weight-bold text-danger text-uppercase mb-1">
                                        Tiến độ chỉ tiêu đạt
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stateDocumentTargetStatisticsUntilThisYear?.totalPercentage}%</div>
                                    <Progress percent={stateDocumentTargetStatisticsUntilThisYear?.totalPercentage} status="active" />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </>
            }
            
            {/* <div style={{ marginTop: '20px' }}>
                <TableComponent columns={columns} data={dataTable} isLoading={isLoadingDigitizedDocument || isLoadingResetFilter} resetSelection={resetSelection}
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
            </div> */}
        </div>
    )
}
