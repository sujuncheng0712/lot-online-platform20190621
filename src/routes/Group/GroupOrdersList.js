/* eslint-disable no-param-reassign,no-plusplus,no-underscore-dangle */
import React, { PureComponent } from 'react';
import { Input, Button, message, List, Divider, Select, Row, Col, Popover, Icon } from 'antd';
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
      lists: [],
      loading: true,
      merchantsList: [],
      orderId: '',
      merchantsContact: '',
    };
  }

  componentDidMount() {
    this.getMerchantsList();
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
              if (val.type === 3 && (val.state === 4 || val.state === 3) &&
                val.activations.length > 0) {
                val.id = k;
                val.consignee = auth.contact;
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
    const { lists, orderId } = this.state;
    const arr = [];
    lists.forEach(val => {
      if (val.uuid === orderId) arr.push(val);
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
    const { lists, loading, merchantsList } = this.state;

    const nowadays = [];
    const yesterday = [];
    const thisMonth = [];
    const lastMonth = [];

    lists.forEach(val => {
      const merchant = val.merchant.m3 || val.merchant.m2 || val.merchant.m1;
      val.referrer = merchant ? merchant.contact : '--';

      if (
        new Date(val.created_at).getMonth() === new Date().getMonth() &&
        new Date(val.created_at).getDate() === new Date().getDate() &&
        val.state === 4 &&
        val.type === 3
      )
        nowadays.push(val);
      if (
        new Date(val.created_at).getMonth() === new Date().getMonth() &&
        new Date(val.created_at).getDate() === new Date().getDate() - 1 &&
        val.state === 4 &&
        val.type === 3
      )
        yesterday.push(val);
      if (
        new Date(val.created_at).getMonth() === new Date().getMonth() &&
        val.state === 4 &&
        val.type === 3
      )
        thisMonth.push(val);
      if (
        new Date(val.created_at).getMonth() === new Date().getMonth() - 1 &&
        val.state === 4 &&
        val.type === 3
      )
        lastMonth.push(val);
    });

    return (
      <PageHeaderLayout title="团购订单列表">
        <div style={styles.content}>
          <Row>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>
                  订单编号：
                </Col>
                <Col span={17}>
                  <Input
                    placeholder="请输入需要查找的设备ID"
                    onChange={e => this.setState({ orderId: e.target.value })}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={4}>
              <Button type="primary" onClick={this.searchList.bind(this)}>
                搜索设备
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
            <div style={styles.consignee}>购买人</div>
            <div style={styles.quantity}>购买数量</div>
            <div style={styles.total}>单价</div>
            <div style={styles.pay_amount}>支付金额</div>
            <div style={styles.pay_amount}>订单状态</div>
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
                    <Divider type="vertical" />
                    支付方式：
                    {item.pay_ch === 'weixin' && '微信支付'}
                    {item.pay_ch === 'wallet' && '账户余额'}
                    {item.pay_ch === 'bank' && '线下支付'}
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.id}>{item.id}</div>
                  <div style={styles.consignee}>{item.referrer}</div>
                  <div style={styles.quantity}>{item.quantity}</div>
                  <div style={styles.total}>￥{item.total / item.quantity}</div>
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
                            {item.pay_billno ? (
                              <Icon
                                type="info-circle-o"
                                style={{ color: '#ccc', fontSize: 12, cursor: 'pointer' }}
                              />
                            ) : (
                              ''
                            )}
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
                    <span style={{ color: stateBadge[item.state] }}>{stateMap[item.state]}</span>
                  </div>
                  <div style={styles.agents}>
                    {item.merchant.m1 ? item.merchant.m1.contact : '--'}
                  </div>
                </div>
              </div>
            )}
            pagination={{
              // onChange: (page) => {
              //   console.log(page);
              // },
              pageSize: 10,
            }}
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
    minWidth: 110,
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

  alignCenter: {
    textAlign: 'center',
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
  quantity: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  total: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  state: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  pay_amount: {
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
