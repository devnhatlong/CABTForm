import React, { useEffect, useState, useRef } from 'react';
import { WrapperHeader } from './style';
import { Button, Col, DatePicker, Form, Row, Space, Upload } from "antd";
import TableComponent from '../TableComponent/TableComponent';
import InputComponent from '../InputComponent/InputComponent';
import ModalComponent from '../ModalComponent/ModalComponent';
import uploadFileService from '../../services/uploadFileService';
import Loading from '../LoadingComponent/Loading';
import * as message from '../../components/Message/Message';
import { useMutationHooks } from '../../hooks/useMutationHook';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux'
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, ReloadOutlined, 
        UploadOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons'
import Moment from 'react-moment';
import viVN from 'antd/es/date-picker/locale/vi_VN';
import DrawerComponent from '../DrawerComponent/DrawerComponent';
import moment from 'moment';
import { convertFileDataToFiles } from '../../utils/utils';
import * as ExcelJS from 'exceljs';

export const UploadFile = () => {
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
    const [tuNgayMoment, setTuNgayMoment] = useState(null);
    const [denNgayMoment, setDenNgayMoment] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewFileUrl, setPreviewFileUrl] = useState('');
    const [previewFileUrlDetail, setPreviewFileUrlDetail] = useState('');
    const [previewModalDetailOpen, setPreviewModalDetailOpen] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 5 // Số lượng mục trên mỗi trang
    });

    const [stateFile, setStateFile] = useState({
        uploadedFiles: []
    });

    const [stateFileDetail, setStateFileDetail] = useState({
        uploadedFiles: []
    });
    
    const [attachedFiles, setAttachedFiles] = useState(stateFileDetail.uploadedFiles);

    const mutation = useMutationHooks(
        (data) => {
            const { departmentCode, uploadedFiles } = data;
    
            // Kiểm tra nếu uploadedFiles có độ dài > 0 thì mới gọi service
            if (uploadedFiles.length > 0) {
                const response = uploadFileService.create({
                    departmentCode,
                    uploadedFiles
                });
                return response;
            }
    
            // Nếu uploadedFiles không có phần tử, trả về một promise giả
            message.warning("Không có file để tải lên");
        }
    );

    const mutationUpdate = useMutationHooks(
        (data) => { 
            const { id, ...rests } = data;
            const response = uploadFileService.updateLetter(id, { ...rests });
            return response;
        }
    );
    
    const mutationDeleted = useMutationHooks(
        (data) => { 
          const { id } = data;
    
          const res = uploadFileService.delete(id);
    
          return res;
        }
    );

    const mutationDeletedMultiple = useMutationHooks(
        (data) => { 
          const { ids } = data;
          const res = uploadFileService.deleteMultipleLetters(ids);
    
          return res;
        }
    );

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateFile({
            uploadedFiles: []
        });

        setUploadedFiles([]);

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;
    const { data: dataUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated, isPending: isPendingUpdated } = mutationUpdate;
    const { data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted, isPending: isLoadingDeleted } = mutationDeleted;
    const { data: dataDeletedMultiple, isSuccess: isSuccessDeletedMultiple, isError: isErrorDeletedMultiple, isPending: isLoadingDeletedMultiple } = mutationDeletedMultiple;

    const getAll = async (currentPage, pageSize, filters) => {
        const response = await uploadFileService.getAll(currentPage, pageSize, filters);
        return response;
    };

    const getAllByAdmin = async (currentPage, pageSize, filters) => {
        const response = await uploadFileService.getAllByAdmin(currentPage, pageSize, filters);
        return response;
    };

    const fetchGetDetail = async (rowSelected) => {
        const response = user?.role === "admin" ? await uploadFileService.getDetailByAdmin(rowSelected) : await uploadFileService.getDetail(rowSelected);
        
        if (response?.data) {
            const files = convertFileDataToFiles(response.data);

            setStateFileDetail({
                uploadedFiles: files
            })
        }
        setIsLoadingUpdate(false);
    }

    const handleDownload = async () => {
        const response = await uploadFileService.getFile(rowSelected);

        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'file.pdf');

        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    useEffect(() => {
        drawerForm.setFieldsValue(stateFileDetail)
    }, [stateFileDetail, drawerForm])

    useEffect(() => {
        if (rowSelected) {
            setIsLoadingUpdate(true);
            fetchGetDetail(rowSelected);
        }
    }, [rowSelected])

    // useEffect(() => {
    //     if (rowSelected) {
    //         handleDownload(rowSelected);
    //     }
    // }, [rowSelected])

    useEffect(() => {
        setAttachedFiles(stateFileDetail.uploadedFiles);
    }, [stateFileDetail.uploadedFiles]);

    const handleDetail = () => {
        setIsOpenDrawer(true);
    }

    useEffect(() => {
        query.refetch();
        setIsLoadingResetFilter(false);
    }, [isLoadingResetFilter]);

    const handleResetAllFilter = () => {
        setIsLoadingResetFilter(true);
        setColumnFilters("");
        setFilters("");
        setTuNgayMoment("");
        setDenNgayMoment("");
    }

    const query = useQuery({
        queryKey: ['files'],
        queryFn: () => user?.role === "admin" ? getAllByAdmin(pagination.currentPage, pagination.pageSize, filters) : getAll(pagination.currentPage, pagination.pageSize, filters),
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingLetter, data: files } = query;

    useEffect(() => {
        if(isSuccess && data?.success) {
            message.success("Lưu file thành công");
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
            message.success("Cập nhật file thành công");
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
            message.success("Đã xóa file thành công");
            handleCancelDelete();
        }
        else if (isErrorDeleted) {
          message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeleted])

    useEffect(() => {
        if (isSuccessDeletedMultiple && dataDeletedMultiple) {
            if (dataDeletedMultiple.deletedLetter.deletedCount > 0) {
                message.success("Xóa file thành công");
            } else {
                message.error("Không có file nào được xóa");
            }
        } else if (isErrorDeletedMultiple) {
            message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeletedMultiple, isErrorDeletedMultiple, dataDeletedMultiple]);

    useEffect(() => {
        query.refetch();
    }, [pagination]);

    const onFinish = async () => {
        const departmentCode = user?.userName;
    
        // Hàm kiểm tra kích thước của file
        const isFileSizeLessThan2MB = (file) => {
            return file.size <= 2 * 1024 * 1024; // 2MB = 2 * 1024 * 1024 bytes
        };
    
        // Hàm kiểm tra loại file
        const isFileTypePDF = (file) => {
            return file.type === 'application/pdf';
        };
    
        // Lọc ra các file có kích thước <= 2MB và loại là PDF từ mảng uploadedFiles
        const filteredUploadedFiles = stateFile.uploadedFiles.filter((file) => {
            return isFileSizeLessThan2MB(file) && isFileTypePDF(file);
        });
    
        // Thực hiện mutation với các file đã lọc
        mutation.mutate({ departmentCode, uploadedFiles: filteredUploadedFiles }, {
            onSettled: () => {
                query.refetch();
            }
        });
    };

    const onUpdate = async () => {
        mutationUpdate.mutate(
            {
                id: rowSelected,
                ...stateFileDetail
            }, 
            {
                onSettled: () => {
                    query.refetch();
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
                query.refetch();
            }
          }
        )
    }

    const handleDeleteMultipleLetters = (ids) => {
        mutationDeletedMultiple.mutate(
          {
            ids: ids,
          },
          {
            onSettled: () => {
                query.refetch();
                setResetSelection(prevState => !prevState);
            }
          }
        )
    }

    useEffect(() => {
        if (files?.data) {
            const updatedDataTable = fetchDataForDataTable(files?.data);
            setDataTable(updatedDataTable);
        }
    }, [files]);

    const fetchDataForDataTable = (data) => {
        return data?.map((item) => {
            return {
                ...item,
                key: item._id,
                createdAt: <Moment format="DD/MM/YYYY HH:MM">{item.createdAt}</Moment>,
                updatedAt: <Moment format="DD/MM/YYYY HH:MM">{item.updatedAt}</Moment>
            };
        });
    };

    const handleOnChange = (name, value) => {
        setStateFile({
            ...stateFile,
            [name]: value
        });
    };

    const handleOnChangeDetail = (name, value) => {
        setStateFileDetail({
            ...stateFileDetail,
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

    const getDateRangeFilterProps = (dataIndex, placeholder) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Space>
                    <DatePicker.RangePicker
                        format="DD/MM/YYYY"
                        value={tuNgayMoment && denNgayMoment ? [tuNgayMoment, denNgayMoment] : []}
                        onChange={dates => {
                            const tuNgay = moment(new Date(dates[0].startOf('day'))).format('DD/MM/YYYY');
                            const denNgay = moment(new Date(dates[1].startOf('day'))).format('DD/MM/YYYY');
                            setTuNgayMoment(dates[0]);
                            setDenNgayMoment(dates[1]);
                            setColumnFilters(prevFilters => ({
                                ...prevFilters,
                                tuNgay,
                                denNgay
                            }));

                            // Cập nhật giá trị selectedKeys
                            setSelectedKeys(dates ? [dates[0].startOf('day'), dates[1].endOf('day')] : []);
                        }}
                        onPressEnter={() => handleSearchDateRange(selectedKeys, confirm)}
                        placeholder={['Từ ngày', 'Đến ngày']}
                        allowClear={false}
                    />
                    <Button
                        type="primary"
                        onClick={() => handleSearchDateRange(selectedKeys, confirm)}
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
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
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
            <div style={{display: "flex", justifyContent: "center"}}>
                <EditOutlined style={{color: 'orange', fontSize: '18px', cursor: 'pointer'}} onClick={handleDetail}/>

                {user?.role === "admin" && (
                    <DeleteOutlined style={{color: 'red', fontSize: '18px', cursor: 'pointer'}} onClick={() => setIsModalOpenDelete(true)}/>
                )}
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
            title: 'Tên file',
            dataIndex: 'fileName',
            key: 'fileName',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('fileName', 'tên file')
        },
        {
            title: 'Ngày tải lên',
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

        // Tiếp tục với cuộc gọi hàm getAll và truyền filters vào đó.
        getAll(pagination.currentPage, pagination.pageSize, filters)
        .then(response => {
            // Xử lý response...
            query.refetch();
        })
        .catch(error => {
            message.error(error);
        });
        confirm();
    }; 

    const handleSearchDateRange = async (selectedKeys, confirm) => {
        if (selectedKeys[0] && selectedKeys[1]) {
            const fromDate = moment(new Date(selectedKeys[0])).format('DD/MM/YYYY');
            const toDate = moment(new Date(selectedKeys[1])).format('DD/MM/YYYY');
        
            setFilters(prevFilters => {
                const updatedFilters = {
                    ...prevFilters,
                    ["tuNgay"]: fromDate,
                    ["denNgay"]: toDate
                };
                return updatedFilters;
            });
    
            // Tiếp tục với cuộc gọi hàm getAll và truyền filters vào đó.
            getAll(pagination.currentPage, pagination.pageSize, filters)
            .then(response => {
                // Xử lý response...
                query.refetch();
            })
            .catch(error => {
                message.error(error);
            });
        }
        else {
            message.warning("Vui lòng nhập đầy đủ khoảng thời gian");
        }
        confirm();
    };
    
    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters();
        
        if (dataIndex === "ngayDen") {
            setTuNgayMoment("");
            setDenNgayMoment("");

            setColumnFilters(prevColumnFilters => {
                const updatedColumnFilters = { ...prevColumnFilters };
                delete updatedColumnFilters["tuNgay"];
                delete updatedColumnFilters["denNgay"];
                return updatedColumnFilters;
            });

            setFilters(prevFilters => {
                const updatedFilters = { ...prevFilters };
                delete updatedFilters["tuNgay"];
                delete updatedFilters["denNgay"];
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

        // Tiếp tục với cuộc gọi hàm getAll và truyền filters vào đó để xóa filter cụ thể trên server.
        getAll(pagination.currentPage, pagination.pageSize, filters)
            .then(response => {
                // Xử lý response nếu cần
                query.refetch();
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

    const handleKeyPress = (e) => {
        // Cho phép các phím số, phím mũi tên lên, xuống, và phím xóa
        const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ArrowUp', 'ArrowDown', 'Backspace'];
    
        if (!allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleUpload = (file) => {
        setUploadedFiles(prevFiles => [...prevFiles, file]);
    };

    const handlePreview = (fileUrl) => {
        setPreviewFileUrl(fileUrl);
        setPreviewModalOpen(true);
    };

    const handleCancelPreview = () => {
        setPreviewModalOpen(false);
    };

    const handleRemoveFile = (index) => {
        const newUploadedFiles = [...uploadedFiles];
        newUploadedFiles.splice(index, 1);
        setUploadedFiles(newUploadedFiles);
        setStateFile(prevState => ({
            ...prevState,
            uploadedFiles: newUploadedFiles
        }));
    };

    // const props = {
    //     beforeUpload: (file) => {
    //         const isLessThan2MB = file.size / 1024 / 1024 < 2; // Size in MB
    
    //         if (!isLessThan2MB) {
    //             message.error(`${file.name} is larger than 2MB`);
    //             return false;
    //         }
    
    //         return new Promise((resolve, reject) => {
    //             const fileReader = new FileReader();
    
    //             fileReader.onload = (e) => {
    //                 const arr = new Uint8Array(e.target.result).subarray(0, 4);
    //                 let header = "";
    //                 for(let i = 0; i < arr.length; i++) {
    //                     header += arr[i].toString(16);
    //                 }
    
    //                 let isPDF = false;
    //                 switch (header) {
    //                     case "25504446": // PDF magic number
    //                         isPDF = true;
    //                         break;
    //                     default:
    //                         isPDF = false;
    //                         break;
    //                 }
    
    //                 if (isPDF) {
    //                     handleUpload(file);
    //                     resolve();
    //                 } else {
    //                     message.error(`${file.name} is not a valid PDF file`);
    //                     reject();
    //                 }
    //             };
    
    //             fileReader.readAsArrayBuffer(file);
    //         });
    //     },
    //     showUploadList: false,
    // };

    // const props = {
    //     beforeUpload: (file) => {
    //         const isLessThan2MB = file.size / 1024 / 1024 < 2; // Size in MB
    
    //         if (!isLessThan2MB) {
    //             message.error(`${file.name} is larger than 2MB`);
    //             return false;
    //         }

    //         if (file.type !== 'application/pdf') {
    //             message.error(`${file.name} is not a PDF file`);
    //             return false;
    //         }
    //         handleUpload(file);
    //         return false;
    //     },
    //     showUploadList: false,
    // };

    const props = {
        beforeUpload: (file) => {
            const isLessThan2MB = file.size / 1024 / 1024 < 2; // Size in MB
    
            if (!isLessThan2MB) {
                
                message.error(`${file.name} is larger than 2MB`);
                return false;
            }
    
            const reader = new FileReader();
            reader.onloadend = () => {
                const arr = new Uint8Array(reader.result).subarray(0, 4);
                let header = '';
                for (let i = 0; i < arr.length; i++) {
                    header += arr[i].toString(16);
                }
                let type = '';
                switch (header) {
                    case '25504446': // PDF header signature
                        type = 'application/pdf';
                        break;
                    case 'ffd8ffe0':
                    case 'ffd8ffe1':
                    case 'ffd8ffe2':
                    case 'ffd8ffe3':
                    case 'ffd8ffe8':
                        type = 'image/jpeg';
                        break;
                    case '89504e47':
                        type = 'image/png';
                        break;
                    default:
                        type = 'unknown';
                        break;
                }
    
                if (type !== 'application/pdf') {
                    message.error(`${file.name} is not a valid PDF file`);
                    return false;
                } else {
                    handleUpload(file);
                }
            };
            reader.readAsArrayBuffer(file);
    
            return false; // Prevent automatic upload
        },
        showUploadList: false,
    };

    const handleFileChange = (info) => {
        handleUploadFile(info.file);
    };

    // Xử lý sự kiện khi người dùng tải lên tập tin
    const handleUploadFile = (file) => {
        const updatedFiles = [...stateFile.uploadedFiles, file];
        setStateFile(prevState => ({
            ...prevState,
            uploadedFiles: updatedFiles
        }));
    };
    
    // Đóng DrawerComponent
    const handleCloseDrawer = () => {
        fetchGetDetail(rowSelected);
        setIsOpenDrawer(false);
    };
    
    // Hàm xử lý sự kiện khi ấn vào biểu tượng EyeOutlined
    const handlePreviewFileDetail = (file) => {
        // Kiểm tra xem file có đường dẫn hay không
        if (file.path) {
            // Nếu có đường dẫn, sử dụng đường dẫn từ server
            const fileUrl = `${process.env.REACT_APP_SERVER_URL}/${file.path}`;
            setPreviewFileUrlDetail(fileUrl);
        } else { 
            // Nếu không có đường dẫn, tạo URL từ đối tượng file
            const fileUrl = URL.createObjectURL(file);
            setPreviewFileUrlDetail(fileUrl);
        }
        // Mở modal xem trước
        setPreviewModalDetailOpen(true);
    };

    // Hàm xử lý sự kiện khi đóng modal xem trước
    const handleCancelPreviewDetail = () => {
        // Đặt URL trong state về trống để đóng modal
        setPreviewFileUrlDetail('');
        setPreviewModalDetailOpen(false);
    };

    const handleFileDetailChange = (info) => {
        handleUploadDetailFile(info.file);
    };

    // Xử lý sự kiện khi người dùng tải lên tập tin
    const handleUploadDetailFile = (file) => {
        const updatedFiles = [...stateFileDetail.uploadedFiles, file];
        setStateFileDetail(prevState => ({
            ...prevState,
            uploadedFiles: updatedFiles
        }));
    };
    
    const handleRemoveFileDetail = (index) => {
        const newUploadedFiles = [...stateFileDetail.uploadedFiles];
        newUploadedFiles.splice(index, 1);
        setStateFileDetail(prevState => ({
            ...prevState,
            uploadedFiles: newUploadedFiles
        }));
    };

    return (
        <div>
            <WrapperHeader>Quản lý file</WrapperHeader>
            {user?.role !== "admin" && (
                <div style={{display: "flex", gap: "20px", marginTop: "10px" }}>
                    <Row gutter={[16, 16]}> {/* Tạo hàng mới với khoảng cách giữa các cột */}
                        <Col flex="1"> {/* Cột đầu tiên */}
                            <Button type="primary" icon={<UploadOutlined />} style={{display: "flex", alignItems: "center", height: "50px", borderRadius: "6px"}} onClick={() => setIsModalOpen(true)}>
                                <strong>Tải báo cáo lên	</strong>
                            </Button>
                        </Col>
                    </Row>
                </div>
            )}
            <div style={{ marginTop: '20px' }}>
                <TableComponent handleDeleteMultiple={handleDeleteMultipleLetters} columns={columns} data={dataTable} isLoading={isLoadingLetter || isLoadingResetFilter} resetSelection={resetSelection}
                    pagination={{
                        current: pagination.currentPage,
                        pageSize: pagination.pageSize,
                        total: files?.totalRecord,
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
            <ModalComponent form={modalForm} forceRender width={600} title="Lưu file" open={isModalOpen} onCancel={handleCancel} footer={null}>
                <Loading isLoading = {isPending}>
                    <Form
                        name="modalForm"
                        labelCol={{ span: 13 }}
                        wrapperCol={{ span: 20 }}
                        style={{ maxWidth: 1500 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        autoComplete="on"
                        form={modalForm}
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item
                                    label="Đính kèm file"
                                    
                                    labelCol={{ span: 4 }}
                                >   
                                    <>
                                        <Upload onChange={handleFileChange} fileList={uploadedFiles} {...props}>
                                            <Button icon={<UploadOutlined />}>Upload pdf file</Button>
                                        </Upload>
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} style={{display: "flex", alignItems: "center"}}>
                                                {file.name}
                                                <EyeOutlined style={{ fontSize: '20px', marginLeft: "10px", color: "#1677ff" }} onClick={() => handlePreview(URL.createObjectURL(file))}/>
                                                <DeleteOutlined style={{ fontSize: '18px', marginLeft: "10px", color: "red" }} onClick={() => handleRemoveFile(index)} />
                                            </div>
                                        ))}
                                    </>
                                </Form.Item>
                            </Col>
                        </Row>
                        <ModalComponent
                            title="Preview PDF"
                            open={previewModalOpen}
                            onCancel={handleCancelPreview}
                            footer={null}
                            width={800}
                        >
                            <iframe title='Preview PDF' src={previewFileUrl} width="100%" height="500px" frameBorder="0" />
                        </ModalComponent>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item wrapperCol={{ offset: 21, span: 24 }}>
                                    <Button type="primary" htmlType="submit">Lưu file</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Loading>
            </ModalComponent>
            <DrawerComponent form={drawerForm} title="Chi tiết file" isOpen={isOpenDrawer} onClose={handleCloseDrawer} width="60%">
                <Loading isLoading = {isLoadingUpdate}>
                    <Form
                        name="drawerForm"
                        labelCol={{ span: 13 }}
                        wrapperCol={{ span: 20 }}
                        style={{ maxWidth: 1500 }}
                        initialValues={{ remember: true }}
                        onFinish={onUpdate}
                        autoComplete="on"
                        form={drawerForm}
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item
                                    label="Đính kèm file"
                                    labelCol={{ span: 4 }}
                                >
                                    <>
                                        {stateFileDetail.uploadedFiles.map((file, index) => (
                                            <div key={index} style={{display: "flex", alignItems: "center"}}>
                                                {file.name}
                                                <DownloadOutlined
                                                    style={{ fontSize: '18px', marginLeft: '10px', color: 'green' }} 
                                                    onClick={() => handleDownload()}
                                                />
                                            </div>
                                        ))}
                                    </>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Loading>
            </DrawerComponent>
            <ModalComponent width={400} title="Xóa file" open={isModalOpenDelete} onCancel={handleCancelDelete} onOk={handleDeleteLetter}>
                <Loading isLoading={isLoadingDeleted}>
                    <div>Bạn có muốn xóa file này trên hệ thống không?</div>
                </Loading>
            </ModalComponent>
        </div>
    )
}