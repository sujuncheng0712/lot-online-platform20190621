import React, {PureComponent} from 'react';
import {Table} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

const columns = [
  {title: '序号', dataIndex: 'id', align: 'center'},
  {title: '激活时间', dataIndex: 'activation_at', align: 'left', render: val => val || '0000-00-00 00:00:00'},
  {title: '设备ID', dataIndex: 'eid', align: 'left'},
  {title: '型号', dataIndex: 'model', align: 'left'},
  {title: '激活码', dataIndex: 'activation_code', align: 'left', render: val => val || '-'},
  {title: '设备状态', dataIndex: 'state', align: 'left'},
  {title: '装机用户', dataIndex: 'uid', align: 'left', render: val => val || '-'},
  {title: '注册手机', dataIndex: 'phone', align: 'left', render: val => val || '-'},
  {title: '推荐人', dataIndex: 'vid', align: 'left'},
];
const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  getCheckboxProps: record => ({
    disabled: record.name === 'Disabled User', // Column configuration not to be checked
    name: record.name,
  }),
};

class ProductsList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
    };
  }

  componentDidMount() {
    this.getEquipments();
  }

  getEquipments() {
    const authData = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';
    let getEquipments = `${url}/equipments`;
    getEquipments += authData.type === 'vendors' ? '' : authData.type === 'agents' ? `?aid=${authData.uuid}` : `?did=${authData.uuid}`;
    fetch(getEquipments).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({lists: info.data});
        });
      }
    });
  }

  render() {
    const {lists} = this.state;

    return (
      <PageHeaderLayout title="设备列表">
        <div style={{padding: 20, backgroundColor: '#fff'}}>
          <Table
            rowKey="id"
            rowSelection={rowSelection}
            columns={columns}
            dataSource={lists}
          />
        </div>
      </PageHeaderLayout>
    );
  }
}

export default ProductsList;
