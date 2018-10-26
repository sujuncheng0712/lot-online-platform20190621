import React, {PureComponent} from 'react';
import {Card, Button, Form, Input, InputNumber, Select} from 'antd';
import {connect} from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

// 输入框
const fieldLabels = {
  title: '产品标题',
  desc: '产品描述(卖点)',
  tags: '标签',
  type: '产品类型',
  coding: '商家编码',
  price: '销售价格',
  stock: '库存',
  freight: '运费',
  order: '排序',
  bonus: '积分',
  prev_image: '装修主图',
  intro_image: '宝贝图片',
  detail_res: '宝贝描述(详情)',
};

const formItemLayout = {
  labelCol: {xs: {span: 24}, sm: {span: 4}},
  wrapperCol: {xs: {span: 24}, sm: {span: 10}},
};

class ProductAdd extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      info: {},
      typeValue: 1,
    };
  }

  componentDidMount() {
    this.getProducts();
  }

  // 获取商品详情
  getProducts() {
    const {location: {search}} = this.props;
    const pid = search.slice(1).split('=')[1];
    const getProducts = `${url}/products/${pid}`;
    fetch(getProducts).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({info: info.data[0]});
        });
      }
    });
  }

  render() {
    const {form, submitting, location: {search}} = this.props;
    const {getFieldDecorator, validateFieldsAndScroll} = form;
    const pid = search.slice(1).split('=')[1];

    // 请求服务器
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        values.price = parseFloat(values.price);
        values.freight = parseFloat(values.freight);
        if (!error) {
          let postProducts = `${url}/products`;
          postProducts += pid ? `/${pid}` : '';
          fetch(postProducts, {
            method: pid ? 'PUT' : 'POST',
            body: JSON.stringify(values),
          }).then((res) => {
            if (res.ok) {
              res.json().then((info) => {
                if (info.status) {
                  location.hash = `/products/products-list`;
                }
              });
            }
          });
        }
      });
    };

    return (
      <PageHeaderLayout title={`${pid ? '编辑' : '发布'}商品`}>
        <Card title="基本信息" bordered={false}>
          <Form>
            <Form.Item label={fieldLabels.title} {...formItemLayout} >
              {getFieldDecorator('title', {
                initialValue: this.state.info.title,
                rules: [{required: true, message: '产品标题必须填写'}],
              })(
                <Input
                  placeholder="请输入产品标题"
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.desc} {...formItemLayout} >
              {getFieldDecorator('desc', {
                initialValue: this.state.info.desc,
              })(
                <Input
                  placeholder="请描述产品的卖点"
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.tags} {...formItemLayout} >
              {getFieldDecorator('tags', {
                initialValue: this.state.info.tags,
              })(
                <Input
                  placeholder="请描述产品的卖点"
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.type} {...formItemLayout} >
              {getFieldDecorator('type', {
                initialValue: this.state.info.type || this.state.typeValue,
              })(
                <Input
                  type="hidden"
                />
              )}
              <Select
                style={{width: '100%'}}
                value={`${this.state.info.type || this.state.typeValue}`}
                onChange={(value) => {
                  this.setState({typeValue: value});
                }}
              >
                <Select.Option value="1">产品（补贴）</Select.Option>
                <Select.Option value="2">耗材（返点）</Select.Option>
                <Select.Option value="3">团购（发码+补贴）</Select.Option>
                <Select.Option value="4">产品套餐（活动+补贴）</Select.Option>
                <Select.Option value="5">耗材套餐（活动+返点）</Select.Option>
                <Select.Option value="8">激活代理</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label={fieldLabels.coding} {...formItemLayout} >
              {getFieldDecorator('coding', {
                initialValue: this.state.info.coding,
                rules: [{required: true, message: '商家编码必须填写'}],
              })(
                <Input
                  placeholder="请输入商家编码"
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.price} {...formItemLayout} >
              {getFieldDecorator('price', {
                initialValue: this.state.info.price || 99,
                rules: [{required: true, message: '销售价格必须填写'}],
              })(
                <InputNumber
                  style={{width: 200}}
                  min={0}
                  formatter={value => `${value}元`}
                  parser={value => value.replace('元', '')}
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.stock} {...formItemLayout} >
              {getFieldDecorator('stock', {
                initialValue: this.state.info.stock || 0,
                rules: [{required: true, message: '产品库存必须大于0'}],
              })(
                <InputNumber
                  style={{width: 200}}
                  min={1}
                  formatter={value => `${value}台`}
                  parser={value => value.replace('台', '')}
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.freight} {...formItemLayout} >
              {getFieldDecorator('freight', {
                initialValue: this.state.info.freight || 0,
              })(
                <InputNumber
                  style={{width: 200}}
                  min={0}
                  formatter={value => `${value}元`}
                  parser={value => value.replace('元', '')}
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.order} {...formItemLayout} >
              {getFieldDecorator('order', {
                initialValue: this.state.info.order || 0,
              })(
                <InputNumber
                  style={{width: 200}}
                  min={0}
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.bonus} {...formItemLayout} >
              {getFieldDecorator('bonus', {
                initialValue: this.state.info.bonus || 0,
              })(
                <InputNumber
                  style={{width: 200}}
                  min={0}
                />
              )}
            </Form.Item>
          </Form>
        </Card>
        <Card title="资源信息" bordered={false}>
          <Form>
            <Form.Item label={fieldLabels.prev_image} {...formItemLayout} >
              {getFieldDecorator('prev_image', {
                initialValue: this.state.info.prev_image || 'http://gw.dochen.cn/assets/images/Installation_main.jpg',
              })(
                <Input
                  placeholder="请输入装修主图地址"
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.intro_image} {...formItemLayout} >
              {getFieldDecorator('intro_image', {
                initialValue: this.state.info.intro_image || 'http://gw.dochen.cn/assets/images/Installation_main.jpg',
              })(
                <Input
                  placeholder="请输入宝贝图片地址"
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.detail_res} {...formItemLayout} >
              {getFieldDecorator('detail_res', {
                initialValue: this.state.info.detail_res || 'http://gw.dochen.cn/assets/images/Installation_main.jpg',
              })(
                <Input
                  placeholder="宝贝描述(详情)"
                />
              )}
            </Form.Item>
          </Form>
        </Card>
        <div style={{display: `flex`, alignItems: `center`, flexDirection: `row-reverse`}}>
          <Button type="primary" onClick={validate} loading={submitting}>提交</Button>
        </div>
      </PageHeaderLayout>
    );
  }
}

export default connect(({global, loading}) => ({
  collapsed: global.collapsed,
  submitting: loading.effects['form/submitAdvancedForm'],
}))(Form.create()(ProductAdd));
