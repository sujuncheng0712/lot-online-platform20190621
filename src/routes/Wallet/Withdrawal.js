import React, {PureComponent} from 'react';
import {Card, Button, Form, Icon, Input, Popover, Divider} from 'antd';
import {connect} from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './style.less';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';

// 输入框
const fieldLabels = {
  balance: '可提现金额',
  amount: '金额',
  pay_password: '支付密码',
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
    this.state = {};
  }

  render() {
    const {form, submitting} = this.props;
    const {getFieldDecorator, validateFieldsAndScroll, getFieldsError} = form;

    // 请求服务器
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          const data = JSON.stringify(values);
          const getPWD = `${url}/${auth.type}/${auth.uuid}/pwd`;
          fetch(getPWD, {
            method: 'PUT',
            body: JSON.stringify({data}),
          }).then((res) => {
            if (res.ok) {
              res.json().then((info) => {
                console.log(info);
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

    return (
      <PageHeaderLayout wrapperClassName={styles.advancedForm}>
        <Card className={styles.card} bordered={false} title={<div>中国农业银行（尾号6073）<a href="/">修改绑定银行卡 <Icon type="right" /></a></div>}>
          <Form>
            <Form.Item label={fieldLabels.balance} {...formItemLayout} >
              {getFieldDecorator('balance', {
                initialValue: '300.00',
              })(
                <Input disabled />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.amount} {...formItemLayout} >
              {getFieldDecorator('amount', {
                rules: [
                  {required: true, message: '新密码必须填写'},
                  {validator: this.checkPassword},
                ],
              })(
                <Input type="password" placeholder="请输入8-16位的密码，区分大小写" />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.pay_password} {...formItemLayout} >
              {getFieldDecorator('pay_password', {
                rules: [
                  {required: true, message: '确认密码必须填写'},
                  {validator: this.checkConfirm},
                ],
              })(
                <Input type="password" placeholder="请重新输入密码" />
              )}
            </Form.Item>
          </Form>
        </Card>
        <div style={{display: `flex`, alignItems: `center`, flexDirection: `row-reverse`}}>
          <Button type="primary" onClick={validate} loading={submitting}>确认提现</Button>
          {getErrorInfo()}
          <Divider type="vertical" />
          <a href="/">忘记支付密码</a>
        </div>
      </PageHeaderLayout>
    );
  }
}

export default connect(({global, loading}) => ({
  collapsed: global.collapsed,
  submitting: loading.effects['form/submitAdvancedForm'],
}))(Form.create()(Withdrawal));
