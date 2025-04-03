import React from 'react';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';

const BreadcrumbComponent = ({ items }) => {
    return (
        <Breadcrumb style={{ marginBottom: '20px', fontSize: '16px' }}>
            {items.map((item, index) => (
                <Breadcrumb.Item key={index}>
                    {item.path ? (
                        <Link to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {item.label}
                        </Link>
                    ) : (
                        item.label
                    )}
                </Breadcrumb.Item>
            ))}
        </Breadcrumb>
    );
};

export default BreadcrumbComponent;