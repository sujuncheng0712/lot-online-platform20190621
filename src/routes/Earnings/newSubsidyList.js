/* eslint-disable no-param-reassign,no-plusplus,no-const-assign,radix,no-underscore-dangle,one-var */
import React, { PureComponent } from 'react';
import { Input, Button, Badge, message, List, Divider, Select, Row, Col, Popover } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth')
  ? JSON.parse(sessionStorage.getItem('dochen-auth'))
  : '';

class newSubsidyList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      merchantsList: [],
      usersList: [],  // 用户列表
      lists: [],
      loading: true,
      orderId: '',
      midList: [],
      orderList: [],  // 订单列表
    };
  }

  componentDidMount() {
    this.getMerchantsList();
    this.getOrders();
    this.getUsersList();
    this.getEarnings();
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

  // 获取订单列表
  getOrders() {
    const getOrders = `${url}/orders`;

    fetch(getOrders).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            const orderList = [];
            info.data.forEach(val => {
              if (val.type === 3 && (val.state === 4 || val.state === 3) &&
                val.activations.length > 0) {
                orderList.push(val);
              }
            });
            this.setState({ orderList });
          } else {
            this.setState({ orderList: [] });
            message.warning(`提示：[${info.message}]`);
          }
        });
      }
    });
  }

  // 获取收益列表
  getEarnings() {
    const getEarnings = `${url}/dgk_earning`;

    fetch(getEarnings, {
      headers: auth.mid ? {
        mid: auth.mid,
      } : {
        vid: 'f40d03342db411e8bc9600163e0851fd',
      },
    }).then(res => {
      if (!res.ok) return false;
      res.json().then(info => {
        if (info.status) {
          let midList = [];
          info.data.forEach(val => {
            if (val.m1id || val.m2id) {
              midList.push(val.m1id);
              midList.push(val.m2id);
            }
          });
          midList = [...new Set(midList)];
          this.setState({ lists: info.data, midList, loading: false });
        } else {
          this.setState({ lists: [], loading: false });
          message.warning(`提示：[${info.message}]`);
          return false;
        }
      });
    });
  }

  // 根据 mid 搜索收益列表
  getEarningByMid(val) {
    const getEarnings = `${url}/dgk_earning`;
    fetch(getEarnings, {
      headers: {
        mid: val,
      },
    }).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            this.setState({ lists: info.data, loading: false });
          } else {
            message.warning(`搜索的商家不存在！`);
            this.setState({ loading: false });
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
      if (val.oid === orderId) {
        arr.push(val);
      }
    });

    if (arr.length === 0) message.error('没找到对应的数据');

    this.setState({ lists: arr.length > 0 ? arr : lists });
  }

  // 搜索商家的机器
  searchMerchantsList(mid) {
    this.setState({loading: true});
    const { merchantsList, merchantsContact } = this.state;
    let isSearch = false;
    if (typeof mid === 'string') {
      this.getEarningByMid(mid);
      return;
    }
    merchantsList.forEach(val => {
      if (val.contact === merchantsContact) {
        isSearch = true;
        this.getEarningByMid(val.uuid)
      }
    });
    if (!isSearch) {
      message.warning(`搜索的商家不存在！`);
      this.setState({ loading: false });
    }
  }

  render() {
    const { lists, loading, merchantsList, midList, usersList, orderList } = this.state;

    // 从全部商家列表中找出该收益列表才有的商家
    const merchantOfEarningList = [];
    midList.forEach(mval => {
      merchantsList.forEach(item => {
        if (item.uuid === mval) merchantOfEarningList.push(item);
      });
    });

    // 把商家分为代理商和经销商
    const agentList = [];
    const dealerList = [];
    merchantOfEarningList.forEach(item => {
      if (item.type === 1) agentList.push(item);
      if (item.type === 2) dealerList.push(item);
    });

    // 根据 uid 找出激活人, 根据订单号 oid 找购买人
    lists.forEach(item => {
      usersList.forEach(val => {
        if (item.uid === val.uuid) item.activationName = val.name ? val.name : val.mobile;
      });
      merchantsList.forEach(val => {
        if (item.uid === val.uuid) item.activationName = val.contact;
      });
      orderList.forEach(oVal => {
        if (item.oid === oVal.uuid) {
          const merchant = oVal.merchant.m2 || oVal.merchant.m1;
          item.purchaser = merchant ? merchant.contact : '--';
        }
      });
    });

    const data = [];
    const nowadays = { m1: 0, m2: 0, m3: 0 };
    const yesterday = { m1: 0, m2: 0, m3: 0 };
    const thisMonth = { m1: 0, m2: 0, m3: 0 };
    const lastMonth = { m1: 0, m2: 0, m3: 0 };

    let k = 1;
    lists.forEach(val => {

      merchantOfEarningList.forEach(value => {
        if (val.m1id === value.uuid) val.m1 = value.contact;
        if (val.m2id === value.uuid) val.m2 = value.contact;
        if (val.m3id === value.uuid) val.m3 = value.contact;
      });

      if (val.type === 1 || val.type === 3 || val.type === 4) {
        if (
          new Date(val.link_at).getMonth() === new Date().getMonth() &&
          new Date(val.link_at).getDate() === new Date().getDate()
        ) {
          nowadays.m1 += val.m1earning !== 'None' ? val.m1earning : 0;
          nowadays.m2 += val.m2earning !== 'None' ? val.m2earning : 0;
          nowadays.m3 += val.m3earning !== 'None' ? parseInt(val.m3earning) : 0;
        }
        if (
          new Date(val.link_at).getMonth() === new Date().getMonth() &&
          new Date(val.link_at).getDate() === new Date().getDate() - 1
        ) {
          yesterday.m1 += val.m1earning !== 'None' ? val.m1earning : 0;
          yesterday.m2 += val.m2earning !== 'None' ? val.m2earning : 0;
          yesterday.m3 += val.m3earning !== 'None' ? parseInt(val.m3earning) : 0;
        }
        if (new Date(val.link_at).getMonth() === new Date().getMonth()) {
          thisMonth.m1 += val.m1earning !== 'None' ? val.m1earning : 0;
          thisMonth.m2 += val.m2earning !== 'None' ? val.m2earning : 0;
          thisMonth.m3 += val.m3earning !== 'None' ? parseInt(val.m3earning) : 0;
        }
        if (new Date(val.link_at).getMonth() === new Date().getMonth() - 1) {
          lastMonth.m1 += val.m1earning !== 'None' ? val.m1earning : 0;
          lastMonth.m2 += val.m2earning !== 'None' ? val.m2earning : 0;
          lastMonth.m3 += val.m3earning !== 'None' ? parseInt(val.m3earning) : 0;
        }

        val.id = k;
        data.push(val);
        k += 1;
      }

    });

    return (
      <PageHeaderLayout title="预估补贴收益列表">
        <div style={styles.content}>
          <Row>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>
                  激活码单号：
                </Col>
                <Col span={17}>
                  <Input
                    placeholder="请输入需要查找的激活码单号"
                    onChange={e => this.setState({ orderId: e.target.value })}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={4}>
              <Button type="primary" onClick={this.searchList.bind(this)}>
                查找收益
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
                    onChange={value => this.searchMerchantsList(value)}
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
        <div style={styles.content}>
          <div
            style={{ marginBottom: 15, textAlign: 'left' }}
            hidden={
              localStorage.getItem('antd-pro-authority') === 'merchants_02' ||
              localStorage.getItem('antd-pro-authority') === 'merchants_03'
            }
          >
            代理商：
            <Badge status="success" text={`今天收益：${nowadays.m1}元`} />
            <Divider type="vertical" />
            <Badge status="success" text={`昨天收益：${yesterday.m1}元`} />
            <Divider type="vertical" />
            <Badge status="processing" text={`本月收益：${thisMonth.m1}元`} />
            <Divider type="vertical" />
            <Badge status="processing" text={`上月收益：${lastMonth.m1}元`} />
          </div>
          <div
            style={{ marginBottom: 15, textAlign: 'left' }}
            hidden={localStorage.getItem('antd-pro-authority') === 'merchants_03'}
          >
            经销商：
            <Badge status="success" text={`今天收益：${nowadays.m2}元`} />
            <Divider type="vertical" />
            <Badge status="success" text={`昨天收益：${yesterday.m2}元`} />
            <Divider type="vertical" />
            <Badge status="processing" text={`本月收益：${thisMonth.m2}元`} />
            <Divider type="vertical" />
            <Badge status="processing" text={`上月收益：${lastMonth.m2}元`} />
          </div>
          <div style={styles.title}>
            <div style={styles.id}>序号</div>
            <div style={styles.activationTime}>激活时间</div>
            <div style={styles.model}>设备型号</div>
            <div style={styles.eid}>设备ID</div>
            <div style={styles.code}>设备激活码</div>
            <div style={styles.consignee}>激活人</div>
            <div
              style={styles.agents}
              hidden={
                localStorage.getItem('antd-pro-authority') === 'merchants_02' ||
                localStorage.getItem('antd-pro-authority') === 'merchants_03'
              }
            >
              代理商
            </div>
            <div
              style={styles.agent_earning}
              hidden={
                localStorage.getItem('antd-pro-authority') === 'merchants_02' ||
                localStorage.getItem('antd-pro-authority') === 'merchants_03'
              }
            >
              收益
            </div>
            <div
              style={styles.dealers}
              hidden={localStorage.getItem('antd-pro-authority') === 'merchants_03'}
            >
              经销商
            </div>
            <div
              style={styles.dealer_earning}
              hidden={localStorage.getItem('antd-pro-authority') === 'merchants_03'}
            >
              收益
            </div>
            {/* <div style={styles.dealers}>代理商</div>
            <div style={styles.dealer_earning}>代理收益</div> */}
          </div>
          <List
            split={false}
            bordered={false}
            dataSource={data}
            loading={loading}
            renderItem={item => (
              <div key={item.oid} style={styles.item}>
                <div style={styles.rowT}>
                  <div>
                    激活码单号：
                    <Popover
                      title="订单信息"
                      content={(
                        <div>
                          <div>单价：{item.univalent}元</div>
                          <div>数量：{item.quantity}</div>
                          <div>总金额：{Number(item.payment_amount.toString().slice(0, -2))}元</div>
                        </div>
                      )}
                    >
                      {item.oid}
                    </Popover>
                    <Divider type="vertical" />
                    购买人：{item.purchaser || '--'}
                    <Divider type="vertical" />
                    {item.pay_ch === 'weixin' && '微信支付'}
                    {item.pay_ch === 'wallet' && '账户余额支付'}
                    {item.pay_ch === 'bank' && '线下支付'}
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.id}>{item.id}</div>
                  <div style={styles.activationTime}>{item.link_at}</div>
                  <div style={styles.model}>{item.eptags}</div>
                  <div style={styles.eid}>{item.eid}</div>
                  <div style={styles.code}>{item.link_id}</div>
                  <div style={styles.consignee}>{item.activationName || '--'}</div>
                  <div
                    style={styles.agents}
                    hidden={
                      localStorage.getItem('antd-pro-authority') === 'merchants_02' ||
                      localStorage.getItem('antd-pro-authority') === 'merchants_03'
                    }
                  >
                    {item.m1 || '--'}
                  </div>
                  <div
                    style={styles.agent_earning}
                    hidden={
                      localStorage.getItem('antd-pro-authority') === 'merchants_02' ||
                      localStorage.getItem('antd-pro-authority') === 'merchants_03'
                    }
                  >
                    {item.m1earning !== 'None' ? `${item.m1earning}元` : '--'}
                  </div>
                  <div
                    style={styles.dealers}
                    hidden={
                      localStorage.getItem('antd-pro-authority') === 'merchants_03'
                    }
                  >
                    {item.m2 || '--'}
                  </div>
                  <div
                    style={styles.dealer_earning}
                    hidden={localStorage.getItem('antd-pro-authority') === 'merchants_03'}
                  >
                    {item.m2earning !== 'None' ? `${item.m2earning}元` : '--'}
                  </div>
                  {/* <div style={styles.dealers}>{item.m3 || '--'}</div>
                  <div style={styles.dealer_earning}>
                    {item.m3earning !== 'None' ? `${item.m3earning}元` : '--'}
                  </div> */}
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
  activationTime: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  model: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  eid: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  code: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },

  consignee: {
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
  agent_earning: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  dealers: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  dealer_earning: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
};

export default newSubsidyList;
