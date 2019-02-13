/* eslint-disable no-param-reassign,no-plusplus,prefer-rest-params,no-script-url,no-undef */
import React, { PureComponent } from 'react';
import { Input, Button, message, Select, Row, Col, Tabs, List, Divider } from 'antd';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
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
      orderList: [],  // 订单列表
    };
  }

  componentWillMount() {
    this.getDevicesList();
    this.getUsersList();
    this.getMerchantsList();
    this.getOrders();
    this.getFilterElementList();
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
              // 添加滤芯类型属性
              if (val.eptags === 'DCL01') val.CPP = val.used;
              if (val.eptags === 'DCL02') val.PPC = val.used;
              if (val.eptags === 'DCL09') val.RO = val.used;
              lists.push(val);
            });
            this.changeData(lists);
            this.getExpirationData(lists);
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

  // 获取订单列表
  getOrders() {
    let getOrders = `${url}/orders`;
    getOrders += auth.mid ? `?mid=${auth.mid}` : '';
    fetch(getOrders).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) {
            const orderList = [];
            info.data.forEach(val => {
              orderList.push(val);
            });
            this.setState({ orderList });
          }
        });
      }
    });
  }

  // 从滤芯寿命列表中找出到期的滤芯
  getExpirationData(lists) {
    const expirationList = [];
    let eidList = [];
    lists.forEach(eItem => {
      if (eItem.state === 0) {
        // expirationList.unshift(eItem);
        eidList.push(eItem.eid);
      };
    });
    eidList = [...new Set(eidList)];

    const arrList = [];
    eidList.forEach(val => {
      const tmpArr = [];
      lists.forEach(fItem => {
        if (fItem.eid === val) tmpArr.push(fItem);
      });
      arrList.push(tmpArr);
    });

    arrList.forEach(arrItem => {
      arrItem.sort((last, next) => next.state - last.state);
      if (arrItem[0].state === 0 || arrItem[1].state === 0 || arrItem[2].state === 0) {
        expirationList.unshift(Object.assign({}, arrItem[0], arrItem[1], arrItem[2]));
      }
    });

    this.setState({expirationList});
  }

  // 把后端获取到的数据转为显示到滤芯寿命列表的数据
  changeData(lists, isExpiration=false) {

    // 把 eid 拿出来放到数组eidList中并去重
    let eidList = [];
    lists.forEach(fItem => {
      eidList.push(fItem.eid);
    });
    eidList = [...new Set(eidList)];

    // 同一个设备的滤芯放到同一个数组中
    const arrList = [];
    eidList.forEach(val => {
      const tmpArr = [];
      lists.forEach(fItem => {
        if (fItem.eid === val) tmpArr.push(fItem);
      });
      arrList.push(tmpArr);
    });

    // 合并三个滤芯对象并依次添加到新数组中
    const dataList = [];
    const expirationList = [];
    if (!isExpiration) {
      arrList.forEach(arrItem => {
        // 把未激活或已过期的放到数组后面
        arrItem.sort((last, next) => next.state - last.state);
        // 把新更换的(使用天数少的)放到数组后面以覆盖前面的
        // arrItem.sort((last, next) => next.used - last.used);
        // 新更换的滤芯默认放在数组的前面，所以只需取前三条滤芯即可
        dataList.push(Object.assign({}, arrItem[0], arrItem[1], arrItem[2]));
      });
    } else {
      arrList.forEach(arrItem => {
        arrItem.sort((last, next) => next.state - last.state);
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
            // 把未激活或已过期的放到数组后面
            info.data.sort((last, next) => next.state - last.state);
            info.data.forEach(val => {
              // 添加滤芯类型属性
              if (val.eptags === 'DCL01') val.CPP = val.used;
              if (val.eptags === 'DCL02') val.PPC = val.used;
              if (val.eptags === 'DCL09') val.RO = val.used;
              lists.push(val);
            });
            console.log(info.data);
            this.changeData(lists);
            if (info.data[0].state === 0 || info.data[1].state === 0  || info.data[2].state === 0 ) {
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
    const { loading, devicesList, usersList, agentList, referrerList, dataList, expirationList, orderList } = this.state;

    // 增加用户地址
    orderList.forEach(oItem => {
      dataList.forEach(fItem => {
        if (oItem.link_id && oItem.link_id === fItem.eid) fItem.address = oItem.address;
        if (oItem.activations.length > 0) {
          oItem.activations.forEach(val => {
            if (val.eid === fItem.eid) fItem.address = oItem.address;
          })
        }
      });
    });

    const addProperty = (list) => {
      let k = 1;
      // 把 devicesList 的设备型号和 usersList 的用户姓名、手机号，推荐人和代理商加进 list 里面
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
            const referrer1 = uItem.merchant.m1 ? uItem.merchant.m1.contact : '';
            const referrer2 = uItem.merchant.m2 ? uItem.merchant.m2.contact : '';
            fItem.referrer = referrer2 || referrer1;
            if (uItem.merchant.m1) {
              fItem.agent = uItem.merchant.m1.contact;
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
                    {item.address && (
                      <span>
                        <Divider type="vertical" />
                        地址：
                        <Ellipsis length={10} tooltip style={{display: 'inline'}}>
                          {item.address}
                        </Ellipsis>
                      </span>
                    )}
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.id}>{item.key}</div>
                  <div style={styles.model}>{item.model || '--'}</div>
                  <div style={styles.eid}>{item.eid}</div>
                  <div style={styles.filter_element}>
                    {`PPC : ${(180 - item.CPP) > 0 ? 180 - item.CPP : 0} 天 | CPP : ${(180 - item.PPC) > 0 ? 180 - item.PPC : 0} 天 | RO : ${(720 - item.RO) > 0 ? 720 - item.RO : 0} 天`}
                  </div>
                  <div style={styles.name}>{item.name || item.mobile ||'--'}</div>
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
