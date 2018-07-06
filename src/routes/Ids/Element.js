import React, {PureComponent} from 'react';
import {Button, Row, Col, Table} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const columns = [
  {title: '序号', dataIndex: 'id', align: 'center'},
  {title: '激活日期', dataIndex: '', align: 'center'},
  {title: '滤芯ID', dataIndex: '', align: 'center'},
  {title: '激活滤芯', dataIndex: '', align: 'center'},
  {title: '用户', dataIndex: '', align: 'center'},
  {title: '注册手机', dataIndex: '', align: 'center'},
  {title: '推荐人', dataIndex: '', align: 'center'},
  {title: '代理商', dataIndex: '', align: 'center'},
];

class Machines extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      loading: false,
    };
  }

  render() {
    const {lists, loading} = this.state;
    return (
      <PageHeaderLayout title="销售模式">
        <div style={styles.content}>
          <div style={styles.title}>未激活</div>
          <Button type="primary" style={styles.button}>导入ID</Button>
          <Row type="flex" justify="start">
            <Col span={6}>剩余PPC：500个 <a href="/">详情</a></Col>
            <Col span={6}>剩余CPP：500个 <a href="/">详情</a></Col>
            <Col span={6}>剩余RO：500个 <a href="/">详情</a></Col>
          </Row>
        </div>
        <div style={styles.content}>
          <div style={styles.title}>已激活</div>
          <Button type="primary" style={styles.button}>导入ID</Button>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={lists}
            loading={loading}
            style={{marginTop: 20}}
          />
        </div>
      </PageHeaderLayout>
    );
  }
}

const styles = {
  content: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 25,
  },
  title: {
    marginBottom: 25,
    fontSize: 20,
    fontWeight: 500,
  },
  button: {
    marginBottom: 15,
  },
};

export default Machines;
