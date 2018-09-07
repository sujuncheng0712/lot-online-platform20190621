/* eslint-disable no-param-reassign,no-plusplus,no-script-url,no-undef */
import React, {PureComponent} from 'react';
import {Table, Badge, Divider, Input, Button, Icon, message, Popconfirm, Menu, Dropdown, Popover, Select} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

class EquipmentsList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      userLists: [],
      dealersLists: [],
      agentsLists: [],
      loading: true,

      codeId: '',
      deviceId: '',
      agentsName: '',
    };
  }

  componentWillMount() {
    this.getAgentsList();
    this.getDealersList();
    this.getUsersList();
    this.getEquipmentsList();
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
  getDealersList() {
    const dealersListUrl = `${url}/dealers`;
    fetch(dealersListUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({dealersLists: info.data});
        });
      }
    });
  }

  // 获取用户列表
  getUsersList() {
    const usersListUrl = `${url}/users`;
    fetch(usersListUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            this.setState({userLists: info.data});
          }
        });
      }
    });
  }

  // 获取设备列表
  getEquipmentsList(type = '', uuid = '') {

    const authData = JSON.parse(sessionStorage.getItem('dochen-auth'));

    let equipmentsListUrl = `${url}/equipments`;
    equipmentsListUrl += authData.type === 'vendors' ? type === 'agents' ? `?aid=${uuid}` : `?did=${uuid}` : authData.type === 'agents' ? `?aid=${authData.uuid}` : `?did=${authData.uuid}`;

    fetch(equipmentsListUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            const lists = [];
            info.data.forEach((val) => {
              if (val.activation_code) lists.push(val);
            });
            this.setState({lists, loading: false});
          } else {
            this.setState({lists: [], loading: false});
            message.warning(`提示：[${info.message}]`);
          }
        });
      }
    });
  }

  // 获取搜索后的列表
  searchList() {
    const {lists, codeId, deviceId, agentsName} = this.state;
    const arr = [];
    lists.forEach((val) => {
      if (val.activation_code === codeId || val.eid === deviceId || val.agents === agentsName) arr.push(val);
    });

    if (arr.length === 0) message.error('没找到对应的数据');

    this.setState({lists: arr.length > 0 ? arr : lists});
  }

  render() {
    const {lists, userLists, dealersLists, agentsLists, loading} = this.state;

    const onLine = [];
    const versionArr = [];
    let k = 1;
    lists.forEach((val) => {
      userLists.forEach((user) => {
        if (val.uid === user.uid) val.mobile = user.mobile;
      });

      dealersLists.forEach((dealers) => {
        if (val.relation.did === dealers.did) val.contact = dealers.contact;
      });

      agentsLists.forEach((agents) => {
        if (val.relation.aid === agents.aid) {
          val.agents = agents.contact;
          if (!val.relation.did) {
            val.contact = agents.contact;
          }
        }
      });

      if(!val.relation.aid){
        val.agents = 'DGK智能平台';
      }

      if (val.online_at && !val.offline_at) onLine.push(val);

      versionArr.push(val.version || '0.0.0');

      val.id = k;
      k++;
    });

    const notUpgraded = [];
    versionArr.forEach((val) => {
      if (val < versionArr.sort()[versionArr.length - 1]) notUpgraded.push(val);
    });

    const menu = (info) => (
      <Menu>
        <Menu.Item>
          <Popconfirm
            placement="left"
            title="确认要退货吗？确认之后会把机器的所有信息重置"
            okText="确认"
            cancelText="取消"
            onConfirm={() => {

              let returnUrl = `${url}/equipments`;
              returnUrl += `/${info.eid}`;
              returnUrl += `/return`;

              fetch(returnUrl, {
                method: 'POST',
                body: JSON.stringify({eid: info.eid}),
              }).then((res) => {
                if (res.ok) {
                  res.json().then((data) => {
                    if (data.status) {
                      message.success('成功');
                      this.getEquipmentsList();
                    } else {
                      message.error(`错误：[${data.message}]`);
                    }
                  });
                }
              });
            }}
          >
            <a href="javascript:;">{info.activation_code && info.activation_code.length > 16 ? '退货退单' : '解除激活'}</a>
          </Popconfirm>
        </Menu.Item>
        {
          info.activation_code && info.activation_code.length > 16 ? (
            <Menu.Item>
              <Popconfirm
                placement="left"
                title="确认要换货吗？"
                okText="确认"
                cancelText="取消"
                onConfirm={() => {

                  let returnUrl = `${url}/equipments`;
                  returnUrl += `/${info.eid}`;
                  returnUrl += `/replace`;

                  fetch(returnUrl, {
                    method: 'POST',
                    body: JSON.stringify({
                      eid: info.eid,
                      oid: info.activation_code,
                    }),
                  }).then((res) => {
                    if (res.ok) {
                      res.json().then((data) => {
                        if (data.status) {
                          message.success('解除成功');
                          this.getEquipmentsList();
                        } else {
                          message.error(`解除失败失败：[${data.message}]`);
                        }
                      });
                    }
                  });
                }}
              >
                <a href="javascript:;">解除激活</a>
              </Popconfirm>
            </Menu.Item>
          ) : ''
        }
      </Menu>
    );

    const columns = [
      {title: '序号', dataIndex: 'id', align: 'center'},
      {title: '激活时间', dataIndex: 'activation_at', align: 'center'},
      {title: '设备ID', dataIndex: 'eid', align: 'center'},
      {title: '型号', dataIndex: 'model', align: 'center'},
      {
        title: '版本号',
        dataIndex: 'version',
        align: 'center',
        render: (val, info) => {
          return (
            <div>
              <span>V {val || '0.0.0'}</span>
              &nbsp;
              {
                ((val || '0.0.0') < versionArr.sort()[versionArr.length - 1]) ? (
                  <Icon
                    type="arrow-up"
                    style={{color: '#52c41a', cursor: 'pointer'}}
                    onClick={() => {
                      let updateUrl = `${url}/equipments`;
                      updateUrl += `/${info.eid}`;
                      updateUrl += `/upgrade`;

                      if (info.online_at && !info.offline_at) {
                        fetch(updateUrl, {
                          method: 'POST',
                          body: JSON.stringify({eid: info.eid}),
                        }).then((res) => {
                          if (res.ok) {
                            res.json().then((data) => {
                              if (data.status) {
                                message.success('更新请求成功');
                                this.getEquipmentsList();
                              } else {
                                message.error(`更新请求失败：[${data.message}]`);
                              }
                            });
                          }
                        });
                      } else {
                        message.error(`更新请求失败：[设备不在线]`);
                      }
                    }}
                  />
                ) : ''
              }
            </div>
          );
        },
      },
      {width: 190, title: '激活码/订单号', dataIndex: 'activation_code', align: 'center', render: val => val || '-'},
      {
        title: '在线状态',
        dataIndex: '',
        align: 'center',
        render: info => (info.online_at && !info.offline_at) ? (
          <Badge status="success" text="在线" />
        ) : (
          <Badge status="default" text="离线" />
        ),
      },
      localStorage.getItem('antd-pro-authority') === 'vendors' ? {
        title: '使用人',
        dataIndex: 'mobile',
        align: 'center',
        render: (val, info) => (
          <Popover placement="top" title="用户ID" content={info.uid} trigger="click">
            {val}
          </Popover>
        ),
      } : {title: '使用人', dataIndex: 'mobile', align: 'center'},
      {title: '推荐人', dataIndex: 'contact', align: 'center'},
      {title: '代理商', dataIndex: 'agents', align: 'center'},
      localStorage.getItem('antd-pro-authority') === 'vendors' ? {
        title: '操作',
        dataIndex: '',
        align: 'center',
        render: info => (
          <Dropdown overlay={menu(info)}>
            <span style={{color: '#ff8800', cursor: 'pointer'}}>
              操作 <Icon type="down" />
            </span>
          </Dropdown>
        ),
      } : {},
    ];

    return (
      <PageHeaderLayout title="已激活设备列表">
        <div style={styles.search}>
          <div style={styles.searchRow}>
            <div style={styles.searchTit}>激活码/订单号：</div>
            <div style={{width: 300}}>
              <Input
                placeholder="请输入激活码或订单编号"
                onChange={(e) => {
                  this.setState({codeId: e.target.value});
                }}
              />
            </div>
          </div>
          <div style={styles.searchRow}>
            <div style={styles.searchTit}>设备ID：</div>
            <div style={{width: 300}}>
              <Input
                placeholder="请输入需要查找的设备ID"
                onChange={(e) => {
                  this.setState({deviceId: e.target.value});
                }}
              />
            </div>
          </div>
          <Button type="primary" onClick={this.searchList.bind(this)}><Icon type="search" /> 查找</Button>
        </div>
        {localStorage.getItem('antd-pro-authority') === 'vendors' ? (
          <div style={styles.search}>
            <div style={styles.searchRow}>
              <div style={styles.searchTit}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;代理商：</div>
              <div style={{width: 300}}>
                <Select
                  defaultValue="请选择"
                  style={{width: 300}}
                  onChange={(value) => {
                    this.getEquipmentsList(value.split(',')[0], value.split(',')[1]);
                  }}
                >
                  <Select.OptGroup label="代理商">
                    {agentsLists.map((item) => (
                      <Select.Option key={`agents,${item.aid}`}>{item.contact}({item.mobile})</Select.Option>
                    ))}
                  </Select.OptGroup>
                </Select>
              </div>
            </div>
            <div style={styles.searchRow}>
              <div style={styles.searchTit}>经销商：</div>
              <div style={{width: 300}}>
                <Select
                  defaultValue="请选择"
                  style={{width: 300}}
                  onChange={(value) => {
                    this.getEquipmentsList(value.split(',')[0], value.split(',')[1]);
                  }}
                >
                  <Select.OptGroup label="经销商">
                    {dealersLists.map((item) => (
                      <Select.Option key={`dealers,${item.did}`}>{item.contact}({item.mobile})</Select.Option>
                    ))}
                  </Select.OptGroup>
                </Select>
              </div>
            </div>
          </div>
        ) : ''}
        <div style={{padding: 20, backgroundColor: '#fff'}}>
          <div style={{marginTop: 15, textAlign: 'left'}}>
            <Badge status="success" text={`已激活设备共${lists.length}台`} />
            <Divider type="vertical" />
            <Badge status="success" text={`在线设备共${onLine.length}台`} />
            <Divider type="vertical" />
            <Badge status="processing" text={`设备在线率${Math.ceil(onLine.length / lists.length * 100) || 0}%`} />
            <Divider type="vertical" />
            <Badge status="error" text={`未升级设备${notUpgraded.length}台`} />
          </div>
        </div>
        <div style={{padding: 20, backgroundColor: '#fff'}}>
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
  search: {
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
    display: 'flex',
  },
  searchRow: {
    marginRight: 20,
    display: 'flex',
    alignItems: 'center',
  },
  searchTit: {
    paddingRight: 5,
  },
};

export default EquipmentsList;
