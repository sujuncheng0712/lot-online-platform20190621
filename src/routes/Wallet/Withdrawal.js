/* eslint-disable no-shadow,no-param-reassign,radix */
import React, {PureComponent} from 'react';
import {Card, Button, Form, Icon, Input, Popover, message, Select} from 'antd';
import {connect} from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import banks from '../../models/banks'
import styles from './style.less';

const url = 'http://iot.dochen.cn/api';
const role = localStorage.getItem('antd-pro-authority');
const auth = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';

// 输入框
const fieldLabels = {
  bank: '开户银行',
  account: '银行账户',
  name: '开户人姓名',
  mobile: '手机号',
  amount: '提现金额',
};

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 4},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 10},
  },
};

class Withdrawal extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      balance: 0,
      banks,
      bankCode:'',
    };
  }

  componentDidMount() {
    this.countBalance();
  }

  countBalance() {
    let getSummary = `${url}/earnings`;
    getSummary += `/${auth.uuid}`;
    getSummary += `/summary`;
    fetch(getSummary).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            let balance = 0;
            info.data.forEach(val => {
              balance += val.allowance + val.commission + val.refund
            });
            this.setState({balance});
          }
        });
      }
    });
  }

  render() {
    const {form, submitting} = this.props;
    const {getFieldDecorator, validateFieldsAndScroll, getFieldsError} = form;
    const {balance, banks, bankCode} = this.state;

    // 请求服务器
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          values.amount = parseInt(values.amount);
          values.type = role;
          console.log(values);
          const data = JSON.stringify(values);
          let postWallet = `${url}/wallet`;
          postWallet += `/${auth.uuid}`;
          postWallet += `/apply`;
          fetch(postWallet, {
            method: 'POST',
            body: JSON.stringify({data}),
          }).then((res) => {
            if (res.ok) {
              res.json().then((info) => {
                if (info.code === 20013) message.error('余额不足');
                if (info.status) location.href = '#/wallet/wallet-list';
              });
            }
          });
        }
      });
    };

    // 获取错误列表
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

    const banksList = [];
    banks.forEach((item) => (
      banksList.push(<Select.Option key={item.code} value={item.code}>{item.name}</Select.Option>)
    ));

    return (
      <PageHeaderLayout wrapperClassName={styles.advancedForm}>
        <Card
          className={styles.card}
          bordered={false}
          title={`可提现金额：${balance} 元`}
        >
          <Form>
            <Form.Item label={fieldLabels.bank} {...formItemLayout} >
              {getFieldDecorator('bank', {
                initialValue: bankCode,
                rules: [{required: true, message: '*'}],
              })(
                <Input
                  type="hidden"
                />
              )}
              <Select
                showSearch
                placeholder="请选择开户银行"
                optionFilterProp="children"
                onChange={(value) => {
                  console.log(value);
                  this.setState({bankCode: value});
                }}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {banksList}
              </Select>
            </Form.Item>
            <Form.Item label={fieldLabels.account} {...formItemLayout} >
              {getFieldDecorator('account', {
                rules: [
                  {required: true, message: '银行账号必须填写'},
                ],
              })(
                <Input
                  type="text"
                  placeholder="请输入开户银行账号"
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.name} {...formItemLayout} >
              {getFieldDecorator('name', {
                rules: [
                  {required: true, message: '开户人姓名必须填写'},
                ],
              })(
                <Input
                  type="text"
                  placeholder="请输入开户人姓名"
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.mobile} {...formItemLayout} >
              {getFieldDecorator('mobile', {
                rules: [
                  {required: true, message: '手机号必须填写'},
                ],
              })(
                <Input
                  type="text"
                  placeholder="请输入在银行预留的手机号"
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.amount} {...formItemLayout} >
              {getFieldDecorator('amount', {
                rules: [
                  {required: true, message: '提现金额必须填写'},
                  {validator: this.checkPassword},
                ],
              })(
                <Input
                  type="number"
                  placeholder="请输入提现的金额"
                />
              )}
            </Form.Item>
          </Form>
        </Card>
        <div style={{display: `flex`, alignItems: `center`, flexDirection: `row-reverse`}}>
          <Button type="primary" onClick={validate} loading={submitting}>确认提现</Button>
          {getErrorInfo()}
        </div>
      </PageHeaderLayout>
    );
  }
}

export default connect(({global, loading}) => ({
  collapsed: global.collapsed,
  submitting: loading.effects['form/submitAdvancedForm'],
}))(Form.create()(Withdrawal));
