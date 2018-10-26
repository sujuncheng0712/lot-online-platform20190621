/* eslint-disable no-param-reassign,radix,no-underscore-dangle */
import React, {PureComponent} from 'react';
import {Tabs, Table, Card, Select, message, Row, Col, Input, Button, Badge, Divider} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';

const columns = [
  {title: '月份', dataIndex: 'cycle', align: 'center'},
  {title: '补贴收入', dataIndex: 'allowance', render: val => `${val}元`, align: 'center'},
  {title: '返点收入', dataIndex: 'commission', render: val => `${val}元`, align: 'center'},
  {title: '退款补扣金额', dataIndex: 'refund', render: val => `${val}元`, align: 'center'},
  {
    title: '月结发钱',
    dataIndex: '',
    render: info => `${parseFloat(info.allowance) + parseFloat(info.commission) + parseFloat(info.refund)}元`,
    align: 'center',
  },
];
const typeMap = ['', '产品', '耗材', '团购', '套餐'];
const columns2 = [
  {title: '日期', dataIndex: 'created_at'},
  {title: '订单编号', dataIndex: 'oid'},
  {title: '订单类型', dataIndex: 'type', align: 'center', render: val => typeMap[val]},
  {title: '付款金额', dataIndex: 'pay_amount', align: 'center', render: val => `${val}元`},
  {title: '付款人', dataIndex: '', render: info => info.type === 3 ? info.contact : info.consignee},
  {
    title: '我的收益',
    dataIndex: '',
    align: 'center',
    render: info => {
      if (info.type === 1) return info.m1earning !== 'None' ? info.m1earning : 0;
      if (info.type === 2) return info.m2earning !== 'None' ? info.m2earning : 0;
      if (info.type === 3) return info.m3earning !== 'None' ? info.m3earning : 0;
    },
  },
];

class ClearingList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      earningsLists: [],
      orderLists: [],
      merchantsList: [],
    };
  }

  componentDidMount() {
    this.getSummary(auth.mid || '');
    this.getEarnings(auth.mid || '');
    this.getOrders();
    this.getMerchantsList();
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

  // 获取结算列表
  getSummary(mid = '') {
    if (!mid) return false;
    let getSummary = `${url}/earnings`;
    getSummary += `/${mid}`;
    getSummary += `/summary`;
    fetch(getSummary).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            this.setState({lists: info.data});
          } else {
            this.setState({lists: []});
            message.warning(`提示：[${info.message}]`);
          }
        });
      }
    });
  }

  // 获取收益列表
  getEarnings(mid = '') {
    if (!mid) return false;
    let getEarnings = `${url}/earnings`;
    getEarnings += `?mid=${mid}`;
    fetch(getEarnings).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            this.setState({earningsLists: info.data});
          } else {
            this.setState({earningsLists: []});
            message.warning(`提示：[${info.message}]`);
          }
        });
      }
    });
  }

  // 获取订单列表
  getOrders() {
    const getOrders = `${url}/orders`;
    fetch(getOrders).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({orderLists: info.data});
        });
      }
    });
  }

  // 搜索商家的机器
  searchMerchantsList() {
    const {merchantsList, merchantsContact} = this.state;
    merchantsList.forEach((val) => {
      if (val.contact === merchantsContact) {
        message.info(`正在搜索${merchantsContact}的结算情况，请稍后`);
        this.getSummary(val.uuid);
        this.getEarnings(val.uuid);
      }
    });
  }

  render() {
    const {lists, earningsLists, orderLists, merchantsList} = this.state;

    const nowadays = {m1: 0, m2: 0, m3: 0};
    const yesterday = {m1: 0, m2: 0, m3: 0};
    const thisMonth = {m1: 0, m2: 0, m3: 0};
    const lastMonth = {m1: 0, m2: 0, m3: 0};

    earningsLists.forEach((val) => {
      orderLists.forEach((value) => {
        if (val.oid === value.uuid) {
          const merchant = value.merchant.m3 || value.merchant.m2 || value.merchant.m1;
          const contact = merchant ? merchant.contact : '--';
          val.contact = contact;
          val.consignee = value.consignee || '--';
          val.pay_amount = value.pay_amount;
        }
      });

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
    });

    return (
      <PageHeaderLayout title="结算列表">
        <div style={styles.content} hidden={!(localStorage.getItem("antd-pro-authority") === "vendors") || false}>
          <Row>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>商家：</Col>
                <Col span={17}>
                  <Select
                    defaultValue="请选择"
                    style={{width: '100%'}}
                    onChange={(value) => {
                      this.getSummary(value);
                      this.getEarnings(value);
                    }}
                  >
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
        <Card bordered={false}>
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
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="已结算概况" key="1">
              <Table rowKey="id" columns={columns} dataSource={lists} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="收益结算明细" key="2">
              <Table rowKey="id" columns={columns2} dataSource={earningsLists} />
            </Tabs.TabPane>
          </Tabs>
        </Card>
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

export default ClearingList;
