/* eslint-disable no-param-reassign,no-plusplus,no-script-url,no-undef, prefer-rest-params */
import React, { PureComponent } from 'react';
import {
  Table,
  Input,
  Button,
  Icon,
  message,
  Popconfirm,
  Menu,
  Dropdown,
  Popover,
  Row,
  Col,
  Select,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const identity = localStorage.getItem('antd-pro-authority');
const auth = sessionStorage.getItem('dochen-auth')
  ? JSON.parse(sessionStorage.getItem('dochen-auth'))
  : '';

function injectUnount (target){
  // 改装componentWillUnmount，销毁的时候记录一下
  const next = target.prototype.componentWillUnmount;
  target.prototype.componentWillUnmount = function () {
    if (next) next.call(this, ...arguments);
    this.unmount = true
  };
  // 对setState的改装，setState查看目前是否已经销毁
  const {setState} = target.prototype;
  target.prototype.setState = function () {
    if ( this.unmount ) return ;
    setState.call(this, ...arguments)
  }
}
@injectUnount
class FilterElementsList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      loading: true,
      devicesList: [],  // 设备列表
      usersList: [],  // 用户列表
      agentList: [],  // 代理商列表
      referrerList: [],  // 经销商列表
      codeId: '',
      filterName: '',
    };
  }

  componentWillMount() {
    this.getEquipmentsList();
    this.getUsersList();
    this.getMerchantsList();
    this.getFilterElementList();
  }

  // 获取设备列表
  getEquipmentsList(mid) {
    let getEquipments = `${url}/devices`;
    getEquipments += mid ? `?mid=${mid}` : '';
    fetch(getEquipments).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            const devicesList = [];
            info.data.forEach(val => {
              devicesList.push(val);
            });
            this.setState({ devicesList });
          }
        });
      }
    });
  }

  // 获取用户列表
  getUsersList() {
    let getUsersUrl = `${url}/users`;
    getUsersUrl += auth.mid ? `?mid=${auth.mid}` : '';
    fetch(getUsersUrl).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            const usersList = [];
            info.data.forEach(val => {
              usersList.push(val);
            });
            this.setState({usersList});
          }
        });
      }
    });
  }

  // 获取商家列表
  getMerchantsList() {
    const getMerchantUrl = `${url}/merchants`;
    fetch(getMerchantUrl).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            const agentList = [];
            const referrerList = [];
            info.data.forEach(val => {
              if (val.type === 1) agentList.push(val);
              if (val.type === 2) referrerList.push(val);
            });
            this.setState({agentList, referrerList});
          }
        });
      }
    });
  }

  // 获取滤芯激活码列表
  getFilterElementList() {
    let getUrl = `${url}/filter_cdkey`;
    getUrl += auth.mid ? `?mid=${auth.mid}` : '';
    fetch(getUrl, {
      headers: identity === 'vendors' ? {
        vid: 'f40d03342db411e8bc9600163e0851fd',
      } : {},
    }).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            const lists = [];
            info.data.forEach(val => {
              if (val.eptags === 'DCL01') val.fliterName = 'PPC复合PP棉滤芯';
              if (val.eptags === 'DCL02') val.fliterName = 'CPP复合活性炭滤芯';
              if (val.eptags === 'DCL09') val.fliterName = 'RO反渗透滤芯';
              if (val.confirm_at) lists.push(val);
            });
            this.setState({lists, loading: false});
          } else {
            this.setState({ loading: false });
            message.warning(`提示：[${info.message}]`);
          }
        });
      }
    });
  }

  // 搜索激活码或滤芯名称
  searchList() {
    const { lists, codeId, filterName } = this.state;
    const arr = [];
    lists.forEach(val => {
      if (val.activation_code === codeId) arr.push(val);
      if (val.fliterName === filterName) arr.push(val);
    });

    if (arr.length === 0) message.error('没找到对应的数据');

    this.setState({ lists: arr.length > 0 ? arr : lists });
  }

  // 根据下拉菜单项选择代理商或经销商
  searchMerchant(selectValue) {
    const {lists} = this.state;
    const arr = [];
    lists.forEach(val => {
      if (val.mid === selectValue) arr.push(val);
    });
    if (arr.length === 0) message.error('没找到对应的数据');

    this.setState({ lists: arr.length > 0 ? arr : [], loading: false });
  }

  render() {
    const { lists, devicesList, usersList, loading, agentList, referrerList } = this.state;

    let k = 1;
    lists.forEach(fItem => {
      fItem.id = k;
      k += 1;
      // 把 devicesList 的设备型号和 usersList 的用户姓名、手机号，推荐人和代理商加进 list 里面
      devicesList.forEach(dItem => {
        if (dItem.eid === fItem.eid) {
          fItem.model = dItem.model;
        }
      });
      usersList.forEach(uItem => {
        if (uItem.uuid === fItem.uid) {
          fItem.name = uItem.name;
          fItem.mobile = uItem.mobile;
          const referrer1 = uItem.merchant.m1 ? uItem.merchant.m1.contact : '';
          const referrer2 = uItem.merchant.m2 ? uItem.merchant.m2.contact : '';
          fItem.referrer = referrer2 || referrer1;
          if (uItem.merchant.m1) {
            fItem.agent = uItem.merchant.m1.contact;
          }
        }
      });
    });

    // 功能按钮
    const menu = info => (
      <Menu>
        <Menu.Item>
          <Popconfirm
            placement="left"
            title="确认解除滤芯激活？"
            okText="确认"
            cancelText="取消"
            onConfirm={() => {
              let returnUrl = `${url}/filter_element`;
              returnUrl += `/${info.eid}/deactivate`;

              fetch(returnUrl, {
                method: 'POST',
                headers: {
                  vid: 'f40d03342db411e8bc9600163e0851fd',
                },
                body: JSON.stringify({
                  uid: info.uid,
                  tags: info.eptags,
                  code: info.code,
                }),
              }).then(res => {
                if (res.ok) {
                  res.json().then(data => {
                    if (data.status) {
                      message.success('解除成功');
                      window.location.reload();
                    } else {
                      message.error(`错误：[${data.message}]`);
                    }
                  });
                }
              });
            }}
          >
            <a href="javascript:;">
              解除激活
            </a>
          </Popconfirm>
        </Menu.Item>
      </Menu>
    );

    // 表格列的配置描述
    const columns = [
      { title: '序号', dataIndex: 'id', align: 'center' },
      { title: '激活时间', dataIndex: 'confirm_at', align: 'center' },
      { title: '设备ID', dataIndex: 'eid', align: 'center' },
      { title: '产品型号',
        dataIndex: 'model',
        align: 'center',
        render: val => val || '--',
      },
      {
        title: '滤芯名称',
        dataIndex: 'fliterName',
        align: 'center',
      },
      { title: '激活码', dataIndex: 'code', align: 'center' },
      localStorage.getItem('antd-pro-authority') === 'vendors'
        ? {
          title: '使用人',
          dataIndex: '',
          align: 'center',
          render: (val, info) => (
            <Popover placement="top" title="用户ID" content={info.uid} trigger="click">
              {info.name || info.mobile || '--'}
            </Popover>
          ),
        }
        : { title: '使用人',
          dataIndex: '',
          align: 'center',
          render: (val, info) => info.name || info.mobile || '--',
          },
      {
        title: '推荐人',
        dataIndex: 'referrer',
        align: 'center',
        render: val => val || '--',
      },
      {
        title: '代理商',
        dataIndex: 'agent',
        align: 'center',
        render: val => val || '--',
      },
      localStorage.getItem('antd-pro-authority') === 'vendors'
        ? {
          title: '操作',
          align: 'center',
          render: info => (
            <Dropdown overlay={menu(info)}>
              <span style={{ color: '#ff8800', cursor: 'pointer' }}>
                操作 <Icon type="down" />
              </span>
            </Dropdown>
          ),
        }
        : {},
    ];

    return (
      <PageHeaderLayout title="已激活滤芯列表">
        <div style={styles.content}>
          <Row>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>激活码：</Col>
                <Col span={17}>
                  <Input
                    placeholder="请输入需要查找的激活码"
                    onChange={e => this.setState({ codeId: e.target.value })}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>滤芯名称：</Col>
                <Col span={17}>
                  <Input
                    placeholder="请输入需要查找的滤芯名称"
                    onChange={e => this.setState({ filterName: e.target.value })}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={4}>
              <Button type="primary" onClick={this.searchList.bind(this)}>搜索</Button>
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
                    showSearch
                    placeholder="请输入或从下拉列表中选择需要查找的代理商"
                    optionFilterProp="children"
                    onChange={selectValue => {
                      this.setState({loading: true});
                      this.searchMerchant(selectValue)
                    }}
                    style={{ width: '100%' }}
                  >
                    {agentList.map(item => (
                      <Select.Option key={item.uuid}>
                        {item.contact}
                      </Select.Option>
                    ))}
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
                    showSearch
                    placeholder="请输入或从下拉列表中选择需要查找的经销商"
                    optionFilterProp="children"
                    onChange={selectValue => {
                      this.setState({loading: true});
                      this.searchMerchant(selectValue)
                    }}
                    style={{ width: '100%' }}
                  >
                    {referrerList.map(item => (
                      <Select.Option key={item.uuid}>
                        {item.contact}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        <div style={styles.content}>
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={lists}
          />
        </div>
      </PageHeaderLayout>
    );
  }
}

const styles = {
  content: {
    backgroundColor: '#fff',
    padding: '20px',
    marginBottom: 15,
  },
  tit: {
    minWidth: 110,
    textAlign: 'right',
    lineHeight: '32px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '16px 0',
  },
};

export default FilterElementsList;
