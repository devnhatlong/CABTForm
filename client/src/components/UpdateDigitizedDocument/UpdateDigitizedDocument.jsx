import React, { useState, useEffect } from 'react';
import { WrapperHeader } from './style';
import { Button, Form, Row, Col } from "antd";
import InputComponent from '../InputComponent/InputComponent';
import ModalComponent from '../ModalComponent/ModalComponent';
import updateDigitizedDocumentService from '../../services/updateDigitizedDocumentService';
import { useMutationHooks } from '../../hooks/useMutationHook';
import { useSelector } from 'react-redux'
import * as message from '../Message/Message';
import { useQuery } from '@tanstack/react-query';

export const UpdateDigitizedDocument = () => {
    const [modalForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [yearList, setYearList] = useState([]);
    const user = useSelector((state) => state?.user);

    const [stateUpdateDigitizedDocument, setStateUpdateDigitizedDocument] = useState({
        year: "",
        digitized_documents_count: "",
    });

    useEffect(() => {
        modalForm.setFieldsValue({
            year: stateUpdateDigitizedDocument.year
        });
    }, [isModalOpen]);

    const mutation = useMutationHooks(
        (data) => {
            const { 
                year,
                digitized_documents_count,
            } = data;

            const response = updateDigitizedDocumentService.importDigitizedDocumentByYear({
                year,
                digitized_documents_count,
            });

            return response;
        }
    )

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateUpdateDigitizedDocument({
            year: "",
            digitized_documents_count: "",
        });

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;

    const getAllYear = async () => {
        const response = await updateDigitizedDocumentService.getAllYear();
        return response;
    };

    const queryYears = useQuery({
        queryKey: ['years'],
        queryFn: () => getAllYear(),
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingYears, data: years } = queryYears;

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

    const onFinish = async () => {
        mutation.mutate(stateUpdateDigitizedDocument);
    }

    useEffect(() => {
        if (years?.years) {
            const year = years?.years;
            setYearList(year);
        }
    }, [years]);

    const handleOnChange = (name, value) => {
        setStateUpdateDigitizedDocument({
            ...stateUpdateDigitizedDocument,
            [name]: value
        });
    };

    const handleKeyPress = (e) => {
        // Cho phép các phím số, phím mũi tên lên, xuống, và phím xóa
        const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ArrowUp', 'ArrowDown', 'Backspace', 'Tab'];
    
        if (!allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleOpenModal = (year) => {
        setIsModalOpen(true);
        setStateUpdateDigitizedDocument({
            ...stateUpdateDigitizedDocument,
            year: year
        });
    };

    return (
        <div>
            <WrapperHeader>Nhập số liệu số hóa hàng năm</WrapperHeader>
            <WrapperHeader style={{marginTop: "20px", color: "red"}}>*Lưu ý: Mỗi tháng vô form này để cập nhật</WrapperHeader>
            <div style={{display: "flex", gap: "20px", marginTop: "10px" }}>
                <Row gutter={[16, 16]}> {/* Tạo hàng mới với khoảng cách giữa các cột */}
                    <Col flex="1"> {/* Cột đầu tiên */}
                        <Button style={{display: "flex", alignItems: "center", height: "50px", borderRadius: "6px", borderStyle: "dashed"}} onClick={() => handleOpenModal("2018")}>
                            Nhập số liệu số hóa năm 2018
                        </Button>
                    </Col>
                    <Col flex="1"> {/* Cột thứ hai */}
                        <Button style={{display: "flex", alignItems: "center", height: "50px", borderRadius: "6px", borderStyle: "dashed"}} onClick={() => handleOpenModal("2019")}>
                            Nhập số liệu số hóa năm 2019
                        </Button>
                    </Col>
                    <Col flex="1"> {/* Cột thứ ba */}
                        <Button style={{display: "flex", alignItems: "center", height: "50px", borderRadius: "6px", borderStyle: "dashed"}} onClick={() => handleOpenModal("2020")}>
                            Nhập số liệu số hóa năm 2020
                        </Button>
                    </Col>
                    <Col flex="1"> {/* Cột thứ tư */}
                        <Button style={{display: "flex", alignItems: "center", height: "50px", borderRadius: "6px", borderStyle: "dashed"}} onClick={() => handleOpenModal("2021")}>
                            Nhập số liệu số hóa năm 2021
                        </Button>
                    </Col>
                    <Col flex="1"> {/* Cột thứ tư */}
                        <Button style={{display: "flex", alignItems: "center", height: "50px", borderRadius: "6px", borderStyle: "dashed"}} onClick={() => handleOpenModal("2022")}>
                            Nhập số liệu số hóa năm 2022
                        </Button>
                    </Col>
                    <Col flex="1"> {/* Cột đầu tiên */}
                        <Button style={{display: "flex", alignItems: "center", height: "50px", borderRadius: "6px", borderStyle: "dashed"}} onClick={() => handleOpenModal("2023")}>
                            Nhập số liệu số hóa năm 2023
                        </Button>
                    </Col>
                </Row>
            </div>
            <ModalComponent form={modalForm} forceRender width={500} title="Nhập số liệu số hóa" open={isModalOpen} onCancel={handleCancel} footer={null}>
                <Form
                    name="modalForm"
                    labelCol={{ span: 9 }}
                    wrapperCol={{ span: 20 }}
                    style={{ maxWidth: 1000 }}
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
                        <InputComponent type="number" name="year" value={stateUpdateDigitizedDocument.year} onChange={(e) => handleOnChange('year', e.target.value)} min="0" onKeyDown={handleKeyPress} disabled/>
                    </Form.Item>
                    <Form.Item
                        label="Số tài liệu đã số hóa"
                        name="digitized_documents_count"
                        rules={[{ required: true, message: 'Vui lòng nhập số tài liệu đã số hóa!' }]}
                    >
                        <InputComponent type="number" name="digitized_documents_count" value={stateUpdateDigitizedDocument.digitized_documents_count} onChange={(e) => handleOnChange('digitized_documents_count', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 19, span: 24 }}>
                        <Button type="primary" htmlType="submit">Lưu số liệu</Button>
                    </Form.Item>
                </Form>
            </ModalComponent>
        </div>
    )
}