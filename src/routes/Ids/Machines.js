import React, {PureComponent} from 'react';
import {Button, Table, Input} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

const columns = [
  {title: '序号', dataIndex: 'id', align: 'center'},
  {title: '日期', dataIndex: 'date', align: 'center'},
  {title: '设备ID数量', dataIndex: 'num', align: 'center'},
  {
    title: '操作',
    dataIndex: '',
    align: 'center',
    render: () => (
      <Button type="primary">详情</Button>
    ),
  },
];

class Element extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [
        {
          id: 1,
          date: '2018-05-29',
          num: '300',
        }, {
          id: 2,
          date: '2018-05-28',
          num: '300',
        }, {
          id: 3,
          date: '2018-05-27',
          num: '300',
        },
      ],
      loading: false,
      idsList: [],
      idsLength: 0,
    };
  }

  render() {
    const {lists, loading, idsList, idsLength} = this.state;
    return (
      <PageHeaderLayout title="产品ID管理">
        <div style={styles.content}>
          <div style={styles.title}>工厂模式</div>
          <div style={styles.row}>
            <Button
              type="primary"
              style={styles.button}
              onClick={() => {
                fetch(`${url}/equipments/mode`, {
                  method: 'POST',
                  body: JSON.stringify({eid: idsList, mode: 1}),
                }).then((res) => {
                  if (res.ok) {
                    res.json().then((data) => {
                      console.log(data);
                    });
                  }
                });
              }}
            >
              导入ID
            </Button>
            <div>设备数量：{idsLength}个 <a href="#/ids/machine-list?type=1" style={styles.link}>详情</a></div>
          </div>
          <Input.TextArea
            rows={10}
            onChange={(e) => {
              let ids = [];
              if (e.target.value) {
                ids = e.target.value.split('\n');
                this.setState({idsList: ids, idsLength: ids.length});
              }
              console.log(JSON.stringify(ids), ids.length);
            }}
          />
        </div>
        <div style={styles.content}>
          <div style={styles.title}>销售模式</div>
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
    marginBottom: 15,
  },
  title: {
    marginBottom: 25,
    fontSize: 20,
    fontWeight: 500,
  },
  row: {
    marginBottom: 25,
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    marginRight: 10,
  },
  link: {
    marginLeft: 5,
  },
};

export default Element;
