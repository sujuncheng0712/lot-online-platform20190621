/* eslint-disable no-param-reassign,radix,no-underscore-dangle */
import React, {PureComponent} from 'react';
import {Tabs, Table, Card, Select, message} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const role = localStorage.getItem('antd-pro-authority');
const auth = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';

const columns = [
  {title: '月份', dataIndex: 'cycle', align: 'center'},
  {title: '补贴收入', dataIndex: 'allowance', render: val => `${val}元`, align: 'center'},
  {title: '返点收入', dataIndex: 'commission', render: val => `${val}元`, align: 'center'},
  {title: '退款补扣金额', dataIndex: 'refund', render: val => `${val}元`, align: 'center'},
  {
    title: '月结发钱',
    dataIndex: '',
    render: info => `${info.allowance + info.commission + info.refund}元`,
    align: 'center',
  },
];
const typeMap = ['', '产品', '耗材', '团购', '套餐'];
const columns2 = [
  {title: '日期', dataIndex: 'created_at'},
  {title: '订单编号', dataIndex: 'oid'},
  {title: '订单类型', dataIndex: 'type', align: 'center', render: val => typeMap[val]},
  {title: '付款金额', dataIndex: 'pay_amount', align: 'center', render: val => `${val}元`},
  {title: '付款人', dataIndex: 'mobile'},
  {
    title: '我的收益',
    dataIndex: '',
    align: 'center',
    render: info => `${role === 'agents' ? info.agent_earning : info.dealer_earning}元`,
  },
];

