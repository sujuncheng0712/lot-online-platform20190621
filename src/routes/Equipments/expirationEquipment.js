import React, { PureComponent } from 'react';
import { Input, Button, message, Select, Row, Col, Tabs } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

class expirationEquipment extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  render() {
    return (
      <PageHeaderLayout title="滤芯寿命列表">
        <div style={styles.content}>
          <Row>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>设备ID：</Col>
                <Col span={17}>
                  <Input
                    placeholder="请输入需要查找的设备ID"
                  />
                </Col>
              </Row>
            </Col>
            <Col span={4}>
              <Button type="primary">搜索</Button>
            </Col>
          </Row>
          <br />
          <Row hidden={!(localStorage.getItem('antd-pro-authority') === 'vendors') || false}>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>
                  代理商：
                </Col>
                <Col span={17}>
                  <Select
                    defaultValue="请选择"
                    style={{ width: '100%' }}
                  >
                    <Select.Option value="1"></Select.Option>
                  </Select>
                </Col>
              </Row>
            </Col>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>
                  经销商：
                </Col>
                <Col span={17}>
                  <Select
                    defaultValue="请选择"
                    style={{ width: '100%' }}
                  >
                    <Select.Option value="1"></Select.Option>
                  </Select>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        <div style={styles.content}>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="滤芯寿命情况列表" key="1">
              {}
            </Tabs.TabPane>
            <Tabs.TabPane tab="滤芯寿命到期列表" key="2">

            </Tabs.TabPane>
          </Tabs>
        </div>
      </PageHeaderLayout>
    )
  }
}

const styles = {
  content: {
    backgroundColor: '#fff',
    padding: '20px',
    marginBottom: 15,
  },
  tit: {
    minWidth: 115,
    textAlign: 'right',
    lineHeight: '32px',
  },
};

export default expirationEquipment;
