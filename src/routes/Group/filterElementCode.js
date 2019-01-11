/* eslint-disable no-param-reassign,no-plusplus,no-underscore-dangle */
import React, { PureComponent } from 'react';
import { Row, Col, Input, Button, Badge, Divider, List, message } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth')
  ? JSON.parse(sessionStorage.getItem('dochen-auth'))
  : '';

class filterElementCode extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      loading: true,
      lists: [],
      usersList: [],
      orderId: '',
      orderCode: '',
      // merchantsList: [],
      // merchantsContact: '',
    };
  }

  componentWillMount() {
    // this.getMerchantsList();
    this.getUsersList();
    this.getOrders(auth.mid);
  }

  // 获取商家列表
  // getMerchantsList() {
  //   const getMerchants = `${url}/merchants`;
  //   fetch(getMerchants).then(res => {
  //     if (res.ok) {
  //       res.json().then(info => {
  //         if (info.status) this.setState({ merchantsList: info.data });
  //       });
  //     }
  //   });
  // }

  // 获取用户列表
  getUsersList() {
    let getUsersUrl = `${url}/users`;
    getUsersUrl += auth.mid ? `?mid=${auth.mid}` : '';
    fetch(getUsersUrl).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            const usersList = [];
            info.data.forEach(val => {
              usersList.push(val);
            });
            this.setState({usersList});
          }
        });
      }
    });
  }

  // 获取滤芯激活码订单列表
  getOrders() {
    let getOrders = `${url}/filter_cdkey`;
    getOrders += auth.mid ? `?mid=${auth.mid}` : '';
    fetch(getOrders, {
      headers: auth.mid ? {} : {
        vid: 'f40d03342db411e8bc9600163e0851fd',
      },
    }).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            const lists = [];
            let k = 1;
            info.data.forEach(val => {
              val.id = k;
              lists.push(val);
              k++;
            });
            this.setState({ lists, loading: false });
          } else {
            this.setState({ lists: [], loading: false });
            message.warning(`提示：[${info.message}]`);
          }
        });
      }
    });
  }

  // 搜索列表
  searchList() {
    this.setState({loading: true});
    const { lists, orderId, orderCode } = this.state;
    const arr = [];
    lists.forEach(val => {
      if (val.oid === orderId) arr.push(val);
      if (val.code === orderCode) arr.push(val);
    });

    if (arr.length === 0) message.error('没找到对应的数据');

    this.setState({ lists: arr.length > 0 ? arr : lists, loading: false });
  }

  render() {
    const { loading, lists, usersList } = this.state;

    const dataList = [];
    let orderArr = [];
    lists.forEach(item => {
      usersList.forEach(uItem => {
        if (uItem.uuid === item.uid) item.purchaser = uItem.name ? uItem.name : uItem.mobile;
      });

      orderArr.push(item.oid);
    });
    orderArr = [...new Set(orderArr)];

    orderArr.forEach(val => {
      const objArr = [];
      const objItem = {};
      lists.forEach(item => {
        if (item.oid === val) {
          objArr.push(item);
          objItem.orderId = item.oid;
          objItem.created_at = item.created_at;
        }
      });
      objItem.content = objArr;
      dataList.push(objItem);
    });

    return (
      <PageHeaderLayout title="滤芯激活码列表">
        <div style={styles.content}>
          <Row>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>
                  订单编号：
                </Col>
                <Col span={17}>
                  <Input
                    placeholder="请输入需要查找的订单编号"
                    onChange={e => {
                      this.setState({ orderId: e.target.value });
                    }}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>
                  激活码：
                </Col>
                <Col span={17}>
                  <Input
                    placeholder="请输入需要查找的滤芯激活码"
                    onChange={e => {
                      this.setState({ orderCode: e.target.value });
                    }}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={4}>
              <Button type="primary" onClick={this.searchList.bind(this)}>
                搜索订单
              </Button>
            </Col>
          </Row>
        </div>
        <div style={styles.content}>
          <div style={styles.title}>
            <div style={styles.id}>序号</div>
            <div style={styles.consignee}>购买人</div>
            <div style={styles.code}>激活码</div>
            <div style={styles.confirm_at}>激活状态</div>
            <div style={styles.confirm_at}>激活时间</div>
          </div>
          <List
            split={false}
            bordered={false}
            dataSource={dataList}
            loading={loading}
            renderItem={item => (
              <div key={item.code} style={styles.item}>
                <div style={styles.rowT}>
                  <div>
                    订单编号：{item.orderId}
                    <Divider type="vertical" />
                    {/* {item.state !== 10 ? '成交' : '退款'}时间：{item.created_at} */}
                    成交时间：{item.created_at}
                  </div>
                </div>
                {item.content.map((val, index) => (
                  <div key={val.code} style={styles.row}>
                    <div style={styles.id}>{index + 1}</div>
                    <div style={styles.consignee}>{val.purchaser || '--'}</div>
                    <div style={styles.code}>{val.code}</div>
                    <div style={styles.confirm_at}>
                      <Badge
                        status={val.confirm_at ? 'success' : 'default'}
                        text={val.confirm_at ? '已激活' : '未激活'}
                      />
                    </div>
                    <div style={styles.confirm_at}>{val.confirm_at || '--'}</div>
                  </div>
                ))}
              </div>
            )}
            pagination={{ pageSize: 10 }}
          />
        </div>
      </PageHeaderLayout>
    )
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
  title: {
    display: 'flex',
    backgroundColor: '#eee',
    padding: '10px 0px',
    marginBottom: 10,
    boxShadow: '0 1px 4px rgba(0,21,41,.12)',
  },
  item: {
    marginBottom: 15,
    paddingBottom: 10,
    boxShadow: '0 1px 4px rgba(0,21,41,.12)',
  },
  row: {
    display: 'flex',
    paddingTop: 15,
  },
  rowT: {
    padding: '3px 15px',
    backgroundColor: '#f6f6f6',
    display: 'flex',
    justifyContent: 'space-between',
  },
  oid: {
    padding: '0px 10px',
  },
  created_at: {
    padding: '0px 10px',
  },
  id: {
    width: 100,
    padding: '0px 10px',
    textAlign: 'center',
  },
  consignee: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  code: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  confirm_at: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
};

export default filterElementCode;
