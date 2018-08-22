/* eslint-disable prefer-const,no-param-reassign,class-methods-use-this */
import React, {PureComponent} from 'react';
import {Button, Divider, Tabs, Table, List, Select} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import banks from '../../models/banks';

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
      dealersLists: [],
      agentsLists: [],
    };
  }

  componentDidMount() {
    this.getDealers();
    this.getAgents();
    this.getWallet();
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

  // 获取余额信息
  getWallet(id) {
    let getWallet = `${url}/wallet`;
    getWallet += `/${id || auth.uuid}`;
    fetch(getWallet).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({lists: info.data, balance: info.data[0].balance});
        });
      }
    });
  }

  render() {
    const {lists, balance, dealersLists, agentsLists} = this.state;

    const columns = [
      {title: '时间', dataIndex: 'created_at', width:'20%'},
      {title: '类型', dataIndex: 'type', render: val => typeMap[val]},
      {title: '收入/支出金额', dataIndex: 'amount', width:'20%', render: val => `${val} 元`},
      {title: '账户余额', dataIndex: 'balance', width:'20%', render: val => `${val || 0} 元`},
      {title: '备注', dataIndex: 'purpose', width:'20%', render: val => val || '无'},
    ];

    let schedules = [];
    lists.forEach((val, k) => {
      banks.forEach((Bval) => {
        if (Bval.code === val.bank) val.bank = Bval.name;
      });
      if (val.state) {
        val.id = k + 1;
        schedules.push(val);
      }
    });

    const htmlHeader = (
      <div style={styles.colBk}>
        <div style={styles.order}>序号</div>
        <div style={styles.col}>提现人</div>
        <div style={styles.col}>提现金额</div>
        <div style={styles.col}>手续费</div>
        <div style={styles.bank}>开户银行</div>
        <div style={styles.col}>开户名</div>
        <div style={styles.col}>最新进度</div>
      </div>
    );
    const htmlBody = (data) => (
      <List
        split={false}
        bordered={false}
        dataSource={data}
        pagination={{pageSize: 10}}
        loading={false}
        renderItem={
          item => (
            <div key={item.oid} style={styles.item}>
              <div style={styles.row}>
                <div>
                  发起时间：{item.created_at}
                  <Divider type="vertical" />
                  银行账户：{item.account}
                </div>
              </div>
              <div style={styles.column}>
                <div style={styles.order}>{item.id}</div>
                <div style={styles.col}>{auth.contact}</div>
                <div style={styles.col}>{item.amount}元</div>
                <div style={styles.col}>
                  {item.fee || (((Math.round(item.amount * 0.1) / 100) <= 2 ? 2 : Math.round(item.amount * 0.1) / 100)).toFixed(2)}元
                </div>
                <div style={styles.bank}>{item.bank}</div>
                <div style={styles.col}>{item.name}</div>
                <div style={styles.col}>{stateMap[item.state]}</div>
              </div>
            </div>
          )
        }
      />
    );

    return (
      <PageHeaderLayout title="钱包账户">
        {localStorage.getItem('antd-pro-authority') === 'vendors' ? (
          <Select
            defaultValue="请选择"
            style={{width: 200, marginBottom: 15}}
            onChange={(value) => this.getWallet(value)}
          >
            <Select.OptGroup label="代理商">
              {agentsLists.map((item, k) => (
                <Select.Option key={k} value={item.aid}>{item.contact}</Select.Option>
              ))}
            </Select.OptGroup>
            <Select.OptGroup label="经销商">
              {dealersLists.map((item, k) => (
                <Select.Option key={k} value={item.did}>{item.contact}</Select.Option>
              ))}
            </Select.OptGroup>
          </Select>
        ) : ''}
        <div style={styles.content}>
          <div style={{marginBottom: 15}}>
            <span>账户余额 <span>{balance}</span> 元</span>&nbsp;&nbsp;
            <a href="#/wallet/withdrawal"><Button type="primary" size="small">提现</Button></a>
            <Divider type="vertical" />
            <span>手续费 0.1%，最低2元，72小时内到账</span>
          </div>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="提现进度查询" key="1">
              {htmlHeader}
              {htmlBody(schedules)}
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
    width: '20%',
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
