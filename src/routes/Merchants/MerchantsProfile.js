/* eslint-disable no-param-reassign,no-plusplus,radix,no-shadow */
import React, {PureComponent} from 'react';
import {Card, Col, Row, Button, Tabs, Table, message, Input, Tag, Icon} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

const goodsColumns = [
  {title: '合同约定押金(元)', dataIndex: 'month'},
  {title: '已缴纳押金(元)', dataIndex: 'date'},
  {title: '应配发货额度(台)', dataIndex: 'state'},
  {title: '已发货数量', dataIndex: 'amount'},
  {title: '已退货', dataIndex: 'balance'},
  {title: '已激活数量', dataIndex: 'remark'},
  {title: '未激活数量', dataIndex: 'remark1'},
  {title: '剩余发货额度', dataIndex: 'remark2'},
];

const goodsColumns2 = [
  {title: '序号', dataIndex: 'month'},
  {title: '日期', dataIndex: 'date'},
  {title: '单号', dataIndex: 'state'},
  {title: '数量', dataIndex: 'amount'},
  {title: '类型', dataIndex: 'balance'},
  {title: '账户', dataIndex: 'remark'},
  {title: '代理商', dataIndex: 'remark1'},
];

class ADProfile extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      info: {},
      merchantsList: [],
      subscriptionList: [],
      productsLists: [],
      allowanceLists: [],
    };
  }

  componentWillMount() {
    this.getMerchantsInfo();
    this.getMerchantsList();
    this.getSubscriptionList();
    this.getProducts();
    this.getAllowance();
  }

  // 获取商家信息
  getMerchantsInfo() {
    const {location: {search}} = this.props;
    const mid = search.slice(1).split('=')[1];
    const getMerchants = `${url}/merchants/${mid}`;
    fetch(getMerchants).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({info: info.data[0]});
        });
      }
    });
  }

  // 获取商家列表
  getMerchantsList() {
    const getMerchants = `${url}/merchants`;
    fetch(getMerchants).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({merchantsList: info.data});
        });
      }
    });
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
    const {location: {search}} = this.props;
    const mid = search.slice(1).split('=')[1];
    const getAllowance = `${url}/merchants/${mid}/allowance`;
    fetch(getAllowance).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({allowanceLists: info.data});
        });
      }
    });
  }

  // 修改分配
  editAllowance(value, parameter) {
    const {location: {search}} = this.props;
    const {productsLists} = this.state;
    const mid = search.slice(1).split('=')[1];
    let getAllowance = `${url}/merchants/${mid}/allowance`;
    getAllowance += parameter.editType === 'PUT' ? `/${parameter.editUuid}` : '';
    const data = {
      eptags: parameter.tags,
      pid: parameter.pid,
    };

    if (parameter.type === 2) {
      data.commission = value;
    } else {
      data.allowance = value;
    }

    fetch(getAllowance, {
      method: parameter.editType,
      body: JSON.stringify(data),
    }).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            const lists = [];
            productsLists.forEach(val => {
              if (val.pid === parameter.pid) {
                val.edit = !val.edit;
              }
              lists.push(val);
            });
            this.setState({productsLists: lists});
            this.getAllowance(sessionStorage.getItem('authUuid'));
            message.success(`修改成功`);
          } else {
            message.error(`错误：[${info.message}]`);
          }
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
              location.hash = `#/vendors/deal-add/?mid=${mid}&id=${val}`;
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
          if (item.tags === val.eptags) {
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
        render: (info) => !info.edit ? (
          <div>
            <span style={{paddingRight: 15}}>
              {info.type === 2 ? `${info.commission} %` : `${info.allowance} 元`}
            </span>
            {localStorage.getItem('antd-pro-authority') === 'vendors' ? (
              <Icon
                type="form"
                theme="outlined"
                onClick={() => {
                  const lists = [];
                  productsLists.forEach(val => {
                    if (val.pid === info.pid) {
                      val.edit = !val.edit;
                    }
                    lists.push(val);
                  });
                  this.setState({productsLists: lists});
                }}
              />
            ) : ''}
          </div>
        ) : (
          <Input.Search
            defaultValue={info.type === 2 ? info.commission : info.allowance}
            onSearch={value => {
              this.editAllowance(value, info);
            }}
            enterButton={<Icon type="check" theme="outlined" />}
            style={{width: 100}}
          />
        ),
      },
    ];

    return (
      <PageHeaderLayout title={info.organization}>
        <Card title="基本信息" bordered={false}>
          <Row gutter={24}>
            <Col span={4} style={{textAlign: 'right', lineHeight: 3}}>单位名称：</Col>
            <Col span={20} style={{lineHeight: 3}}>{info.organization}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={4} style={{textAlign: 'right', lineHeight: 3}}>所属区域：</Col>
            <Col span={20} style={{lineHeight: 3}}>{info.area}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={4} style={{textAlign: 'right', lineHeight: 3}}>联系人：</Col>
            <Col span={20} style={{lineHeight: 3}}>{info.contact}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={4} style={{textAlign: 'right', lineHeight: 3}}>推荐码：</Col>
            <Col span={20} style={{lineHeight: 3}}>{info.mobile}</Col>
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
        <br />
        <Card title="发货信息" bordered={false}>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="发货额度" key="1">
              <Table rowKey="id" columns={goodsColumns} dataSource={[]} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="发货记录" key="2">
              <Table rowKey="id" columns={goodsColumns2} dataSource={[]} />
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </PageHeaderLayout>
    );
  }
}

export default ADProfile;
