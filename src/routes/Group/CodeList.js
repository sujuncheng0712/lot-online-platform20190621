/* eslint-disable no-param-reassign,no-plusplus */
import React, {PureComponent} from 'react';
import {Badge, Divider, Input, Icon, Button, message, List} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

class codesList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      loading: true,
      agentsList: [],
      dealersList: [],
      orderId: '',
      orderConsignee: '',
      orderCode: '',
    };
  }

  componentWillMount() {
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
                lists.push(val);
                k++;
              }
            });
            this.setState({lists, loading: false});
          }
        });
      }
    });
  }

  // 搜索列表
  searchList() {
    const {lists, orderId, orderConsignee, orderCode} = this.state;
    const arr = [];
    lists.forEach((val) => {
      if (val.oid === orderId || val.consignee === orderConsignee) arr.push(val);
      val.activations.forEach((v) => {
        if (v.code === orderCode) arr.push(val);
      });
    });

    if (arr.length === 0) message.error('没找到对应的数据');

    this.setState({lists: arr.length > 0 ? arr : lists});
  }

  render() {
    const {lists, loading, agentsList, dealersList} = this.state;

    const ActivationCode = [];
    const activation = [];
    let k = 1;
    lists.forEach((val) => {
      if (val.activations.length > 0) {
        val.activations.forEach((v) => {
          v.id = k;
          k++;
          ActivationCode.push(v.code);
          if (v.confirm_at) activation.push(v);
        });

        agentsList.forEach((v) => {
          if (v.aid === val.uid) val.consignee = v.contact;
        });

        dealersList.forEach((v) => {
          if (v.did === val.uid) val.consignee = v.contact;
        });

        let i = 1;
        val.activations.forEach((activationsVal) => {
          activationsVal.id = i;
          i++;
        });
      }
    });

    return (
      <PageHeaderLayout title="激活码列表">
        <div style={{padding: 20, backgroundColor: '#fff'}}>
          <div style={{marginTop: 15, textAlign: 'left'}}>
            <Badge status="default" text={`总购买数量${ActivationCode.length}个`} />
            <Divider type="vertical" />
            <Badge status="success" text={`已激活数量${activation.length}个`} />
            <Divider type="vertical" />
            <Badge status="processing" text={`未激活数量${(ActivationCode.length - activation.length)}个`} />
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
          <div style={styles.searchRow}>
            <div style={styles.searchTit}>激活码：</div>
            <div style={{width: 200}}>
              <Input
                placeholder="请输入需要查找的激活码"
                onChange={(e) => {
                  this.setState({orderCode: e.target.value});
                }}
              />
            </div>
          </div>
          <Button type="primary" onClick={this.searchList.bind(this)}><Icon type="search" /> 查找</Button>
        </div>
        <div style={{padding: 20, backgroundColor: '#fff', marginTop: 20}}>
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
                  {
                    item.activations.map((val) => (
                      <div key={val.code} style={styles.row}>
                        <div style={styles.id}>{val.id}</div>
                        <div style={styles.consignee}>{item.consignee || '-'}</div>
                        <div style={styles.code}>{val.code}</div>
                        <div style={styles.confirm_at}>
                          <Badge
                            status={val.confirm_at ? 'success' : 'default'}
                            text={val.confirm_at ? '已激活' : '未激活'}
                          />
                        </div>
                        <div style={styles.confirm_at}>{val.confirm_at || '-'}</div>
                      </div>
                    ))
                  }
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
