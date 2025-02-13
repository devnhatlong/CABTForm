import React, { useEffect, useState, useRef } from 'react';
import { WrapperHeader } from './style';
import { Button, DatePicker } from "antd";
import TableComponent from '../TableComponent/TableComponent';
import { useQuery } from '@tanstack/react-query';
import warningByAdminService from '../../services/warningByAdminService';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, HeadingLevel, VerticalAlign, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import moment from 'moment';
import Moment from 'react-moment';

export const WarningByAdmin = () => {
    const [rowSelected, setRowSelected] = useState();
    const [dataTable1, setDataTable1] = useState([]);
    const [dataTable2, setDataTable2] = useState([]);
    const [dataTable3, setDataTable3] = useState([]);
    const [dataTable4, setDataTable4] = useState([]);
    const [sortedData1, setSortedData1] = useState({});
    const [sortedData2, setSortedData2] = useState({});
    const [sortedData3, setSortedData3] = useState({});
    const [sortedData4, setSortedData4] = useState({});
    const [filters, setFilters] = useState({});
    const [resetSelection, setResetSelection] = useState(false);
    const [searchDate, setSearchDate] = useState(moment());
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 100 // Số lượng mục trên mỗi trang
    });

    const getUnitNotEnteredData1 = async (month, year) => {
        const response = await warningByAdminService.getUnitNotEnteredData1(month, year);

        return response;
    };

    const queryUnitNotEnteredData1 = useQuery({
        queryKey: ['unitNotEnteredData1'],
        queryFn: () => getUnitNotEnteredData1(searchDate.month() + 1, searchDate.year()), // Months are zero-based in JavaScript
        retry: 3,
        retryDelay: 1000,
    });

    const getUnitNotEnteredData2 = async (month, year) => {
        const response = await warningByAdminService.getUnitNotEnteredData2(month, year);

        return response;
    };

    const queryUnitNotEnteredData2 = useQuery({
        queryKey: ['unitNotEnteredData2'],
        queryFn: () => getUnitNotEnteredData2(searchDate.month() + 1, searchDate.year()), // Months are zero-based in JavaScript
        retry: 3,
        retryDelay: 1000,
    });

    const getUnitNotEnteredData3 = async (month, year) => {
        const response = await warningByAdminService.getUnitNotEnteredData3(month, year);

        return response;
    };

    const queryUnitNotEnteredData3 = useQuery({
        queryKey: ['unitNotEnteredData3'],
        queryFn: () => getUnitNotEnteredData3(searchDate.month() + 1, searchDate.year()), // Months are zero-based in JavaScript
        retry: 3,
        retryDelay: 1000,
    });

    const getUnitNotEnteredData4 = async (month, year) => {
        const response = await warningByAdminService.getUnitNotEnteredData4(month, year);

        return response;
    };

    const queryUnitNotEnteredData4 = useQuery({
        queryKey: ['unitNotEnteredData4'],
        queryFn: () => getUnitNotEnteredData4(searchDate.month() + 1, searchDate.year()), // Months are zero-based in JavaScript
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingUnitNotEnteredData1, data: unitNotEnteredData1 } = queryUnitNotEnteredData1;
    const { isLoading: isLoadingUnitNotEnteredData2, data: unitNotEnteredData2 } = queryUnitNotEnteredData2;
    const { isLoading: isLoadingUnitNotEnteredData3, data: unitNotEnteredData3 } = queryUnitNotEnteredData3;
    const { isLoading: isLoadingUnitNotEnteredData4, data: unitNotEnteredData4 } = queryUnitNotEnteredData4;

    useEffect(() => {
        if (unitNotEnteredData1?.response) {
            const updatedDataTable = fetchDataForDataTable(unitNotEnteredData1);
            setDataTable1(updatedDataTable);
        }
    }, [unitNotEnteredData1]);

    useEffect(() => {
        if (unitNotEnteredData2?.response) {
            const updatedDataTable = fetchDataForDataTable(unitNotEnteredData2);
            setDataTable2(updatedDataTable);
        }
    }, [unitNotEnteredData2]);

    useEffect(() => {
        if (unitNotEnteredData3?.response) {
            const updatedDataTable = fetchDataForDataTable(unitNotEnteredData3);
            setDataTable3(updatedDataTable);
        }
    }, [unitNotEnteredData3]);

    useEffect(() => {
        if (unitNotEnteredData4?.response) {
            const updatedDataTable = fetchDataForDataTable(unitNotEnteredData4);
            setDataTable4(updatedDataTable);
        }
    }, [unitNotEnteredData4]);

    const fetchDataForDataTable = (unitNotEnteredData) => {
        return unitNotEnteredData?.response?.map((digitizedDocument) => {
            return {
                ...digitizedDocument, 
                key: digitizedDocument._id,
                createdAt: <Moment format="DD/MM/YYYY HH:MM">{digitizedDocument.createdAt}</Moment>,
            };
        });
    };

    const columnsTable1 = [
        {
            title: 'Đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
            sorter: (a, b) => a.departmentName.localeCompare(b.departmentName),
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            // ...getColumnSearchProps('departmentName', 'đơn vị')
        },
        {
            title: 'Ngày nhập cuối cùng',
            dataIndex: 'createdAt',
            key: 'createdAt',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
    ];

    const columnsTable2 = [
        {
            title: 'Đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
            sorter: (a, b) => a.departmentName.localeCompare(b.departmentName),
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            // ...getColumnSearchProps('departmentName', 'đơn vị')
        },
        {
            title: 'Ngày nhập cuối cùng',
            dataIndex: 'createdAt',
            key: 'createdAt',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
    ];

    const columnsTable3 = [
        {
            title: 'Đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
            sorter: (a, b) => a.departmentName.localeCompare(b.departmentName),
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            // ...getColumnSearchProps('departmentName', 'đơn vị')
        },
        {
            title: 'Ngày nhập cuối cùng',
            dataIndex: 'createdAt',
            key: 'createdAt',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
    ];

    const columnsTable4 = [
        {
            title: 'Đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
            sorter: (a, b) => a.departmentName.localeCompare(b.departmentName),
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            // ...getColumnSearchProps('departmentName', 'đơn vị')
        },
        {
            title: 'Ngày nhập cuối cùng',
            dataIndex: 'createdAt',
            key: 'createdAt',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
    ];

    const handlePageChange = (page, pageSize) => {
        setPagination({
            ...pagination,
            currentPage: page,
            pageSize: pageSize
        });
    };

    const createTwoColumnTable = () => {
        const currentDate = new Date();
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1; // Months are zero-based in JavaScript
        const year = currentDate.getFullYear();

        return new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({
                                children: [
                                    new TextRun({ text: "CÔNG AN BÌNH THUẬN", bold: true, size: 24 }),
                                ],
                                alignment: AlignmentType.CENTER
                            })],
                            borders: {
                                top: { size: 0, color: "FFFFFF" },
                                bottom: { size: 0, color: "FFFFFF" },
                                left: { size: 0, color: "FFFFFF" },
                                right: { size: 0, color: "FFFFFF" }
                            },
                            width: {
                                size: 40,
                                type: WidthType.PERCENTAGE
                            }
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, size: 24 }),
                                        new TextRun({ break: 1 }), // This will insert a hard break (new line)
                                        new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", bold: true, size: 24 }),
                                    ],
                                    alignment: AlignmentType.CENTER
                                }),
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: `Bình Thuận, ngày ${day} tháng ${month} năm ${year}`, italics: true, size: 24 }),
                                    ],
                                    alignment: AlignmentType.CENTER,
                                    spacing: {
                                        before: 200
                                    }
                                })
                            ],
                            borders: {
                                top: { size: 0, color: "FFFFFF" },
                                bottom: { size: 0, color: "FFFFFF" },
                                left: { size: 0, color: "FFFFFF" },
                                right: { size: 0, color: "FFFFFF" }
                            },
                            width: {
                                size: 60,
                                type: WidthType.PERCENTAGE
                            }
                        })
                    ]
                })
            ]
        });
    };

    const estimateTextWidth = (text, fontSize = 26) => {
        // Approximate width of the text based on the character count and font size
        const characterWidth = fontSize * 0.6; // Rough estimate: each character is 0.6 times the font size
        return text.length * characterWidth;
    };

    const createTable = (data, columns) => {
        // Chỉ sử dụng 2 cột
        const filteredColumns = columns.slice(0, 2); 
    
        // Lấy nội dung từ cột đầu tiên trong hàng đầu tiên
        const firstColumnContent = data[0]?.departmentName || "";
        const firstColumnWidth = estimateTextWidth(firstColumnContent); // Ước tính độ rộng của văn bản dài nhất
    
        const totalWidth = 100; // Tổng chiều rộng dưới dạng phần trăm
        const firstColumnWidthPercentage = Math.min(firstColumnWidth, totalWidth * 0.42); // Giới hạn chiều rộng của cột đầu tiên
        const remainingWidth = totalWidth - firstColumnWidthPercentage;
        const equalWidth = remainingWidth / (filteredColumns.length - 1);
    
        const headerCells = filteredColumns.map((col, index) => new TableCell({
            children: [new Paragraph({
                children: [new TextRun({ text: col.title, bold: true, size: 26 })], // Cài đặt kích thước phông chữ
                spacing: { before: 60, after: 60 }, // Thêm khoảng cách trước và sau
                alignment: AlignmentType.CENTER // Canh giữa theo chiều ngang
            })],
            verticalAlign: VerticalAlign.CENTER, // Canh giữa theo chiều dọc
            width: {
                size: index === 0 ? firstColumnWidthPercentage : equalWidth,
                type: WidthType.PERCENTAGE
            }
        }));
        const headerRow = new TableRow({ children: headerCells });
    
        const dataRows = data.map(row => {
            const cells = filteredColumns.map((col, index) => new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text: row[col.dataIndex]?.toString() || "", size: 26 })], // Cài đặt kích thước phông chữ
                    spacing: { before: 60, after: 60 }, // Thêm khoảng cách trước và sau
                    alignment: AlignmentType.CENTER // Canh giữa theo chiều ngang
                })],
                verticalAlign: VerticalAlign.CENTER, // Canh giữa theo chiều dọc
                width: {
                    size: index === 0 ? firstColumnWidthPercentage : equalWidth,
                    type: WidthType.PERCENTAGE
                }
            }));
            return new TableRow({ children: cells });
        });
    
        return new Table({
            rows: [headerRow, ...dataRows],
            width: {
                size: 100,
                type: WidthType.PERCENTAGE,
            },
        });
    };
    
    const handleExport = () => {
        const formattedData1 = dataTable1.map(row => {
            // Kiểm tra và chuyển đổi createdAt nếu cần
            const formattedDate = moment(row.createdAt.props.children).format("DD/MM/YYYY HH:mm");
    
            return {
                ...row,
                createdAt: formattedDate
            };
        });

        const formattedData2 = dataTable2.map(row => {
            // Kiểm tra và chuyển đổi createdAt nếu cần
            const formattedDate = moment(row.createdAt.props.children).format("DD/MM/YYYY HH:mm");
    
            return {
                ...row,
                createdAt: formattedDate
            };
        });

        const formattedData3 = dataTable3.map(row => {
            // Kiểm tra và chuyển đổi createdAt nếu cần
            const formattedDate = moment(row.createdAt.props.children).format("DD/MM/YYYY HH:mm");
    
            return {
                ...row,
                createdAt: formattedDate
            };
        });

        const formattedData4 = dataTable4.map(row => {
            // Kiểm tra và chuyển đổi createdAt nếu cần
            const formattedDate = moment(row.createdAt.props.children).format("DD/MM/YYYY HH:mm");
    
            return {
                ...row,
                createdAt: formattedDate
            };
        });

        const columns = [
            { title: 'Đơn vị', dataIndex: 'departmentName'},
            { title: 'Ngày nhập cuối cùng', dataIndex: 'createdAt'},
        ];
    
        const currentDate = new Date();
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1; // Months are zero-based in JavaScript
        const year = currentDate.getFullYear();
    
        const doc = new Document({
            sections: [
                {
                    children: [
                        createTwoColumnTable(),

                        new Paragraph({
                            children: [new TextRun({ text: "BÁO CÁO", bold: true, size: 26 })],
                            alignment: AlignmentType.CENTER,
                            spacing: {
                                before: 300
                            }
                        }),

                        new Paragraph({
                            children: [new TextRun({ text: `Kết quả thống kê số hóa tháng ${month}`, bold: true, size: 26 })],
                            alignment: AlignmentType.CENTER,
                            spacing: {
                                after: 300
                            }
                        }),

                        new Paragraph({
                            children: [new TextRun({ text: "I. Danh sách các địa phương chưa nhập số liệu hình thành phổ biến từ 2018-2023", bold: true, size: 26 })],
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }),
                        createTable(sortedData1.length > 0 ? sortedData1 : formattedData1, columns),

                        new Paragraph({
                            children: [new TextRun({ text: "II. Danh sách các địa phương chưa nhập số liệu hình thành phổ biến 2024", bold: true, size: 26 })],
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }),
                        createTable(sortedData2.length > 0 ? sortedData2 : formattedData2, columns),

                        new Paragraph({
                            children: [new TextRun({ text: "III. Danh sách các địa phương chưa nhập số liệu thủ tục hành chính từ 01/07/2022 trở về trước", bold: true, size: 26 })],
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }),
                        createTable(sortedData3.length > 0 ? sortedData3 : formattedData3, columns),

                        new Paragraph({
                            children: [new TextRun({ text: "VI. Danh sách các địa phương chưa nhập số liệu thủ tục hành chính từ 01/07/2022 đến nay", bold: true, size: 26 })],
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }),
                        createTable(sortedData4.length > 0 ? sortedData4 : formattedData4, columns),

                        new Paragraph({
                            children: [new TextRun({ text: "", size: 26 })],
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({ text: "CÁN BỘ THỐNG KÊ", bold: true, size: 26 }),
                                new TextRun({ text: "\t\t\t\t\t\t" }), // Sử dụng các tab để căn chỉnh văn bản
                                new TextRun({ text: "LÃNH ĐẠO ĐƠN VỊ", bold: true, size: 26 })
                            ],
                            alignment: AlignmentType.LEFT // Căn trái đoạn văn, nhưng tab sẽ căn phải văn bản thứ hai
                        })
                    ]
                }
            ]
        });
    
        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "thống kê.docx");
        });
    };    

    const handleTable1Change = (pagination, filters, sorter, extra) => {
        setSortedData1(extra.currentDataSource);
    };

    const handleTable2Change = (pagination, filters, sorter, extra) => {
        setSortedData2(extra.currentDataSource);
    };

    const handleTable3Change = (pagination, filters, sorter, extra) => {
        setSortedData3(extra.currentDataSource);
    };

    const handleTable4Change = (pagination, filters, sorter, extra) => {
        setSortedData4(extra.currentDataSource);
    };

    const handleDateChangeUnitNotEnteredData1 = (date) => {
        setSearchDate(date);
    };

    const handleSearchUnitNotEnteredData1 = () => {
        queryUnitNotEnteredData1.refetch();
    };

    const handleDateChangeUnitNotEnteredData2 = (date) => {
        setSearchDate(date);
    };

    const handleSearchUnitNotEnteredData2 = () => {
        queryUnitNotEnteredData2.refetch();
    };

    const handleDateChangeUnitNotEnteredData3 = (date) => {
        setSearchDate(date);
    };

    const handleSearchUnitNotEnteredData3 = () => {
        queryUnitNotEnteredData3.refetch();
    };

    const handleDateChangeUnitNotEnteredData4 = (date) => {
        setSearchDate(date);
    };

    const handleSearchUnitNotEnteredData4 = () => {
        queryUnitNotEnteredData4.refetch();
    };

    return (
        <div>
            <div style={{display: "flex", gap: "20px", marginTop: "10px", marginBottom: "10px" }}>
                <Button type="primary" style={{display: "flex", alignItems: "center", height: "50px", borderRadius: "6px"}} onClick={handleExport}>
                    <strong>Xuất file báo cáo</strong>
                </Button>
            </div>

            <div>
                <WrapperHeader>Danh sách các địa phương chưa nhập số liệu hình thành phổ biến từ 2018-2023</WrapperHeader>
                
                <div style={{ display: "flex", gap: "20px", marginTop: "10px", marginBottom: "10px" }}>
                    <DatePicker 
                        picker="month"
                        onChange={handleDateChangeUnitNotEnteredData1}
                        format="MM/YYYY"
                        style={{ borderRadius: "6px" }}
                    />
                    <Button type="primary" onClick={handleSearchUnitNotEnteredData1}>Tìm kiếm</Button>
                </div>

                {/* Table 1 */}
                <div style={{ marginTop: '20px' }}>
                    <TableComponent columns={columnsTable1} data={dataTable1} isLoading={isLoadingUnitNotEnteredData1} resetSelection={resetSelection}
                        onChange={handleTable1Change}
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
            </div>

            <div>
                <WrapperHeader>Danh sách các địa phương chưa nhập số liệu hình thành phổ biến 2024</WrapperHeader>
                
                <div style={{ display: "flex", gap: "20px", marginTop: "10px", marginBottom: "10px" }}>
                    <DatePicker 
                        picker="month"
                        onChange={handleDateChangeUnitNotEnteredData2}
                        format="MM/YYYY"
                        style={{ borderRadius: "6px" }}
                    />
                    <Button type="primary" onClick={handleSearchUnitNotEnteredData2}>Tìm kiếm</Button>
                </div>

                {/* Table 2 */}
                <div style={{ marginTop: '20px' }}>
                    <TableComponent columns={columnsTable2} data={dataTable2} isLoading={isLoadingUnitNotEnteredData2} resetSelection={resetSelection}
                        onChange={handleTable2Change}
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
            </div>

            <div>
                <WrapperHeader>Danh sách các địa phương chưa nhập số liệu thủ tục hành chính từ 01/07/2022 trở về trước</WrapperHeader>
                
                <div style={{ display: "flex", gap: "20px", marginTop: "10px", marginBottom: "10px" }}>
                    <DatePicker 
                        picker="month"
                        onChange={handleDateChangeUnitNotEnteredData3}
                        format="MM/YYYY"
                        style={{ borderRadius: "6px" }}
                    />
                    <Button type="primary" onClick={handleSearchUnitNotEnteredData3}>Tìm kiếm</Button>
                </div>

                {/* Table 3 */}
                <div style={{ marginTop: '20px' }}>
                    <TableComponent columns={columnsTable3} data={dataTable3} isLoading={isLoadingUnitNotEnteredData3} resetSelection={resetSelection}
                        onChange={handleTable3Change}
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
            </div>

            <div>
                <WrapperHeader>Danh sách các địa phương chưa nhập số liệu thủ tục hành chính từ 01/07/2022 đến nay</WrapperHeader>
                
                <div style={{ display: "flex", gap: "20px", marginTop: "10px", marginBottom: "10px" }}>
                    <DatePicker 
                        picker="month"
                        onChange={handleDateChangeUnitNotEnteredData4}
                        format="MM/YYYY"
                        style={{ borderRadius: "6px" }}
                    />
                    <Button type="primary" onClick={handleSearchUnitNotEnteredData4}>Tìm kiếm</Button>
                </div>

                {/* Table 3 */}
                <div style={{ marginTop: '20px' }}>
                    <TableComponent columns={columnsTable4} data={dataTable4} isLoading={isLoadingUnitNotEnteredData4} resetSelection={resetSelection}
                        onChange={handleTable4Change}
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
            </div>
        </div>
    )
}