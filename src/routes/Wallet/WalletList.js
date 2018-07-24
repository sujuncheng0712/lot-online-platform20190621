import React, {PureComponent} from 'react';
import {Button, Divider, Tabs, Table, List} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

class WalletList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [
        {
          id: 1,
          created_at: '2018年06月11日 11:39:19',
          oid: '201806111146',
          name: '周成华',
          amount: '50元',
          fee: '0.3元',
          account: '周成华',
          bank: '中国农业银行',
          number: '6228480109443866073',
          state: '0',
        }, {
          id: 2,
          created_at: '2018年06月11日 11:39:19',
          oid: '201806111146',
          name: '周成华',
          amount: '50元',
          fee: '0.3元',
          account: '周成华',
          bank: '中国农业银行',
          number: '6228480109443866073',
          state: '1',
        },
      ],
      lists2: [
        {
          created_at:'2018-05-31 15:40:16',
          type:'支出',
          and:'-6960元',
          balance:'-5960元',
          remarks:'购买激活码',
        },{
          created_at:'2018-05-31 15:40:16',
          type:'收入',
          and:'-6960元',
          balance:'-5960元',
          remarks:'购买激活码',
        },
      ],
    };
  }

  componentDidMount() {}

  render() {
    const {lists, lists2} = this.state;

    const columns = [
      {title: '时间', dataIndex: 'created_at', align:'center'},
      {title: '类型', dataIndex: 'type', align:'center'},
      {title: '收入/支出金额(元)', dataIndex: 'and', align:'center'},
      {title: '账户余额', dataIndex: 'balance', align:'center'},
      {title: '备注', dataIndex: 'remarks', align:'center'},
    ];

    return (
      <PageHeaderLayout title="钱包账户">
        <div style={styles.content}>
          <div style={{marginBottom: 15}}>
            <span>账户余额 <span>{300}</span> 元</span>&nbsp;&nbsp;
            <Button type="primary" size="small">提现</Button>
            <Divider type="vertical" />
            <span>手续费 0.6%，48小时内到账</span>
          </div>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="提现进度查询" key="1">
              <div style={styles.colBk}>
                <div style={styles.order}>序号</div>
                <div style={styles.col}>提现人</div>
                <div style={styles.col}>提现金额</div>
                <div style={styles.col}>手续费</div>
                <div style={styles.col}>开户名</div>
                <div style={styles.col}>开户银行</div>
                <div style={styles.col}>账户</div>
                <div style={styles.col}>最新进度</div>
              </div>
              <List
                split={false}
                bordered={false}
                dataSource={lists}
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
                        <div style={styles.col}>{item.name}</div>
                        <div style={styles.col}>{item.amount}</div>
                        <div style={styles.col}>{item.fee}</div>
                        <div style={styles.col}>{item.account}</div>
                        <div style={styles.col}>{item.bank}</div>
                        <div style={styles.col}>{item.number}</div>
                        <div style={styles.col}>{item.state === '1' ? '提现成功' : '正在处理'}</div>
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
              <Table rowKey="id" columns={columns} dataSource={lists2} />
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
    width: '15%',
    height: 40,
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
