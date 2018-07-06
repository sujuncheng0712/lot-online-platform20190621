import React, {PureComponent} from 'react';
import {Card, Button, Form, Icon, Input, Popover, Row, Col, message} from 'antd';
import {connect} from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './style.less';

const Auth = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';
const AuthInfo = JSON.parse(sessionStorage.getItem('dochen-auth'));

// 输入框
const fieldLabels = {
  username: '手机号',
  password: '新密码',
  confirm_password: '确认密码',
  code: '验证码',
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

class ResetPassword extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      username: AuthInfo.username,
      count: 0,
    };
  }

  // 禁用按钮
  onGetCaptcha = () => {
    fetch(`http://iot.dochen.cn/api/${Auth}/${AuthInfo.uuid}/code`, {
      method: 'POST',
      body: JSON.stringify({
        data: JSON.stringify({
          vid: JSON.parse(sessionStorage.getItem('dochen-auth')).vid,
          mobile: JSON.parse(sessionStorage.getItem('dochen-auth')).mobile,
        }),
      }),
    }).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            message.success('获取验证码成功，请注意查收');
          }
        });
      }
    });

    let count = 59;
    this.setState({ count });
    this.interval = setInterval(() => {
      count -= 1;
      this.setState({ count });
      if (count === 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  };

  // 验证手机号
  checkPassword = (rule, value, callback) => {
    if (!value) {
      this.setState({
        visible: !!value,
      });
      callback('error');
    } else {
      if (!this.state.visible) {
        this.setState({
          visible: !!value,
        });
      }
      if (value.length < 8) {
        callback('至少输入8位密码');
      } else {
        const { form } = this.props;
        if (value && this.state.confirmDirty) {
          form.validateFields(['confirm'], { force: true });
        }
        callback();
      }
    }
  };

  // 验证确认密码
  checkConfirm = (rule, value, callback) => {
    const {form} = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不匹配!');
    } else {
      callback();
    }
  };

  render() {
    const {form, submitting} = this.props;
    const {getFieldDecorator, validateFieldsAndScroll, getFieldsError} = form;

    // 请求服务器
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          const data = JSON.stringify({
            username: values.username,
            password: values.password,
          });
          fetch(`http://iot.dochen.cn/api/${Auth.type}/${Auth.uuid}/pwd`, {
            method: 'POST',
            body: JSON.stringify({data}),
          }).then((res) => {
            if (res.ok) {
              res.json().then((info) => {
                if (info.status) {
                  message.success('密码修改成功');
                }
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
      <PageHeaderLayout
        title="设置支付密码"
        wrapperClassName={styles.advancedForm}
      >
        <Card title="设置支付密码" className={styles.card} bordered={false}>
          <Form>
            <Form.Item label={fieldLabels.username} {...formItemLayout} >
              {getFieldDecorator('username', {
                initialValue: this.state.username,
              })(
                <Input disabled />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.code} {...formItemLayout} >
              <Row gutter={24}>
                <Col span={18}>
                  {getFieldDecorator('code', {
                    rules: [{required: true, message: '验证码错误'}],
                  })(
                    <Input placeholder="请输入验证码" />
                  )}
                </Col>
                <Col span={6}>
                  <Button
                    type="primary"
                    style={{width: '100%'}}
                    disabled={this.state.count}
                    onClick={this.onGetCaptcha}
                  >
                    {this.state.count ? `${this.state.count} s` : '获取验证码'}
                  </Button>
                </Col>
              </Row>
            </Form.Item>
            <Form.Item label={fieldLabels.password} {...formItemLayout} >
              {getFieldDecorator('password', {
                rules: [
                  {required: true, message: '新密码必须填写'},
                  {validator: this.checkPassword},
                ],
              })(
                <Input type="password" placeholder="请输入8-16位的密码，区分大小写" />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.confirm_password} {...formItemLayout} >
              {getFieldDecorator('confirm_password', {
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
}))(Form.create()(ResetPassword));
