import { Button, Upload } from "antd";
import { styled } from "styled-components";

export const WrapperHeader = styled.h1 `
    color: #012970;
    font-size: 30px;
    font-weight: 500;
`

export const WrapperHeaderH5 = styled.h5 `
    color: #012970;
    font-weight: 500;
`

export const WrapperHeaderTable = styled.h1 `
    color: #012970;
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 20px;
`

export const WrapperButtonName = styled.span `
    color: #000;
    font-size: 14px;
    font-weight: 500;
`

export const WrapperUploadFile = styled(Upload) `
    & .ant-upload-list {
        display: none;
    }
`

export const FormListHeader = styled.div`
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
`;

export const WrapperButton = styled(Button)`
    font-size: 16px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const CreateFormIcon = styled.div`
    font-size: 40px;
    color: #1677ff;
`;

export const FormContainer = styled.div`
    background-color: #f9f9f9; /* Màu nền nhạt cho form */
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px; /* Tạo khoảng cách với bảng */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4); /* Hiệu ứng đổ bóng */
`;

export const StyledButtonStatus = styled.div`
    display: inline-block;
    text-align: center;
    background-color: ${(props) => (props.disabled ? "#d9d9d9" : "#1890ff")};
    border: 1px solid ${(props) => (props.disabled ? "#d9d9d9" : "#1890ff")};
    color: ${(props) => (props.disabled ? "#8c8c8c" : "#fff")};
    height: 24px;
    line-height: 24px;
    font-size: 12px;
    font-style: italic;
    border-radius: 4px;
    padding: 0 12px;
    user-select: none; /* Ngăn chọn văn bản */
    margin: 10px;
    font-weight: 500;
`;