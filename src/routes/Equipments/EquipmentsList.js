/* eslint-disable no-param-reassign,no-plusplus,no-script-url,no-undef */
import React, { PureComponent } from 'react';
import {
  Table,
  Badge,
  Divider,
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
  Pagination,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const auth = sessionStorage.getItem('dochen-auth')
  ? JSON.parse(sessionStorage.getItem('dochen-auth'))
  : '';

class EquipmentsList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      loading: true,
      inputValue: '',
      totalNum: 0, // 总共激活数量
      onlineNum: 0, // 在线设备数量
      notUpgradedNum: 0, // 未升级设备数量
      isUsedPaginationSearch: true,
      latestVersion: '', // 最新的版本号
      deviceId: '',
      codeId: '',
      curPage: 1,
    };
  }

  componentWillMount() {
    // 如果是管理员登录使用分页获取数据，否则根据商家 ID 获取数据
    const isVendor = localStorage.getItem('antd-pro-authority');
    if (isVendor === 'vendors') {
      this.getDevicesByPagination(0, 10);
    } else {
      this.getEquipmentsList(auth.mid);
    }
  }

  // 获取设备列表
  getEquipmentsList(mid) {
    let getEquipments = `${url}/devices`;
    getEquipments += mid ? `?mid=${mid}` : '';
    fetch(getEquipments).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            const lists = [];
            let k = 1;
            info.data.forEach(val => {
              if (val.activation_code) {
                val.id = k;
                lists.push(val);
                k++;
              }
            });
            this.setState({ lists, loading: false, isUsedPaginationSearch: false });
          } else {
            this.setState({ lists: [], loading: false });
            message.warning(`提示：[${info.message}]`);
          }
        });
      }
    });
  }

  // 根据分页获取数据
  getDevicesByPagination(curPage, pageSize) {
    let getDevices = `${url}/devices`;
    getDevices += `?offset=${curPage}&limit=${pageSize}`;
    fetch(getDevices).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            const lists = [];
            let k = curPage > 0 ? `${curPage}1` : 1;
            info.data.forEach(val => {
              if (val.activation_code) {
                val.id = k;
                lists.push(val);
                k++;
              }
            });
            this.setState({ lists, loading: false });
          } else {
            this.setState({ lists: [], loading: false });
            message.warning(`提示：[${info.message}]`);
          }
          this.setState({
            totalNum: info.total,
            onlineNum: info.online_number,
            notUpgradedNum: info.not_upgraded,
            latestVersion: info.version,
          });
        });
      }
    });
  }

  // 管理员权限获取搜索后的列表
  searchList() {
    const { inputValue } = this.state;
    const arr = [];
    const eidRegex = /^[0-9A-Z]{10}$/;
    const codeRegex = /^[0-9A-Z]{8}$/;
    const orderRegex = /^[0-9]{20}$/;
    const merchantRegex = /^[\u4E00-\u9FA5]{1,5}$/;
    if (eidRegex.test(inputValue)) {
      this.setState({ loading: true });
      let searchEidUrl = `${url}/devices`;
      searchEidUrl += `?search=eid&eid=${inputValue}`;
      fetch(searchEidUrl).then(res => {
        if (res.ok) {
          res.json().then(info => {
            if (info.status && info.data.length > 0 && info.data[0].activation_code) {
              info.data[0].id = 1;
              arr.push(info.data[0]);
            } else {
              message.error('没找到对应的数据');
            }
            this.setState({ lists: arr, loading: false, isUsedPaginationSearch: false });
          });
        }
      });
    } else if (codeRegex.test(inputValue) || orderRegex.test(inputValue)) {
      this.setState({ loading: true });
      let searchEidUrl = `${url}/devices`;
      searchEidUrl += `?search=code&code=${inputValue}`;
      fetch(searchEidUrl).then(res => {
        if (res.ok) {
          res.json().then(info => {
            if (info.status && info.data.length > 0) {
              info.data[0].id = 1;
              arr.push(info.data[0]);
            } else {
              message.error('没找到对应的数据');
            }
            this.setState({ lists: arr, loading: false, isUsedPaginationSearch: false });
          });
        }
      });
    } else if (merchantRegex.test(inputValue)) {
      this.setState({ loading: true });
      let searchEidUrl = `${url}/devices`;
      searchEidUrl += `?search=merchant&merchant=${inputValue}`;
      fetch(searchEidUrl).then(res => {
        if (res.ok) {
          res.json().then(info => {
            if (info.status && info.data.length > 0) {
              let k = 1;
              info.data.forEach(val => {
                val.id = k;
                arr.push(val);
                k++;
              });
            } else {
              message.error('没找到对应的数据');
            }
            this.setState({ lists: arr, loading: false, isUsedPaginationSearch: false });
          });
        }
      });
    } else {
      message.error('没找到对应的数据');
    }
  }

  // 商家权限获取搜索后的列表
  searchListOfMerchant() {
    const { lists, codeId, deviceId } = this.state;
    const arr = [];
    lists.forEach(val => {
      if (val.activation_code === codeId || val.eid === deviceId) arr.push(val);
    });

    if (arr.length === 0) message.error('没找到对应的数据');

    this.setState({ lists: arr.length > 0 ? arr : lists });
  }

  render() {
    const {
      lists,
      loading,
      totalNum,
      onlineNum,
      notUpgradedNum,
      isUsedPaginationSearch,
      latestVersion,
      curPage,
    } = this.state;

    lists.forEach(val => {
      if (val.version === '1.0') {
        val.version = `${val.version}.0`;
      }
    });

    // 翻译使用用户
    const onLine = [];
    const versionArr = [];
    lists.forEach(val => {
      if (val.online_at && !val.offline_at) onLine.push(val);
      versionArr.push(val.version || '0.0.0');
    });

    // 检索版本号
    const notUpgraded = [];
    versionArr.forEach(val => {
      if (val < versionArr.sort()[versionArr.length - 1]) notUpgraded.push(val);
    });

    // 判断是否是按分页来获取数据，是则使用返回的 total 等数据显示，否则使用商家的数据长度
    const activatedTotalNum = isUsedPaginationSearch ? totalNum : lists.length;
    const onlineTotalNum = isUsedPaginationSearch ? onlineNum : onLine.length;
    const notUpgradedTotalNum = isUsedPaginationSearch ? notUpgradedNum : notUpgraded.length;

    // 判断有没拿到最新版本号，没有则使用数据中最新的版本号
    const newVersion = latestVersion || versionArr.sort()[versionArr.length - 1];

    // 功能按钮
    const menu = info => (
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
                body: JSON.stringify({ eid: info.eid }),
              }).then(res => {
                if (res.ok) {
                  res.json().then(data => {
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
            <a href="javascript:;">
              {info.activation_code && info.activation_code.length > 16 ? '退货退单' : '解除激活'}
            </a>
          </Popconfirm>
        </Menu.Item>
        {info.activation_code && info.activation_code.length > 16 ? (
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
                }).then(res => {
                  if (res.ok) {
                    res.json().then(data => {
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
        ) : (
          ''
        )}
      </Menu>
    );

    // 表格列的配置描述
    const columns = [
      isUsedPaginationSearch ? {
          title: '序号',
          dataIndex: 'id',
          align: 'center',
        } :
      { title: '序号',
        dataIndex: '',
        align: 'center',
        render: (text, record, index) => {
          if (curPage === 1) {
            return `${index+1}`
          } else if (curPage.current === 1) {
            return `${index+1}`
          } else if (curPage.current > 1) {
            if (`${index+1}`.length > 1) {
              return `${curPage.current}0`
            } else {
              return `${curPage.current -1 }${index+1}`
            }
          }
        },
      },
      { title: '激活时间',
        dataIndex: 'activation_at',
        align: 'center',
        defaultSortOrder: 'descend',
        sorter: (pre, next) => Date.parse(pre.activation_at) - Date.parse(next.activation_at),
      },
      { title: '设备ID', dataIndex: 'eid', align: 'center' },
      { title: '型号', dataIndex: 'model', align: 'center' },
      {
        title: '版本号',
        dataIndex: 'version',
        align: 'center',
        render: (val, info) => {
          return (
            <div>
              <span>V {val || '0.0.0'}</span>
              &nbsp;
              {(val || '0.0.0') < newVersion ? (
                <Icon
                  type="arrow-up"
                  style={{ color: '#52c41a', cursor: 'pointer' }}
                  onClick={() => {
                    let updateUrl = `${url}/equipments`;
                    updateUrl += `/${info.eid}`;
                    updateUrl += `/upgrade`;

                    if (info.online_at && !info.offline_at) {
                      fetch(updateUrl, {
                        method: 'POST',
                        body: JSON.stringify({ eid: info.eid }),
                      }).then(res => {
                        if (res.ok) {
                          res.json().then(data => {
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
              ) : (
                ''
              )}
            </div>
          );
        },
      },
      {
        width: 190,
        title: '激活码/订单号',
        dataIndex: 'activation_code',
        align: 'center',
        render: val => val || '-',
      },
      {
        title: '在线状态',
        dataIndex: '',
        align: 'center',
        render: info =>
          info.online_at && !info.offline_at ? (
            <Badge status="success" text="在线" />
          ) : (
            <Badge status="default" text="离线" />
          ),
      },
      localStorage.getItem('antd-pro-authority') === 'vendors'
        ? {
            title: '使用人',
            dataIndex: 'name',
            align: 'center',
            render: (val, info) => (
              <Popover placement="top" title="用户ID" content={info.uid} trigger="click">
                {val}
              </Popover>
            ),
          }
        : { title: '使用人', dataIndex: 'name', align: 'center' },
      {
        title: '推荐人',
        dataIndex: 'referrer',
        align: 'center',
        render: val => val || '--',
      },
      {
        title: '代理商',
        dataIndex: '',
        align: 'center',
        render: info => info.superior || info.referrer || '--',
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
      <PageHeaderLayout title="已激活设备列表">
        <div style={styles.content}>
          <Row>
            {localStorage.getItem('antd-pro-authority') === 'vendors' ? (
              <div>
                <Col span={12}>
                  <Row>
                    <Col span={5} style={styles.tit}>
                      关键词：
                    </Col>
                    <Col span={18}>
                      <Input
                        placeholder="请输入需要查找的设备ID、激活码、订单号、代理商或经销商"
                        onChange={e => this.setState({ inputValue: e.target.value })}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col span={6}>
                  <Button type="primary" onClick={this.searchList.bind(this)}>
                    搜索
                  </Button>
                </Col>
              </div>
            ) : (
              <div>
                <Col span={10}>
                  <Row>
                    <Col span={6} style={styles.tit}>
                      设备ID：
                    </Col>
                    <Col span={17}>
                      <Input
                        placeholder="请输入需要查找的设备ID"
                        onChange={e => this.setState({ deviceId: e.target.value })}
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
                        onChange={e => this.setState({ codeId: e.target.value })}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col span={4}>
                  <Button type="primary" onClick={this.searchListOfMerchant.bind(this)}>
                    搜索
                  </Button>
                </Col>
              </div>
            )}
          </Row>
        </div>
        <div style={{ padding: 20, backgroundColor: '#fff' }}>
          <div style={{ marginTop: 15, textAlign: 'left' }}>
            <Badge status="success" text={`已激活设备共${activatedTotalNum}台`} />
            <Divider type="vertical" />
            <Badge status="success" text={`在线设备共${onlineTotalNum}台`} />
            <Divider type="vertical" />
            <Badge
              status="processing"
              text={`设备在线率${Math.ceil(onlineTotalNum / activatedTotalNum * 100) || 0}%`}
            />
            <Divider type="vertical" />
            <Badge status="error" text={`未升级设备${notUpgradedTotalNum}台`} />
          </div>
        </div>
        <div style={styles.content}>
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={lists}
            onChange={(current) => this.setState({curPage: current})}
            pagination={isUsedPaginationSearch ? false : {}}
          />
          {isUsedPaginationSearch ? (
            <Pagination
              style={styles.pagination}
              total={totalNum}
              onChange={(current, pageSize) => {
                this.setState({ loading: true });
                this.getDevicesByPagination(current - 1, pageSize);
              }}
            />
          ) : (
            ''
          )}
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

export default EquipmentsList;
