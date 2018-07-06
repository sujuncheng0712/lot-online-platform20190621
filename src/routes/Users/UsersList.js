/* eslint-disable no-param-reassign,no-plusplus */
import React, {PureComponent} from 'react';
import {Table} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

const columns = [
  {title: '序号', dataIndex: 'id'},
  {title: '注册时间', dataIndex: 'created_at', align: 'left'},
  {title: '注册手机号', dataIndex: 'mobile', align: 'left'},
  {title: '姓名', dataIndex: 'name', align: 'left', render: val => val || '-'},
  {title: '推荐人', dataIndex: 'contact', align: 'left'},
  {title: '代理商', dataIndex: 'agents', align: 'left'},
];

class UsersList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      loading: true,
      dealersLists: [],
      agentsLists: [],
    };
  }

  componentDidMount() {
    this.getDealers();
    this.getAgents();
    this.getUsers();
  }

  // 获取经销商列表
  getDealers() {
    const getDealers = `${url}/dealers`;
    fetch(getDealers).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({dealersLists: info.data});
        });
      }
    });
  }

  // 获取代理商列表
  getAgents() {
    const getAgents = `${url}/agents`;
    fetch(getAgents).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({agentsLists: info.data});
        });
      }
    });
  }

  // 获取用户列表
  getUsers() {
    const authData = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';
    let getUser = `${url}/users`;
    getUser += authData.type === 'vendors' ? '' : authData.type === 'agents' ? `?aid=${authData.uuid}` : `?did=${authData.uuid}`;
    fetch(getUser).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({lists: info.data, loading: false});
        });
      }
    });
  }

  render() {
    const {lists, loading, dealersLists, agentsLists} = this.state;

    let k = 1;
    lists.forEach((val) => {
      agentsLists.forEach((value) => {
        if (val.aid === value.aid) {
          val.contact = value.contact;
          val.phone = value.mobile;
          val.agents = value.contact;
        }
      });
      dealersLists.forEach((value) => {
        if (val.did === value.did) {
          val.contact = value.contact;
          val.phone = value.mobile;
        }
      });
      val.id = k;
      k++;
    });

    return (
      <PageHeaderLayout title="用户列表">
        <div style={{padding: 20, backgroundColor: '#fff'}}>
          <Table
            columns={columns}
            dataSource={lists}
            loading={loading}
            rowKey="id"
          />
        </div>
      </PageHeaderLayout>
    );
  }
}

export default UsersList;
