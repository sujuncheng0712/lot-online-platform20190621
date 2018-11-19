import React, { PureComponent } from 'react';
import { Card, Button, Row, Col, Table } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

const columns = [
  {
    title: '主图',
    dataIndex: 'prev_image',
    align: 'center',
    render: val => <img alt="" src={val} height={100} />,
  },
  { title: '标题', dataIndex: 'title' },
  { title: '描述', dataIndex: 'desc' },
  { title: '价格', dataIndex: 'price', align: 'center', sorter: (a, b) => a.price - b.price },
  { title: '运费', dataIndex: 'freight', align: 'center', sorter: (a, b) => a.freight - b.freight },
  { title: '商家编码', dataIndex: 'coding' },
];

class OrderProfile extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      info: {},
    };
  }

  componentDidMount() {
    this.getOrderProfile();
  }

  getOrderProfile() {
    const { location: { search } } = this.props;
    const id = search.slice(1).split('=')[1];
    const getOrderProfile = `${url}/orders/${id}`;
    fetch(getOrderProfile).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) this.setState({ info: info.data[0] });
        });
      }
    });
  }

  render() {
    const { info } = this.state;
    const { location: { search } } = this.props;

    return (
      <PageHeaderLayout title="订单详情">
        <Card title="收货人信息" bordered={false}>
          <Row gutter={24}>
            <Col span={3} style={{ textAlign: 'right', lineHeight: 2 }}>
              姓名：
            </Col>
            <Col span={21} style={{ lineHeight: 2 }}>
              {info.consignee}
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={3} style={{ textAlign: 'right', lineHeight: 2 }}>
              手机号：
            </Col>
            <Col span={21} style={{ lineHeight: 2 }}>
              {info.phone}
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={3} style={{ textAlign: 'right', lineHeight: 2 }}>
              地区：
            </Col>
            <Col span={21} style={{ lineHeight: 2 }}>
              {info.area}
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={3} style={{ textAlign: 'right', lineHeight: 2 }}>
              收货地址地址：
            </Col>
            <Col span={21} style={{ lineHeight: 2 }}>
              {info.address}
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={3} style={{ textAlign: 'right', lineHeight: 2 }}>
              邮编：
            </Col>
            <Col span={21} style={{ lineHeight: 2 }}>
              {info.zipcode}
            </Col>
          </Row>
        </Card>
        <br />
        <Card
          title="快递信息"
          extra={
            <a href={`#/orders/order-ship/${search}`}>
              <Button type="primary">点击发货</Button>
            </a>
          }
          bordered={false}
        >
          {info.logistic === null ? (
            ''
          ) : (
            <div>
              <Row gutter={24}>
                <Col span={3} style={{ textAlign: 'right', lineHeight: 2 }}>
                  发货人：
                </Col>
                <Col span={21} style={{ lineHeight: 2 }}>
                  {info.shipper}
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={3} style={{ textAlign: 'right', lineHeight: 2 }}>
                  快递单号：
                </Col>
                <Col span={21} style={{ lineHeight: 2 }}>
                  {info.logistic}
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={3} style={{ textAlign: 'right', lineHeight: 2 }}>
                  快递公司：
                </Col>
                <Col span={21} style={{ lineHeight: 2 }}>
                  {info.consigner}
                </Col>
              </Row>
            </div>
          )}
        </Card>
        <br />
        <Card
          title="安装信息"
          extra={
            <a href={`#/orders/order-install/${search}`}>
              <Button type="primary">点击安装</Button>
            </a>
          }
          bordered={false}
        >
          <Row gutter={24}>
            <Col span={3} style={{ textAlign: 'right', lineHeight: 2 }}>
              设备ID：
            </Col>
            <Col span={21} style={{ lineHeight: 2 }}>
              {info.shipper}
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={3} style={{ textAlign: 'right', lineHeight: 2 }}>
              装机地址：
            </Col>
            <Col span={21} style={{ lineHeight: 2 }}>
              {info.shipper}
            </Col>
          </Row>
        </Card>
        <br />
        <Card title="商品列表" bordered={false}>
          <Table rowKey="pid" columns={columns} dataSource={info.products} />
        </Card>
        <div style={{ display: `flex`, alignItems: `center`, flexDirection: `row-reverse` }}>
          <a href="#">
            <Button type="primary">编辑商品信息</Button>
          </a>
        </div>
      </PageHeaderLayout>
    );
  }
}
export default OrderProfile;
