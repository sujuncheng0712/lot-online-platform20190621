import React, {Component} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import {Checkbox, Alert, message} from 'antd';
import Login from 'components/Login';
import styles from './Login.less';

const {Tab, UserName, Password, Submit} = Login;

@connect(({login, loading}) => ({
  login,
  submitting: loading.effects['login/login'],
}))
export default class LoginPage extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      type: 'agents',
      autoLogin: true,
    }
  }

  onTabChange(type) {
    this.setState({type});
  }

  handleSubmit(err, values) {
    const {type} = this.state;
    if (!err) {
      fetch('http://iot.dochen.cn/api/auth', {
        method: 'POST',
        body: JSON.stringify({
          username: values.userName,
          password: values.password,
          type,
        }),
      }).then((res) => {
        if (res.ok) {
          res.json().then((info) => {
            if (info.status) {
              localStorage.setItem('antd-pro-authority', type);
              sessionStorage.setItem('dochen-auth', JSON.stringify(info.data[0]));
              location.href = '/';
            }else {
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

  renderMessage = (content) => {
    return (
      <Alert style={{marginBottom: 24}} message={content} type="error" showIcon />
    );
  };

  render() {
    const {login, submitting} = this.props;
    const {type} = this.state;

    return (
      <div className={styles.main}>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange.bind(this)}
          onSubmit={this.handleSubmit.bind(this)}
        >
          <Tab key="agents" tab="代理商">
            {
              login.status === 'error' &&
              login.type === 'agents' &&
              !login.submitting &&
              this.renderMessage('账户或密码错误')
            }
            <UserName name="userName" placeholder="请输入代理商账号" />
            <Password name="password" placeholder="请输入8-16位的密码" />
          </Tab>
          <Tab key="dealers" tab="经销商">
            {
              login.status === 'error' &&
              login.type === 'dealers' &&
              !login.submitting &&
              this.renderMessage('账户或密码错误')
            }
            <UserName name="userName" placeholder="请输入经销商账号" />
            <Password name="password" placeholder="请输入8-16位的密码" />
          </Tab>
          <Tab key="vendors" tab="员工登录">
            {
              login.status === 'error' &&
              login.type === 'vendors' &&
              !login.submitting &&
              this.renderMessage('账户或密码错误')
            }
            <UserName name="userName" placeholder="请输入运营商账号" />
            <Password name="password" placeholder="请输入8-16位的密码" />
          </Tab>
          <div>
            <Checkbox checked={this.state.autoLogin} onChange={this.changeAutoLogin.bind(this)}>自动登录</Checkbox>
            <a style={{float: 'right'}} href="">忘记密码</a>
          </div>
          <Submit loading={submitting}>登录</Submit>
          <div className={styles.other}>
            <Link className={styles.register} to="/user/register">注册账户</Link>
          </div>
        </Login>
      </div>
    );
  }
}
