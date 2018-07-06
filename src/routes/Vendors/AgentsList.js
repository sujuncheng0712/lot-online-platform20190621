/* eslint-disable no-param-reassign,no-plusplus */
import React, {PureComponent} from 'react';
import {Button, Table, Icon} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

const columns = [
  {width: 80, title: '序号', dataIndex: 'id', align: 'center'},
  {title: '开始时间', dataIndex: 'created_at', align: 'center'},
  {title: '单位名称', dataIndex: 'organization', align: 'center'},
  {width: 100, title: '联系人', dataIndex: 'contact', align: 'center'},
  {width: 120, title: '联系人电话', dataIndex: 'mobile', align: 'center'},
  {title: '代理区域', dataIndex: 'area', align: 'center'},
  {
    title: '操作',
    dataIndex: 'aid',
    align: 'center',
    render: val => (
      <Button
        type="primary"
        onClick={() => {
          location.href = `#/vendors/ad-profile/?role=agents&id=${val}`;
        }}
      >
        详情
      </Button>
    ),
  },
];

class AgentsList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.getAgentsList();
  }

  // 获取代理商列表
  getAgentsList() {
    const agentsListUrl = `${url}/agents`;
    fetch(agentsListUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            let k = 1;
            info.data.forEach((val) => {
              val.id = k;
              k++;
            });
            this.setState({lists: info.data, loading: false});
          }
        });
      }
    });
  }

  render() {
    const {lists, loading} = this.state;

    return (
      <PageHeaderLayout title="代理商列表">
        <div style={{padding: 20, backgroundColor: '#fff'}}>
          <Button
            type="primary"
            style={{marginBottom: 20}}
            onClick={() => {
              location.href = '#/vendors/ad-add/?role=agents'
            }}
            hidden={(localStorage.getItem("antd-pro-authority") === "agents" || localStorage.getItem("antd-pro-authority") === "dealers") || false}
          >
            <Icon type="plus" /> 添加代理商
          </Button>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={lists}
            loading={loading}
          />
        </div>
      </PageHeaderLayout>
    );
  }
}

export default AgentsList;