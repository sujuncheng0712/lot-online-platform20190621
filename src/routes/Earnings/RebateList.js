/* eslint-disable no-param-reassign,no-plusplus,no-const-assign,radix,no-underscore-dangle */
import React, {PureComponent} from 'react';
import {Input, Button, Icon, message, List, Divider, Select} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';
const stateBadge = ['','','','','#666','','','','','','#f5222d'];
const stateMap = ['','','','待付款','已付款','','','','','','已退款'];

class SubsidyList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      agentsLists: [],
      dealersLists: [],
      ordersLists: [],
      lists: [],
      loading: true,
      orderId: '',
      agentsName: '',
    };
  }

  componentDidMount() {
    this.getDealers();
    this.getAgents();
    this.getOrders();
    this.getEarnings();
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
            const data = [];
            info.data.forEach((val) => {
              if (val.type === 2) data.push(val);
            });
            this.setState({lists: data, loading: false});
          }else {
            this.setState({lists: [], loading: false});
            message.warning(`提示：[${info.message}]`);
          }
        });
      }
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

    this.setState({lists: arr.length>0?arr:lists});
  }

  render() {
    const {lists, loading, ordersLists, dealersLists, agentsLists} = this.state;

    let nowadays = 0;
    let yesterday = 0;
    let thisMonth = 0;
    let lastMonth = 0;

    let k = 1;
    lists.forEach((val) => {
      ordersLists.forEach((value) => {
        if (val.oid === value.oid) {
          val.consignee = value.consignee;
          val.pay_amount = value.pay_amount;
          if (val.agent_earning > 0 && value.state === 10) {
            val.state = 4;
          } else {
            val.state = value.state;
          }
        }
      });
      dealersLists.forEach((value) => {
        if (val.did === value.did) val.dealers = value.contact;
      });
      agentsLists.forEach((value) => {
        if (val.aid === value.aid) val.agents = value.contact;
      });
      if (val.type === 3) {
        dealersLists.forEach((value) => {
          if (val.uid === value.did) val.consignee = value.contact;
        });
        agentsLists.forEach((value) => {
          if (val.uid === value.aid) val.consignee = value.contact;
        });
      }

      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate()) {
        if (localStorage.getItem('antd-pro-authority') === 'vendors') {
          nowadays += parseInt(val.agent_earning);
          nowadays += parseInt(val.dealer_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'agents') {
          nowadays += parseInt(val.agent_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'dealers') {
          nowadays += parseInt(val.dealer_earning);
        }
      }
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate() - 1) {
        if (localStorage.getItem('antd-pro-authority') === 'vendors') {
          yesterday += parseInt(val.agent_earning);
          yesterday += parseInt(val.dealer_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'agents') {
          yesterday += parseInt(val.agent_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'dealers') {
          yesterday += parseInt(val.dealer_earning);
        }
      }
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth()) {
        if (localStorage.getItem('antd-pro-authority') === 'vendors') {
          thisMonth += parseInt(val.agent_earning);
          thisMonth += parseInt(val.dealer_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'agents') {
          thisMonth += parseInt(val.agent_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'dealers') {
          thisMonth += parseInt(val.dealer_earning);
        }
      }
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() - 1) {
        if (localStorage.getItem('antd-pro-authority') === 'vendors') {
          lastMonth += parseInt(val.agent_earning);
          lastMonth += parseInt(val.dealer_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'agents') {
          lastMonth += parseInt(val.agent_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'dealers') {
          lastMonth += parseInt(val.dealer_earning);
        }
      }

      val.id = k;
      k++;
    });

    return (
      <PageHeaderLayout title="收益列表">
        <div style={styles.search}>
          <div style={styles.searchRow}>
            <div style={styles.searchTit}>订单编号：</div>
            <div style={{width: 300}}>
              <Input
                placeholder="请输入需要查找的订单编号"
                onChange={(e) => {
                  this.setState({orderId: e.target.value});
                }}
              />
            </div>
          </div>
          <Button type="primary" onClick={this.searchList.bind(this)}><Icon type="search" /> 查找收益</Button>
        </div>
        {localStorage.getItem('antd-pro-authority') === 'vendors' ? (
          <div style={styles.search}>
            <div style={styles.searchRow}>
              <div style={styles.searchTit}>&nbsp;&nbsp;&nbsp;&nbsp;代理商：</div>
              <div style={{width: 300}}>
                <Select
                  defaultValue="请选择"
                  style={{width: 300}}
                  onChange={(value) => this.getEarnings(value.split(',')[0], value.split(',')[1])}
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
                  onChange={(value) => this.getEarnings(value.split(',')[0], value.split(',')[1])}
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
            dataSource={lists}
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
              pageSize: 10,
            }}
          />
        </div>
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

export default SubsidyList;
