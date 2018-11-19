/* eslint-disable default-case,no-shadow,no-unused-vars */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Checkbox, Alert, message } from 'antd';
import Login from 'components/Login';
import styles from './Login.less';

const { Tab, UserName, Password, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
export default class LoginPage extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      type: 'merchants',
      autoLogin: false,
    };
  }

  onTabChange(type) {
    this.setState({ type });
  }

  handleSubmit(err, values) {
    const { type } = this.state;
    if (!err) {
      fetch('http://iot.dochen.cn/api/auth', {
        method: 'POST',
        body: JSON.stringify({
          username: values.userName,
          password: values.password,
          type,
        }),
      }).then(res => {
        if (res.ok) {
          res.json().then(info => {
            if (info.status) {
              message.success(`登陆成功`);
              let type = 0;
              switch (info.data[0].type) {
                case 0:
                  type = 'vendors';
                  break;
                case 1:
                  type = 'merchants_01';
                  break;
                case 2:
                  type = 'merchants_02';
                  break;
                case 3:
                  type = 'merchants_03';
                  break;
                default:
                  type = 'guest';
              }
              localStorage.setItem('antd-pro-authority', type);
              sessionStorage.setItem('dochen-auth', JSON.stringify(info.data[0]));
              location.href = '/';
            } else {
              message.error(`登录失败,账号或密码不正确。错误代码：${info.messgae}`);
            }
          });
        }
      });
    }
  }

  changeAutoLogin(e) {
    this.setState({
      autoLogin: e.target.checked,
    });
  }

  renderMessage = content => {
    return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
  };

  render() {
    const { login, submitting } = this.props;
    const { type } = this.state;

    return (
      <div className={styles.main}>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange.bind(this)}
          onSubmit={this.handleSubmit.bind(this)}
        >
          <Tab key="merchants" tab="商家登录">
            {login.status === 'error' &&
              login.type === 'merchants' &&
              !login.submitting &&
              this.renderMessage('账户或密码错误')}
            <UserName name="userName" placeholder="请输入代理商账号" />
            <Password name="password" placeholder="请输入8-16位的密码" />
          </Tab>
          <Tab key="vendors" tab="员工登录">
            {login.status === 'error' &&
              login.type === 'vendors' &&
              !login.submitting &&
              this.renderMessage('账户或密码错误')}
            <UserName name="userName" placeholder="请输入运营商账号" />
            <Password name="password" placeholder="请输入8-16位的密码" />
          </Tab>
          <div>
            <Checkbox checked={this.state.autoLogin} onChange={this.changeAutoLogin.bind(this)}>
              记住账号密码
            </Checkbox>
          </div>
          <Submit loading={submitting}>登录</Submit>
        </Login>
      </div>
    );
  }
}
