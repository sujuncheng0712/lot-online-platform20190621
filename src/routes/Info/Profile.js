import React, {PureComponent} from 'react';
import {Card, Col, Row, Button} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

const role = localStorage.getItem('antd-pro-authority');
const auth = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';

class CenterProfile extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      info: auth,
      agentsList: [],
    };
  }

  componentDidMount() {
    this.getAgents();
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

  render() {
    const {info, agentsList/* , goodsList, dealList */} = this.state;

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
      </PageHeaderLayout>
    );
  }
}

export default CenterProfile;
