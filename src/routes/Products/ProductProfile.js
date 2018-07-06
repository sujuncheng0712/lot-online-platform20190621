/* eslint-disable jsx-a11y/alt-text */
import React, {PureComponent} from 'react';
import {Card, Button, Row, Col} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

class ProductsProfile extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      info: {
        title: 'A13 RO反渗透纯水机',
        desc: 'A13 RO反渗透纯水机...',
        price: 699,
        stock: 100,
        coding: '商家编码',
        freight: 0,
        order: '排序',
        bonus: 699,

        prev_image: 'http://dochen.cn/product/A13/A13_02.jpg',
        intro_image: 'http://dochen.cn/product/A13/A13_02.jpg',
        detail_res: 'http://dochen.cn/product/A13/A13_02.jpg',
      },
    };
  }

  componentDidMount() {
    this.getProducts();
  }

  getProducts() {
    const {location: {search}} = this.props;
    let getProducts = `${url}/products/${search.slice(5)}`;
    getProducts += search.slice(5);
    fetch(getProducts).then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          if (data.status) this.setState({info: data.data[0]});
        });
      }
    });
  }

  render() {
    const {info} = this.state;
    const {location: {search}} = this.props;

    return (
      <PageHeaderLayout
        title={`${info.title}详情`}
      >
        <Card title="基本信息" bordered={false}>
          <Row gutter={24}>
            <Col span={3} style={{textAlign: 'right', lineHeight: 3}}>产品标题：</Col>
            <Col span={21} style={{lineHeight: 3}}>{info.title}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={3} style={{textAlign: 'right', lineHeight: 3}}>产品描述(卖点)：</Col>
            <Col span={21} style={{lineHeight: 3}}>{info.desc}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={3} style={{textAlign: 'right', lineHeight: 3}}>销售价格：</Col>
            <Col span={21} style={{lineHeight: 3}}>{info.price}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={3} style={{textAlign: 'right', lineHeight: 3}}>库存：</Col>
            <Col span={21} style={{lineHeight: 3}}>{info.stock}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={3} style={{textAlign: 'right', lineHeight: 3}}>商家编码：</Col>
            <Col span={21} style={{lineHeight: 3}}>{info.coding}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={3} style={{textAlign: 'right', lineHeight: 3}}>运费：</Col>
            <Col span={21} style={{lineHeight: 3}}>{info.freight}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={3} style={{textAlign: 'right', lineHeight: 3}}>排序：</Col>
            <Col span={21} style={{lineHeight: 3}}>{info.order}</Col>
          </Row>
          <Row gutter={24}>
            <Col span={3} style={{textAlign: 'right', lineHeight: 3}}>积分：</Col>
            <Col span={21} style={{lineHeight: 3}}>{info.bonus}</Col>
          </Row>
        </Card>
        <br />
        <Card title="装修主图" bordered={false}>
          <Row gutter={24}>
            <Col span={24}><img src={info.prev_image} height={200} /></Col>
          </Row>
        </Card>
        <br />
        <Card title="宝贝图片" bordered={false}>
          <Row gutter={24}>
            <Col span={4}><img src={info.intro_image} width={220} /></Col>
            <Col span={4}><img src={info.intro_image} width={220} /></Col>
            <Col span={4}><img src={info.intro_image} width={220} /></Col>
            <Col span={4} />
            <Col span={4} />
          </Row>
        </Card>
        <br />
        <Card title="宝贝描述(详情)" bordered={false}>
          <Row gutter={24}>
            <Col span={24}><img src={info.detail_res} height={200} /></Col>
          </Row>
        </Card>
        <div style={{display: `flex`, alignItems: `center`, flexDirection: `row-reverse`}}>
          <a href={`#/products/product-add/${search}`}><Button type="primary">编辑商品信息</Button></a>
        </div>
      </PageHeaderLayout>
    );
  }
}

export default ProductsProfile;
