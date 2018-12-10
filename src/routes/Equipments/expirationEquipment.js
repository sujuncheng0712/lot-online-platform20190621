/* eslint-disable no-param-reassign,no-plusplus,no-script-url,no-undef */
import React, { PureComponent } from 'react';
import { Input, Button, message, Select, Row, Col, Tabs, List, Divider } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';
const identity = localStorage.getItem('antd-pro-authority');
const auth = sessionStorage.getItem('dochen-auth')
  ? JSON.parse(sessionStorage.getItem('dochen-auth'))
  : '';

class expirationEquipment extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      loading: true,
      dataList: [],  // 滤芯寿命情况列表
      expirationList: [],  // 滤芯寿命到期列表
      devicesList: [],  // 设备列表
      usersList: [],  // 用户列表
      agentList: [],  // 代理商列表
      referrerList: [],  // 经销商列表
      equipmentId: '',
    };
  }

  componentWillMount() {
    this.getFilterElementList();
    this.getDevicesList();
    this.getUsersList();
    this.getMerchantsList();
  }

  // 获取滤芯使用情况列表
  getFilterElementList() {
    const getUrl = `${url}/filter_element`;
    fetch(getUrl, {
      headers: identity === 'vendors' ? {
        vid: 'f40d03342db411e8bc9600163e0851fd',
      } : {
        mid: auth.mid,
      },
    }).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            const lists = [];
            info.data.forEach(val => {
              lists.push(val);
            });
            this.changeData(lists);
            this.getexpirationData();
          } else {
            this.setState({ loading: false });
            message.warning(`提示：[${info.message}]`);
          }
        });
      }
    });
  }

  // 获取设备列表
  getDevicesList() {
    let getDecicesUrl = `${url}/devices`;
    getDecicesUrl += auth.mid ? `?mid=${auth.mid}` : '';
    fetch(getDecicesUrl).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            const devicesList = [];
            info.data.forEach(val => {
              devicesList.push(val);
            });
            this.setState({devicesList});
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

  // 从滤芯寿命列表中找出到期的滤芯
  getexpirationData() {
    const {dataList} = this.state;
    const tmp = [];
    dataList.forEach(eItem => {
      if (eItem.CPP.used >= 180 || eItem.PPC.used >= 180 || eItem.RO.used >= 720) {
        tmp.unshift(eItem);
      }
    });

    const expirationList = tmp.map(o => Object.assign({}, o));

    this.setState({expirationList});
  }

  // 把后端获取到的数据转为显示到滤芯寿命列表的数据
  changeData(lists, isExpiration=false) {
    // 添加滤芯类型属性
    lists.forEach(fItem => {
      if (fItem.type === '1') fItem.CPP = {type: Number(fItem.type), used: fItem.used};
      if (fItem.type === '2') fItem.PPC = {type: Number(fItem.type), used: fItem.used};
      if (fItem.type === '3') fItem.RO = {type: Number(fItem.type), used: fItem.used};
    });

    // 同一个设备的滤芯放到同一个数组中
    let first = 0;
    let third = 3;
    const arrList = [];
    lists.forEach((val, index) => {
      if (third <= index+1) {
        arrList.push(lists.slice(first, third));
        first += 3;
        third += 3;
      }
    });

    // 合并三个滤芯对象并依次添加到新数组中
    const dataList = [];
    const expirationList = [];
    if (!isExpiration) {
      arrList.forEach(arrItem => {
        dataList.push(Object.assign({}, arrItem[0], arrItem[1], arrItem[2]));
      });
    } else {
      arrList.forEach(arrItem => {
        expirationList.push(Object.assign({}, arrItem[0], arrItem[1], arrItem[2]));
      });
    }

    this.setState({dataList, expirationList, loading: false});
  }

  // 搜索设备ID
  searchEId() {
    this.setState({ loading: true });
    const {equipmentId} = this.state;
    let searchUrl = `${url}/filter_element`;
    searchUrl += `?eid=${equipmentId}`;
    fetch(searchUrl, {
      headers: {
        vid: 'f40d03342db411e8bc9600163e0851fd',
      },
    }).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            const lists = [];
            info.data.forEach(val => {
              lists.push(val);
            });
            this.changeData(lists);
            if (info.data[0].used >= 180 || info.data[1].used >= 180 || info.data[2].used >= 720) {
              const isExpiration=true;
              this.changeData(lists, isExpiration);
            }
          } else {
            this.setState({ loading: false });
            message.warning(`提示：[${info.message}]`);
          }
        });
      }
    });
  }

  // 根据下拉菜单项选择代理商或经销商
  searchMerchant(selectValue) {
    const {dataList, expirationList} = this.state;
    const arr1 = [];
    const arr2 = [];
    dataList.forEach(val => {
      if (val.mid === selectValue) arr1.push(val);
    });
    expirationList.forEach(val => {
      if (val.mid === selectValue) arr2.push(val);
    });
    if (arr1.length === 0 && arr2.length === 0) message.error('没找到对应的数据');

    this.setState({ dataList: arr1.length > 0 ? arr1 : [], expirationList: arr2.length > 0 ? arr2 : [], loading: false });
  }


  render() {
    const { loading, devicesList, usersList, agentList, referrerList, dataList, expirationList } = this.state;


    const addProperty = (list) => {
      let k = 1;
      // 把 devicesList 的设备型号和 usersList 的用户姓名、手机号，推荐人和代理商加进 lists 里面
      list.forEach(fItem => {
        fItem.key = k;
        k += 1;
        devicesList.forEach(dItem => {
          if (dItem.eid === fItem.eid) {
            fItem.model = dItem.model;
          }
        });
        usersList.forEach(uItem => {
          if (uItem.uuid === fItem.uid) {
            fItem.name = uItem.name;
            fItem.mobile = uItem.mobile;
            if (uItem.merchant.m1) {
              fItem.agent = uItem.merchant.m1.contact;
            }
            if (uItem.merchant.m2 && uItem.merchant.m2.uuid === fItem.mid) {
              fItem.referrer = uItem.merchant.m2.contact;
            }
          }
        });
      });
    };
    addProperty(dataList);
    addProperty(expirationList);

    const filterElement = (data) => {
      return (
        <div>
          <div style={styles.title}>
            <div style={styles.id}>序号</div>
            <div style={styles.model}>设备型号</div>
            <div style={styles.eid}>设备ID</div>
            <div style={styles.filter_element}>滤芯剩余寿命</div>
            <div style={styles.name}>使用人</div>
            <div style={styles.referrer}>推荐人</div>
            <div style={styles.agent}>代理商</div>
          </div>
          <List
            split={false}
            bordered={false}
            dataSource={data}
            loading={loading}
            renderItem={(item, key) => (
              <div key={key} style={styles.item}>
                <div style={styles.userInfo}>
                  <div>
                    姓名：{item.name || '--'}
                    <Divider type="vertical" />
                    电话：{item.mobile}
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.id}>{item.key}</div>
                  <div style={styles.model}>{item.model}</div>
                  <div style={styles.eid}>{item.eid}</div>
                  <div style={styles.filter_element}>
                    {`CPP : ${(180 - item.CPP.used) > 0 ? 180 - item.CPP.used : 0} 天 | PPC : ${(180 - item.PPC.used) > 0 ? 180 - item.PPC.used : 0} 天 | RO : ${(720 - item.RO.used) > 0 ? 720 - item.RO.used : 0} 天`}
                  </div>
                  <div style={styles.name}>{item.name ||'--'}</div>
                  <div style={styles.referrer}>{item.referrer || '--'}</div>
                  <div style={styles.agent}>{item.agent || '--'}</div>
                </div>
              </div>
            )}
            pagination={{ pageSize: 10 }}
          />
        </div>
      )
    };

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
                    onChange={e => this.setState({ equipmentId: e.target.value })}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={4}>
              <Button type="primary" onClick={this.searchEId.bind(this)}>搜索</Button>
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
                    placeholder="请选择"
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
                    placeholder="请选择"
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
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="滤芯寿命情况列表" key="1">
              {filterElement(dataList)}
            </Tabs.TabPane>
            <Tabs.TabPane tab="滤芯寿命到期列表" key="2">
              {filterElement(expirationList)}
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

  title: {
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: '#eee',
    padding: '10px 0px',
    marginBottom: 10,
    boxShadow: '0 1px 4px rgba(0,21,41,.12)',
  },
  item: {
    marginBottom: 15,
    paddingBottom: 10,
    boxShadow: '0 1px 4px rgba(0,21,41,.12)',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-around',
    paddingTop: 15,
  },
  userInfo: {
    padding: '3px 15px',
    backgroundColor: '#f6f6f6',
    display: 'flex',
    justifyContent: 'space-between',
  },
  oid: {
    padding: '0px 10px',
  },
  created_at: {
    padding: '0px 10px',
  },
  id: {
    width: 100,
    padding: '0px 10px',
    textAlign: 'center',
  },
  model: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  eid: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  filter_element: {
    width: 300,
    padding: '0px 10px',
    textAlign: 'center',
  },
  name: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  referrer: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },
  agent: {
    width: 200,
    padding: '0px 10px',
    textAlign: 'center',
  },

};

export default expirationEquipment;
