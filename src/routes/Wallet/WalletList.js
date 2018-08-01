/* eslint-disable prefer-const,no-param-reassign,class-methods-use-this */
import React, {PureComponent} from 'react';
import {Button, Divider, Tabs, Table, List} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';
const typeMap = ['支出', '收入'];
const stateMap = ['', '处理中', '已处理', '', '', '', '', '', '', '', '未通过'];

class WalletList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      balance: 0,
    };
  }

  componentDidMount() {
    this.getWallet();
    this.countBalance();
  }

  getWallet() {
    let getWallet = `${url}/wallet`;
    getWallet += `/${auth.uuid}`;
    fetch(getWallet).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            this.setState({lists: info.data});
          }
        });
      }
    });
  }

  countBalance() {
    let getSummary = `${url}/earnings`;
    getSummary += `/${auth.uuid}`;
    getSummary += `/summary`;
    fetch(getSummary).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            let balance = 0;
            info.data.forEach(val => {
              balance += val.allowance + val.commission + val.refund
            });
            this.setState({balance});
          }
        });
      }
    });
  }

  render() {
    const {lists, balance} = this.state;

    const columns = [
      {title: '时间', dataIndex: 'created_at', align: 'center'},
      {title: '类型', dataIndex: 'type', align: 'center', render: val => typeMap[val]},
      {title: '收入/支出金额(元)', dataIndex: 'amount', align: 'center'},
      {title: '账户余额(元)', dataIndex: 'balance', align: 'center', render: val => val || 0},
      {title: '备注', dataIndex: 'remark', align: 'center', render: val => val || '无'},
    ];

    let schedules = [];
    lists.forEach((val, k) => {
      if (val.state) {
        val.id = k + 1;
        schedules.push(val);
      }
    });

    return (
      <PageHeaderLayout title="钱包账户">
        <div style={styles.content}>
          <div style={{marginBottom: 15}}>
            <span>账户余额 <span>{balance}</span> 元</span>&nbsp;&nbsp;
            <a href="#/wallet/withdrawal"><Button type="primary" size="small">提现</Button></a>
            <Divider type="vertical" />
            {/* <span>手续费 0.6%，48小时内到账</span> */}
          </div>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="提现进度查询" key="1">
              <div style={styles.colBk}>
                <div style={styles.order}>序号</div>
                <div style={styles.col}>提现人</div>
                <div style={styles.col}>提现金额</div>
                <div style={styles.col}>手续费</div>
                <div style={styles.col}>开户名</div>
                <div style={styles.bank}>开户银行</div>
                <div style={styles.bank}>账户</div>
                <div style={styles.col}>最新进度</div>
              </div>
              <List
                split={false}
                bordered={false}
                dataSource={schedules}
                loading={false}
                renderItem={
                  item => (
                    <div key={item.oid} style={styles.item}>
                      <div style={styles.row}>
                        <div>
                          发起时间：{item.created_at}
                          <Divider type="vertical" />
                          流水单号：{item.oid}
                        </div>
                      </div>
                      <div style={styles.column}>
                        <div style={styles.order}>{item.id}</div>
                        <div style={styles.col}>{auth.contact}</div>
                        <div style={styles.col}>{item.amount}</div>
                        <div style={styles.col}>{item.fee}</div>
                        <div style={styles.col}>{item.name}</div>
                        <div style={styles.col}>{item.bank}</div>
                        <div style={styles.col}>{item.account}</div>
                        <div style={styles.col}>{stateMap[item.state]}</div>
                      </div>
                    </div>
                  )
                }
                pagination={{
                  pageSize: 10,
                }}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="账户收支明细" key="2">
              <Table rowKey="id" columns={columns} dataSource={lists} />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </PageHeaderLayout>
    );
  }
}

const styles = {
  content: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  // 提现进度列表
  item: {
    margin:'0px 5px',
    marginTop: 10,
    boxShadow: '0 1px 4px rgba(0,21,41,.12)',
  },
  column: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colBk: {
    margin:'0px 5px',
    backgroundColor:'#f1f1f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  col: {
    width: '8%',
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bank: {
    width: '15%',
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  order: {
    width: '8%',
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    height: 30,
    backgroundColor: '#f1f1f1',
    padding: '0px 15px',
    display: 'flex',
    alignItems: 'center',
  },
};

export default WalletList;
