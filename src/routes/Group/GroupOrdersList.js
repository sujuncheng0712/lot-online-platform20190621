/* eslint-disable no-param-reassign,no-plusplus */
import React, {PureComponent} from 'react';
import {Input, Button, Icon, message, List, Divider} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const stateBadge = ['','','','','#666','','','','','','#f5222d'];
const stateMap = ['','','','待付款','已付款','','','','','','已退款'];

class OrdersList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      loading: true,
      agentsList: [],
      dealersList: [],
      orderConsignee: '',
      orderId: '',
    };
  }

  componentDidMount() {
    this.getDealers();
    this.getAgents();
    this.getOrders();
  }

  // 获取经销商列表
  getDealers(){
    const getDealers = `${url}/dealers`;
    fetch(getDealers).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({dealersList: info.data});
        });
      }
    });
  }

  // 获取代理商列表
  getAgents(){
    const getAgents = `${url}/agents`;
    fetch(getAgents).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({agentsList: info.data});
        });
      }
    });
  }

  // 获取订单列表
  getOrders(){
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
              if (val.type === 3 && val.state === 4) {
                val.id = k;
                val.consignee = authData.contact;
                lists.push(val);
                k++;
              }
            });
            this.setState({lists, loading:false});
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
      if (val.oid === orderId||val.consignee === orderConsignee) arr.push(val);
    });

    if (arr.length === 0) message.error('没找到对应的数据');

    this.setState({lists: arr.length>0?arr:lists});
  }

  render() {
    const {lists, loading, agentsList, dealersList} = this.state;

    const nowadays = [];
    const yesterday = [];
    const thisMonth = [];
    const lastMonth = [];

    lists.forEach((val) => {
      agentsList.forEach((v) => {
        if (v.aid === val.uid) {
          val.consignee = v.contact;
          val.agents = v.contact;
        }
      });
      dealersList.forEach((v) => {
        if (v.did === val.uid) {
          val.consignee = v.contact;
          agentsList.forEach((agents) => {
            if (v.superior === agents.aid) val.agents = agents.contact;
          });
        }
      });
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate() && val.state === 4 && val.type === 3) nowadays.push(val);
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate() - 1 && val.state === 4 && val.type === 3) yesterday.push(val);
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && val.state === 4 && val.type === 3) thisMonth.push(val);
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() - 1 && val.state === 4 && val.type === 3) lastMonth.push(val);
    });

    return (
      <PageHeaderLayout title="团购订单列表">
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
          {
            (localStorage.getItem('antd-pro-authority') !== 'agents' && localStorage.getItem('antd-pro-authority') !== 'dealers') ? (
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
            ) : ''
          }
          <Button type="primary" onClick={this.searchList.bind(this)}><Icon type="search" /> 查找</Button>
        </div>
        <div style={{padding: 20, backgroundColor: '#fff'}}>
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
            renderItem={
              item => (
                <div key={item.oid} style={styles.item}>
                  <div style={styles.rowT}>
                    <div>
                      订单编号：{item.oid}
                      <Divider type="vertical" />
                      {item.state !== 10?'成交':'退款'}时间：{item.created_at}
                    </div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.id}>{item.id}</div>
                    <div style={styles.consignee}>{item.consignee || '-'}</div>
                    <div style={styles.quantity}>{item.quantity}</div>
                    <div style={styles.total}>￥{item.total / item.quantity}</div>
                    <div span={4} style={styles.pay_amount}>
                      {item.pay_amount !== null ? (<span>{item.pay_amount}元</span>) : '--'}
                    </div>
                    <div span={4} style={styles.pay_amount}>
                      <span style={{color: stateBadge[item.state]}}>{stateMap[item.state]}</span>
                    </div>
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