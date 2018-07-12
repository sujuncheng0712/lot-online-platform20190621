/* eslint-disable no-param-reassign */
import React, {PureComponent} from 'react';
import {Card, Col, Row, Button, Tabs, Table, List, Divider} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const stateBadge = ['','','','','#666','','','','','','#f5222d'];
const stateMap = ['','','','待付款','已付款','','','','','','已退款'];

const goodsColumns = [
  {title: '合同约定押金(元)', dataIndex: 'month'},
  {title: '已缴纳押金(元)', dataIndex: 'date'},
  {title: '应配发货额度(台)', dataIndex: 'state'},
  {title: '已发货数量', dataIndex: 'amount'},
  {title: '已退货', dataIndex: 'balance'},
  {title: '已激活数量', dataIndex: 'remark'},
  {title: '未激活数量', dataIndex: 'remark1'},
  {title: '剩余发货额度', dataIndex: 'remark2'},
];

const goodsColumns2 = [
  {title: '序号', dataIndex: 'month'},
  {title: '日期', dataIndex: 'date'},
  {title: '单号', dataIndex: 'state'},
  {title: '数量', dataIndex: 'amount'},
  {title: '类型', dataIndex: 'balance'},
  {title: '账户', dataIndex: 'remark'},
  {title: '代理商', dataIndex: 'remark1'},
];

