import { Button, Card } from "antd";
import styled from "styled-components";

export const FormListContainer = styled.div`
    padding: 20px;
`;

export const FormListHeader = styled.div`
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
`;

export const CreateFormButton = styled(Button)`
    height: 120px;
    width: 160px;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

export const CreateFormIcon = styled.div`
    font-size: 40px;
    color: #1677ff;
`;

export const FormCard = styled(Card)`
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
        transform: scale(1.05);
    }
`;

export const EmptyState = styled.div`
    margin-top: 20px;
`;

export const ActionContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;