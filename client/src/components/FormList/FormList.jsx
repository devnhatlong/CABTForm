import React, { useEffect, useState } from "react";
import { Button, List, Card, message, Empty } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import formService from "../../services/formService";
import { useSelector } from "react-redux";

const FormList = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(false);
    const user = useSelector((state) => state?.user);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        setLoading(true);
        try {
            const data = await formService.getAllForms();
            setForms(Array.isArray(data) ? data : []);
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

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", gap: "20px" }}>
                <Button
                    onClick={createForm}
                    style={{ height: "120px", width: "160px", borderRadius: "6px" }}
                >
                    <div>Tạo form</div>
                    <PlusOutlined style={{ fontSize: "40px", color: "#1677ff" }} />
                </Button>
            </div>
            {forms.length === 0 && !loading ? (
                <Empty description="Chưa có form nào" style={{ marginTop: "20px" }} />
            ) : (
                <List
                    loading={loading}
                    grid={{ gutter: 16, column: 3 }}
                    dataSource={forms}
                    renderItem={(form) => (
                        <List.Item>
                            <Card
                                title={form.title}
                                onClick={() => navigate(`/admin/forms/edit-forms/${form._id}`)}
                                style={{ cursor: "pointer" }}
                            >
                                {form.description || "Không có mô tả"}
                            </Card>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default FormList;