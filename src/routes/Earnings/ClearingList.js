import React, {PureComponent} from 'react';
import {Button, Divider, Tabs, Table} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
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

const columns2 = [
  {title: '日期', dataIndex: 'month'},
  {title: '订单编号', dataIndex: 'date'},
  {title: '订单类型', dataIndex: 'state'},
  {title: '付款金额', dataIndex: 'amount'},
  {title: '付款人', dataIndex: 'balance'},
  {title: '我的收益', dataIndex: 'remark'},
];


class ClearingList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      lists2: [],
      balance: 0,
    };
  }

  componentDidMount() {
    this.getSummary();
  }

  // 获取结算列表
  getSummary() {
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
            this.setState({lists: info.data, balance});
          }
        });
      }
    });
  }

  render() {
    const {lists, lists2, balance} = this.state;

    return (
      <PageHeaderLayout title="结算列表">
        <div style={styles.content}>
          <div style={{marginBottom: 15}}>
            <span>待结算 <span>{1000}</span> 元</span>
            <Divider type="vertical" />
            <span>账户余额 <span>{balance}</span> 元</span>&nbsp;&nbsp;
            <Button type="primary" size="small">提现</Button>
            <Divider type="vertical" />
            {/* <span>手续费 0.6%，48小时内到账</span> */}
          </div>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="已结算概况" key="1">
              <Table rowKey="id" columns={columns} dataSource={lists} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="收益结算明细" key="2">
              <Table rowKey="id" columns={columns2} dataSource={lists2} />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </PageHeaderLayout>
    );
  }
}

const styles = {
  content: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
};

export default ClearingList;
