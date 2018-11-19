/* eslint-disable no-param-reassign,no-plusplus */
import React, { PureComponent } from 'react';
import { Button, Table, Icon, Radio } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth')
  ? JSON.parse(sessionStorage.getItem('dochen-auth'))
  : '';

class AgentsList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.getMerchantsList();
  }

  // 获取商家列表
  getMerchantsList(type = 0) {
    let getMerchants = `${url}/merchants`;
    getMerchants += auth.mid ? `?mid=${auth.mid}` : '';
    fetch(getMerchants).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            const lists = [];
            info.data.forEach((val, key) => {
              if (type === val.type) {
                val.id = key + 1;
                lists.push(val);
              }
              if (type === 0) {
                val.id = key + 1;
                lists.push(val);
              }
              if (val.type === 1) {
                val.type = '一级';
              } else if (val.type === 2) {
                val.type = '二级';
              } else if (val.type === 3) {
                val.type = '三级';
              }
            });
            this.setState({ lists, loading: false });
          }
        });
      }
    });
  }

  render() {
    const { lists, loading } = this.state;
    const columns = [
      { title: '序号', dataIndex: 'id', width: 80, align: 'center' },
      { title: '注册时间', dataIndex: 'created_at', align: 'center' },
      { title: '单位名称', dataIndex: 'organization', align: 'center' },
      { title: '联系人', dataIndex: 'contact', width: 100, align: 'center' },
      { title: '联系人电话', dataIndex: 'mobile', width: 120, align: 'center' },
      { title: '代理区域', dataIndex: 'area', align: 'center' },
      { title: '代理商等级', dataIndex: 'type', align: 'center' },
      {
        title: '操作',
        dataIndex: 'uuid',
        align: 'center',
        render: (val, infos) => (
          <Button.Group size="small">
            <Button
              onClick={() => {
                location.hash = `/merchants/merchants-profile/?mid=${val}`;
              }}
            >
              详情
            </Button>
            <Button
              hidden={!(localStorage.getItem('antd-pro-authority') === 'vendors') || false}
              onClick={() => {
                location.hash = `/merchants/add-edit-merchants/?mid=${val}`;
              }}
            >
              编辑
            </Button>
            {infos.state !== 0 ? (
              <Button
                hidden={!(localStorage.getItem('antd-pro-authority') === 'vendors') || false}
                onClick={() => {
                  const delMerchants = `${url}/merchants/${val}`;
                  fetch(delMerchants, {
                    method: 'DELETE',
                  }).then(res => {
                    if (res.ok)
                      res.json().then(info => {
                        if (info.status) this.getMerchantsList();
                      });
                  });
                }}
              >
                注销
              </Button>
            ) : (
              ''
            )}
          </Button.Group>
        ),
      },
    ];
    return (
      <PageHeaderLayout title="商家列表">
        <div style={{ padding: 20, backgroundColor: '#fff' }}>
          <div hidden={!(localStorage.getItem('antd-pro-authority') === 'vendors') || false}>
            <Button
              type="primary"
              style={{ marginBottom: 20, marginRight: 20 }}
              onClick={() => {
                location.hash = '/merchants/add-edit-merchants';
              }}
            >
              <Icon type="plus" /> 添加商家
            </Button>
            <Radio.Group
              name="radiogroup"
              defaultValue={0}
              onChange={e => {
                console.log(e.target.value);
                this.getMerchantsList(e.target.value);
              }}
            >
              <Radio value={0}>全部</Radio>
              <Radio value={1}>一级代理商</Radio>
              <Radio value={2}>二级代理商</Radio>
              <Radio value={3}>三级代理商</Radio>
            </Radio.Group>
          </div>
          <Table rowKey="id" columns={columns} dataSource={lists} loading={loading} />
        </div>
      </PageHeaderLayout>
    );
  }
}

export default AgentsList;
