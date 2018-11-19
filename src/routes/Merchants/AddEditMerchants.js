/* eslint-disable react/no-array-index-key,no-param-reassign,radix */
import React, { PureComponent } from 'react';
import { Card, Button, Form, Input, Cascader, Select } from 'antd';
import { connect } from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import Ares from '../../models/area';

const url = 'http://iot.dochen.cn/api';

// 输入框
const fieldLabels = {
  // 基础信息
  type: '类型',
  organization: '单位名称',
  area: '所在区域',
  sid: '所属代理商',
  contact: '联系人',
  mobile: '手机号',
  username: '用户名',
  password: '初始密码',
};

// 布局
const formItemLayout = {
  labelCol: { xs: { span: 24 }, sm: { span: 4 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 10 } },
};

class DealerAdd extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      merchantsInfo: {},
      lists: [],
      type: '1', // 0:运营商，1:代理商，2:经销商，3:8块8
      area: [],
      mobile: '',
      sid: '',
    };
  }

  componentDidMount() {
    this.getMerchantsInfo();
    this.getMerchantsList();
  }

  // 获取商家信息
  getMerchantsInfo() {
    const { location: { search } } = this.props;
    const mid = search.slice(1).split('=')[1];
    const infoUrl = `${url}/merchants/${mid}`;
    fetch(infoUrl).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) this.setState({ merchantsInfo: info.data[0], type: info.data[0].type });
        });
      }
    });
  }

  // 获取商家列表
  getMerchantsList() {
    const getMerchants = `${url}/merchants`;
    fetch(getMerchants).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) this.setState({ lists: info.data });
        });
      }
    });
  }

  render() {
    const { form, location: { search } } = this.props;
    const { getFieldDecorator, validateFieldsAndScroll } = form;
    const { merchantsInfo, lists, area, type, mobile, sid } = this.state;
    const merchantsList = [];
    lists.forEach(val => {
      if (val.type === 1)
        merchantsList.push(
          <Select.Option key={val.uuid}>
            {val.contact}（{val.area}）
          </Select.Option>
        );
    });

    const mid = search.slice(1).split('=')[1];

    // 请求服务器
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        values.type = parseInt(values.type);
        if (!error) {
          let postMerchants = `${url}/merchants`;
          postMerchants += mid ? `/${mid}` : '';
          fetch(postMerchants, {
            method: mid ? `PUT` : `POST`,
            body: JSON.stringify(values),
          }).then(res => {
            if (res.ok) {
              res.json().then(info => {
                console.log(info);
                if (info.status) location.hash = `/merchants/merchants-list`;
              });
            }
          });
        }
      });
    };

    return (
      <PageHeaderLayout title={`${mid ? '修改' : '添加'}客户`}>
        <Card bordered={false}>
          <Form>
            {mid ? (
              merchantsInfo.type ? (
                <Form.Item label={fieldLabels.type} {...formItemLayout}>
                  {getFieldDecorator('type', {
                    initialValue: merchantsInfo.type.toString(),
                  })(<Input type="hidden" />)}
                  <Select
                    style={{ width: '100%' }}
                    onChange={value => this.setState({ type: value })}
                    placeholder="请选择"
                    defaultValue={merchantsInfo.type.toString()}
                  >
                    <Select.Option value="1">一级运营商</Select.Option>
                    <Select.Option value="2">二级运营商</Select.Option>
                    <Select.Option value="3"> - 代理商 - </Select.Option>
                  </Select>
                </Form.Item>
              ) : (
                ''
              )
            ) : (
              <Form.Item label={fieldLabels.type} {...formItemLayout}>
                {getFieldDecorator('type', {
                  initialValue: type,
                })(<Input type="hidden" />)}
                <Select
                  style={{ width: '100%' }}
                  onChange={value => this.setState({ type: value })}
                  placeholder="请选择"
                  defaultValue={type}
                >
                  <Select.Option value="1">一级运营商</Select.Option>
                  <Select.Option value="2">二级运营商</Select.Option>
                  <Select.Option value="3"> - 代理商 - </Select.Option>
                </Select>
              </Form.Item>
            )}
            <Form.Item label={fieldLabels.organization} {...formItemLayout}>
              {getFieldDecorator('organization', {
                initialValue: merchantsInfo.organization,
                rules: [{ required: true, message: '单位名称必须填写' }],
              })(<Input placeholder="请输入单位名称" />)}
            </Form.Item>
            {mid ? (
              merchantsInfo.area ? (
                <Form.Item label={fieldLabels.area} {...formItemLayout}>
                  {getFieldDecorator('area', {
                    initialValue: area.join('/') || merchantsInfo.area,
                    rules: [{ required: true, message: '所在区域必须选择' }],
                  })(<Input type="hidden" />)}
                  <Cascader
                    options={Ares}
                    changeOnSelect
                    placeholder="请选择"
                    defaultValue={merchantsInfo.area.split('/')}
                    onChange={value => this.setState({ area: value })}
                  />
                </Form.Item>
              ) : (
                ''
              )
            ) : (
              <Form.Item label={fieldLabels.area} {...formItemLayout}>
                {getFieldDecorator('area', {
                  initialValue: area.join('/'),
                  rules: [{ required: true, message: '所在区域必须选择' }],
                })(<Input type="hidden" />)}
                <Cascader
                  options={Ares}
                  changeOnSelect
                  placeholder="请选择"
                  onChange={value => this.setState({ area: value })}
                />
              </Form.Item>
            )}
            {type > 1 ? (
              <Form.Item label={fieldLabels.sid} {...formItemLayout}>
                {getFieldDecorator('sid', {
                  initialValue: merchantsInfo.sid || sid,
                  // rules: [{required: true, message: '必须选择上级代理商'}],
                })(<Input type="hidden" />)}
                <Select
                  style={{ width: '100%' }}
                  onChange={value => this.setState({ sid: value })}
                  placeholder="请选择"
                  defaultValue={merchantsInfo.sid || sid}
                >
                  <Select.Option value="">DGK 智能平台</Select.Option>
                  {merchantsList}
                </Select>
              </Form.Item>
            ) : (
              ''
            )}
            <Form.Item label={fieldLabels.contact} {...formItemLayout}>
              {getFieldDecorator('contact', {
                initialValue: merchantsInfo.contact,
                rules: [
                  { required: true, message: '联系人姓名必须输入' },
                  { pattern: /^[\u4E00-\u9FA5]{1,4}$/, message: '姓名格式错误！' },
                ],
              })(<Input placeholder="请输入联系人姓名" />)}
            </Form.Item>
            <Form.Item label={fieldLabels.mobile} {...formItemLayout}>
              {getFieldDecorator('mobile', {
                initialValue: merchantsInfo.mobile,
                rules: [
                  { required: true, message: '联系人手机号必须输入' },
                  { pattern: /^1\d{10}$/, message: '手机号格式错误！' },
                ],
              })(
                <Input
                  maxLength={11}
                  placeholder="请输入联系人手机号"
                  onChange={e => this.setState({ mobile: e.target.value })}
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.username} {...formItemLayout}>
              {getFieldDecorator('username', {
                initialValue: merchantsInfo.username || mobile,
                rules: [
                  { required: true, message: '用户名必须填写' },
                  { pattern: /^1\d{10}$/, message: '用户名必须为有效的手机号！' },
                ],
              })(<Input maxLength={11} placeholder="用户名必须是有效的手号" />)}
            </Form.Item>
            <Form.Item label={fieldLabels.password} {...formItemLayout}>
              {getFieldDecorator('password', {
                initialValue: '0123456789',
              })(<Input disabled />)}
            </Form.Item>
          </Form>
        </Card>
        <br />
        <div style={{ display: `flex`, alignItems: `center`, flexDirection: `row-reverse` }}>
          <Button type="primary" onClick={validate}>
            提交资料
          </Button>
        </div>
      </PageHeaderLayout>
    );
  }
}

export default connect(({ global, loading }) => ({
  collapsed: global.collapsed,
  submitting: loading.effects['form/submitAdvancedForm'],
}))(Form.create()(DealerAdd));
