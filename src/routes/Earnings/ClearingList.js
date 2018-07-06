import React, {PureComponent} from 'react';
import {Button, Divider, Tabs, Table} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const columns = [
  {title: '月份', dataIndex: 'month'},
  {title: '补贴收入', dataIndex: 'subsidy'},
  {title: '返点收入', dataIndex: 'rebate'},
  {title: '退款补扣金额', dataIndex: 'refund'},
  {title: '月结发钱', dataIndex: 'payment'},
];

const columns2 = [
  {title: '月份', dataIndex: 'month'},
  {title: '时间', dataIndex: 'date'},
  {title: '类型', dataIndex: 'state'},
  {title: '收入/支出金额(元)', dataIndex: 'amount'},
  {title: '账户余额', dataIndex: 'balance'},
  {title: '备注', dataIndex: 'remark'},
];


class ClearingList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      lists2: [],
    };
  }

  componentDidMount() {

  }

  render() {
    const {lists, lists2} = this.state;
    console.log(lists, lists2);

    return (
      <PageHeaderLayout title="结算列表">
        <div style={styles.content}>
          <div style={{marginBottom: 15}}>
            <span>待结算 <span>{1000}</span> 元</span>
            <Divider type="vertical" />
            <span>账户余额 <span>{300}</span> 元</span>&nbsp;&nbsp;
            <Button type="primary" size="small">提现</Button>
            <Divider type="vertical" />
            <span>手续费 0.6%，48小时内到账</span>
          </div>
          <Tabs
            defaultActiveKey="1"
            onChange={(k) => {
              console.log(k);
            }}
          >
            <Tabs.TabPane tab="收益结算概括" key="1">
              <Table rowKey="id" columns={columns} dataSource={lists} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="账户收支明细" key="2">
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
