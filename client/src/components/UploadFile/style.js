import { Upload } from "antd";
import { styled } from "styled-components";

export const WrapperHeader = styled.h1 `
    color: #012970;
    font-size: 30px;
    font-weight: 500;
`

export const WrapperUploadFile = styled(Upload) `
    & .ant-upload-list {
        display: none;
    }
`