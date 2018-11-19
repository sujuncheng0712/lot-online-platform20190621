/* eslint-disable no-param-reassign,no-shadow */
import React, { PureComponent } from 'react';
import { Tabs, List, Divider, Button, Popconfirm } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import banks from '../../models/banks';

const url = 'http://iot.dochen.cn/api';
const stateMap = ['', '处理中', '已处理', '', '', '', '', '', '', '', '未通过'];

class FinanceList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      merchantsList: [],
    };
  }

  componentDidMount() {
    this.getMerchantsList();
    this.getWalletApply();
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

  // 获取提现申请列表
  getWalletApply() {
    const getWalletApply = `${url}/wallet/apply`;
    fetch(getWalletApply).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            this.setState({ lists: info.data });
          }
        });
      }
    });
  }

  // 提现审核
  postWalletApply(mid, uuid, type) {
    let postWalletApply = `${url}/wallet`;
    postWalletApply += `/${mid}`;
    postWalletApply += `/apply`;
    postWalletApply += `/${uuid}`;
    fetch(postWalletApply, {
      method: 'POST',
      body: JSON.stringify({ verdict: type }),
    }).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) this.getWalletApply();
        });
      }
    });
  }

  render() {
    const { lists, merchantsList } = this.state;

    const lists1 = [];
    const lists2 = [];
    const lists3 = [];
    lists.forEach(val => {
      if (val.withdraw) {
        banks.forEach(value => {
          if (value.code === val.withdraw.bank) val.bank = value.name;
        });
      }
      merchantsList.forEach(value => {
        if (value.uuid === val.mid) val.contact = value.contact;
      });

      if (val.state && val.state === 1) lists1.push(val);
      if (val.state && val.state === 2) lists2.push(val);
      if (val.state && val.state === 10) lists3.push(val);
    });

    const htmlHeader = (
      <div style={styles.colBk}>
        <div style={styles.order}>序号</div>
        <div style={styles.col}>提现人</div>
        <div style={styles.col}>提现金额</div>
        <div style={styles.col}>手续费</div>
        <div style={styles.bank}>开户银行</div>
        <div style={styles.col}>开户名</div>
        <div style={styles.tool}>操作</div>
      </div>
    );
    const htmlBody = data => (
      <List
        split={false}
        bordered={false}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        loading={false}
        renderItem={(item, key) => (
          <div key={item.oid} style={styles.item}>
            <div style={styles.row}>
              <div>
                发起时间：{item.created_at}
                <Divider type="vertical" />
                银行账户：{item.withdraw ? item.withdraw.account : '--'}
              </div>
            </div>
            <div style={styles.column}>
              <div style={styles.order}>{key + 1}</div>
              <div style={styles.col}>{item.contact || '--'}</div>
              <div style={styles.col}>{item.amount}元</div>
              <div style={styles.col}>
                {(Math.round(item.amount * 0.1) / 100 <= 2
                  ? 2
                  : Math.round(item.amount * 0.1) / 100
                ).toFixed(2)}元
              </div>
              <div style={styles.bank}>{item.bank}</div>
              <div style={styles.col}>{item.withdraw ? item.withdraw.name : '--'}</div>
              {item.state === 1 ? (
                <div style={styles.tool}>
                  <Popconfirm
                    placement="topRight"
                    title="确认要通过这笔提现吗？"
                    onConfirm={this.postWalletApply.bind(this, item.mid, item.uuid, 1)}
                    okText="确认"
                    cancelText="取消"
                  >
                    <Button type="primary" size="small">
                      通过
                    </Button>
                  </Popconfirm>
                  <Divider type="vertical" />
                  <Button
                    type="primary"
                    size="small"
                    onClick={this.postWalletApply.bind(this, item.mid, item.uuid, 0)}
                  >
                    拒绝
                  </Button>
                </div>
              ) : (
                <div style={styles.tool}>{stateMap[item.state]}</div>
              )}
            </div>
          </div>
        )}
      />
    );

    return (
      <PageHeaderLayout title="审核列表">
        <div style={styles.content}>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="未处理" key="1">
              {htmlHeader}
              {htmlBody(lists1)}
            </Tabs.TabPane>
            <Tabs.TabPane tab="已处理" key="2">
              {htmlHeader}
              {htmlBody(lists2)}
            </Tabs.TabPane>
            <Tabs.TabPane tab="未通过" key="3">
              {htmlHeader}
              {htmlBody(lists3)}
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
  // 列表
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
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tool: {
    width: '20%',
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  order: {
    width: '5%',
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

export default FinanceList;
