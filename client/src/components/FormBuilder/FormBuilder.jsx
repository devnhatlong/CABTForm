import React, { useState } from "react";
import { Button, Input, Select, Switch, Form, Space, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

const FormBuilder = ({ onSave }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [fields, setFields] = useState([]);

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

    // Thêm option cho radio/checkbox
    const addOption = (index) => {
        const newFields = [...fields];
        newFields[index].options.push(`Lựa chọn ${newFields[index].options.length + 1}`);
        setFields(newFields);
    };

    // Cập nhật option của radio/checkbox
    const updateOption = (fieldIndex, optionIndex, value) => {
        const newFields = [...fields];
        newFields[fieldIndex].options[optionIndex] = value;
        setFields(newFields);
    };

    // Xóa option của radio/checkbox
    const removeOption = (fieldIndex, optionIndex) => {
        const newFields = [...fields];
        newFields[fieldIndex].options.splice(optionIndex, 1);
        setFields(newFields);
    };

    const handleSave = () => {
        onSave({ title, description, fields });
    };

    return (
        <>
            <div style={{display: "flex", gap: "20px", marginTop: "10px" }}>
                <Button style={{height: "90px", width: "90px", borderRadius: "6px", borderStyle: "dashed"}}>
                    <div>Tạo form</div>
                    <PlusOutlined style={{fontSize: "40px", color: "#1677ff"}} />
                </Button>
            </div>
            <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
                <h2>Tạo Form</h2>
                <Input placeholder="Tiêu đề form" value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: "10px" }} />
                <Input.TextArea placeholder="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: "20px" }} />

                {fields.map((field, index) => (
                    <div key={index} style={{ marginBottom: "15px", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Input placeholder="Tên câu hỏi" value={field.label} onChange={(e) => updateField(index, "label", e.target.value)} />
                            <Select value={field.type} style={{ width: "100%" }} onChange={(value) => updateField(index, "type", value)}>
                                <Option value="text">Văn bản</Option>
                                <Option value="number">Số</Option>
                                <Option value="radio">Radio</Option>
                                <Option value="checkbox">Checkbox</Option>
                                <Option value="date">Ngày</Option>
                            </Select>

                            {/* Hiển thị input field theo từng loại */}
                            {field.type === "text" && <Input placeholder="Nhập câu trả lời..." disabled />}
                            {field.type === "number" && <Input type="number" placeholder="Nhập số..." disabled />}
                            {field.type === "date" && <Input type="date" disabled />}

                            {["radio", "checkbox"].includes(field.type) && (
                                <>
                                    {field.options.map((opt, optIndex) => (
                                        <Space key={optIndex} style={{ display: "flex", alignItems: "center", width: "100%" }}>
                                            <Input value={opt} onChange={(e) => updateOption(index, optIndex, e.target.value)} />
                                            <Button type="text" icon={<DeleteOutlined />} onClick={() => removeOption(index, optIndex)} />
                                        </Space>
                                    ))}
                                    <Button type="dashed" onClick={() => addOption(index)} icon={<PlusOutlined />}>
                                        Thêm lựa chọn
                                    </Button>
                                </>
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
        </>
    );
};

export default FormBuilder;
