/* eslint-disable no-param-reassign */
import React, {PureComponent} from 'react';
import {Tabs, List, Divider, Button} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const stateMap = ['', '处理中', '已处理', '', '', '', '', '', '', '', '未通过'];

class FinanceList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      dealersLists: [],
      agentsLists: [],
    };
  }

  componentDidMount() {
    this.getDealers();
    this.getAgents();
    this.getWalletApply();
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

  // 获取提现申请列表
  getWalletApply(){
    const getWalletApply = `${url}/wallet/apply`;
    fetch(getWalletApply).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            this.setState({lists: info.data});
          }
        });
      }
    });
  }

  // 提现审核
  postWalletApply(uid, uuid, type) {
    const data = JSON.stringify({verdict: type});
    let postWalletApply = `${url}/wallet`;
    postWalletApply += `/${uid}`;
    postWalletApply += `/apply`;
    postWalletApply += `/${uuid}`;
    fetch(postWalletApply, {
      method: 'POST',
      body: JSON.stringify({data}),
    }).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            this.setState({lists: info.data});
          }
        });
      }
    });
  }

  render() {
    const {lists, dealersLists, agentsLists} = this.state;

    const lists1 = [];
    const lists2 = [];
    const lists3 = [];
    lists.forEach((val)=>{
      dealersLists.forEach((Dval)=>{
        if (Dval.did === val.uid) val.contact = Dval.contact;
      });
      agentsLists.forEach((Aval)=>{
        if (Aval.aid === val.uid) val.contact = Aval.contact;
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
    const htmlBody = (data) => (
      <List
        split={false}
        bordered={false}
        dataSource={data}
        pagination={{pageSize: 10}}
        loading={false}
        renderItem={
          (item, key) => (
            <div key={item.oid} style={styles.item}>
              <div style={styles.row}>
                <div>
                  发起时间：{'2018年06月11日 11:39:19'}
                  <Divider type="vertical" />
                  银行账户：{item.account}
                </div>
              </div>
              <div style={styles.column}>
                <div style={styles.order}>{key + 1}</div>
                <div style={styles.col}>{item.contact}</div>
                <div style={styles.col}>{item.amount}</div>
                <div style={styles.col}>{item.service || `0.1%`}</div>
                <div style={styles.bank}>{item.bank}</div>
                <div style={styles.col}>{item.name}</div>{
                item.state === 1 ? (
                  <div style={styles.tool}>
                    <Button
                      type="primary"
                      size="small"
                      onClick={this.postWalletApply.bind(this, item.uid, item.uuid, 1)}
                    >
                      通过
                    </Button>
                    <Divider type="vertical" />
                    <Button
                      type="primary"
                      size="small"
                      onClick={this.postWalletApply.bind(this, item.uid, item.uuid, 0)}
                    >
                      拒绝
                    </Button>
                  </div>
                ) : (
                  <div style={styles.col}>{stateMap[item.state]}</div>
                )
              }
              </div>
            </div>
          )
        }
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
