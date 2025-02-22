import React, { useEffect, useState } from "react";
import { Button, Input, Select, Switch, Space, Divider, message } from "antd";
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import formService from "../../services/formService";

const { Option } = Select;

const FormBuilder = () => {
    const { id } = useParams(); // Lấy ID từ URL
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [fields, setFields] = useState([]);

    const fetchForm = async (formId) => {
        if (formId) {
            try {
                const data = await formService.getFormById(formId); // Gọi hàm lấy dữ liệu từ formService
                setFields(data.fields);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin form:", error);
            }
        }
    };

    useEffect(() => {
        fetchForm(id);
    }, [id]);

    const addField = () => {
        setFields([...fields, { label: "", type: "text", required: false, options: [] }]);
    };

    const removeField = (index) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const updateField = (index, key, value) => {
        const newFields = [...fields];
        newFields[index][key] = value;
        setFields(newFields);
    };

    const handleSave = async () => {
        try {
            const updatedForm = await formService.updateForm(id, { title, description, fields });
            if (updatedForm && updatedForm.data) {
                message.success("Cập nhật form thành công!");
            } else {
                message.error("Cập nhật form thất bại!");
            }
            navigate(`/forms`);
        } catch (error) {
            console.error("Lỗi khi lưu form:", error);
            message.error("Lỗi khi lưu form!");
        }
    };

    const handleBack = () => {
        navigate("/forms");
    };

    return (
        <div>
            <div style={{ top: "20px", left: "20px" }}>
                <Button
                    type="primary"
                    shape="circle"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBack}
                />
            </div>
            <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto", padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
                <h2 style={{ textAlign: "center" }}>Tạo Form</h2>
                <Input placeholder="Tiêu đề form" value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: "10px" }} />
                <Input.TextArea placeholder="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: "20px" }} />

                {fields.map((field, index) => (
                    <div key={index} style={{ marginBottom: "15px", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Input placeholder="Tên câu hỏi" value={field.label} onChange={(e) => updateField(index, "label", e.target.value)} />
                            <Select value={field.type} style={{ width: "100px" }} onChange={(value) => updateField(index, "type", value)}>
                                <Option value="text">Văn bản</Option>
                                <Option value="number">Số</Option>
                                <Option value="radio">Radio</Option>
                                <Option value="checkbox">Checkbox</Option>
                                <Option value="date">Ngày</Option>
                            </Select>

                            {/* Hiển thị ô nhập tùy chọn cho Radio / Checkbox */}
                            {["radio", "checkbox"].includes(field.type) && (
                                <div>
                                    {field.options.map((option, optIndex) => (
                                        <Space key={optIndex} style={{ display: "flex", marginBottom: 8 }}>
                                            <Input value={option} onChange={(e) => updateField(index, "options", field.options.map((opt, i) => (i === optIndex ? e.target.value : opt)))} />
                                            <Button icon={<DeleteOutlined />} onClick={() => updateField(index, "options", field.options.filter((_, i) => i !== optIndex))} />
                                        </Space>
                                    ))}
                                    <Button type="dashed" onClick={() => updateField(index, "options", [...field.options, ""])} icon={<PlusOutlined />}>
                                        Thêm lựa chọn
                                    </Button>
                                </div>
                            )}

                            <Switch checked={field.required} onChange={(checked) => updateField(index, "required", checked)} /> Bắt buộc
                            <Button type="danger" icon={<DeleteOutlined />} onClick={() => removeField(index)} />
                        </Space>
                    </div>
                ))}

                <Button type="dashed" onClick={addField} icon={<PlusOutlined />} style={{ width: "100%" }}>
                    Thêm câu hỏi
                </Button>
                <Divider />
                <Button type="primary" onClick={handleSave} style={{ width: "100%" }}>
                    Lưu Form
                </Button>
            </div>
        </div>
    );
};

export default FormBuilder;