class ClearingList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      earningsLists:[],
      userLists: [],
      orderLists: [],
      dealersLists: [],
      agentsLists: [],
    };
  }

  componentDidMount() {
    this.getSummary();
    this.getEarnings();
    this.getUsersList();
    this.getOrders();
    this.getDealers();
    this.getAgents();
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

  // 获取结算列表
  getSummary(uuid = '') {
    let getSummary = `${url}/earnings`;
    getSummary += `/${uuid || auth.uuid}`;
    getSummary += `/summary`;
    fetch(getSummary).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            this.setState({lists: info.data});
          }else {
            this.setState({lists: []});
            message.warning(`提示：[${info.message}]`);
          }
        });
      }
    });
  }

  // 获取收益列表
  getEarnings(type = '', uuid = '') {
    let getEarnings = `${url}/earnings`;
    let _type;
    switch (type) {
      case 'agents':
        _type = `?aid=${uuid}`;
        break;
      case 'dealers':
        _type = `?did=${uuid}`;
        break;
      default:
        _type = '';
    }
    getEarnings += auth.type === 'vendors' ? _type : auth.type === 'agents' ? `?aid=${auth.uuid}` : `?did=${auth.uuid}`;

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

  // 获取用户列表
  getUsersList() {
    const usersListUrl = `${url}/users`;
    fetch(usersListUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            this.setState({userLists: info.data});
          }
        });
      }
    });
  }

  // 获取订单列表
  getOrders() {
    let getOrders = `${url}/orders`;
    getOrders += auth.type === 'vendors' ? '' : auth.type === 'agents' ? `?aid=${auth.uuid}` : `?did=${auth.uuid}`;

    fetch(getOrders).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({orderLists:info.data});
        });
      }
    });
  }

  render() {
    const {lists, earningsLists, userLists, orderLists, dealersLists, agentsLists} = this.state;

    let nowadays = 0;
    let yesterday = 0;
    let thisMonth = 0;
    let lastMonth = 0;

    earningsLists.forEach((val) => {
      orderLists.forEach((Oval)=>{
        if (val.oid === Oval.oid) val.pay_amount = Oval.pay_amount;
      });
      userLists.forEach((Uval) => {
        if (val.uid === Uval.uid) val.mobile = Uval.mobile;
      });
      dealersLists.forEach((Dval) => {
        if (val.uid === Dval.did) val.mobile = Dval.contact;
      });
      agentsLists.forEach((Aval) => {
        if (val.uid === Aval.aid) val.mobile = Aval.contact;
      });

      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate()) {
        if (localStorage.getItem('antd-pro-authority') === 'vendors') {
          if (sessionStorage.getItem('authType') === 'agents') {
            nowadays += parseInt(val.agent_earning);
          } else if (sessionStorage.getItem('authType') === 'dealers') {
            nowadays += parseInt(val.dealer_earning);
          } else {
            nowadays += parseInt(val.agent_earning);
            nowadays += parseInt(val.dealer_earning);
          }
        } else if (localStorage.getItem('antd-pro-authority') === 'agents') {
          nowadays += parseInt(val.agent_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'dealers') {
          nowadays += parseInt(val.dealer_earning);
        }
      }
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate() - 1) {
        if (localStorage.getItem('antd-pro-authority') === 'vendors') {
          if (sessionStorage.getItem('authType') === 'agents') {
            yesterday += parseInt(val.agent_earning);
          } else if (sessionStorage.getItem('authType') === 'dealers') {
            yesterday += parseInt(val.dealer_earning);
          } else {
            yesterday += parseInt(val.agent_earning);
            yesterday += parseInt(val.dealer_earning);
          }
        } else if (localStorage.getItem('antd-pro-authority') === 'agents') {
          yesterday += parseInt(val.agent_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'dealers') {
          yesterday += parseInt(val.dealer_earning);
        }
      }
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth()) {
        if (localStorage.getItem('antd-pro-authority') === 'vendors') {
          if (sessionStorage.getItem('authType') === 'agents') {
            thisMonth += parseInt(val.agent_earning);
          } else if (sessionStorage.getItem('authType') === 'dealers') {
            thisMonth += parseInt(val.dealer_earning);
          } else {
            thisMonth += parseInt(val.agent_earning);
            thisMonth += parseInt(val.dealer_earning);
          }
        } else if (localStorage.getItem('antd-pro-authority') === 'agents') {
          thisMonth += parseInt(val.agent_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'dealers') {
          thisMonth += parseInt(val.dealer_earning);
        }
      }
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() - 1) {
        if (localStorage.getItem('antd-pro-authority') === 'vendors') {
          if (sessionStorage.getItem('authType') === 'agents') {
            lastMonth += parseInt(val.agent_earning);
          } else if (sessionStorage.getItem('authType') === 'dealers') {
            lastMonth += parseInt(val.dealer_earning);
          } else {
            lastMonth += parseInt(val.agent_earning);
            lastMonth += parseInt(val.dealer_earning);
          }
        } else if (localStorage.getItem('antd-pro-authority') === 'agents') {
          lastMonth += parseInt(val.agent_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'dealers') {
          lastMonth += parseInt(val.dealer_earning);
        }
      }
    });

    return (
      <PageHeaderLayout title="结算列表">
        {localStorage.getItem('antd-pro-authority') === 'vendors' ? (
          <div style={styles.search}>
            <div style={styles.searchRow}>
              <div style={styles.searchTit}>&nbsp;&nbsp;&nbsp;&nbsp;代理商：</div>
              <div style={{width: 300}}>
                <Select
                  defaultValue="请选择"
                  style={{width: 300}}
                  onChange={(value) => {
                    sessionStorage.setItem('authType', value.split(',')[0]);
                    this.getSummary(value.split(',')[1]);
                    this.getEarnings(value.split(',')[0], value.split(',')[1]);
                  }}
                >
                  <Select.OptGroup label="代理商">
                    {agentsLists.map((item) => (
                      <Select.Option key={`agents,${item.aid}`}>{item.contact}({item.mobile})</Select.Option>
                    ))}
                  </Select.OptGroup>
                </Select>
              </div>
            </div>
            <div style={styles.searchRow}>
              <div style={styles.searchTit}>&nbsp;&nbsp;&nbsp;&nbsp;经销商：</div>
              <div style={{width: 300}}>
                <Select
                  defaultValue="请选择"
                  style={{width: 300}}
                  onChange={(value) => {
                    sessionStorage.setItem('authType', value.split(',')[0]);
                    this.getSummary(value.split(',')[1]);
                    this.getEarnings(value.split(',')[0], value.split(',')[1]);
                  }}
                >
                  <Select.OptGroup label="经销商">
                    {dealersLists.map((item) => (
                      <Select.Option key={`dealers,${item.did}`}>{item.contact}({item.mobile})</Select.Option>
                    ))}
                  </Select.OptGroup>
                </Select>
              </div>
            </div>
          </div>
        ) : ''}
        <div style={styles.count}>
          <div style={styles.countRow}><div>今天收益</div><div>{nowadays}元</div></div>
          <div style={styles.countRow}><div>昨天收益</div><div>{yesterday}元</div></div>
          <div style={styles.countRow}><div>本月收益</div><div>{thisMonth}元</div></div>
          <div style={styles.countRow}><div>上月收益</div><div>{lastMonth}元</div></div>
        </div>
        <Card bordered={false}>
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
