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
      dealList: [],
      agentsList: [],
      productsLists: [],
      allowanceLists: [],
    };
  }

  componentWillMount() {
    this.getAgentsList();
    this.getDealList();
    this.getAgentsInfo();
    this.getProducts();
    this.getAllowance();
  }

  // 获取代理商列表
  getAgentsList() {
    const agentsListUrl = `${url}/agents`;
    fetch(agentsListUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({agentsList: info.data});
        });
      }
    });
  }

  // 获取商家信息
  getAgentsInfo(){
    const {location: {search}} = this.props;
    const ad = search.slice(1).split('&');
    const role = ad[0].slice(1).split('=')[1];
    const roleId = ad[1].slice(1).split('=')[1];

    const infoUrl = `${url}/${role}/${roleId}`;
    fetch(infoUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            this.state.agentsList.forEach((value) => {
              if (info.data[0].superior === value.aid) info.data[0].superior = value.contact;
            });
            this.setState({info: info.data[0]});
          }
        });
      }
    });
  }

  // 获取签约信息列表
  getDealList() {
    const {location: {search}} = this.props;
    const ad = search.slice(1).split('&');
    const roleId = ad[1].slice(1).split('=')[1];

    const dealListUrl = `${url}/agents/${roleId}/deal`;
    fetch(dealListUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({dealList: info.data});
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
              val.allowance_fee = '0';
              val.commission_rate = '0';
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
    const ad = search.slice(1).split('&');
    const roleId = ad[1].slice(1).split('=')[1];
    const getAllowance = `${url}/agents/${roleId}/allowance`;
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
    const ad = search.slice(1).split('&');
    const roleId = ad[1].slice(1).split('=')[1];
    const {productsLists} = this.state;
    let getAllowance = `${url}/agents/${roleId}/allowance`;
    getAllowance += parameter.editType === 'PUT' ? `/${parameter.editUuid}` : '';
    const data = {
      eptags: parameter.tags,
      pid: parameter.pid,
    };

    if (parameter.type === 2) {
      data.allowance_fee = value;
    } else {
      data.commission_rate = value;
    }

    fetch(getAllowance, {
      method: parameter.editType,
      body: JSON.stringify({data: JSON.stringify(data)}),
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
    const ad = search.slice(1).split('&');
    const role = ad[0].slice(1).split('=')[1];
    const roleId = ad[1].slice(1).split('=')[1];

    const {info, dealList, productsLists, allowanceLists} = this.state;

    const columns = [
      {title: '起始时间', dataIndex: 'begin_at'},
      {title: '共已缴金额(元)', dataIndex: 'pledge', align: 'center'},
      {title: '保证金(元)', dataIndex: 'deposit', align: 'center'},
      {title: '应配发货额度(台)', dataIndex: 'goods', align: 'center'},
      // {title: '补贴金额(元)', dataIndex: 'allowance_fee', align: 'center'},
      // {title: '滤芯返点(%)', dataIndex: 'commission_rate', align: 'center'},
      // {title: '售后返点(%)', dataIndex: 'service_rate', align: 'center'},
      localStorage.getItem("antd-pro-authority") === "vendors" ? {
        align: 'center',
        title: '操作',
        dataIndex: 'uuid',
        render: val => (
          <Button
            onClick={() => {
              location.hash = `#/vendors/deal-add/?role=${role}&id=${roleId}&uuid=${val}`;
            }}
          >
            编辑
          </Button>
        ),
      } : {},
    ];

    productsLists.forEach(item => {
      if (allowanceLists) {
        allowanceLists.forEach(val => {
          if (item.pid === val.pid) {
            item.allowance_fee = val.allowance_fee || 0;
            item.commission_rate = val.commission_rate || 0;
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
              {info.type === 2 ? `${info.allowance_fee} %` : `${info.commission_rate} 元`}
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
            defaultValue={info.type === 2 ? info.allowance_fee : info.commission_rate}
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
                size="small"
                onClick={() => {
                  location.href = `#/vendors/ad-add/?role=${role}&id=${roleId}`;
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
            <Col span={4} style={{textAlign: 'right', lineHeight: 3}}>{role === 'agents' ? '代理' : '所属'}区域：</Col>
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
              <a href={`#/vendors/deal-add/?role=${role}&id=${roleId}`}>增加</a>
            ) : ''
          }
          bordered={false}
        >
          <Table rowKey="id" columns={columns} dataSource={dealList} />
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
