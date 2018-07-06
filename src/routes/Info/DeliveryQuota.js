import React, {PureComponent} from 'react';
import {List, Card, Button, Icon} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const data = [
  {title: '中国农业银行', number: '**** **** **** 6073'},
];

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
        <List
          grid={{gutter: 24, lg: 3, md: 2, sm: 1, xs: 1}}
          dataSource={[...data, '']}
          renderItem={item =>
            item ? (
              <List.Item>
                <Card>
                  <p>{item.title}</p>
                  <p>{item.number}</p>
                </Card>
              </List.Item>
            ) : (
              <List.Item>
                <Button type="dashed" style={{width: '100%', height: 120}}>
                  <Icon type="plus" /> 绑定银行卡
                </Button>
              </List.Item>
            )}
        />
      </PageHeaderLayout>
    );
  }
}

export default BankCard;
