/* eslint-disable no-shadow,no-param-reassign,radix */
import React, { PureComponent } from 'react';
import { Card, Button, Form, Input, message, Select } from 'antd';
import { connect } from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import banks from '../../models/banks';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth')
  ? JSON.parse(sessionStorage.getItem('dochen-auth'))
  : '';

// 输入框
const fieldLabels = {
  bank: '开户银行',
  account: '银行账户',
  name: '开户人姓名',
  mobile: '手机号',
  amount: '提现金额',
};

const formItemLayout = {
  labelCol: { xs: { span: 24 }, sm: { span: 4 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 10 } },
};

// 限制最小提现金额
function validatePrimeNumber(number) {
  if (number > 3) {
    return {
      validateStatus: 'success',
      errorMsg: null,
    };
  }
  return {
    validateStatus: 'error',
    errorMsg: '提现金额必须大于或等于3元！',
  };
}

class Withdrawal extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      balance: 0,
      bankCode: '',
      service: 0,
      number: {},
    };
  }

  componentDidMount() {
    this.getWallet(auth.mid || '');
  }

  getWallet(mid = '') {
    let getWallet = `${url}/wallet`;
    getWallet += mid ? `/${mid}` : '';
    fetch(getWallet).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) this.setState({ balance: info.data[0].balance });
        });
      }
    });
  }

  render() {
    const { form, submitting } = this.props;
    const { getFieldDecorator, validateFieldsAndScroll } = form;
    const { balance, bankCode, service, number } = this.state;

    // 请求服务器
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          values.amount = parseInt(values.amount);
          let postWallet = `${url}/wallet`;
          postWallet += `/${auth.mid}/apply`;
          fetch(postWallet, {
            method: 'POST',
            body: JSON.stringify(values),
          }).then(res => {
            if (res.ok) {
              res.json().then(info => {
                if (info.code === 20013) message.error('余额不足');
                if (info.status) location.href = '#/wallet/wallet-list';
              });
            }
          });
        }
      });
    };

    const banksList = [];
    banks.forEach(item =>
      banksList.push(
        <Select.Option key={item.code} value={item.code}>
          {item.name}
        </Select.Option>
      )
    );

    return (
      <PageHeaderLayout>
        <Card bordered={false} title={`可提现金额：${balance} 元`}>
          <Form>
            <Form.Item label={fieldLabels.bank} {...formItemLayout}>
              {getFieldDecorator('bank', {
                initialValue: bankCode,
                rules: [{ required: true, message: '*' }],
              })(<Input type="hidden" />)}
              <Select
                showSearch
                placeholder="请选择开户银行"
                optionFilterProp="children"
                onChange={value => this.setState({ bankCode: value })}
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {banksList}
              </Select>
            </Form.Item>
            <Form.Item label={fieldLabels.account} {...formItemLayout}>
              {getFieldDecorator('account', {
                rules: [{ required: true, message: '银行账号必须填写' }],
              })(<Input type="text" placeholder="请输入开户银行账号" />)}
            </Form.Item>
            <Form.Item label={fieldLabels.name} {...formItemLayout}>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '开户人姓名必须填写' }],
              })(<Input type="text" placeholder="请输入开户人姓名" />)}
            </Form.Item>
            <Form.Item label={fieldLabels.mobile} {...formItemLayout}>
              {getFieldDecorator('mobile', {
                rules: [{ required: true, message: '手机号必须填写' }],
              })(<Input type="text" placeholder="请输入在银行预留的手机号" />)}
            </Form.Item>
            <Form.Item
              label={fieldLabels.amount}
              {...formItemLayout}
              validateStatus={number.validateStatus}
              help={number.errorMsg || `手续费${service}元（费率0.1%，最低2元）`}
            >
              {getFieldDecorator('amount', {
                rules: [{ required: true, message: '提现金额必须填写' }],
              })(
                <Input
                  type="number"
                  placeholder="请输入提现的金额"
                  addonAfter="元"
                  style={{ width: 260 }}
                  onChange={e => {
                    this.setState({
                      number: { ...validatePrimeNumber(e.target.value) },
                      service: (Math.round(e.target.value * 0.1) / 100 <= 2
                        ? 2
                        : Math.round(e.target.value * 0.1) / 100
                      ).toFixed(2),
                    });
                  }}
                />
              )}
            </Form.Item>
          </Form>
        </Card>
        <div style={{ display: `flex`, alignItems: `center`, flexDirection: `row-reverse` }}>
          <Button type="primary" onClick={validate} loading={submitting}>
            确认提现
          </Button>
        </div>
      </PageHeaderLayout>
    );
  }
}

export default connect(({ global, loading }) => ({
  collapsed: global.collapsed,
  submitting: loading.effects['form/submitAdvancedForm'],
}))(Form.create()(Withdrawal));
