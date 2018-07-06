/* eslint-disable no-param-reassign,no-plusplus */
import React, {PureComponent} from 'react';
import {Badge, Input, Button, Icon} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

class OrdersList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      dealersLists: [],
      agentsLists: [],
      usersLists: [],
      searchLists: [],
      orderConsignee: '',
      orderId: '',
      orderState: '',
    };
  }

  componentWillMount() {
    // fetch('http://iot.dochen.cn/api/dealers').then((res) => {
    //   if (res.ok) {
    //     res.json().then((info) => {
    //       if (info.status) this.setState({dealersLists: info.data});
    //     });
    //   }
    // });
    //
    // fetch('http://iot.dochen.cn/api/agents').then((res) => {
    //   if (res.ok) {
    //     res.json().then((info) => {
    //       if (info.status) this.setState({agentsLists: info.data});
    //     });
    //   }
    // });
    //
    // fetch(`http://iot.dochen.cn/api/users`).then((res) => {
    //   if (res.ok) {
    //     res.json().then((info) => {
    //       if (info.status) this.setState({usersLists: info.data});
    //     });
    //   }
    // });
    //
    // const authData = JSON.parse(sessionStorage.getItem('dochen-auth'));
    // const authHref = authData.type === 'vendors' ? '' : authData.type === 'agents' ? `?aid=${authData.uuid}` : `?did=${authData.uuid}`;
    // fetch(`http://iot.dochen.cn/api/orders${authHref}`).then((res) => {
    //   if (res.ok) {
    //     res.json().then((info) => {
    //       if (info.status) {
    //         const lists = [];
    //         let k = 1;
    //         info.data.forEach((val) => {
    //           if (val.type !== 3 && val.state >= 4) {
    //             val.id = k;
    //             lists.push(val);
    //             k++;
    //           }
    //         });
    //         this.setState({lists});
    //       }
    //     });
    //   }
    // });
  }

  searchList() {
    const {lists, orderId, orderState, orderConsignee} = this.state;
    console.log(lists, orderId, orderState, orderConsignee);
    const arr = [];
    lists.forEach((val) => {
      if (val.oid === orderId) {
        arr.push(val);
      }
      if (val.consignee === orderConsignee) {
        arr.push(val);
      }
    });
    this.setState({searchLists: arr});
  }

  render() {
    const {lists, dealersLists, agentsLists, usersLists, searchLists} = this.state;

    console.log(searchLists);

    lists.forEach((val) => {
      usersLists.forEach((usersVal) => {
        if (val.uid === usersVal.uid) {
          agentsLists.forEach((value) => {
            if (usersVal.aid === value.aid) {
              val.contact = value.contact;
              val.agents = value.contact;
            }
          });
          dealersLists.forEach((value) => {
            if (usersVal.did === value.did) {
              val.contact = value.contact;
              agentsLists.forEach((agents) => {
                if (value.superior === agents.aid) {
                  val.agents = agents.contact;
                }
              });
            }
          });
        }
      });
    });

    return (
      <PageHeaderLayout title="退码列表">
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
          <Button type="primary" onClick={this.searchList.bind(this)}><Icon type="search" /> 查找</Button>
        </div>
        <div style={{padding: 20, backgroundColor: '#fff'}}>
          <div style={styles.title}>
            <div style={styles.id}>序号</div>
            <div style={styles.consignee}>购买人</div>
            <div style={styles.phone}>联系电话</div>
            <div style={styles.address}>安装地址</div>
            <div style={styles.state}>订单状态</div>
            <div style={styles.pay_amount}>支付金额</div>
            <div style={styles.contact}>推荐人</div>
            <div style={styles.agents}>代理商</div>
          </div>
          {
            searchLists.length > 0 ?
              searchLists.map((item) => (
                <div key={item.oid} style={styles.item}>
                  <div style={styles.rowT}>
                    <div style={styles.oid}>订单编号：{item.oid}</div>
                    <div style={styles.created_at}>成交时间：{item.created_at}</div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.id}>{item.id}</div>
                    <div style={styles.consignee}>{item.consignee}</div>
                    <div style={styles.phone}>{item.phone}</div>
                    <div style={styles.rowAddress}>{item.address.split(' ')[0]}</div>
                    <div style={styles.state}>
                      <Badge
                        status={item.state === '4' ? 'success' : 'default'}
                        text={item.state === '4' ? '已付款' : '待付款'}
                      />
                    </div>
                    <div span={4} style={styles.pay_amount}>
                      {
                        item.pay_amount !== null ? (
                          <span>{item.pay_amount}元</span>
                        ) : '--'
                      }
                    </div>
                    <div style={styles.contact}>{item.contact}</div>
                    <div style={styles.agents}>{item.agents}</div>
                  </div>
                </div>
              )) : lists.map((item) => (
                <div key={item.oid} style={styles.item}>
                  <div style={styles.rowT}>
                    <div style={styles.oid}>订单编号：{item.oid}</div>
                    <div style={styles.created_at}>成交时间：{item.created_at}</div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.id}>{item.id}</div>
                    <div style={styles.consignee}>{item.consignee}</div>
                    <div style={styles.phone}>{item.phone}</div>
                    <div style={styles.rowAddress}>{item.address.split(' ')[0]}</div>
                    <div style={styles.state}>
                      <Badge
                        status={item.state === '4' ? 'success' : 'default'}
                        text={item.state === '4' ? '已付款' : '待付款'}
                      />
                    </div>
                    <div span={4} style={styles.pay_amount}>
                      {
                        item.pay_amount !== null ? (
                          <span>{item.pay_amount}元</span>
                        ) : '--'
                      }
                    </div>
                    <div style={styles.contact}>{item.contact}</div>
                    <div style={styles.agents}>{item.agents}</div>
                  </div>
                </div>
              ))
          }
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

  title: {
    display: 'flex',
    backgroundColor: '#eee',
    padding: '10px 0px',
    marginBottom: 5,
  },
  item: {
    borderTop: '1px solid #ddd',
    paddingBottom: 15,
  },
  row: {
    display: 'flex',
    paddingTop: 15,
  },
  rowT: {
    display: 'flex',
    padding: '3px 0px',
    backgroundColor: '#f6f6f6',
  },
  oid: {
    padding: '0px 15px',
  },
  created_at: {
    padding: '0px 15px',
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
  phone: {
    width: 250,
    padding: '0px 10px',
    textAlign: 'center',
  },
  address: {
    width: `${100 / 2  }vw`,
    padding: '0px 10px',
    paddingLeft: 50,
    textAlign: 'center',
  },
  rowAddress: {
    width: `${100 / 2  }vw`,
    padding: '0px 10px',
    paddingLeft: 50,
    textAlign: 'left',
    // textIndent: 20,
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
  contact: {
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