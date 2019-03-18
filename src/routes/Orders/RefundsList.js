/* eslint-disable no-param-reassign,no-plusplus,no-undef,no-underscore-dangle */
import React, { PureComponent } from 'react';
import {
  Input,
  Button,
  Icon,
  message,
  List,
  Popconfirm,
  Popover,
  Divider,
  Select,
  Row,
  Col,
} from 'antd';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
import 'ant-design-pro/dist/ant-design-pro.css';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth')
  ? JSON.parse(sessionStorage.getItem('dochen-auth'))
  : '';
const stateBadge = ['', '', '', '', '#666', '', '', '', '', '', '#f5222d'];
const stateMap = ['', '', '', '待付款', '已付款', '', '', '', '', '', '已退款'];

class OrdersList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      merchantsList: [],
      usersLists: [],
      lists: [],
      loading: true,
      consignee: '',
      orderId: '',
      merchantsContact: '',
    };
  }

  componentWillMount() {
    this.getMerchantsList();
    this.getUsers();
    this.getOrders(auth.mid);
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
  getUsers() {
    const getUsers = `${url}/users`;
    fetch(getUsers).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) this.setState({ usersLists: info.data });
        });
      }
    });
  }

  // 获取订单列表
  getOrders(mid) {
    let getOrders = `${url}/orders`;
    getOrders += mid ? `?mid=${mid}` : '';
    fetch(getOrders).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            const lists = [];
            let k = 1;
            info.data.forEach(val => {
              if (val.state === 10) {
                val.id = k;
                lists.push(val);
                k++;
              }
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
    const { lists, orderId, consignee } = this.state;

    const arr = [];
    lists.forEach(val => {
      if (val.uuid === orderId || val.consignee === consignee) arr.push(val);
    });

    if (arr.length === 0) message.error('没找到对应的数据');

    this.setState({ lists: arr.length > 0 ? arr : lists });
  }

  // 搜索商家的机器
  searchMerchantsList() {
    const { merchantsList, merchantsContact } = this.state;
    merchantsList.forEach(val => {
      if (val.contact === merchantsContact) {
        message.info(`正在搜索${merchantsContact}的订单，请稍后`);
        this.getOrders(val.uuid);
      }
    });
  }

  render() {
    const { merchantsList, lists, usersLists, loading } = this.state;

    // 把商家分为代理商和经销商
    const agentList = [];
    const dealerList = [];
    merchantsList.forEach(item => {
      if (item.type === 1) agentList.push(item);
      if (item.type === 2) dealerList.push(item);
    });

    const nowadays = [];
    const yesterday = [];
    const thisMonth = [];
    const lastMonth = [];

    lists.forEach(val => {
      usersLists.forEach(usersVal => {
        if (val.uid === usersVal.uuid) val.name = usersVal.name ? usersVal.name : usersVal.mobile;
      });

      const merchant = val.merchant.m3 || val.merchant.m2 || val.merchant.m1;
      val.referrer = merchant ? merchant.contact : '--';

      if (
        new Date(val.created_at).getMonth() === new Date().getMonth() &&
        new Date(val.created_at).getDate() === new Date().getDate() &&
        val.state === 4 &&
        val.type === 1
      )
        nowadays.push(val);
      if (
        new Date(val.created_at).getMonth() === new Date().getMonth() &&
        new Date(val.created_at).getDate() === new Date().getDate() - 1 &&
        val.state === 4 &&
        val.type === 1
      )
        yesterday.push(val);
      if (
        new Date(val.created_at).getMonth() === new Date().getMonth() &&
        val.state === 4 &&
        val.type === 1
      )
        thisMonth.push(val);
      if (
        new Date(val.created_at).getMonth() === new Date().getMonth() - 1 &&
        val.state === 4 &&
        val.type === 1
      )
        lastMonth.push(val);
    });

    return (
      <PageHeaderLayout title="退款列表">
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
                    onChange={e => this.setState({ orderId: e.target.value })}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>
                  收货人姓名：
                </Col>
                <Col span={17}>
                  <Input
                    placeholder="请输入需要查找的买家姓名"
                    onChange={e => this.setState({ consignee: e.target.value })}
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
          <br />
          <Row hidden={!(localStorage.getItem('antd-pro-authority') === 'vendors') || false}>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>
                  商家：
                </Col>
                <Col span={17}>
                  <Select
                    defaultValue="请选择"
                    style={{ width: '100%' }}
                    onChange={value => this.getOrders(value)}
                  >
                    <Select.OptGroup label="代理商">
                      {agentList.map(item => (
                        <Select.Option key={item.uuid}>
                          {item.contact}({item.mobile})
                        </Select.Option>
                      ))}
                    </Select.OptGroup>
                    <Select.OptGroup label="经销商">
                      {dealerList.map(item => (
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
        <div style={{ padding: 10, backgroundColor: '#fff' }}>
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
            renderItem={item => (
              <div key={item.uuid} style={styles.item}>
                <div style={styles.rowT}>
                  <div>
                    订单编号：{item.uuid}
                    <Divider type="vertical" />
                    {item.state !== 10 ? '成交' : '退款'}时间：{item.created_at}
                  </div>
                  {localStorage.getItem('antd-pro-authority') === 'vendors' && item.state !== 10 ? (
                    <Popconfirm
                      placement="left"
                      title="确认要退单吗？"
                      okText="确认"
                      cancelText="取消"
                      onConfirm={() => {
                        let returnUrl = `${url}/orders`;
                        returnUrl += `/${item.uuid}`;
                        returnUrl += `/return`;
                        fetch(returnUrl, {
                          method: 'POST',
                          body: JSON.stringify({ oid: item.uuid }),
                        }).then(res => {
                          if (res.ok) {
                            res.json().then(data => {
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
                      <Button type="primary" size="small">
                        <Icon type="delete" /> 退单
                      </Button>
                    </Popconfirm>
                  ) : (
                    ''
                  )}
                </div>
                <div style={styles.row}>
                  <div style={styles.id}>{item.id}</div>
                  <div style={styles.consignee}>{item.consignee}</div>
                  <div style={styles.phone}>{item.phone}</div>
                  <div style={styles.rowAddress}>
                    <Ellipsis length={10} tooltip>
                      {item.address}
                    </Ellipsis>
                  </div>
                  <div span={4} style={styles.pay_amount}>
                    {item.pay_amount !== null ? (
                      <span>
                        {item.pay_amount}元&nbsp;&nbsp;
                        {localStorage.getItem('antd-pro-authority') === 'vendors' ? (
                          <Popover
                            placement="top"
                            title="支付单号"
                            content={item.pay_billno}
                            trigger="click"
                          >
                            <Icon
                              type="info-circle-o"
                              style={{ color: '#ccc', fontSize: 12, cursor: 'pointer' }}
                            />
                          </Popover>
                        ) : (
                          ''
                        )}
                      </span>
                    ) : (
                      '--'
                    )}
                  </div>
                  <div span={4} style={styles.pay_amount}>
                    <span style={{ color: stateBadge[item.state] }}>
                      {/* {item.message === 'book' ? '已预约' : stateMap[item.state]} */}
                      {stateMap[item.state]}
                    </span>
                  </div>
                  <div style={styles.contact}>{item.name || '--'}</div>
                  <div style={styles.contact}>{item.referrer}</div>
                  <div style={styles.agents}>
                    {item.merchant.m1 ? item.merchant.m1.contact : '--'}
                  </div>
                </div>
              </div>
            )}
            pagination={{ pageSize: 10 }}
          />
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
    minWidth: 115,
    textAlign: 'right',
    lineHeight: '32px',
  },

  count: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fafafa',
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

export default OrdersList;
