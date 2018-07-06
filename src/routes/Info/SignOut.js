import React, {PureComponent} from 'react';

export default class SignOut extends PureComponent {
  render() {
    localStorage.setItem('antd-pro-authority', 'guest');
    sessionStorage.setItem('dochen-auth', '')
    location.href = "#/user/login";
    return (
      <div>退出登录</div>
    );
  }
}
