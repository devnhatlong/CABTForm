import React, { useEffect, useState, useRef } from 'react';
import { WrapperHeader } from './style';
import { Button } from "antd";
import TableComponent from '../TableComponent/TableComponent';
import { useQuery } from '@tanstack/react-query';
import statisticsByAdminService from '../../services/statisticsByAdminService';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, HeadingLevel, VerticalAlign, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { formatNumber } from '../../utils/utils';

export const StatisticsByAdmin = () => {
    const [rowSelected, setRowSelected] = useState();
    const [dataTable1, setDataTable1] = useState([]);
    const [sortedData1, setSortedData1] = useState({});
    const [dataTable2, setDataTable2] = useState([]);
    const [sortedData2, setSortedData2] = useState({});
    const [dataTable3, setDataTable3] = useState([]);
    const [sortedData3, setSortedData3] = useState({});
    const [dataTable4, setDataTable4] = useState([]);
    const [sortedData4, setSortedData4] = useState({});
    const [dataTable5, setDataTable5] = useState([]);
    const [sortedData5, setSortedData5] = useState({});
    const [dataTable6, setDataTable6] = useState([]);
    const [sortedData6, setSortedData6] = useState({});
    const [dataTable7, setDataTable7] = useState([]);
    const [sortedData7, setSortedData7] = useState({});
    const [filters, setFilters] = useState({});
    const [resetSelection, setResetSelection] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 100 // Số lượng mục trên mỗi trang
    });

    const getDigitizedDocumentFrom2018To2023 = async () => {
        const response = await statisticsByAdminService.getDigitizedDocumentFrom2018To2023();
    
        // Format number fields with thousand separators
        const formattedAggregatedResults = response?.response.aggregatedResults.map(doc => ({
            ...doc,
            digitized_documents_count: formatNumber(doc.digitized_documents_count),
            digitized_documents_count_current: formatNumber(doc.digitized_documents_count_current),
            total_documents_count: formatNumber(doc.total_documents_count),
            undigitized_documents_count: formatNumber(doc.undigitized_documents_count),
        }));
    
        // Prepare total row
        const totalRow = {
            departmentName: 'Tổng của cả CAT',
            total_documents_count: formatNumber(response?.response.totalDocumentsCountAllUser),
            digitized_documents_count: formatNumber(response?.response.digitizedDocumentsCountCurrentAllUser),
            undigitized_documents_count: formatNumber(response?.response.undigitizedDocumentsCountAllUser),
            digitization_percentage: response?.response.digitizationPercentageAllUser,
            achieve_assigned_targets: response?.response.achieveAssignedTargetsAllUser,
            percentageAchieved: response?.response.percentageAchievedAllUser
        };
    
        setDataTable1([...formattedAggregatedResults, totalRow]);
        return response;
    };

    const getDigitizedDocumentInCurrentYear = async () => {
        const response = await statisticsByAdminService.getDigitizedDocumentInCurrentYear();
        const aggregatedResults = response?.response.aggregatedResults;
    
        // Update digitization_percentage to include "%" sign
        const updatedAggregatedResults = aggregatedResults.map(doc => {
            return {
                ...doc,
                digitized_documents_count: formatNumber(doc.digitized_documents_count),
                total_documents_count: formatNumber(doc.total_documents_count),
                undigitized_documents_count: formatNumber(doc.undigitized_documents_count),
                digitization_percentage: doc.digitization_percentage + "%"
            };
        });
    
        const totalRow = {
            departmentName: 'Tổng của cả CAT',
            total_documents_count: formatNumber(response?.response.totalDocumentsCountAllUser),
            digitized_documents_count: formatNumber(response?.response.digitizedDocumentsCountAllUser),
            undigitized_documents_count: formatNumber(response?.response.undigitizedDocumentsCountAllUser),
            digitization_percentage: response?.response.digitizationPercentageAllUser,
        };
    
        // Add the total row to the updated aggregated results
        setDataTable2([...updatedAggregatedResults, totalRow]);
        return response;
    };

    const getDigitizedDocumentFrom2018To2024 = async () => {
        const response = await statisticsByAdminService.getDigitizedDocumentFrom2018To2024();
        const aggregatedResults = response?.response.aggregatedResults;
    
        // Update digitization_percentage to include "%" sign
        const updatedAggregatedResults = aggregatedResults.map(doc => {
            return {
                ...doc,
                digitized_documents_count: formatNumber(doc.digitized_documents_count),
                total_documents_count: formatNumber(doc.total_documents_count),
                undigitized_documents_count: formatNumber(doc.undigitized_documents_count)
            };
        });

        const totalRow = {
            departmentName: 'Tổng của cả CAT',
            total_documents_count: formatNumber(response?.response.totalDocumentsCountAllUser),
            digitized_documents_count: formatNumber(response?.response.digitizedDocumentsCountCurrentAllUser),
            undigitized_documents_count: formatNumber(response?.response.undigitizedDocumentsCountAllUser),
            digitization_percentage: response?.response.digitizationPercentageAllUser,
        };

        setDataTable5([...updatedAggregatedResults, totalRow]);
        return response;
    };

    const getTargetFromPolice = async () => {
        const response = await statisticsByAdminService.getTargetFromPolice();
    
        // Format numbers with thousand separators
        const formattedResponse = {
            ...response.response,
            target: formatNumber(response.response.target),
            total_did: formatNumber(response.response.total_did),
            undigitizedDocumentsCountAllUser: formatNumber(response.response.undigitizedDocumentsCountAllUser)
        };
    
        setDataTable6([formattedResponse]);
        return response;
    };

    const getTargetFromPoliceDetail = async () => {
        const response = await statisticsByAdminService.getTargetFromPoliceDetail();
    
        // Format numbers with thousand separators
        const formattedResponse = response?.response.map(doc => ({
            ...doc,
            digitizedIn2018To2023: formatNumber(doc.digitizedIn2018To2023),
            digitizedIn2024: formatNumber(doc.digitizedIn2024),
            totalDigitized: formatNumber(doc.totalDigitized),
            totalDocumentsNeedDigitized: formatNumber(doc.totalDocumentsNeedDigitized),
            totalIn2024: formatNumber(doc.totalIn2024),
            undigitizedDocumentsCount: formatNumber(doc.undigitizedDocumentsCount)
        }));
    
        setDataTable7([...formattedResponse]);
        return response;
    };

    const getAdministrativeProceduresPre = async () => {
        const response = await statisticsByAdminService.getAdministrativeProceduresPre();
    
        // Format numbers with thousand separators
        const formattedAggregatedResults = response?.response.aggregatedResults.map(doc => ({
            ...doc,
            digitized_documents_count: formatNumber(doc.digitized_documents_count),
            total_documents_count: formatNumber(doc.total_documents_count)
        }));
    
        const totalRow = {
            departmentName: 'Tổng của cả CAT',
            total_documents_count: formatNumber(response?.response.totalDocumentsCountAllUser),
            digitized_documents_count: formatNumber(response?.response.digitizedDocumentsCountAllUser),
            digitization_percentage: response?.response.digitizationPercentageAllUser,
        };
    
        setDataTable3([...formattedAggregatedResults, totalRow]);
        return response;
    };

    const getAdministrativeProceduresPost = async () => {
        const response = await statisticsByAdminService.getAdministrativeProceduresPost();

        // Format numbers with thousand separators
        const formattedAggregatedResults = response?.response.aggregatedResults.map(doc => ({
            ...doc,
            digitized_documents_count: formatNumber(doc.digitized_documents_count),
            total_documents_count: formatNumber(doc.total_documents_count)
        }));

        const totalRow = {
            departmentName: 'Tổng của cả CAT',
            total_documents_count: formatNumber(response?.response.totalDocumentsCountAllUser),
            digitized_documents_count: formatNumber(response?.response.digitizedDocumentsCountAllUser),
            digitization_percentage: response?.response.digitizationPercentageAllUser,
        };

        setDataTable4([...formattedAggregatedResults, totalRow]);
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

    const queryTargetFromPolice = useQuery({
        queryKey: ['targetFromPolice'],
        queryFn: () => getTargetFromPolice(),
        retry: 3,
        retryDelay: 1000,
    });

    const queryTargetFromPoliceDetail = useQuery({
        queryKey: ['targetFromPoliceDetail'],
        queryFn: () => getTargetFromPoliceDetail(),
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
    const { isLoading: isLoadingTargetFromPolice, data: targetFromPolice } = queryTargetFromPolice;
    const { isLoading: isLoadingTargetFromPoliceDetail, data: targetFromPoliceDetail } = queryTargetFromPoliceDetail;
    const { isLoading: isLoadingAdministrativeProceduresPre, data: administrativeProceduresPre } = queryAdministrativeProceduresPre;
    const { isLoading: isLoadingAdministrativeProceduresPost, data: administrativeProceduresPost } = queryAdministrativeProceduresPost;

    const fetchDataForDataTable = (datas) => {
        return datas?.map((data) => {
            return {
                ...data, 
                key: data.userId,
                digitization_percentage: `${data.digitization_percentage}%`,
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
            title: 'Tổng',
            dataIndex: 'total_documents_count',
            key: 'total_documents_count',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.total_documents_count.replace(',', ''));
                const bPercentage = parseFloat(b.total_documents_count.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Đã số hóa',
            dataIndex: 'digitized_documents_count',
            key: 'digitized_documents_count',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.digitized_documents_count.replace(',', ''));
                const bPercentage = parseFloat(b.digitized_documents_count.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Chưa số hóa',
            dataIndex: 'undigitized_documents_count',
            key: 'undigitized_documents_count',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.undigitized_documents_count.replace(',', ''));
                const bPercentage = parseFloat(b.undigitized_documents_count.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tỉ lệ đã số hóa',
            dataIndex: 'digitization_percentage',
            key: 'digitization_percentage',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.digitization_percentage.replace('%', ''));
                const bPercentage = parseFloat(b.digitization_percentage.replace('%', ''));
                return aPercentage - bPercentage;
            },
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
        {
            title: 'Tỉ lệ đạt chỉ tiêu được giao',
            dataIndex: 'percentageAchieved',
            key: 'percentageAchieved',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.percentageAchieved.replace('%', ''));
                const bPercentage = parseFloat(b.percentageAchieved.replace('%', ''));
                return aPercentage - bPercentage;
            },
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
        },
        {
            title: 'Tổng hồ sơ 2024 tính đến thời điểm hiện tại',
            dataIndex: 'total_documents_count',
            key: 'total_documents_count',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.total_documents_count.replace(',', ''));
                const bPercentage = parseFloat(b.total_documents_count.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Đã số hóa',
            dataIndex: 'digitized_documents_count',
            key: 'digitized_documents_count',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.digitized_documents_count.replace(',', ''));
                const bPercentage = parseFloat(b.digitized_documents_count.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tỉ lệ đã số hóa',
            dataIndex: 'digitization_percentage',
            key: 'digitization_percentage',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.digitization_percentage.replace('%', ''));
                const bPercentage = parseFloat(b.digitization_percentage.replace('%', ''));
                return aPercentage - bPercentage;
            },
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
            title: 'Tổng',
            dataIndex: 'total_documents_count',
            key: 'total_documents_count',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.total_documents_count.replace(',', ''));
                const bPercentage = parseFloat(b.total_documents_count.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Đã số hóa',
            dataIndex: 'digitized_documents_count',
            key: 'digitized_documents_count',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.digitized_documents_count.replace(',', ''));
                const bPercentage = parseFloat(b.digitized_documents_count.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tỉ lệ đã số hóa',
            dataIndex: 'digitization_percentage',
            key: 'digitization_percentage',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.digitization_percentage.replace('%', ''));
                const bPercentage = parseFloat(b.digitization_percentage.replace('%', ''));
                return aPercentage - bPercentage;
            },
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
            sorter: (a, b) => a.departmentName.localeCompare(b.departmentName),
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tổng hồ sơ 2024 tính đến thời điểm hiện tại',
            dataIndex: 'total_documents_count',
            key: 'total_documents_count',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.total_documents_count.replace(',', ''));
                const bPercentage = parseFloat(b.total_documents_count.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Đã số hóa',
            dataIndex: 'digitized_documents_count',
            key: 'digitized_documents_count',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.digitized_documents_count.replace(',', ''));
                const bPercentage = parseFloat(b.digitized_documents_count.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tỉ lệ đã số hóa',
            dataIndex: 'digitization_percentage',
            key: 'digitization_percentage',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.digitization_percentage.replace('%', ''));
                const bPercentage = parseFloat(b.digitization_percentage.replace('%', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
    ];

    const columnsTable5 = [
        {
            title: 'Đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
            sorter: (a, b) => a.departmentName.localeCompare(b.departmentName),
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tổng',
            dataIndex: 'total_documents_count',
            key: 'total_documents_count',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.total_documents_count.replace(',', ''));
                const bPercentage = parseFloat(b.total_documents_count.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Đã số hóa',
            dataIndex: 'digitized_documents_count',
            key: 'digitized_documents_count',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.digitized_documents_count.replace(',', ''));
                const bPercentage = parseFloat(b.digitized_documents_count.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tỉ lệ đã số hóa',
            dataIndex: 'digitization_percentage',
            key: 'digitization_percentage',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.digitization_percentage.replace('%', ''));
                const bPercentage = parseFloat(b.digitization_percentage.replace('%', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
    ];

    const columnsTable6 = [
        {
            title: 'Tổng số hồ sơ chưa số hóa',
            dataIndex: 'undigitizedDocumentsCountAllUser',
            key: 'undigitizedDocumentsCountAllUser',
            // sorter: (a, b) => a.departmentName.localeCompare(b.departmentName),
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Chỉ tiêu bộ giao',
            dataIndex: 'target',
            key: 'target',
            // sorter: (a, b) => a.digitized_documents_count - b.digitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Đã làm',
            dataIndex: 'total_did',
            key: 'total_did',
            // sorter: (a, b) => a.undigitized_documents_count - b.undigitized_documents_count,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        }
    ];

    const columnsTable7 = [
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
            title: 'Tổng hồ sơ chưa số hóa 2018-2023 nhập đầu năm',
            dataIndex: 'undigitizedDocumentsCount',
            key: 'undigitizedDocumentsCount',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.undigitizedDocumentsCount.replace(',', ''));
                const bPercentage = parseFloat(b.undigitizedDocumentsCount.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tổng hồ sơ 2024',
            dataIndex: 'totalIn2024',
            key: 'totalIn2024',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.totalIn2024.replace(',', ''));
                const bPercentage = parseFloat(b.totalIn2024.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tổng hồ sơ cần số hóa',
            dataIndex: 'totalDocumentsNeedDigitized',
            key: 'totalDocumentsNeedDigitized',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.totalDocumentsNeedDigitized.replace(',', ''));
                const bPercentage = parseFloat(b.totalDocumentsNeedDigitized.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Đã số hóa 2018 – 2023',
            dataIndex: 'digitizedIn2018To2023',
            key: 'digitizedIn2018To2023',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.digitizedIn2018To2023.replace(',', ''));
                const bPercentage = parseFloat(b.digitizedIn2018To2023.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Đã số hóa 2024',
            dataIndex: 'digitizedIn2024',
            key: 'digitizedIn2024',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.digitizedIn2024.replace(',', ''));
                const bPercentage = parseFloat(b.digitizedIn2024.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tổng đã số hóa',
            dataIndex: 'totalDigitized',
            key: 'totalDigitized',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.totalDigitized.replace(',', ''));
                const bPercentage = parseFloat(b.totalDigitized.replace(',', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Tỉ lệ',
            dataIndex: 'ratio',
            key: 'ratio',
            sorter: (a, b) => {
                const aPercentage = parseFloat(a.ratio.replace('%', ''));
                const bPercentage = parseFloat(b.ratio.replace('%', ''));
                return aPercentage - bPercentage;
            },
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        }
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

    const createTableNormal = (data, columns, includeUndigitized = true, includeAchieveTargets = true) => {
        // Filter out columns based on the provided options
        const filteredColumns = columns.filter(col => {
            if (!includeUndigitized && col.title === 'Chưa số hóa') return false;
            if (!includeAchieveTargets && col.title === 'Đạt chỉ tiêu được giao') return false;
            return true;
        });
    
        // Calculate the equal width for each column
        const equalWidth = 100 / filteredColumns.length;
    
        const headerCells = filteredColumns.map(col => new TableCell({
            children: [new Paragraph({
                children: [new TextRun({ text: col.title, bold: true, size: 26 })], // Set font size to 26
                spacing: { before: 60, after: 60 }, // Add spacing before and after
                alignment: AlignmentType.CENTER // Center horizontally
            })],
            verticalAlign: VerticalAlign.CENTER, // Center vertically
            width: { size: equalWidth, type: WidthType.PERCENTAGE }
        }));
        const headerRow = new TableRow({ children: headerCells });
    
        const dataRows = data.map(row => {
            const cells = filteredColumns.map(col => new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text: row[col.dataIndex]?.toString() || "", size: 26 })], // Set font size to 26
                    spacing: { before: 60, after: 60 }, // Add spacing before and after
                    alignment: AlignmentType.CENTER // Center horizontally
                })],
                verticalAlign: VerticalAlign.CENTER, // Center vertically
                width: { size: equalWidth, type: WidthType.PERCENTAGE }
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
    
        const columns1 = [
            { title: 'Đơn vị', dataIndex: 'departmentName'},
            { title: 'Tổng', dataIndex: 'total_documents_count'},
            { title: 'Đã số hóa', dataIndex: 'digitized_documents_count'},
            { title: 'Chưa số hóa', dataIndex: 'undigitized_documents_count'},
            { title: 'Tỉ lệ đã số hóa', dataIndex: 'digitization_percentage'},
            { title: 'Đạt chỉ tiêu được giao', dataIndex: 'achieve_assigned_targets'},
            { title: 'Tỉ lệ đạt chỉ tiêu được giao', dataIndex: 'percentageAchieved'}
        ];
    
        const columns6 = [
            { title: 'Tổng số hồ sơ chưa số hóa', dataIndex: 'undigitizedDocumentsCountAllUser'},
            { title: 'Chỉ tiêu bộ giao', dataIndex: 'target'},
            { title: 'Đã làm', dataIndex: 'total_did'}
        ];
    
        const columns7 = [
            { title: 'Đơn vị', dataIndex: 'departmentName'},
            { title: 'Tổng hồ sơ chưa số hóa 2018-2023 nhập đầu năm', dataIndex: 'undigitizedDocumentsCount'},
            { title: 'Tổng hồ sơ 2024', dataIndex: 'totalIn2024'},
            { title: 'Tổng hồ sơ cần số hóa', dataIndex: 'totalDocumentsNeedDigitized'},
            { title: 'Đã số hóa 2018 – 2023', dataIndex: 'digitizedIn2018To2023'},
            { title: 'Đã số hóa 2024', dataIndex: 'digitizedIn2024'},
            { title: 'Tổng đã số hóa', dataIndex: 'totalDigitized'},
            { title: 'Tỉ lệ', dataIndex: 'ratio'}
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
                        createTable(sortedData1.length > 0 ? sortedData1 : dataTable1, columns1),

                        new Paragraph({
                            children: [new TextRun({ text: "2. Năm 2024", bold: true, italics: true, size: 26 })],
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }),
                        createTable(sortedData2.length > 0 ? sortedData2 : dataTable2, columns, true, false), // Exclude 'Đạt chỉ tiêu được giao' column
                        
                        new Paragraph({
                            children: [new TextRun({ text: "3. Từ năm 2018 đến năm 2024", bold: true, italics: true, size: 26 })],
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }),
                        createTable(sortedData5.length > 0 ? sortedData5 : dataTable5, columns, true, false),
                        
                        new Paragraph({
                            children: [new TextRun({ text: "4. Thống kê chỉ tiêu Bộ CA giao CAT", bold: true, italics: true, size: 26 })],
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }),
                        createTableNormal(dataTable6, columns6, true, false),

                        new Paragraph({
                            children: [new TextRun({ text: "5. Thống kê chi tiết chỉ tiêu Bộ CA giao CAT", bold: true, italics: true, size: 26 })],
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }),
                        createTable(sortedData7.length > 0 ? sortedData7 : dataTable7, columns7, true, false),

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
                        createTable(sortedData3.length > 0 ? sortedData3 : dataTable3, columns, false), // Exclude 'Chưa số hóa' column
                        
                        new Paragraph({
                            children: [new TextRun({ text: "2. Sau 01/07/2022", bold: true, italics: true, size: 26 })],
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }),
                        createTable(sortedData4.length > 0 ? sortedData4 : dataTable4, columns, false, false), // Exclude 'Chưa số hóa' and 'Đạt chỉ tiêu được giao' columns
                        
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

    const handleTable5Change = (pagination, filters, sorter, extra) => {
        setSortedData5(extra.currentDataSource);
    };

    const handleTable6Change = (pagination, filters, sorter, extra) => {
        setSortedData6(extra.currentDataSource);
    };

    const handleTable7Change = (pagination, filters, sorter, extra) => {
        setSortedData7(extra.currentDataSource);
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

            {/* Table 2 */}
            <WrapperHeader>II. 2024</WrapperHeader>
            <div style={{ marginTop: '20px' }}>
                <TableComponent columns={columnsTable2} data={dataTable2} isLoading={isLoadingDigitizedDocumentInCurrentYear} resetSelection={resetSelection}
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

            {/* Table 5 */}
            <WrapperHeader>III. 2018 - 2024</WrapperHeader>
            <div style={{ marginTop: '20px' }}>
                <TableComponent columns={columnsTable5} data={dataTable5} isLoading={isLoadingDigitizedDocumentFrom2018To2024} resetSelection={resetSelection}
                    onChange={handleTable5Change}
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

            {/* Table 6 */}
            <WrapperHeader>IV. Thống kê chỉ tiêu Bộ CA giao CAT</WrapperHeader>
            <div style={{ marginTop: '20px' }}>
                <TableComponent columns={columnsTable6} data={dataTable6} isLoading={isLoadingTargetFromPolice} resetSelection={resetSelection}
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

            {/* Table 7 */}
            <WrapperHeader>V. Thống kê chi tiết chỉ tiêu Bộ CA giao CAT</WrapperHeader>
            <div style={{ marginTop: '20px' }}>
                <TableComponent columns={columnsTable7} data={dataTable7} isLoading={isLoadingTargetFromPoliceDetail} resetSelection={resetSelection}
                    onChange={handleTable7Change}
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

            {/* Table 4 */}
            <WrapperHeader>II. Sau 01/07/2022</WrapperHeader>
            <div style={{ marginTop: '20px' }}>
                <TableComponent columns={columnsTable4} data={dataTable4} isLoading={isLoadingAdministrativeProceduresPost} resetSelection={resetSelection}
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
    )
}