/* eslint-disable no-param-reassign,no-plusplus,no-underscore-dangle */
import React, { PureComponent } from 'react';
import { Badge, Divider, Input, Button, message, List, Select, Row, Col } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth')
  ? JSON.parse(sessionStorage.getItem('dochen-auth'))
  : '';

class codesList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      loading: true,
      merchantsList: [],
      orderId: '',
      orderConsignee: '',
      orderCode: '',
      merchantsContact: '',
    };
  }

  componentWillMount() {
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
              if (
                val.type === 3 &&
                (val.state === 4 || val.state === 3) &&
                val.activations.length > 0
              ) {
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
    const { lists, orderId, orderConsignee, orderCode } = this.state;
    const arr = [];
    lists.forEach(val => {
      if (val.uuid === orderId || val.consignee === orderConsignee) arr.push(val);
      val.activations.forEach(v => {
        if (v.code === orderCode) arr.push(val);
      });
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

    const ActivationCode = [];
    const activation = [];
    let k = 1;
    lists.forEach(val => {
      if (val.activations.length > 0) {
        val.activations.forEach(v => {
          v.id = k;
          k++;
          ActivationCode.push(v.code);
          if (v.confirm_at) activation.push(v);
        });
        let i = 1;
        val.activations.forEach(activationsVal => {
          activationsVal.id = i;
          i++;
        });
      }
      const merchant = val.merchant.m3 || val.merchant.m2 || val.merchant.m1;
      val.referrer = merchant ? merchant.contact : '--';
    });

    // 把商家分为代理商和经销商
    const agentList = [];
    const dealerList = [];
    merchantsList.forEach(item => {
      if (item.type === 1) agentList.push(item);
      if (item.type === 2) dealerList.push(item);
    });

    return (
      <PageHeaderLayout title="设备激活码列表">
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
                    placeholder="请输入需要查找的激活码"
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
        <div style={styles.content}>
          <div style={{ marginBottom: 15, textAlign: 'left' }}>
            <Badge status="default" text={`总购买数量${ActivationCode.length}个`} />
            <Divider type="vertical" />
            <Badge status="success" text={`已激活数量${activation.length}个`} />
            <Divider type="vertical" />
            <Badge
              status="processing"
              text={`未激活数量${ActivationCode.length - activation.length}个`}
            />
          </div>
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
            dataSource={lists}
            loading={loading}
            renderItem={item => (
              <div key={item.oid} style={styles.item}>
                <div style={styles.rowT}>
                  <div>
                    订单编号：{item.uuid}
                    <Divider type="vertical" />
                    {item.state !== 10 ? '成交' : '退款'}时间：{item.created_at}
                  </div>
                </div>
                {item.activations.map(val => (
                  <div key={val.code} style={styles.row}>
                    <div style={styles.id}>{val.id}</div>
                    <div style={styles.consignee}>{item.referrer}</div>
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
            pagination={{
              onChange: page => {
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

export default codesList;
