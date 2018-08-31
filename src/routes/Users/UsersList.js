/* eslint-disable no-param-reassign,no-plusplus */
import React, {PureComponent} from 'react';
import {Table, Select, message} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';


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
  getUsers(type = '', uuid = '') {
    let getUser = `${url}/users`;
    let _type;
    switch (type) {
      case 'agents':
        _type = `?aid=${uuid}`;
        break;
      case 'dealers':
        _type = `?did=${uuid}`;
        break;
      default:
        _type = '';
    }
    getUser += auth.type === 'vendors' ? _type : auth.type === 'agents' ? `?aid=${auth.uuid}` : `?did=${auth.uuid}`;

    fetch(getUser).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            this.setState({lists: info.data, loading: false});
          } else {
            this.setState({lists: [], loading: false});
            message.warning(`提示：[${info.message}]`);
          }
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
      if (!val.aid) val.agents = 'DGK 智能平台';
      val.id = k;
      k++;
    });

    return (
      <PageHeaderLayout title="用户列表">
        {localStorage.getItem('antd-pro-authority') === 'vendors' ? (
          <div style={styles.search}>
            <div style={styles.searchRow}>
              <div style={styles.searchTit}>&nbsp;&nbsp;&nbsp;&nbsp;代理商：</div>
              <div style={{width: 300}}>
                <Select
                  defaultValue="请选择"
                  style={{width: 300}}
                  onChange={(value) => {
                    this.getUsers(value.split(',')[0], value.split(',')[1]);
                  }}
                >
                  <Select.OptGroup label="代理商">
                    {agentsLists.map((item) => (
                      <Select.Option value={`agents,${item.aid}`}>{item.contact}({item.mobile})</Select.Option>
                    ))}
                  </Select.OptGroup>
                </Select>
              </div>
            </div>
            <div style={styles.searchRow}>
              <div style={styles.searchTit}>&nbsp;&nbsp;&nbsp;&nbsp;经销商：</div>
              <div style={{width: 300}}>
                <Select
                  defaultValue="请选择"
                  style={{width: 300}}
                  onChange={(value) => {
                    this.getUsers(value.split(',')[0], value.split(',')[1]);
                  }}
                >
                  <Select.OptGroup label="经销商">
                    {dealersLists.map((item) => (
                      <Select.Option value={`dealers,${item.did}`}>{item.contact}({item.mobile})</Select.Option>
                    ))}
                  </Select.OptGroup>
                </Select>
              </div>
            </div>
          </div>
        ) : ''}
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

const styles={
  search: {
    width: '100%',
    padding: '10px 20px',
    backgroundColor: '#fff',
    display: 'flex',
  },
  searchRow: {
    marginRight: 20,
    display: 'flex',
    alignItems: 'center',
  },
  searchTit: {
    width: 80,
  },
};

export default UsersList;
