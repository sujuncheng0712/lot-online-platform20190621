import React, {PureComponent} from 'react';
import {Card, Col, Row, Button, Tabs, Table} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

const role = localStorage.getItem('antd-pro-authority');
const auth = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';

const dealColumns = [
  {title: '起始时间', dataIndex: 'begin_start'},
  {title: '共已缴金额(元)', dataIndex: 'sum'},
  {title: '保证金(元)', dataIndex: 'earnest_money'},
  {title: '应配发货额度(台)', dataIndex: 'delivery_quota'},
  {title: '补贴金额(元)', dataIndex: 'subsidy'},
  {title: '滤芯返点(%)', dataIndex: 'rebate'},
  {title: '售后返点(%)', dataIndex: 'After_sales'},
];

const goodsColumns = [
  {title: '合同约定押金(元)', dataIndex: 'month'},
  {title: '已缴纳押金(元)', dataIndex: 'date'},
  {title: '应配发货额度(台)', dataIndex: 'state'},
  {title: '已发货数量', dataIndex: 'amount'},
  {title: '已退货', dataIndex: 'balance'},
  {title: '已激活数量', dataIndex: 'remark'},
  {title: '未激活数量', dataIndex: 'remark'},
  {title: '剩余发货额度', dataIndex: 'remark'},
];

const goodsColumns2 = [
  {title: '序号', dataIndex: 'month'},
  {title: '日期', dataIndex: 'date'},
  {title: '单号', dataIndex: 'state'},
  {title: '数量', dataIndex: 'amount'},
  {title: '类型', dataIndex: 'balance'},
  {title: '账户', dataIndex: 'remark'},
  {title: '代理商', dataIndex: 'remark'},
];

class CenterProfile extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      info: auth,
      agentsList: [],
      dealList: [],
      goodsList: [],
    };
  }

  componentDidMount() {
    this.getAgents();
    this.getDeal();
  }

  // 获取代理商列表
  getAgents() {
    const getAgents = `${url}/agents`;
    fetch(getAgents).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({agentsList: info.data});
        });
      }
    });
  }

  // 获取签约信息
  getDeal() {
    const getDeal = `${url}/${role}/${auth.uuid}/deal`;
    fetch(getDeal).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({dealInfo: info.data});
        });
      }
    });
  }

  render() {
    const {info, agentsList, goodsList, dealList} = this.state;

    agentsList.forEach((agents) => {
      if (info.superior === agents.aid) info.agents = agents.contact;
    });

    return (
      <PageHeaderLayout
        title={info.organization}
      >
        <Card
          title="基本信息"
          bordered={false}
          extra={
            localStorage.getItem("antd-pro-authority") === "vendors" ? (
              <Button
                type="primary"
                onClick={() => {
                  location.href = `#/vendors/ad-add/?role=${role}&id=${auth.uuid}`;
                }}
              >
                编辑经销信息
              </Button>
            ) : ''
          }
        >
          <Row gutter={24}>
            <Col span={4} style={{textAlign: 'right', lineHeight: 3}}>单位名称：</Col>
            <Col span={20} style={{lineHeight: 3}}>{info.organization}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={4} style={{textAlign: 'right', lineHeight: 3}}>
              {
                localStorage.getItem('antd-pro-authority') === 'agents' ? '代理' : '所属'
              }区域：
            </Col>
            <Col span={20} style={{lineHeight: 3}}>{info.area}</Col>
          </Row>
          {
            info.agents ? (
              <Row gutter={24}>
                <Col span={4} style={{textAlign: 'right', lineHeight: 3}}>所属代理商：</Col>
                <Col span={20} style={{lineHeight: 3}}>{info.agents}</Col>
              </Row>
            ) : ''
          }
          <Row gutter={24}>
            <Col span={4} style={{textAlign: 'right', lineHeight: 3}}>联系人：</Col>
            <Col span={20} style={{lineHeight: 3}}>{info.contact}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={4} style={{textAlign: 'right', lineHeight: 3}}>手机号：</Col>
            <Col span={20} style={{lineHeight: 3}}>{info.mobile}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={4} style={{textAlign: 'right', lineHeight: 3}}>用户名：</Col>
            <Col span={20} style={{lineHeight: 3}}>{info.username}</Col>
          </Row>
        </Card>
        <br />
        <Card title="签约信息" bordered={false}>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="当前签约" key="1">
              <Table rowKey="id" columns={dealColumns} dataSource={dealList[0]} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="历史签约" key="2">
              <Table rowKey="id" columns={dealColumns} dataSource={dealList} />
            </Tabs.TabPane>
          </Tabs>
        </Card>
        <br />
        <Card title="发货信息" bordered={false}>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="发货额度" key="1">
              <Table rowKey="id" columns={goodsColumns} dataSource={goodsList} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="发货记录" key="2">
              <Table rowKey="id" columns={goodsColumns2} dataSource={goodsList} />
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </PageHeaderLayout>
    );
  }
}

export default CenterProfile;
