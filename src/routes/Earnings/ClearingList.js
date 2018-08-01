import React, {PureComponent} from 'react';
import {Tabs, Table, Card} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const role = localStorage.getItem('antd-pro-authority');
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
const typeMap = ['', '用户订单', '', '团购订单'];
const columns2 = [
  {title: '日期', dataIndex: 'created_at'},
  {title: '订单编号', dataIndex: 'oid'},
  {title: '订单类型', dataIndex: 'type', render: val => typeMap[val]},
  {title: '付款金额', dataIndex: 'total'},
  {title: '付款人', dataIndex: 'uid'},
  {title: '我的收益', dataIndex: '', render: info => role === 'agents' ? info.agent_earning : info.dealer_earning},
];

class ClearingList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      earningsLists:[],
    };
  }

  componentDidMount() {
    this.getSummary();
    this.getEarnings();
  }

  // 获取结算列表
  getSummary() {
    let getSummary = `${url}/earnings`;
    getSummary += `/${auth.uuid}`;
    getSummary += `/summary`;
    fetch(getSummary).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({lists: info.data});
        });
      }
    });
  }

  // 获取收益列表
  getEarnings() {
    let getEarnings = `${url}/earnings`;
    getEarnings += auth.type === 'vendors' ? '' : auth.type === 'agents' ? `?aid=${auth.uuid}` : `?did=${auth.uuid}`;

    fetch(getEarnings).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({earningsLists: info.data});
        });
      }
    });
  }

  render() {
    const {lists, earningsLists} = this.state;

    let nowadays = 0;
    let yesterday = 0;
    let thisMonth = 0;
    let lastMonth = 0;

    earningsLists.forEach((val) => {
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate()) {
        if (localStorage.getItem('antd-pro-authority') === 'vendors') {
          nowadays += parseInt(val.agent_earning);
          nowadays += parseInt(val.dealer_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'agents') {
          nowadays += parseInt(val.agent_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'dealers') {
          nowadays += parseInt(val.dealer_earning);
        }
      }
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() && (new Date(val.created_at)).getDate() === (new Date()).getDate() - 1) {
        if (localStorage.getItem('antd-pro-authority') === 'vendors') {
          yesterday += parseInt(val.agent_earning);
          yesterday += parseInt(val.dealer_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'agents') {
          yesterday += parseInt(val.agent_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'dealers') {
          yesterday += parseInt(val.dealer_earning);
        }
      }
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth()) {
        if (localStorage.getItem('antd-pro-authority') === 'vendors') {
          thisMonth += parseInt(val.agent_earning);
          thisMonth += parseInt(val.dealer_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'agents') {
          thisMonth += parseInt(val.agent_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'dealers') {
          thisMonth += parseInt(val.dealer_earning);
        }
      }
      if ((new Date(val.created_at)).getMonth() === (new Date()).getMonth() - 1) {
        if (localStorage.getItem('antd-pro-authority') === 'vendors') {
          lastMonth += parseInt(val.agent_earning);
          lastMonth += parseInt(val.dealer_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'agents') {
          lastMonth += parseInt(val.agent_earning);
        } else if (localStorage.getItem('antd-pro-authority') === 'dealers') {
          lastMonth += parseInt(val.dealer_earning);
        }
      }
    });

    return (
      <PageHeaderLayout title="结算列表">
        <Card title={`待结算收益共 ${thisMonth} 元`} border={false}>
          <div style={styles.count}>
            <div style={styles.countRow}><div>今天</div><div>{nowadays}元</div></div>
            <div style={styles.countRow}><div>昨天</div><div>{yesterday}元</div></div>
            <div style={styles.countRow}><div>本月</div><div>{thisMonth}元</div></div>
            <div style={styles.countRow}><div>上月</div><div>{lastMonth}元</div></div>
          </div>
        </Card>
        <br />
        <Card border={false}>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="已结算概况" key="1">
              <Table rowKey="id" columns={columns} dataSource={lists} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="收益结算明细" key="2">
              <Table rowKey="id" columns={columns2} dataSource={earningsLists} />
            </Tabs.TabPane>
          </Tabs>
        </Card>
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
};

export default ClearingList;
