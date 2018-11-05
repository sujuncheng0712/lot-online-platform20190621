/* eslint-disable no-param-reassign,no-plusplus,no-const-assign,radix,no-underscore-dangle,one-var */
import React, {PureComponent} from 'react';
import {Input, Button, Badge, message, List, Divider, Select, Row, Col, Tabs} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';

class SubsidyList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      merchantsList: [],
      ordersLists: [],
      lists: [],
      loading: true,
      orderId: '',
      agentsName: '',
    };
  }

  componentDidMount() {
    this.getMerchantsList();
    this.getOrders();
    this.getEarnings(auth.mid || '');
  }

  // 获取订单列表
  getOrders() {
    const getOrders = `${url}/orders`;
    fetch(getOrders).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({ordersLists: info.data});
        });
      }
    });
  }

  // 获取商家列表
  getMerchantsList() {
    const getMerchants = `${url}/merchants`;
    fetch(getMerchants).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({merchantsList: info.data});
        });
      }
    });
  }

  // 获取收益列表
  getEarnings(mid = '') {
    let getEarnings = `${url}/earnings`;
    getEarnings += mid ? `?mid=${mid}` : '';
    fetch(getEarnings).then((res) => {
      if (!res.ok) return false;
      res.json().then((info) => {
        if (!info.status) {
          this.setState({lists: [], loading: false});
          message.warning(`提示：[${info.message}]`);
          return false;
        }
        this.setState({lists: info.data, loading: false});
      });
    });
  }

  // 搜索列表
  searchList() {
    const {lists, orderId, agentsName} = this.state;
    const arr = [];
    lists.forEach((val) => {
      if (val.oid === orderId || val.agents === agentsName) {
        arr.push(val);
      }
    });

    if (arr.length === 0) message.error('没找到对应的数据');

    this.setState({lists: arr.length > 0 ? arr : lists});
  }

  // 搜索商家的机器
  searchMerchantsList() {
    const {merchantsList, merchantsContact} = this.state;
    merchantsList.forEach((val) => {
      if (val.contact === merchantsContact) {
        message.info(`正在搜索${merchantsContact}的订单，请稍后`);
        this.getEarnings(val.uuid);
      }
    });
  }

  render() {
    const {lists, loading, ordersLists, merchantsList} = this.state;

    const earnings = (type) => {
      const data = [];
      const nowadays = {m1: 0, m2: 0, m3: 0};
      const yesterday = {m1: 0, m2: 0, m3: 0};
      const thisMonth = {m1: 0, m2: 0, m3: 0};
      const lastMonth = {m1: 0, m2: 0, m3: 0};

      lists.forEach((val) => {
        ordersLists.forEach((value) => {
          if (val.oid === value.uuid) {
            const merchant = value.merchant.m3 || value.merchant.m2 || value.merchant.m1;
            const contact = merchant ? merchant.contact : '--';
            val.contact = contact;
            val.consignee = value.consignee || '--';
            val.pay_amount = value.pay_amount;
          }
        });
        merchantsList.forEach((value) => {
          if (val.m1id === value.uuid) val.m1 = value.contact;
          if (val.m2id === value.uuid) val.m2 = value.contact;
          if (val.m3id === value.uuid) val.m3 = value.contact;
        });

        if (type === 1 && (val.type === 1 || val.type === 3 || val.type === 4)) {
          if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate()) {
            nowadays.m1 += val.m1earning !== 'None' ? parseInt(val.m1earning) : 0;
            nowadays.m2 += val.m2earning !== 'None' ? parseInt(val.m2earning) : 0;
            nowadays.m3 += val.m3earning !== 'None' ? parseInt(val.m3earning) : 0;
          }
          if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate() - 1) {
            yesterday.m1 += val.m1earning !== 'None' ? parseInt(val.m1earning) : 0;
            yesterday.m2 += val.m2earning !== 'None' ? parseInt(val.m2earning) : 0;
            yesterday.m3 += val.m3earning !== 'None' ? parseInt(val.m3earning) : 0;
          }
          if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth()) {
            thisMonth.m1 += val.m1earning !== 'None' ? parseInt(val.m1earning) : 0;
            thisMonth.m2 += val.m2earning !== 'None' ? parseInt(val.m2earning) : 0;
            thisMonth.m3 += val.m3earning !== 'None' ? parseInt(val.m3earning) : 0;
          }
          if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() - 1) {
            lastMonth.m1 += val.m1earning !== 'None' ? parseInt(val.m1earning) : 0;
            lastMonth.m2 += val.m2earning !== 'None' ? parseInt(val.m2earning) : 0;
            lastMonth.m3 += val.m3earning !== 'None' ? parseInt(val.m3earning) : 0;
          }

          data.push(val);
        }
        if (type === 2 && val.type === 2) {
          if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate()) {
            nowadays.m1 += val.m1earning !== 'None' ? parseInt(val.m1earning) : 0;
            nowadays.m2 += val.m2earning !== 'None' ? parseInt(val.m2earning) : 0;
            nowadays.m3 += val.m3earning !== 'None' ? parseInt(val.m3earning) : 0;
          }
          if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate() - 1) {
            yesterday.m1 += val.m1earning !== 'None' ? parseInt(val.m1earning) : 0;
            yesterday.m2 += val.m2earning !== 'None' ? parseInt(val.m2earning) : 0;
            yesterday.m3 += val.m3earning !== 'None' ? parseInt(val.m3earning) : 0;
          }
          if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth()) {
            thisMonth.m1 += val.m1earning !== 'None' ? parseInt(val.m1earning) : 0;
            thisMonth.m2 += val.m2earning !== 'None' ? parseInt(val.m2earning) : 0;
            thisMonth.m3 += val.m3earning !== 'None' ? parseInt(val.m3earning) : 0;
          }
          if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() - 1) {
            lastMonth.m1 += val.m1earning !== 'None' ? parseInt(val.m1earning) : 0;
            lastMonth.m2 += val.m2earning !== 'None' ? parseInt(val.m2earning) : 0;
            lastMonth.m3 += val.m3earning !== 'None' ? parseInt(val.m3earning) : 0;
          }

          data.push(val);
        }
      });

      return (
        <div style={styles.content}>
          <div
            style={{marginBottom: 15, textAlign: 'left'}}
            hidden={(localStorage.getItem('antd-pro-authority') === 'merchants_02' || localStorage.getItem('antd-pro-authority') === 'merchants_02')}
          >
            一级运营商：
            <Badge status="success" text={`今天收益：${nowadays.m1}元`} />
            <Divider type="vertical" />
            <Badge status="success" text={`昨天收益：${yesterday.m1}元`} />
            <Divider type="vertical" />
            <Badge status="processing" text={`本月收益：${thisMonth.m1}元`} />
            <Divider type="vertical" />
            <Badge status="processing" text={`上月收益：${lastMonth.m1}元`} />
          </div>
          <div
            style={{marginBottom: 15, textAlign: 'left'}}
            hidden={localStorage.getItem('antd-pro-authority') === 'merchants_03'}
          >
            二级运营商：
            <Badge status="success" text={`今天收益：${nowadays.m2}元`} />
            <Divider type="vertical" />
            <Badge status="success" text={`昨天收益：${yesterday.m2}元`} />
            <Divider type="vertical" />
            <Badge status="processing" text={`本月收益：${thisMonth.m2}元`} />
            <Divider type="vertical" />
            <Badge status="processing" text={`上月收益：${lastMonth.m2}元`} />
          </div>
          <div style={{marginBottom: 15, textAlign: 'left'}}>
            代理商：
            <Badge status="success" text={`今天收益：${nowadays.m3}元`} />
            <Divider type="vertical" />
            <Badge status="success" text={`昨天收益：${yesterday.m3}元`} />
            <Divider type="vertical" />
            <Badge status="processing" text={`本月收益：${thisMonth.m3}元`} />
            <Divider type="vertical" />
            <Badge status="processing" text={`上月收益：${lastMonth.m3}元`} />
          </div>
          <div style={styles.title}>
            <div style={styles.id}>序号</div>
            <div style={styles.type}>订单类型</div>
            <div style={styles.pay_amount}>付款金额</div>
            <div style={styles.pay_amount}>订单状态</div>
            <div style={styles.consignee}>付款人</div>
            <div
              style={styles.agents}
              hidden={(localStorage.getItem('antd-pro-authority') === 'merchants_02' || localStorage.getItem('antd-pro-authority') === 'merchants_03')}
            >
              一级运营商
            </div>
            <div
              style={styles.agent_earning}
              hidden={(localStorage.getItem('antd-pro-authority') === 'merchants_02' || localStorage.getItem('antd-pro-authority') === 'merchants_03')}
            >
              一级收益
            </div>
            <div
              style={styles.dealers}
              hidden={localStorage.getItem('antd-pro-authority') === 'merchants_03'}
            >
              二级运营商
            </div>
            <div
              style={styles.dealer_earning}
              hidden={localStorage.getItem('antd-pro-authority') === 'merchants_03'}
            >
              二级收益
            </div>
            <div style={styles.dealers}>代理商</div>
            <div style={styles.dealer_earning}>代理收益</div>
          </div>
          <List
            split={false}
            bordered={false}
            dataSource={data}
            loading={loading}
            renderItem={
              (item, key) => (
                <div key={item.oid} style={styles.item}>
                  <div style={styles.rowT}>
                    <div>
                      订单编号：{item.oid}<Divider type="vertical" />成交时间：{item.created_at}
                    </div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.id}>{key + 1}</div>
                    <div style={styles.type}>
                      {item.type === 3 ? '团购订单' : '用户订单'}
                    </div>
                    <div style={styles.pay_amount}>{item.total}元</div>
                    <div style={styles.pay_amount}>已付款</div>
                    <div style={styles.consignee}>
                      {item.type === 3 ? item.contact : item.consignee}
                    </div>
                    <div
                      style={styles.agents}
                      hidden={localStorage.getItem('antd-pro-authority') === 'merchants_02'}
                    >
                      {item.m1 || '--'}
                    </div>
                    <div
                      style={styles.agent_earning}
                      hidden={(localStorage.getItem('antd-pro-authority') === 'merchants_02' || localStorage.getItem('antd-pro-authority') === 'merchants_03')}
                    >
                      {item.m1earning !== 'None' ? `${item.m1earning}元` : '--'}
                    </div>
                    <div
                      style={styles.dealers}
                      hidden={(localStorage.getItem('antd-pro-authority') === 'merchants_02' || localStorage.getItem('antd-pro-authority') === 'merchants_03')}
                    >
                      {item.m2 || '--'}
                    </div>
                    <div
                      style={styles.dealer_earning}
                      hidden={localStorage.getItem('antd-pro-authority') === 'merchants_02'}
                    >
                      {item.m2earning !== 'None' ? `${item.m2earning}元` : '--'}
                    </div>
                    <div style={styles.dealers}>{item.m3 || '--'}</div>
                    <div style={styles.dealer_earning}>
                      {item.m3earning !== 'None' ? `${item.m3earning}元` : '--'}
                    </div>
                  </div>
                </div>
              )
            }
            pagination={{pageSize: 10}}
          />
        </div>
      );
    };

    return (
      <PageHeaderLayout title="收益列表">
        <div style={styles.content}>
          <Row>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>订单编号：</Col>
                <Col span={17}>
                  <Input placeholder="请输入需要查找的订单编号" onChange={(e) => this.setState({orderId: e.target.value})} />
                </Col>
              </Row>
            </Col>
            <Col span={4}>
              <Button type="primary" onClick={this.searchList.bind(this)}>查找收益</Button>
            </Col>
          </Row>
          <br />
          <Row hidden={!(localStorage.getItem("antd-pro-authority") === "vendors") || false}>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>商家：</Col>
                <Col span={17}>
                  <Select defaultValue="请选择" style={{width: '100%'}} onChange={(value) => this.getEarnings(value)}>
                    <Select.OptGroup label="代理商">
                      {merchantsList.map((item) => (
                        <Select.Option key={item.uuid}>{item.contact}({item.mobile})</Select.Option>
                      ))}
                    </Select.OptGroup>
                  </Select>
                </Col>
              </Row>
            </Col>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>按商家姓名搜索：</Col>
                <Col span={17}>
                  <Input placeholder="请输入商家姓名" onChange={(e) => this.setState({merchantsContact: e.target.value})} />
                </Col>
              </Row>
            </Col>
            <Col span={4}>
              <Button type="primary" onClick={this.searchMerchantsList.bind(this)}>搜索商家</Button>
            </Col>
          </Row>
        </div>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="补贴收益" key="1">{earnings(1)}</Tabs.TabPane>
          <Tabs.TabPane tab="返点收益" key="2">{earnings(2)}</Tabs.TabPane>
        </Tabs>
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
  type: {
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

export default SubsidyList;
