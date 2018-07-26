import React, {PureComponent} from 'react';
// import {List, Card, Button, Icon} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

// const data = [
//   {title: '中国农业银行', number: '**** **** **** 6073'},
// ];

class BankCard extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  render() {
    return (
      <PageHeaderLayout
        title="发货额度"
      >
        发货额度
      </PageHeaderLayout>
    );
  }
}

export default BankCard;
