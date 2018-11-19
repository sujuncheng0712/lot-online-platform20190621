/* eslint-disable no-param-reassign,no-plusplus,no-underscore-dangle */
import React, { PureComponent } from 'react';
import { Table, Select, message, Row, Col, Input, Button } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth')
  ? JSON.parse(sessionStorage.getItem('dochen-auth'))
  : '';

const columns = [
  { title: '序号', dataIndex: 'id' },
  { title: '注册时间', dataIndex: 'created_at' },
  { title: '注册手机号', dataIndex: 'mobile' },
  { title: '姓名', dataIndex: 'name', render: val => val || '-' },
  { title: '推荐人', dataIndex: 'merchant', render: val => (val.m3 || val.m2 || val.m1).contact },
  { title: '代理商', dataIndex: 'merchant', render: val => val.m1.contact },
];

class UsersList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      loading: true,
      merchantsList: [],
      merchantsContact: '',
    };
  }

  componentDidMount() {
    this.getUsers(auth.mid);
    this.getMerchantsList();
  }

  // 获取商家列表
  getMerchantsList() {
    const getMerchants = `${url}/merchants`;
    fetch(getMerchants).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) this.setState({ merchantsList: info.data });
        });
      }
    });
  }

  // 获取用户列表
  getUsers(mid) {
    let getUser = `${url}/users`;
    getUser += mid ? `?mid=${mid}` : '';

    fetch(getUser).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            this.setState({ lists: info.data, loading: false });
          } else {
            this.setState({ lists: [], loading: false });
            message.warning(`提示：[${info.message}]`);
          }
        });
      }
    });
  }

  // 搜索商家的机器
  searchMerchantsList() {
    const { merchantsList, merchantsContact } = this.state;
    merchantsList.forEach(val => {
      if (val.contact === merchantsContact) {
        message.info(`正在搜索${merchantsContact}的用户，请稍后`);
        this.getUsers(val.uuid);
      }
    });
  }

  render() {
    const { lists, loading, merchantsList } = this.state;

    lists.forEach(val => {
      merchantsList.forEach(merchant => {
        if (val.mid === merchant.uuid) {
          val.mid = merchant.contact;
        }
      });
    });

    return (
      <PageHeaderLayout title="用户列表">
        <div
          style={styles.content}
          hidden={!(localStorage.getItem('antd-pro-authority') === 'vendors') || false}
        >
          <Row>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>
                  商家：
                </Col>
                <Col span={17}>
                  <Select
                    defaultValue="请选择"
                    style={{ width: '100%' }}
                    onChange={value => this.getUsers(value)}
                  >
                    <Select.OptGroup label="代理商">
                      {merchantsList.map(item => (
                        <Select.Option key={item.uuid}>
                          {item.contact}({item.mobile})
                        </Select.Option>
                      ))}
                    </Select.OptGroup>
                  </Select>
                </Col>
              </Row>
            </Col>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>
                  按商家姓名搜索：
                </Col>
                <Col span={17}>
                  <Input
                    placeholder="请输入商家姓名"
                    onChange={e => this.setState({ merchantsContact: e.target.value })}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={4}>
              <Button type="primary" onClick={this.searchMerchantsList.bind(this)}>
                搜索商家
              </Button>
            </Col>
          </Row>
        </div>
        <div style={{ padding: 20, backgroundColor: '#fff' }}>
          <Table columns={columns} dataSource={lists} loading={loading} rowKey="id" />
        </div>
      </PageHeaderLayout>
    );
  }
}

const styles = {
  content: {
    backgroundColor: '#fff',
    padding: '20px',
    marginBottom: 15,
  },
  tit: {
    minWidth: 110,
    textAlign: 'right',
    lineHeight: '32px',
  },
};

export default UsersList;
