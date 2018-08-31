/* eslint-disable no-param-reassign,no-plusplus,no-underscore-dangle */
import React, {PureComponent} from 'react';
import {Button, Table, Icon, Select, message} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';

const columns = [
  {width: 80, title: '序号', dataIndex: 'id', align: 'center'},
  {title: '开始时间', dataIndex: 'created_at', align: 'center'},
  {title: '单位名称', dataIndex: 'organization', align: 'center'},
  {width: 100, title: '联系人', dataIndex: 'contact', align: 'center'},
  {width: 120, title: '联系人电话', dataIndex: 'mobile', align: 'center'},
  {title: '所属区域', dataIndex: 'area', align: 'center'},
  {width: 160, title: '所属代理商', dataIndex: 'superior', align: 'center'},
  {
    title: '操作',
    dataIndex: 'did',
    align: 'center',
    render: val => (
      <Button
        type="primary"
        onClick={() => {
          location.href = `#/vendors/ad-profile/?role=dealers&id=${val}`
        }}
      >
        详情
      </Button>
    ),
  },
];

class DealerList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      loading: true,
      agentsLists: [],
    };
  }

  componentDidMount() {
    this.getAgentsList();
    this.getDealersList();
  }

  // 获取代理商列表
  getAgentsList() {
    const agentsListUrl = `${url}/agents`;
    fetch(agentsListUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({agentsLists: info.data});
        });
      }
    });
  }

  // 获取经销商列表
  getDealersList(type = '', uuid = '') {
    let getDealersList = `${url}/dealers`;
    let _type;
    switch (type) {
      case 'agents':
        _type = `?aid=${uuid}`;
        break;
      case 'dealers':
        _type = `?did=${uuid}`;
        break;
      default:
        _type = '';
    }
    getDealersList += auth.type === 'vendors' ? _type : auth.type === 'agents' ? `?aid=${auth.uuid}` : `?did=${auth.uuid}`;

    fetch(getDealersList).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            info.data.forEach((val,k) => {
              val.id = k + 1;
            });
            this.setState({lists: info.data, loading: false});
          } else {
            this.setState({agentsLists: []});
            message.warning(`提示：[${info.message}]`);
          }
        });
      }
    });
  }

  render() {
    const {lists, loading, agentsLists} = this.state;

    lists.forEach((val) => {
      agentsLists.forEach((Aval) => {
        if (val.superior === Aval.aid) val.superior = Aval.contact;
      });
      if (!val.superior) val.superior = 'DGK 智能平台';
    });

    return (
      <PageHeaderLayout title="经销商列表">
        {localStorage.getItem('antd-pro-authority') === 'vendors' ? (
          <div style={styles.search}>
            <div style={styles.searchRow}>
              <div style={styles.searchTit}>&nbsp;&nbsp;&nbsp;&nbsp;代理商：</div>
              <div style={{width: 300}}>
                <Select
                  defaultValue="请选择"
                  style={{width: 300}}
                  onChange={(value) => this.getDealersList(value.split(',')[0], value.split(',')[1])}
                >
                  <Select.OptGroup label="代理商">
                    {agentsLists.map((item) => (
                      <Select.Option value={`agents,${item.aid}`}>{item.contact}({item.mobile})</Select.Option>
                    ))}
                  </Select.OptGroup>
                </Select>
              </div>
            </div>
          </div>
        ) : ''}
        <div style={{padding: 20, backgroundColor: '#fff'}}>
          <Button
            type="primary"
            style={{marginBottom: 20}}
            onClick={() => {
              location.href = '#/vendors/ad-add/?role=dealers'
            }}
            hidden={(localStorage.getItem("antd-pro-authority") === "agents" || localStorage.getItem("antd-pro-authority") === "dealers") || false}
          >
            <Icon type="plus" /> 添加经销商
          </Button>
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

const styles={
  search: {
    width: '100%',
    padding: '10px 20px',
    backgroundColor: '#fff',
    display: 'flex',
  },
  searchRow: {
    marginRight: 20,
    display: 'flex',
    alignItems: 'center',
  },
  searchTit: {
    width: 80,
  },
};

export default DealerList;