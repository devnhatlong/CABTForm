import React, { useEffect, useState, useRef } from 'react';
import { WrapperHeader } from './style';
import { Button, Form, Space, Row, Col, Card, Progress } from "antd";
import statisticsAdministrativeProceduresService from '../../services/statisticsAdministrativeProceduresService';
import { useQuery } from '@tanstack/react-query';

export const StatisticsAdministrativeProcedures = () => {
    const [statePreJuly2022DigitizedStatistics, setStatePreJuly2022DigitizedStatistics] = useState({
        totalDocuments: "",
        totalDigitizedDocuments: "",
        totalPercentage: ""
    });

    const [statePostJuly2022DigitizedStatistics, setStatePostJuly2022DigitizedStatistics] = useState({
        totalDocuments: "",
        totalDigitizedDocuments: "",
        totalPercentage: ""
    });

    const [stateAdministrativeProceduresTargetStatistics, setStateAdministrativeProceduresTargetStatistics] = useState({
        administrative_procedures_target: "",
        total_digitized: "",
        totalPercentage: ""
    });

    const getPreJuly2022Digitized = async () => {
        // Gọi service với năm trước đó
        const response = await statisticsAdministrativeProceduresService.getPreJuly2022Digitized();
        setStatePreJuly2022DigitizedStatistics(response?.response);
        return response;
    };

    const getPostJuly2022Digitized = async () => {
        const response = await statisticsAdministrativeProceduresService.getPostJuly2022Digitized();
        setStatePostJuly2022DigitizedStatistics(response?.response);
        return response;
    };

    const getAdministrativeProceduresTargetStatistics = async () => {
        const response = await statisticsAdministrativeProceduresService.getAdministrativeProceduresTargetStatistics();
        setStateAdministrativeProceduresTargetStatistics(response?.response);
        return response;
    };

    const queryPreJuly2022Digitized = useQuery({
        queryKey: ['reJuly2022Digitized'],
        queryFn: () => getPreJuly2022Digitized(),
        retry: 3,
        retryDelay: 1000,
    });

    const queryPostJuly2022Digitized = useQuery({
        queryKey: ['postJuly2022Digitized'],
        queryFn: () => getPostJuly2022Digitized(),
        retry: 3,
        retryDelay: 1000,
    });

    const queryAdministrativeProceduresTargetStatistics = useQuery({
        queryKey: ['administrativeProceduresTargetStatistics'],
        queryFn: () => getAdministrativeProceduresTargetStatistics(),
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingPreJuly2022Digitized, data: preJuly2022Digitized } = queryPreJuly2022Digitized;
    const { isLoading: isLoadingPostJuly2022Digitized, data: postJuly2022Digitized } = queryPostJuly2022Digitized;
    const { isLoading: isLoadingAdministrativeProceduresTargetStatistics, data: administrativeProceduresTargetStatistics } = queryAdministrativeProceduresTargetStatistics;

    useEffect(() => {
        setStatePreJuly2022DigitizedStatistics(preJuly2022Digitized?.response);
    }, [isLoadingPreJuly2022Digitized]);

    useEffect(() => {
        setStatePostJuly2022DigitizedStatistics(postJuly2022Digitized?.response);
    }, [isLoadingPostJuly2022Digitized]);

    useEffect(() => {
        setStateAdministrativeProceduresTargetStatistics(administrativeProceduresTargetStatistics?.response);
    }, [isLoadingAdministrativeProceduresTargetStatistics]);

    return (
        <div>
            <WrapperHeader>Thống kê số liệu thủ tục hành chính</WrapperHeader>
            <div className="mt-4" style={{ padding: "20px", backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 8px 12px rgba(0,0,0,0.1)' }}>
                <WrapperHeader>Tổng số hồ sơ giai đoạn 01/7/2022 trở về trước còn hiệu lực</WrapperHeader>
                <Row gutter={[16, 16]}>
                    <Col xl={8} md={12} sm={24}>
                        <Card bordered={false} className="border-left-success shadow h-100 py-2">
                            <div className="font-weight-bold text-success text-uppercase mb-1">
                                Tổng số hồ sơ giải quyết TTHC
                            </div>
                            <div className="h5 mb-0 font-weight-bold text-gray-800">{statePreJuly2022DigitizedStatistics?.totalDocuments}</div>
                        </Card>
                    </Col>
                    <Col xl={8} md={12} sm={24}>
                        <Card bordered={false} className="border-left-success shadow h-100 py-2">
                            <div className="font-weight-bold text-success text-uppercase mb-1">
                                Tổng số hồ sơ giải quyết TTHC đã số hóa
                            </div>
                            <div className="h5 mb-0 font-weight-bold text-gray-800">{statePreJuly2022DigitizedStatistics?.totalDigitizedDocuments}</div>
                        </Card>
                    </Col>
                    <Col xl={8} md={12} sm={24}>
                        <Card bordered={false} className="border-left-success shadow h-100 py-2">
                            <div className="font-weight-bold text-success text-uppercase mb-1">
                                Tỉ lệ đã số hóa
                            </div>
                            <div className="h5 mb-0 font-weight-bold text-gray-800">{statePreJuly2022DigitizedStatistics?.totalPercentage}%</div>
                            <Progress percent={statePreJuly2022DigitizedStatistics?.totalPercentage} status="active" />
                        </Card>
                    </Col>
                </Row>

                <div style={{marginTop: "10px"}}>
                    <Row gutter={[16, 16]}>
                        <Col xl={8} md={12} sm={24}>
                            <Card bordered={false} className="border-left-danger shadow h-100 py-2">
                                <div className="font-weight-bold text-danger text-uppercase mb-1">
                                    CHỈ TIÊU CÔNG AN TỈNH GIAO
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{stateAdministrativeProceduresTargetStatistics?.administrative_procedures_target}</div>
                            </Card>
                        </Col>
                        <Col xl={8} md={12} sm={24}>
                            <Card bordered={false} className="border-left-danger shadow h-100 py-2">
                                <div className="font-weight-bold text-danger text-uppercase mb-1">
                                    ĐÃ SỐ HÓA ĐƯỢC
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{stateAdministrativeProceduresTargetStatistics?.total_digitized}</div>
                            </Card>
                        </Col>
                        <Col xl={8} md={12} sm={24}>
                            <Card bordered={false} className="border-left-danger shadow h-100 py-2">
                                <div className="font-weight-bold text-danger text-uppercase mb-1">
                                    Tỉ lệ đã số hóa
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{stateAdministrativeProceduresTargetStatistics?.totalPercentage}%</div>
                                <Progress percent={stateAdministrativeProceduresTargetStatistics?.totalPercentage} status="active" />
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
            <div className="mt-4" style={{ padding: "20px", backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 8px 12px rgba(0,0,0,0.1)' }}>
            <WrapperHeader>Tổng số hồ sơ giai đoạn 01/7/2022 đến thời điểm hiện tại</WrapperHeader>
                <Row gutter={[16, 16]}>
                    <Col xl={8} md={12} sm={24}>
                        <Card bordered={false} className="border-left-info shadow h-100 py-2">
                            <div className="font-weight-bold text-info text-uppercase mb-1">
                                Tổng số hồ sơ giải quyết TTHC
                            </div>
                            <div className="h5 mb-0 font-weight-bold text-gray-800">{statePostJuly2022DigitizedStatistics?.totalDocuments}</div>
                        </Card>
                    </Col>
                    <Col xl={8} md={12} sm={24}>
                        <Card bordered={false} className="border-left-info shadow h-100 py-2">
                            <div className="font-weight-bold text-info text-uppercase mb-1">
                                Tổng số hồ sơ giải quyết TTHC đã số hóa
                            </div>
                            <div className="h5 mb-0 font-weight-bold text-gray-800">{statePostJuly2022DigitizedStatistics?.totalDigitizedDocuments}</div>
                        </Card>
                    </Col>
                    <Col xl={8} md={12} sm={24}>
                        <Card bordered={false} className="border-left-info shadow h-100 py-2">
                            <div className="font-weight-bold text-info text-uppercase mb-1">
                                Tỉ lệ đã số hóa
                            </div>
                            <div className="h5 mb-0 font-weight-bold text-gray-800">{statePostJuly2022DigitizedStatistics?.totalPercentage}%</div>
                            <Progress percent={statePostJuly2022DigitizedStatistics?.totalPercentage} status="active" />
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    )
}