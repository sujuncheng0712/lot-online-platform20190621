import React, {PureComponent} from 'react';
import {Table} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const columns = [
  {title: '序号', dataIndex: ''},
  {title: '日期', dataIndex: ''},
  {title: '设备ID', dataIndex: ''},
  {title: '模式', dataIndex: ''},
];

class Element extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      loading: false,
    };
  }

  componentDidMount() {
    const {location: {search}} = this.props;
    const type = search.slice(1).split('=')[1];
    console.log(type);
    // const authData = JSON.parse(sessionStorage.getItem('dochen-auth'));
    // fetch(`http://iot.dochen.cn/api/equipments${authData.type === 'vendors' ? '' : authData.type === 'agents' ? `?aid=${authData.uuid}` : `?did=${authData.uuid}`}`).then((res) => {
    //   if (res.ok) {
    //     res.json().then((info) => {
    //       if (info.status) {
    //         this.setState({lists: info.data});
    //       }
    //     });
    //   }
    // });
  }

  render() {
    const {lists, loading} = this.state;
    return (
      <PageHeaderLayout title="ID管理">
        <div style={styles.content}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={lists}
            loading={loading}
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
    marginBottom: 15,
  },
};

export default Element;
