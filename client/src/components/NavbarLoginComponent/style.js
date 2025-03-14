import { styled } from "styled-components";

export const WrapperContentPopup = styled .p `
    cursor: pointer;
    padding: 8px;

    &:hover {
        color: #1677ff;
    }

    margin: 5px;

    &:not(:last-child) {
        border-bottom: 1px solid #ccc;
    }
`

export const WrapperHeaderContainerLogin = styled.div `
    display: flex;
    justify-content: space-between;
    height: 40px;
    width: 100%;
`