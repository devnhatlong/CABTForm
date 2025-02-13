import React, { useState, useEffect } from 'react';
import { WrapperHeader } from './style';
import { Button, Form, Row, Col } from "antd";
import InputComponent from '../InputComponent/InputComponent';
import ModalComponent from '../ModalComponent/ModalComponent';
import postJuly2022DigitizedService from '../../services/postJuly2022DigitizedService';
import { useMutationHooks } from '../../hooks/useMutationHook';
import * as message from '../Message/Message';

export const PostJuly2022Digitized = () => {
    const [modalForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [statePostJuly2022Digitized, setStatePostJuly2022Digitized] = useState({
        total_csgt_records_digitized: "",
        total_admin_records_digitized: "",
        total_firefighting_records_digitized: "",
        total_immigration_records_digitized: ""
    });

    const mutation = useMutationHooks(
        (data) => {
            const { 
                total_csgt_records_digitized,
                total_admin_records_digitized,
                total_firefighting_records_digitized,
                total_immigration_records_digitized
            } = data;

            const response = postJuly2022DigitizedService.importPostJuly2022Digitized({
                total_csgt_records_digitized,
                total_admin_records_digitized,
                total_firefighting_records_digitized,
                total_immigration_records_digitized
            });

            return response;
        }
    )

    const handleCancel = () => {
        setIsModalOpen(false);
        setStatePostJuly2022Digitized({
            total_csgt_records_digitized: "",
            total_admin_records_digitized: "",
            total_firefighting_records_digitized: "",
            total_immigration_records_digitized: ""
        });

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;

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
        mutation.mutate(statePostJuly2022Digitized);
    }

    const handleOnChange = (name, value) => {
        setStatePostJuly2022Digitized({
            ...statePostJuly2022Digitized,
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

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setStatePostJuly2022Digitized({
            ...statePostJuly2022Digitized
        });
    };

    return (
        <div>
            <WrapperHeader style={{marginTop: "20px"}}>NHẬP SỐ LIỆU SỐ HÓA HỒ SƠ GIẢI QUYẾT THỦ TỤC HÀNH CHÍNH (ĐÃ SỐ HÓA)</WrapperHeader>
            <WrapperHeader style={{marginTop: "20px", color: "red"}}>*Lưu ý: Mỗi tháng sẽ phải cập nhật thông tin ở Form này</WrapperHeader>
            <div style={{display: "flex", gap: "20px", marginTop: "10px" }}>
                <Row gutter={[16, 16]}> {/* Tạo hàng mới với khoảng cách giữa các cột */}
                    <Col flex="1"> {/* Cột đầu tiên */}
                        <Button style={{display: "flex", alignItems: "center", height: "50px", borderRadius: "6px", borderStyle: "dashed"}} onClick={() => handleOpenModal()}>
                            Nhập số liệu giai đoạn 01/07/2022 đến thời điểm hiện tại	
                        </Button>
                    </Col>
                </Row>
            </div>
            <ModalComponent form={modalForm} forceRender width={1100} title="Nhập số liệu giai đoạn 01/07/2022 đến thời điểm hiện tại" open={isModalOpen} onCancel={handleCancel} footer={null}>
                <Form
                    name="modalForm"
                    labelCol={{ span: 9 }}
                    wrapperCol={{ span: 20 }}
                    style={{ maxWidth: 1100 }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    autoComplete="on"
                    form={modalForm}
                >
                    <Form.Item
                        label="Tổng số hồ sơ hệ lực lượng CSGT đã số hóa"
                        name="total_csgt_records_digitized"
                        rules={[{ required: true, message: 'Vui lòng nhập số hồ sơ hệ lực lượng CSGT!' }]}
                    >
                        <InputComponent type="number" name="total_csgt_records_digitized" value={statePostJuly2022Digitized.total_csgt_records_digitized} onChange={(e) => handleOnChange('total_csgt_records_digitized', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                    </Form.Item>
                    <Form.Item
                        label="Tổng số hồ sơ hệ lực lượng Quản lý hành chính đã số hóa"
                        name="total_admin_records_digitized"
                        rules={[{ required: true, message: 'Vui lòng nhập số hồ sơ hệ lực lượng Quản lý hành chính!' }]}
                    >
                        <InputComponent type="number" name="total_admin_records_digitized" value={statePostJuly2022Digitized.total_admin_records_digitized} onChange={(e) => handleOnChange('total_admin_records_digitized', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                    </Form.Item>
                    <Form.Item
                        label="Tổng số hồ sơ hệ lực lượng Phòng cháy chữa cháy đã số hóa"
                        name="total_firefighting_records_digitized"
                        rules={[{ required: true, message: 'Vui lòng nhập số hồ sơ hệ lực lượng Phòng cháy chữa cháy!' }]}
                    >
                        <InputComponent type="number" name="total_firefighting_records_digitized" value={statePostJuly2022Digitized.total_firefighting_records_digitized} onChange={(e) => handleOnChange('total_firefighting_records_digitized', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                    </Form.Item>
                    <Form.Item
                        label="Tổng số hồ sơ hệ lực lượng Xuất nhập cảnh đã số hóa"
                        name="total_immigration_records_digitized"
                        rules={[{ required: true, message: 'Vui lòng nhập số hồ sơ hệ lực lượng Xuất nhập cảnh!' }]}
                    >
                        <InputComponent type="number" name="total_immigration_records_digitized" value={statePostJuly2022Digitized.total_immigration_records_digitized} onChange={(e) => handleOnChange('total_immigration_records_digitized', e.target.value)} min="0" onKeyDown={handleKeyPress}/>
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 21, span: 24 }}>
                        <Button type="primary" htmlType="submit">Lưu số liệu</Button>
                    </Form.Item>
                </Form>
            </ModalComponent>
        </div>
    )
}