class ADProfile extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      info: {},
      dealList: [],
      agentsList: [],
      earningsList: [],
      loading: true,
      ordersLists: [],
      dealersLists: [],
      agentsLists: [],
    };
  }

  componentWillMount() {
    this.getAgentsList();
    this.getDealList();
    this.getAgentsInfo();
    this.getEarnings();
    this.getOrders();
    this.getDealers();
    this.getAgents();
  }

  // 获取代理商列表
  getAgentsList() {
    const agentsListUrl = `${url}/agents`;
    fetch(agentsListUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({agentsList: info.data});
        });
      }
    });
  }

  // 获取商家信息
  getAgentsInfo(){
    const {location: {search}} = this.props;
    const ad = search.slice(1).split('&');
    const role = ad[0].slice(1).split('=')[1];
    const roleId = ad[1].slice(1).split('=')[1];

    const infoUrl = `${url}/${role}/${roleId}`;
    fetch(infoUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            this.state.agentsList.forEach((value) => {
              if (info.data[0].superior === value.aid) info.data[0].superior = value.contact;
            });
            this.setState({info: info.data[0]});
          }
        });
      }
    });
  }

  // 获取签约信息列表
  getDealList() {
    const {location: {search}} = this.props;
    const ad = search.slice(1).split('&');
    const role = ad[0].slice(1).split('=')[1];
    const roleId = ad[1].slice(1).split('=')[1];

    const dealListUrl = `${url}/${role}/${roleId}/deal`;
    fetch(dealListUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({dealList: info.data});
        });
      }
    });
  }

  // 获取收益列表
  getEarnings() {
    const {location: {search}} = this.props;
    const ad = search.slice(1).split('&');
    const role = ad[0].slice(1).split('=')[1];
    const roleId = ad[1].slice(1).split('=')[1];

    const getEarnings = `${url}/earnings`;
    fetch(getEarnings).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            const data = [];
            let k = 1;
            info.data.forEach((val) => {
              if (val.aid === roleId || val.did === roleId) {
                val.id = k;
                data.push(val);
                k++;
              }
            });
            this.setState({earningsList: data, loading: false});
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
          if (info.status) this.setState({ordersLists: info.data});
        });
      }
    });
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

  render() {
    const {location: {search}} = this.props;
    const ad = search.slice(1).split('&');
    const role = ad[0].slice(1).split('=')[1];
    const roleId = ad[1].slice(1).split('=')[1];

    const {info, dealList, earningsList, loading, ordersLists, dealersLists, agentsLists} = this.state;

    let nowadays = 0;
    let yesterday = 0;
    let thisMonth = 0;
    let lastMonth = 0;

    earningsList.forEach((val) => {
      ordersLists.forEach((value) => {
        if (val.oid === value.oid) {
          val.consignee = value.consignee;
          val.pay_amount = value.pay_amount;
          val.state = value.state;
        }
      });
      if (val.type === 3) {
        dealersLists.forEach((value) => {
          if (val.uid === value.did) val.consignee = value.contact;
        });
        agentsLists.forEach((value) => {
          if (val.uid === value.aid) val.consignee = value.contact;
        });
      }
      dealersLists.forEach((value) => {
        if (val.did === value.did) val.dealers = value.contact;
      });
      agentsLists.forEach((value) => {
        if (val.aid === value.aid) val.agents = value.contact;
      });
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate()) {
        if (role === 'agents') {
          nowadays += parseInt(val.agent_earning);
        } else if (role === 'dealers') {
          nowadays += parseInt(val.dealer_earning);
        }
      }
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate() - 1) {
        if (role === 'agents') {
          yesterday += parseInt(val.agent_earning);
        } else if (role === 'dealers') {
          yesterday += parseInt(val.dealer_earning);
        }
      }
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth()) {
        if (role === 'agents') {
          thisMonth += parseInt(val.agent_earning);
        } else if (role === 'dealers') {
          thisMonth += parseInt(val.dealer_earning);
        }
      }
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() - 1) {
        if (role === 'agents') {
          lastMonth += parseInt(val.agent_earning);
        } else if (role === 'dealers') {
          lastMonth += parseInt(val.dealer_earning);
        }
      }
    });

    const columns = [
      {title: '起始时间', dataIndex: 'begin_at'},
      {title: '共已缴金额(元)', dataIndex: 'pledge', align: 'center'},
      {title: '保证金(元)', dataIndex: 'deposit', align: 'center'},
      {title: '应配发货额度(台)', dataIndex: 'goods', align: 'center'},
      {title: '补贴金额(元)', dataIndex: 'allowance_fee', align: 'center'},
      {title: '滤芯返点(%)', dataIndex: 'commission_rate', align: 'center'},
      {title: '售后返点(%)', dataIndex: 'service_rate', align: 'center'},
      localStorage.getItem("antd-pro-authority") === "vendors" ? {
        title: '操作',
        dataIndex: 'uuid',
        render: val => (
          <Button
            onClick={() => {
              location.hash = `#/vendors/deal-add/?role=${role}&id=${roleId}&uuid=${val}`;
            }}
          >
            编辑
          </Button>
        ),
      } : {},
    ];

    return (
      <PageHeaderLayout
        title={info.organization}
      >
        <Card
          title="基本信息"
          bordered={false}
          extra={
            localStorage.getItem("antd-pro-authority") === "vendors" ? (
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  location.href = `#/vendors/ad-add/?role=${role}&id=${roleId}`;
                }}
              >
                编辑经销信息
              </Button>
            ) : ''
          }
        >
          <Row gutter={24}>
            <Col span={4} style={{textAlign: 'right', lineHeight: 3}}>单位名称：</Col>
            <Col span={20} style={{lineHeight: 3}}>{info.organization}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={4} style={{textAlign: 'right', lineHeight: 3}}>{role === 'agents' ? '代理' : '所属'}区域：</Col>
            <Col span={20} style={{lineHeight: 3}}>{info.area}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={4} style={{textAlign: 'right', lineHeight: 3}}>联系人：</Col>
            <Col span={20} style={{lineHeight: 3}}>{info.contact}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={4} style={{textAlign: 'right', lineHeight: 3}}>推荐码：</Col>
            <Col span={20} style={{lineHeight: 3}}>{info.mobile}</Col>
          </Row>
        </Card>
        <br />
        <Card
          title="签约信息"
          extra={
            localStorage.getItem("antd-pro-authority") === "vendors" ? (
              <a href={`#/vendors/deal-add/?role=${role}&id=${roleId}`}>增加</a>
            ) : ''
          }
          bordered={false}
        >
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="当前签约" key="1">
              <Table rowKey="id" columns={columns} dataSource={dealList} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="历史签约" key="2">
              <Table rowKey="id" columns={columns} dataSource={dealList} />
            </Tabs.TabPane>
          </Tabs>
        </Card>
        <br />
        <Card title="发货信息" bordered={false}>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="发货额度" key="1">
              <Table rowKey="id" columns={goodsColumns} dataSource={[]} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="发货记录" key="2">
              <Table rowKey="id" columns={goodsColumns2} dataSource={[]} />
            </Tabs.TabPane>
          </Tabs>
        </Card>
        <br />
        <Card title="收益统计" bordered={false}>
          <div style={styles.count}>
            <div style={styles.countRow}>
              <div>今天收益</div>
              <div>{nowadays}元</div>
            </div>
            <div style={styles.countRow}>
              <div>昨天收益</div>
              <div>{yesterday}元</div>
            </div>
            <div style={styles.countRow}>
              <div>本月收益</div>
              <div>{thisMonth}元</div>
            </div>
            <div style={styles.countRow}>
              <div>上月收益</div>
              <div>{lastMonth}元</div>
            </div>
          </div>
          <div style={{padding: 20, backgroundColor: '#fff'}}>
            <div style={styles.title}>
              <div style={styles.id}>序号</div>
              <div style={styles.type}>订单类型</div>
              <div style={styles.pay_amount}>付款金额</div>
              <div style={styles.pay_amount}>订单状态</div>
              <div style={styles.consignee}>付款人</div>
              {
                localStorage.getItem('antd-pro-authority') !== 'dealers' ? (
                  <div style={styles.agents}>代理商</div>
                ) : ''
              }
              {
                localStorage.getItem('antd-pro-authority') !== 'dealers' ? (
                  <div style={styles.agent_earning}>代理商收益</div>
                ) : ''
              }
              <div style={styles.dealers}>经销商</div>
              <div style={styles.dealer_earning}>经销商收益</div>
            </div>

            <List
              split={false}
              bordered={false}
              dataSource={earningsList}
              loading={loading}
              renderItem={
                item => (
                  <div key={item.oid} style={styles.item}>
                    <div style={styles.rowT}>
                      <div>
                        订单编号：{item.oid}
                        <Divider type="vertical" />
                        {(parseInt(item.agent_earning) > 0 || parseInt(item.dealer_earning) > 0) ? '成交' : '退款'}时间：{item.created_at}
                      </div>
                    </div>
                    <div style={styles.row}>
                      <div style={styles.id}>{item.id}</div>
                      <div style={styles.type}><span>{item.type === 3 ? '团购订单' : '用户订单'}</span></div>
                      <div style={styles.pay_amount}>{item.pay_amount}元</div>
                      <div style={styles.pay_amount}>
                        <span style={{color: stateBadge[item.state]}}>{stateMap[item.state]}</span>
                      </div>
                      <div style={styles.consignee}>{item.consignee}</div>
                      {
                        localStorage.getItem('antd-pro-authority') !== 'dealers' ? (
                          <div style={styles.agents}>{item.agents || '-'}</div>
                        ) : ''
                      }
                      {
                        localStorage.getItem('antd-pro-authority') !== 'dealers' ? (
                          <div style={styles.agent_earning}>
                            <span style={{color: parseInt(item.agent_earning) > 0 ? '#666' : '#f5222d'}}>
                              {item.agent_earning === undefined ? '-' : `${item.agent_earning}元`}
                            </span>
                          </div>
                        ) : ''
                      }
                      <div style={styles.dealers}>{item.dealers || '-'}</div>
                      <div style={styles.dealer_earning}>
                        <span style={{color: stateBadge[item.state]}}>
                          {item.dealer_earning === '0' ? '-' : `${item.dealer_earning}元`}
                        </span>
                      </div>
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
        </Card>
      </PageHeaderLayout>
    );
  }
}

const styles = {
  alignCenter: {
    textAlign: 'center',
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

export default ADProfile;
