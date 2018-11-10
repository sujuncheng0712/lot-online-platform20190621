/* eslint-disable no-param-reassign,no-plusplus,no-script-url,no-undef */
import React, {PureComponent} from 'react';
import {Table, Badge, Divider, Input, Button, Icon, message, Popconfirm, Menu, Dropdown, Popover, Select, Row, Col} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth') ? JSON.parse(sessionStorage.getItem('dochen-auth')) : '';

class EquipmentsList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      merchantsList: [],
      userLists: [],
      lists: [],
      loading: true,
      deviceId: '',
      codeId: '',
      merchantsContact: '',
    };
  }

  componentWillMount() {
    this.getMerchantsList();
    this.getUsersList();
    this.getEquipmentsList(auth.mid);
  }

  // 获取商家列表
  getMerchantsList() {
    const getMerchants = `${url}/merchants`;
    fetch(getMerchants).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({merchantsList: info.data});
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
  getEquipmentsList(mid) {
    let getEquipments = `${url}/equipments`;
    getEquipments += mid ? `?mid=${mid}` : '';
    fetch(getEquipments).then((res) => {
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
    const {lists, codeId, deviceId} = this.state;
    const arr = [];
    lists.forEach((val) => {
      if (val.activation_code === codeId || val.uuid === deviceId) arr.push(val);
    });

    if (arr.length === 0) message.error('没找到对应的数据');

    this.setState({lists: arr.length > 0 ? arr : lists});
  }

  // 搜索商家的机器
  searchMerchantsList() {
    const {merchantsList, merchantsContact} = this.state;
    merchantsList.forEach((val) => {
      if (val.contact === merchantsContact) {
        message.info(`正在搜索${merchantsContact}的设备，请稍后`);
        this.getEquipmentsList(val.uuid);
      }
    });
  }

  render() {
    const {merchantsList, userLists, lists, loading} = this.state;

    // 翻译使用用户
    const onLine = [];
    const versionArr = [];
    lists.forEach((val) => {
      userLists.forEach((user) => {
        if (val.uid === user.uuid) val.mobile = user.mobile;
      });
      if (val.online_at && !val.offline_at) onLine.push(val);
      versionArr.push(val.version || '0.0.0');
    });

    // 检索版本号
    const notUpgraded = [];
    versionArr.forEach((val) => {
      if (val < versionArr.sort()[versionArr.length - 1]) notUpgraded.push(val);
    });

    // 功能按钮
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
              returnUrl += `/${info.uuid}`;
              returnUrl += `/return`;

              fetch(returnUrl, {
                method: 'POST',
                body: JSON.stringify({eid: info.uuid}),
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
                  returnUrl += `/${info.uuid}`;
                  returnUrl += `/replace`;

                  fetch(returnUrl, {
                    method: 'POST',
                    body: JSON.stringify({
                      eid: info.uuid,
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

    // 表格列的配置描述
    const columns = [
      {title: '序号', dataIndex: 'id', align: 'center'},
      {title: '激活时间', dataIndex: 'activation_at', align: 'center'},
      {title: '设备ID', dataIndex: 'uuid', align: 'center'},
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
          <Badge status="success" text="在线"/>
        ) : (
          <Badge status="default" text="离线"/>
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
      {
        title: '推荐人', dataIndex: 'merchant', align: 'center', render: val => {
        const merchant = val.m3 || val.m2 || val.m1;
        const contact = merchant ? merchant.contact : '--';
        return contact;
      }
      },
      {title: '代理商', dataIndex: 'merchant', align: 'center', render: val => val.m1 ? val.m1.contact : '--'},
      localStorage.getItem('antd-pro-authority') === 'vendors' ? {
        title: '操作',
        align: 'center',
        render: info => (
          <Dropdown overlay={menu(info)}>
            <span style={{color: '#ff8800', cursor: 'pointer'}}>
              操作 <Icon type="down"/>
            </span>
          </Dropdown>
        ),
      } : {},
    ];

    return (
      <PageHeaderLayout title="已激活设备列表">
        <div style={styles.content}>
          <Row>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>
                  设备ID：
                </Col>
                <Col span={17}>
                  <Input
                    placeholder="请输入需要查找的设备ID"
                    onChange={(e) => this.setState({deviceId: e.target.value})}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>
                  激活码/订单号：
                </Col>
                <Col span={17}>
                  <Input
                    placeholder="请输入激活码或订单编号"
                    onChange={(e) => this.setState({codeId: e.target.value})}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={4}>
              <Button
                type="primary"
                onClick={this.searchList.bind(this)}
              >
                搜索设备
              </Button>
            </Col>
          </Row>
          <br/>
          <Row hidden={!(localStorage.getItem("antd-pro-authority") === "vendors") || false}>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>
                  商家：
                </Col>
                <Col span={17}>
                  <Select
                    defaultValue="请选择"
                    style={{width: '100%'}}
                    onChange={(value) => this.getEquipmentsList(value)}
                  >
                    <Select.OptGroup label="代理商">
                      {merchantsList.map((item) => (
                        <Select.Option key={item.uuid}>{item.contact}({item.mobile})</Select.Option>
                      ))}
                    </Select.OptGroup>
                  </Select>
                </Col>
              </Row>
            </Col>
            <Col span={10}>
              <Row>
                <Col span={6} style={styles.tit}>
                  按商家姓名搜索：
                </Col>
                <Col span={17}>
                  <Input
                    placeholder="请输入商家姓名"
                    onChange={(e) => this.setState({merchantsContact: e.target.value})}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={4}>
              <Button
                type="primary"
                onClick={this.searchMerchantsList.bind(this)}
              >
                搜索商家
              </Button>
            </Col>
          </Row>
        </div>
        <div style={{padding: 20, backgroundColor: '#fff'}}>
          <div style={{marginTop: 15, textAlign: 'left'}}>
            <Badge status="success" text={`已激活设备共${lists.length}台`}/>
            <Divider type="vertical"/>
            <Badge status="success" text={`在线设备共${onLine.length}台`}/>
            <Divider type="vertical"/>
            <Badge status="processing" text={`设备在线率${Math.ceil(onLine.length / lists.length * 100) || 0}%`}/>
            <Divider type="vertical"/>
            <Badge status="error" text={`未升级设备${notUpgraded.length}台`}/>
          </div>
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
};

export default EquipmentsList;
