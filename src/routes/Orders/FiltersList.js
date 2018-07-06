/* eslint-disable no-param-reassign,no-plusplus */
import React, {PureComponent} from 'react';
import {Input, Button, Icon, message, List, Popconfirm, Popover, Divider} from 'antd';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
import 'ant-design-pro/dist/ant-design-pro.css';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const stateBadge = ['','','','','#666','','','','','','#f5222d'];
const stateMap = ['','','','待付款','已付款','','','','','','已退款'];

class FiltersList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      loading: true,
      dealersLists: [],
      agentsLists: [],
      usersLists: [],
      orderConsignee: '',
      orderId: '',
    };
  }

  componentWillMount() {
    this.getDealers();
    this.getAgents();
    this.getUsers();
    this.getOrders();
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
    const getUsers = `${url}/users`;
    fetch(getUsers).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({usersLists: info.data});
        });
      }
    });
  }

  // 获取订单列表
  getOrders() {
    const authData = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';
    let getOrders = `${url}/orders`;
    // getOrders += `?limit=${10}`;
    // getOrders += `&offset=${0}`;
    getOrders += authData.type === 'vendors' ? '' : authData.type === 'agents' ? `?aid=${authData.uuid}` : `?did=${authData.uuid}`;

    fetch(getOrders).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            const lists = [];
            let k = 1;
            info.data.forEach((val) => {
              if (val.type !== 3 && val.state >= 4) {
                val.id = k;
                lists.push(val);
                k++;
              }
            });
            this.setState({lists, loading: false});
          }
        });
      }
    });
  }

  // 搜索列表
  searchList() {
    const {lists, orderId, orderConsignee} = this.state;
    const arr = [];
    lists.forEach((val) => {
      if (val.oid === orderId || val.consignee === orderConsignee) arr.push(val);
    });

    if (arr.length === 0) message.error('没找到对应的数据');

    this.setState({lists: arr.length > 0 ? arr : lists});
  }

  render() {
    const {lists, loading, dealersLists, agentsLists, usersLists} = this.state;

    const nowadays = [];
    const yesterday = [];
    const thisMonth = [];
    const lastMonth = [];

    lists.forEach((val) => {
      usersLists.forEach((usersVal) => {
        if (val.uid === usersVal.uid) {
          val.name = usersVal.name ? usersVal.name : usersVal.mobile;
          agentsLists.forEach((value) => {
            if (usersVal.aid === value.aid) {
              val.contact = value.contact;
              val.agents = value.contact;
            }
          });
          dealersLists.forEach((value) => {
            if (usersVal.did === value.did) {
              val.contact = value.contact;
              agentsLists.forEach((agents) => {
                if (value.superior === agents.aid) val.agents = agents.contact;
              });
            }
          });
        }
      });
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate() && val.state === 4 && val.type === 1) nowadays.push(val);
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate() - 1 && val.state === 4 && val.type === 1) yesterday.push(val);
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && val.state === 4 && val.type === 1) thisMonth.push(val);
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() - 1 && val.state === 4 && val.type === 1) lastMonth.push(val);
    });

    return (
      <PageHeaderLayout title="产品订单列表">
        <div style={styles.count}>
          <div style={styles.countRow}>
            <div>今天订单数</div>
            <div>{nowadays.length}笔</div>
          </div>
          <div style={styles.countRow}>
            <div>昨天订单数</div>
            <div>{yesterday.length}笔</div>
          </div>
          <div style={styles.countRow}>
            <div>本月订单数</div>
            <div>{thisMonth.length}笔</div>
          </div>
          <div style={styles.countRow}>
            <div>上月订单数</div>
            <div>{lastMonth.length}笔</div>
          </div>
        </div>
        <div style={styles.search}>
          <div style={styles.searchRow}>
            <div style={styles.searchTit}>订单编号：</div>
            <div style={{width: 200}}>
              <Input
                placeholder="请输入需要查找的订单编号"
                onChange={(e) => {
                  this.setState({orderId: e.target.value});
                }}
              />
            </div>
          </div>
          <div style={styles.searchRow}>
            <div style={styles.searchTit}>买家姓名：</div>
            <div style={{width: 200}}>
              <Input
                placeholder="请输入需要查找的买家姓名"
                onChange={(e) => {
                  this.setState({orderConsignee: e.target.value});
                }}
              />
            </div>
          </div>
          <Button type="primary" onClick={this.searchList.bind(this)}><Icon type="search" /> 查找</Button>
        </div>
        <div style={{padding: 20, backgroundColor: '#fff'}}>
          <div style={styles.title}>
            <div style={styles.id}>序号</div>
            <div style={styles.consignee}>收货人</div>
            <div style={styles.phone}>联系电话</div>
            <div style={styles.address}>安装地址</div>
            <div style={styles.pay_amount}>支付金额</div>
            <div style={styles.pay_amount}>订单状态</div>
            <div style={styles.contact}>付款人</div>
            <div style={styles.contact}>推荐人</div>
            <div style={styles.agents}>代理商</div>
          </div>
          <List
            split={false}
            bordered={false}
            dataSource={lists}
            loading={loading}
            renderItem={
              item => (
                <div key={item.oid} style={styles.item}>
                  <div style={styles.rowT}>
                    <div>
                      订单编号：{item.oid}
                      <Divider type="vertical" />
                      {item.state !== 10?'成交':'退款'}时间：{item.created_at}
                    </div>
                    {
                      (localStorage.getItem('antd-pro-authority') === 'vendors' && item.state !== 10) ? (
                        <Popconfirm
                          placement="left"
                          title="确认要退单吗？"
                          okText="确认"
                          cancelText="取消"
                          onConfirm={() => {

                            let returnUrl = `${url}/orders`;
                            returnUrl += `/${item.oid}`;
                            returnUrl += `/return`;

                            fetch(returnUrl, {
                              method: 'POST',
                              body: JSON.stringify({oid: item.oid}),
                            }).then((res) => {
                              if (res.ok) {
                                res.json().then((data) => {
                                  if (data.status) {
                                    message.success('退单成功');
                                    this.getOrders();
                                  } else {
                                    message.error(`退单失败：[${data.message}]`);
                                  }
                                });
                              }
                            });
                          }}
                        >
                          <Button type="primary" size="small"><Icon type="delete" /> 退单</Button>
                        </Popconfirm>
                      ) : ''
                    }
                  </div>
                  <div style={styles.row}>
                    <div style={styles.id}>{item.id}</div>
                    <div style={styles.consignee}>{item.consignee}</div>
                    <div style={styles.phone}>{item.phone}</div>
                    <div style={styles.rowAddress}>
                      <Ellipsis length={10} tooltip>{item.address.split(' ')[0]}</Ellipsis>
                    </div>
                    <div span={4} style={styles.pay_amount}>
                      {
                        item.pay_amount !== null ? (
                          <span>
                            {item.pay_amount}元&nbsp;&nbsp;
                            {
                              localStorage.getItem('antd-pro-authority') === 'vendors' ? (
                                <Popover placement="top" title="支付单号" content={item.pay_billno} trigger="click">
                                  <Icon
                                    type="info-circle-o"
                                    style={{color: '#ccc', fontSize: 12, cursor: 'pointer'}}
                                  />
                                </Popover>
                              ) : ''
                            }
                          </span>
                        ) : '--'
                      }
                    </div>
                    <div span={4} style={styles.pay_amount}>
                      <span style={{color: stateBadge[item.state]}}>{stateMap[item.state]}</span>
                    </div>
                    <div style={styles.contact}>{item.name}</div>
                    <div style={styles.contact}>{item.contact}</div>
                    <div style={styles.agents}>{item.agents}</div>
                  </div>
                </div>
              )
            }
            pagination={{
              onChange: (page) => {
                console.log(page);
              },
              pageSize: 10,
            }}
          />
        </div>
      </PageHeaderLayout>
    );
  }
}

const styles = {
  count: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countRow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  search: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
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
    justifyContent:'space-between',
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
  phone: {
    width: 250,
    padding: '0px 10px',
    textAlign: 'center',
  },
  address: {
    width: 300,
    padding: '0px 10px',
    textAlign: 'center',
  },
  rowAddress: {
    width: 300,
    padding: '0px 10px',
    textAlign: 'center',
  },
  pay_amount: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  contact: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  agents: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
};

export default FiltersList;