import React, { useState, useEffect } from 'react'
import { Table } from 'antd';
import Loading from '../LoadingComponent/Loading';
import { useSelector } from 'react-redux'
import { StyledTable } from './style';

const TableComponent = (props) => {
  const { selectionType = 'checkbox', data = [], isLoading = false, columns = [], handleDeleteMultiple, resetSelection } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const user = useSelector((state) => state?.user);
  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [resetSelection]);

  const handleDeleteAll = () => {
    handleDeleteMultiple(selectedRowKeys);
  }

  return (
    <Loading isLoading={isLoading}>
        {user?.role === "admin" && selectedRowKeys.length > 0 && (
          <div style={{ backgroundColor: '#1677ff', color: '#fff', fontWeight: 'bold', padding: '10px', cursor: 'pointer'}} onClick={handleDeleteAll}>
            Xóa tất cả
          </div>
        )}
        <StyledTable
        style={{ fontSize: '16px' }}
          rowSelection={{
          type: selectionType,
            ...rowSelection,
          }}
          columns={columns}
          dataSource={data}
          {...props}
          bordered
        />
    </Loading>
  )
}

export default TableComponent