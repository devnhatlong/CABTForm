import React, { useEffect, useState, useRef } from 'react';
import { WrapperHeader } from './style';
import { Button } from "antd";
import TableComponent from '../TableComponent/TableComponent';
import { useQuery } from '@tanstack/react-query';
import statisticsByUserService from '../../services/statisticsByUserService';
import { Document, Packer, Paragraph, Table, TableCell, 
        TableRow, WidthType, HeadingLevel, TextRun, AlignmentType, 
        VerticalAlign } from 'docx';
import { saveAs } from 'file-saver';
import { formatNumber } from '../../utils/utils';

export const StatisticsByUser = () => {
    const [rowSelected, setRowSelected] = useState();
    const [dataTable1, setDataTable1] = useState([]);
    const [dataTable2, setDataTable2] = useState([]);
    const [dataTable3, setDataTable3] = useState([]);
    const [dataTable4, setDataTable4] = useState([]);
    const [dataTable5, setDataTable5] = useState([]);
    const [filters, setFilters] = useState({});
    const [resetSelection, setResetSelection] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 100 // Số lượng mục trên mỗi trang
    });

    const getDigitizedDocumentFrom2018To2023 = async () => {
        const response = await statisticsByUserService.getDigitizedDocumentFrom2018To2023();
    
        // Format number fields with thousand separators
        const formattedResponse = response.response.map(doc => ({
            ...doc,
            digitized_documents_count: formatNumber(doc.digitized_documents_count),
            digitized_documents_count_current: formatNumber(doc.digitized_documents_count_current),
            total_documents_count: formatNumber(doc.total_documents_count),
            undigitized_documents_count: formatNumber(doc.undigitized_documents_count),
        }));
    
        setDataTable1(formattedResponse);
        return response;
    };

    const getDigitizedDocumentInCurrentYear = async () => {
        const response = await statisticsByUserService.getDigitizedDocumentInCurrentYear();
        const aggregatedResults = response?.response;
    
        // Format numbers with thousand separators
        const updatedAggregatedResults = aggregatedResults.map(doc => ({
            ...doc,
            digitized_documents_count: formatNumber(doc.digitized_documents_count),
            total_documents_count: formatNumber(doc.total_documents_count),
            undigitized_documents_count: formatNumber(doc.undigitized_documents_count),
            digitization_percentage: doc.digitization_percentage.toFixed(2) + "%" // Format digitization_percentage
        }));
    
        setDataTable2(updatedAggregatedResults);
        return response;
    };

    const getDigitizedDocumentFrom2018To2024 = async () => {
        const response = await statisticsByUserService.getDigitizedDocumentFrom2018To2024();
        const aggregatedResults = response?.response;
    
        // Format numbers with thousand separators
        const updatedAggregatedResults = aggregatedResults.map(doc => ({
            ...doc,
            digitized_documents_count: formatNumber(doc.digitized_documents_count),
            total_documents_count: formatNumber(doc.total_documents_count),
            undigitized_documents_count: formatNumber(doc.undigitized_documents_count)
        }));
    
        setDataTable5(updatedAggregatedResults);
        // setDataTable5(response?.response);
        return response;
    };

    const getAdministrativeProceduresPre = async () => {
        const response = await statisticsByUserService.getAdministrativeProceduresPre();
    
        // Format numbers with thousand separators
        const formattedResponse = response?.response.map(doc => ({
            ...doc,
            digitized_documents_count: formatNumber(doc.digitized_documents_count),
            total_documents_count: formatNumber(doc.total_documents_count)
        }));
    
        setDataTable3([...formattedResponse]);
        return response;
    };

    const getAdministrativeProceduresPost = async () => {
        const response = await statisticsByUserService.getAdministrativeProceduresPost();
        const formattedResponse = response?.response.map(doc => ({
            ...doc,
            digitized_documents_count: formatNumber(doc.digitized_documents_count),
            total_documents_count: formatNumber(doc.total_documents_count)
        }));
    
        setDataTable4([...formattedResponse]);
        return response;
    };

    const queryDigitizedDocumentFrom2018To2023 = useQuery({
        queryKey: ['digitizedDocumentFrom2018To2023'],
        queryFn: () => getDigitizedDocumentFrom2018To2023(),
        retry: 3,
        retryDelay: 1000,
    });

    const queryDigitizedDocumentInCurrentYear = useQuery({
        queryKey: ['digitizedDocumentInCurrentYear'],
        queryFn: () => getDigitizedDocumentInCurrentYear(),
        retry: 3,
        retryDelay: 1000,
    });

    const queryDigitizedDocumentFrom2018To2024 = useQuery({
        queryKey: ['digitizedDocumentFrom2018To2024'],
        queryFn: () => getDigitizedDocumentFrom2018To2024(),
        retry: 3,
        retryDelay: 1000,
    });

    const queryAdministrativeProceduresPre = useQuery({
        queryKey: ['administrativeProceduresPre'],
        queryFn: () => getAdministrativeProceduresPre(),
        retry: 3,
        retryDelay: 1000,
    });

    const queryAdministrativeProceduresPost = useQuery({
        queryKey: ['administrativeProceduresPost'],
        queryFn: () => getAdministrativeProceduresPost(),
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingDigitizedDocumentFrom2018To2023, data: digitizedDocumentFrom2018To2023 } = queryDigitizedDocumentFrom2018To2023;
    const { isLoading: isLoadingDigitizedDocumentInCurrentYear, data: digitizedDocumentInCurrentYear } = queryDigitizedDocumentInCurrentYear;
    const { isLoading: isLoadingDigitizedDocumentFrom2018To2024, data: digitizedDocumentFrom2018To2024 } = queryDigitizedDocumentFrom2018To2024;
    const { isLoading: isLoadingAdministrativeProceduresPre, data: administrativeProceduresPre } = queryAdministrativeProceduresPre;
    const { isLoading: isLoadingAdministrativeProceduresPost, data: administrativeProceduresPost } = queryAdministrativeProceduresPost;

    const columnsTable1 = [
        {
            title: 'Đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
            // sorter: (a, b) => a.departmentName - b.departmentName,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            // ...getColumnSearchProps('departmentName', 'đơn vị')
        },
        {
            title: 'Tổng',
            dataIndex: 'total_documents_count',
            key: 'total_documents_count',
            // sorter: (a, b) => a.digitized_documents_count - b.digitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Đã số hóa ',
            dataIndex: 'digitized_documents_count',
            key: 'digitized_documents_count',
            // sorter: (a, b) => a.undigitized_documents_count - b.undigitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Chưa số hóa',
            dataIndex: 'undigitized_documents_count',
            key: 'undigitized_documents_count',
            // sorter: (a, b) => a.total_documents_count - b.total_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tỉ lệ đã số hóa',
            dataIndex: 'digitization_percentage',
            key: 'digitization_percentage',
            // sorter: (a, b) => a.digitization_percentage - b.digitization_percentage,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Đạt chỉ tiêu được giao',
            dataIndex: 'achieve_assigned_targets',
            key: 'achieve_assigned_targets',
            // sorter: (a, b) => a.digitization_percentage - b.digitization_percentage,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
    ];

    const columnsTable2 = [
        {
            title: 'Đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tổng hồ sơ 2024 tính đến thời điểm hiện tại',
            dataIndex: 'total_documents_count',
            key: 'total_documents_count',
            // sorter: (a, b) => a.digitized_documents_count - b.digitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Đã số hóa ',
            dataIndex: 'digitized_documents_count',
            key: 'digitized_documents_count',
            // sorter: (a, b) => a.undigitized_documents_count - b.undigitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tỉ lệ đã số hóa',
            dataIndex: 'digitization_percentage',
            key: 'digitization_percentage',
            // sorter: (a, b) => a.digitization_percentage - b.digitization_percentage,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
    ];

    const columnsTable3 = [
        {
            title: 'Đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
            // sorter: (a, b) => a.departmentName - b.departmentName,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            // ...getColumnSearchProps('departmentName', 'đơn vị')
        },
        {
            title: 'Tổng',
            dataIndex: 'total_documents_count',
            key: 'total_documents_count',
            // sorter: (a, b) => a.digitized_documents_count - b.digitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Đã số hóa ',
            dataIndex: 'digitized_documents_count',
            key: 'digitized_documents_count',
            // sorter: (a, b) => a.undigitized_documents_count - b.undigitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tỉ lệ đã số hóa',
            dataIndex: 'digitization_percentage',
            key: 'digitization_percentage',
            // sorter: (a, b) => a.digitization_percentage - b.digitization_percentage,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Đạt chỉ tiêu được giao',
            dataIndex: 'achieve_assigned_targets',
            key: 'achieve_assigned_targets',
            // sorter: (a, b) => a.digitization_percentage - b.digitization_percentage,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
    ];

    const columnsTable4 = [
        {
            title: 'Đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tổng hồ sơ 2024 tính đến thời điểm hiện tại',
            dataIndex: 'total_documents_count',
            key: 'total_documents_count',
            // sorter: (a, b) => a.digitized_documents_count - b.digitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Đã số hóa ',
            dataIndex: 'digitized_documents_count',
            key: 'digitized_documents_count',
            // sorter: (a, b) => a.undigitized_documents_count - b.undigitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tỉ lệ đã số hóa',
            dataIndex: 'digitization_percentage',
            key: 'digitization_percentage',
            // sorter: (a, b) => a.digitization_percentage - b.digitization_percentage,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
    ];

    const columnsTable5 = [
        {
            title: 'Đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tổng',
            dataIndex: 'total_documents_count',
            key: 'total_documents_count',
            // sorter: (a, b) => a.digitized_documents_count - b.digitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Đã số hóa ',
            dataIndex: 'digitized_documents_count',
            key: 'digitized_documents_count',
            // sorter: (a, b) => a.undigitized_documents_count - b.undigitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tỉ lệ đã số hóa',
            dataIndex: 'digitization_percentage',
            key: 'digitization_percentage',
            // sorter: (a, b) => a.digitization_percentage - b.digitization_percentage,
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
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: "CÔNG AN BÌNH THUẬN", size: 24 }),
                                        new TextRun({ break: 1 }), // This will insert a hard break (new line)
                                        new TextRun({ text: `${dataTable1[0].departmentName}`.toUpperCase(), bold: true, size: 24 }),
                                    ],
                                    alignment: AlignmentType.CENTER
                                }),
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: "Số:", size: 24 }),
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
        const characterWidth = fontSize * 0.5; // Rough estimate: each character is 0.6 times the font size
        return text.length * characterWidth;
    };
    
    const createTable = (data, columns, includeUndigitized = true, includeAchieveTargets = true) => {
        // Filter out columns based on the provided options
        const filteredColumns = columns.filter(col => {
            if (!includeUndigitized && col.title === 'Chưa số hóa') return false;
            if (!includeAchieveTargets && col.title === 'Đạt chỉ tiêu được giao') return false;
            return true;
        });
    
        // Get the content from the first column in the first row
        const firstColumnContent = data[0]?.departmentName || "";
        const firstColumnWidth = estimateTextWidth(firstColumnContent); // Estimate width of the longest text
    
        const totalWidth = 100; // Total width in percentage
        const firstColumnWidthPercentage = Math.min(firstColumnWidth, totalWidth * 0.42); // Cap the first column width to 80% of the total width
        const remainingWidth = totalWidth - firstColumnWidthPercentage;
        const equalWidth = remainingWidth / (filteredColumns.length - 1);
    
        const headerCells = filteredColumns.map((col, index) => new TableCell({
            children: [new Paragraph({
                children: [new TextRun({ text: col.title, bold: true, size: 26 })], // Set font size to 26
                spacing: { before: 60, after: 60 }, // Add spacing before and after
                alignment: AlignmentType.CENTER // Center horizontally
            })],
            verticalAlign: VerticalAlign.CENTER, // Center vertically
            width: {
                size: index === 0 ? firstColumnWidthPercentage : equalWidth,
                type: WidthType.PERCENTAGE
            }
        }));
        const headerRow = new TableRow({ children: headerCells });
    
        const dataRows = data.map(row => {
            const cells = filteredColumns.map((col, index) => new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text: row[col.dataIndex]?.toString() || "", size: 26 })], // Set font size to 26
                    spacing: { before: 60, after: 60 }, // Add spacing before and after
                    alignment: AlignmentType.CENTER // Center horizontally
                })],
                verticalAlign: VerticalAlign.CENTER, // Center vertically
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
        const columns = [
            { title: 'Đơn vị', dataIndex: 'departmentName'},
            { title: 'Tổng', dataIndex: 'total_documents_count'},
            { title: 'Đã số hóa', dataIndex: 'digitized_documents_count'},
            { title: 'Chưa số hóa', dataIndex: 'undigitized_documents_count'},
            { title: 'Tỉ lệ đã số hóa', dataIndex: 'digitization_percentage'},
            { title: 'Đạt chỉ tiêu được giao', dataIndex: 'achieve_assigned_targets'}
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
                            children: [new TextRun({ text: "I. Hồ sơ hình thành phổ biến", bold: true, size: 26 })],
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }),

                        new Paragraph({
                            children: [new TextRun({ text: "1. Từ năm 2018 đến năm 2023", bold: true, italics: true, size: 26 })],
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }),
                        createTable(dataTable1, columns),

                        new Paragraph({
                            children: [new TextRun({ text: "2. Năm 2024", bold: true, italics: true, size: 26 })],
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }),
                        createTable(dataTable2, columns, true, false), // Exclude 'Đạt chỉ tiêu được giao' column

                        new Paragraph({
                            children: [new TextRun({ text: "II. Hồ sơ kết quả giải quyết thủ tục hành chính", bold: true, size: 26 })],
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }),

                        new Paragraph({
                            children: [new TextRun({ text: "1. Trước 01/07/2022", bold: true, italics: true, size: 26 })],
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }),
                        createTable(dataTable3, columns, false), // Exclude 'Chưa số hóa' column

                        new Paragraph({
                            children: [new TextRun({ text: "2. Sau 01/07/2022", bold: true, italics: true, size: 26 })],
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }),
                        createTable(dataTable4, columns, false, false), // Exclude 'Chưa số hóa' and 'Đạt chỉ tiêu được giao' columns

                        new Paragraph({
                            children: [
                                new TextRun({ text: "CÁN BỘ THỐNG KÊ", bold: true, size: 26 }),
                                new TextRun({ text: "\t\t\t\t\t\t" }), // Sử dụng các tab để căn chỉnh văn bản
                                new TextRun({ text: "LÃNH ĐẠO ĐƠN VỊ", bold: true, size: 26 })
                            ],
                            alignment: AlignmentType.LEFT, // Căn trái đoạn văn, nhưng tab sẽ căn phải văn bản thứ hai
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        })
                    ]
                }
            ]
        });
    
        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "thống kê.docx");
        });
    };

    return (
        <div>
            <div style={{display: "flex", gap: "20px", marginTop: "10px" }}>
                <Button type="primary" style={{display: "flex", alignItems: "center", height: "50px", borderRadius: "6px"}} onClick={handleExport}>
                    <strong>Xuất file báo cáo</strong>
                </Button>
            </div>

            <WrapperHeader>A. Hồ sơ hình thành phổ biến</WrapperHeader>
            <WrapperHeader>I. 2018 - 2023</WrapperHeader>
            
            {/* Table 1 */}
            <div style={{ marginTop: '20px' }}>
                <TableComponent columns={columnsTable1} data={dataTable1} isLoading={isLoadingDigitizedDocumentFrom2018To2023} resetSelection={resetSelection}
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

            {/* Table 2 */}
            <WrapperHeader>II. 2024</WrapperHeader>
            <div style={{ marginTop: '20px' }}>
                <TableComponent columns={columnsTable2} data={dataTable2} isLoading={isLoadingDigitizedDocumentInCurrentYear} resetSelection={resetSelection}
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

            {/* Table 5 */}
            <WrapperHeader>III. 2018 - 2024</WrapperHeader>
            <div style={{ marginTop: '20px' }}>
                <TableComponent columns={columnsTable5} data={dataTable5} isLoading={isLoadingDigitizedDocumentFrom2018To2024} resetSelection={resetSelection}
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

            <WrapperHeader>B. Hồ sơ giải quyết thủ tục hành chính</WrapperHeader>
            {/* Table 3 */}
            <WrapperHeader>I. Trước 01/07/2022</WrapperHeader>
            <div style={{ marginTop: '20px' }}>
                <TableComponent columns={columnsTable3} data={dataTable3} isLoading={isLoadingAdministrativeProceduresPre} resetSelection={resetSelection}
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

            {/* Table 4 */}
            <WrapperHeader>II. Sau 01/07/2022</WrapperHeader>
            <div style={{ marginTop: '20px' }}>
                <TableComponent columns={columnsTable4} data={dataTable4} isLoading={isLoadingAdministrativeProceduresPost} resetSelection={resetSelection}
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
    )
}