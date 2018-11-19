/* eslint-disable prefer-const,no-param-reassign,class-methods-use-this */
import React, { PureComponent } from 'react';
import { Button, Divider, Tabs, Table, List, Select, message, Row, Col, Input } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import banks from '../../models/banks';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth')
  ? JSON.parse(sessionStorage.getItem('dochen-auth'))
  : '';
const typeMap = ['支出', '收入'];
const stateMap = ['', '处理中', '已处理', '', '', '', '', '', '', '', '未通过'];

const columnsSummary = [
  { title: '月份', dataIndex: 'cycle', align: 'center' },
  { title: '补贴收入', dataIndex: 'allowance', render: val => `${val}元`, align: 'center' },
  { title: '返点收入', dataIndex: 'commission', render: val => `${val}元`, align: 'center' },
  { title: '退款补扣金额', dataIndex: 'refund', render: val => `${val}元`, align: 'center' },
  {
    title: '月结发钱',
    dataIndex: '',
    render: info =>
      `${parseFloat(info.allowance) + parseFloat(info.commission) + parseFloat(info.refund)}元`,
    align: 'center',
  },
];

class WalletList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      summaryLists: [],
      balance: 0,
      merchantsList: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.getMerchantsList();
    this.getWallet(auth.mid || '');
    this.getSummary(auth.mid || '');
  }

  // 获取商家列表
  getMerchantsList() {
    const getMerchants = `${url}/merchants`;
    fetch(getMerchants).then(res => {
      if (!res.ok) return false;
      res.json().then(info => {
        if (!info.status) return false;
        this.setState({ merchantsList: info.data });
      });
    });
  }

  // 获取余额信息
  getWallet(mid = '') {
    if (!mid) {
      this.setState({ loading: false });
      return false;
    }
    fetch(`${url}/wallet/${mid}`).then(res => {
      if (!res.ok) return false;
      res.json().then(info => {
        if (!info.status) {
          this.setState({ lists: [], balance: 0, loading: false });
          message.warning(`提示：[${info.message}]`);
          return false;
        }
        this.setState({ lists: info.data, balance: info.data[0].balance, loading: false });
      });
    });
  }

  // 获取结算列表
  getSummary(mid = '') {
    if (!mid) return false;
    let getSummary = `${url}/earnings`;
    getSummary += `/${mid}`;
    getSummary += `/summary`;
    fetch(getSummary).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            this.setState({ summaryLists: info.data });
          } else {
            this.setState({ summaryLists: [] });
            message.warning(`提示：[${info.message}]`);
          }
        });
      }
    });
  }

  // 搜索商家的机器
  searchMerchantsList() {
    const { merchantsList, merchantsContact } = this.state;
    merchantsList.forEach(val => {
      if (val.contact === merchantsContact) {
        message.info(`正在搜索${merchantsContact}的结算情况，请稍后`);
        this.getWallet(val.uuid);
        this.getSummary(val.uuid);
      }
    });
  }

  render() {
    const { lists, balance, summaryLists, merchantsList, loading } = this.state;

    const columns = [
      { title: '时间', dataIndex: 'created_at', width: '20%' },
      { title: '类型', dataIndex: 'type', render: val => typeMap[val] },
      { title: '收入/支出金额', dataIndex: 'amount', width: '20%', render: val => `${val} 元` },
      { title: '账户余额', dataIndex: 'balance', width: '20%', render: val => `${val || 0} 元` },
      { title: '备注', dataIndex: 'reference', width: '20%', render: val => val || '无' },
    ];

    let schedules = [];
    lists.forEach((val, k) => {
      if (val.withdraw) {
        banks.forEach(value => {
          if (value.code === val.withdraw.bank) val.bank = value.name;
        });
      } else {
        val.bank = '--';
      }
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
    const htmlBody = data => (
      <List
        split={false}
        bordered={false}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        loading={loading}
        renderItem={item => (
          <div key={item.oid} style={styles.item}>
            <div style={styles.row}>
              <div>
                发起时间：{item.created_at}
                <Divider type="vertical" />
                银行账户：{item.withdraw ? item.withdraw.account : '--'}
              </div>
            </div>
            <div style={styles.column}>
              <div style={styles.order}>{item.id}</div>
              <div style={styles.col}>{auth.contact}</div>
              <div style={styles.col}>{item.amount}元</div>
              <div style={styles.col}>
                {item.fee ||
                  (Math.round(item.amount * 0.1) / 100 <= 2
                    ? 2
                    : Math.round(item.amount * 0.1) / 100
                  ).toFixed(2)}元
              </div>
              <div style={styles.bank}>{item.bank}</div>
              <div style={styles.col}>{item.withdraw ? item.withdraw.name : '--'}</div>
              <div style={styles.col}>{stateMap[item.state]}</div>
            </div>
          </div>
        )}
      />
    );

    return (
      <PageHeaderLayout title="钱包账户">
        <div
          style={styles.content}
          hidden={!(localStorage.getItem('antd-pro-authority') === 'vendors') || false}
        >
          <Row>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>
                  商家：
                </Col>
                <Col span={17}>
                  <Select
                    defaultValue="请选择"
                    style={{ width: '100%' }}
                    onChange={value => {
                      this.getWallet(value);
                      this.getSummary(value);
                    }}
                  >
                    <Select.OptGroup label="代理商">
                      {merchantsList.map(item => (
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
          <div style={{ marginBottom: 15 }}>
            <span>
              账户余额 <span>{balance}</span> 元
            </span>&nbsp;&nbsp;
            <a href="#/wallet/withdrawal">
              <Button type="primary" size="small">
                提现
              </Button>
            </a>
            <Divider type="vertical" />
            <span>手续费 0.1%，最低2元，72小时内到账</span>
          </div>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="提现进度查询" key="1">
              {htmlHeader}
              {htmlBody(schedules)}
            </Tabs.TabPane>
            <Tabs.TabPane tab="结算中心" key="2">
              <Table rowKey="id" columns={columnsSummary} dataSource={summaryLists} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="账户收支明细" key="3">
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
    backgroundColor: '#fff',
    padding: '20px',
    marginBottom: 15,
  },
  tit: {
    minWidth: 115,
    textAlign: 'right',
    lineHeight: '32px',
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
  // 提现进度列表
  item: {
    margin: '0px 5px',
    marginTop: 10,
    boxShadow: '0 1px 4px rgba(0,21,41,.12)',
  },
  column: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colBk: {
    margin: '0px 5px',
    backgroundColor: '#f1f1f1',
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
