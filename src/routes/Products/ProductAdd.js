import React, {PureComponent} from 'react';
// import QRCode from 'qrcode.react';
import {Card, Button, Form, Icon, Input, Popover,InputNumber, Select} from 'antd';
import {connect} from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './style.less';

// 输入框
const fieldLabels = {
  title: '产品标题',
  desc: '产品描述(卖点)',
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
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 },
  },
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
    const {location: {search}} = this.props;
    const pid = search.slice(1).split('=')[1];
    if(pid){
      fetch(`http://iot.dochen.cn/api/products/${pid}`).then((res) => {
        if (res.ok) {
          res.json().then((info) => {
            if (info.status) this.setState({info: info.data[0]});
          });
        }
      });
    }
  }

  render() {
    const {form, submitting} = this.props;
    const {getFieldDecorator, validateFieldsAndScroll, getFieldsError} = form;
    const {location: {search}} = this.props;
    const pid = search.slice(1).split('=')[1];

    // 请求服务器
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          const data = JSON.stringify(values);
          fetch(`http://iot.dochen.cn/api/products${pid ? `/${pid}` : ``}`, {
            method: `${pid ? 'PUT' : 'POST'}`,
            body: JSON.stringify({
              data,
            }),
          }).then((res) => {
            if (res.ok) {
              res.json().then((info) => {
                if (info.status) {
                  location.href = `#/products/product-profile/?pid=${info.data[0].uuid}`;
                }
              });
            }
          });
        }
      });
    };

    const errors = getFieldsError();
    const getErrorInfo = () => {
      const errorCount = Object.keys(errors).filter(key => errors[key]).length;
      if (!errors || errorCount === 0) {
        return null;
      }
      const scrollToField = (fieldKey) => {
        const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
        if (labelNode) {
          labelNode.scrollIntoView(true);
        }
      };
      const errorList = Object.keys(errors).map((key) => {
        if (!errors[key]) {
          return null;
        }
        return (
          <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
            <Icon type="cross-circle-o" className={styles.errorIcon} />
            <div className={styles.errorMessage}>{errors[key][0]}</div>
            <div className={styles.errorField}>{fieldLabels[key]}</div>
          </li>
        );
      });
      return (
        <span className={styles.errorIcon} style={{float: 'right'}}>
          <Popover
            title="表单校验信息"
            content={errorList}
            overlayClassName={styles.errorPopover}
            trigger="click"
            getPopupContainer={trigger => trigger.parentNode}
          >
            <Icon type="exclamation-circle" />
          </Popover>
          {errorCount}
        </span>
      );
    };

    return (
      <PageHeaderLayout
        title="发布商品"
        wrapperClassName={styles.advancedForm}
      >
        <Card title="基本信息" className={styles.card} bordered={false}>
          <Form>
            <Form.Item label={fieldLabels.title} {...formItemLayout} >
              {getFieldDecorator('title', {
                initialValue: this.state.info.title,
                rules: [{required: true, message: '产品标题必须填写'}],
              })(
                <Input placeholder="请输入产品标题" />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.desc} {...formItemLayout} >
              {getFieldDecorator('desc', {
                initialValue: this.state.info.desc,
                // rules: [{required: true, message: '*'}],
              })(
                <Input placeholder="请描述产品的卖点" />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.type} {...formItemLayout} >
              {getFieldDecorator('type', {
                initialValue: this.state.info.type || this.state.typeValue,
                // rules: [{required: true, message: '*'}],
              })(
                <Input type="hidden" placeholder="*" />
              )}
              <Select
                style={{ width: '100%' }}
                value={`${this.state.info.type || this.state.typeValue}`}
                onChange={(value)=>{
                  this.setState({typeValue: value});
                }}
              >
                <Select.Option value="1">产品</Select.Option>
                <Select.Option value="2">耗材</Select.Option>
                <Select.Option value="3">团购</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label={fieldLabels.coding} {...formItemLayout} >
              {getFieldDecorator('coding', {
                initialValue: this.state.info.coding,
                rules: [{required: true, message: '商家编码必须填写'}],
              })(
                <Input placeholder="请输入商家编码" />
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
                // rules: [{required: true, message: '*'}],
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
                // rules: [{required: true, message: '*'}],
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
                // rules: [{required: true, message: '*'}],
              })(
                <InputNumber
                  style={{width: 200}}
                  min={0}
                />
              )}
            </Form.Item>
          </Form>
        </Card>
        <Card title="资源信息" className={styles.card} bordered={false}>
          <Form>
            <Form.Item label={fieldLabels.prev_image} {...formItemLayout} >
              {getFieldDecorator('prev_image', {
                initialValue: this.state.info.prev_image || 'http://gw.dochen.cn/assets/images/Installation_main.jpg',
                // rules: [{required: true, message: '*'}],
              })(
                <Input placeholder="请输入装修主图地址" />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.intro_image} {...formItemLayout} >
              {getFieldDecorator('intro_image', {
                initialValue: this.state.info.intro_image || 'http://gw.dochen.cn/assets/images/Installation_main.jpg',
                // rules: [{required: true, message: '宝贝图片必须有一张'}],
              })(
                <Input placeholder="请输入宝贝图片地址" />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.detail_res} {...formItemLayout} >
              {getFieldDecorator('detail_res', {
                initialValue: this.state.info.detail_res || 'http://gw.dochen.cn/assets/images/Installation_main.jpg',
                // rules: [{required: true, message: '*'}],
              })(
                <Input placeholder="宝贝描述(详情)" />
              )}
            </Form.Item>
          </Form>
        </Card>
        {/* <Card title="code" className={styles.card} bordered={false}> */}
        {/* <QRCode value="123" /> */}
        {/* </Card> */}
        <div style={{display: `flex`, alignItems: `center`, flexDirection: `row-reverse`}}>
          <Button type="primary" onClick={validate} loading={submitting}>提交</Button>
          {getErrorInfo()}
        </div>
      </PageHeaderLayout>
    );
  }
}

export default connect(({global, loading}) => ({
  collapsed: global.collapsed,
  submitting: loading.effects['form/submitAdvancedForm'],
}))(Form.create()(ProductAdd));
