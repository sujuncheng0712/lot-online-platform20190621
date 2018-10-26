/* eslint-disable no-param-reassign */
import React, {PureComponent} from 'react';
import {Card, Col, Row, Table, Tag, Icon, message, Button} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

const auth = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';

class CenterProfile extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      info: auth,
      subscriptionList: [],
      productsLists: [],
      allowanceLists: [],
    };
  }

  componentDidMount() {
    this.getSubscriptionList();
    this.getProducts();
    this.getAllowance();
  }

  // 获取签约信息列表
  getSubscriptionList() {
    const {location: {search}} = this.props;
    const mid = search.slice(1).split('=')[1];

    const getSubscription = `${url}/merchants/${mid}/subscription`;
    fetch(getSubscription).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({subscriptionList: info.data});
        });
      }
    });
  }

  // 获取产品列表
  getProducts() {
    const getProducts = `${url}/products`;
    fetch(getProducts).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            const lists = [];
            info.data.forEach((val, key) => {
              val.allowance = '0';
              val.commission = '0';
              val.edit = false;
              val.editType = 'POST';
              val.key = key;
              lists.push(val);
            });
            this.setState({productsLists: lists});
          }
        });
      }
    });
  }

  // 获取收益分配
  getAllowance() {
    const getAllowance = `${url}/merchants/${auth.mid}/allowance`;
    fetch(getAllowance).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({allowanceLists: info.data});
        });
      }
    });
  }

  render() {
    const {location: {search}} = this.props;
    const mid = search.slice(1).split('=')[1];

    const {info, subscriptionList, productsLists, allowanceLists} = this.state;

    const columns = [
      {title: '起始时间', dataIndex: 'begin_at'},
      {title: '共已缴金额(元)', dataIndex: 'pledge', align: 'center'},
      {title: '保证金(元)', dataIndex: 'deposit', align: 'center'},
      {title: '应配发货额度(台)', dataIndex: 'amount', align: 'center'},
      localStorage.getItem("antd-pro-authority") === "vendors" ? {
        align: 'center',
        title: '操作',
        dataIndex: 'uuid',
        render: val => (
          <Button
            onClick={() => {
              location.hash = `#/vendors/deal-add/?mid=${auth.mid}&id=${val}`;
            }}
          >
            修改
          </Button>
        ),
      } : {},
    ];

    productsLists.forEach(item => {
      if (allowanceLists) {
        allowanceLists.forEach(val => {
          if (item.pid === val.pid) {
            item.allowance = val.allowance || 0;
            item.commission = val.commission || 0;
            item.editType = 'PUT';
            item.editUuid = val.uuid;
          }
        });
      }
    });
    const allowanceColumns = [
      {title: '缩略图', dataIndex: 'prev_image', render: (val) => (<img src={val} alt="" width={60} />)},
      {title: '标题', dataIndex: 'title'},
      {title: '描述', dataIndex: 'desc'},
      {title: '价格', dataIndex: 'price', render: (val) => `¥${val}.00`},
      {title: '标签', dataIndex: 'tags', render: (val) => val ? (<Tag color="blue">{val}</Tag>) : ''},
      {
        align: 'center',
        title: '补贴/返点（元/%）',
        render: (info) => (
          <span style={{paddingRight: 15}}>
            {info.type === 2 ? `${info.commission} %` : `${info.allowance} 元`}
          </span>
        ),
      },
    ];

    return (
      <PageHeaderLayout
        title={info.organization}
      >
        <Card title="基本信息" bordered={false}>
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
        <Card
          title="签约信息"
          extra={
            localStorage.getItem("antd-pro-authority") === "vendors" ? (
              <a href={`#/vendors/deal-add/?mid=${mid}`}>增加</a>
            ) : ''
          }
          bordered={false}
        >
          <Table rowKey="id" columns={columns} dataSource={subscriptionList} />
        </Card>
        <br />
        <Card
          title="产品收益/返点"
          bordered={false}
        >
          <Table
            rowKey="id"
            columns={allowanceColumns}
            dataSource={productsLists}
          />
        </Card>
      </PageHeaderLayout>
    );
  }
}

export default CenterProfile;
