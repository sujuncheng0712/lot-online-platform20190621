/* eslint-disable no-param-reassign,class-methods-use-this */
import React, {PureComponent} from 'react';
import {Card, Select, Table, Input, Tag, Icon, message} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

class Distribution extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      dealersLists: [],
      agentsLists: [],
      productsLists: [],
      allowanceLists: [],
    };
  }

  componentDidMount() {
    this.getDealers();
    this.getAgents();
    this.getProducts();
  }

  // 获取经销商列表
  getDealers() {
    const getDealers = `${url}/dealers`;
    fetch(getDealers).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({dealersLists: info.data});
        });
      }
    });
  }

  // 获取代理商列表
  getAgents() {
    const getAgents = `${url}/agents`;
    fetch(getAgents).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({agentsLists: info.data});
        });
      }
    });
  }

  // 获取产品列表
  getProducts() {
    const getProducts = `${url}/products`;
    fetch(getProducts).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            const lists = [];
            info.data.forEach((val, key) => {
              val.allowance_fee = '0';
              val.commission_rate = '0';
              val.edit = false;
              val.editType = 'POST';
              val.key = key;
              lists.push(val);
            });
            this.setState({productsLists: lists});
          }
        });
      }
    });
  }

  // 获取收益分配
  getAllowance(uuid) {
    const getAllowance = `${url}/agents/${uuid}/allowance`;
    fetch(getAllowance).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({allowanceLists: info.data});
        });
      }
    });
  }

  // 修改分配
  editAllowance(value, parameter) {
    const {productsLists} = this.state;
    let getAllowance = `${url}/agents/${sessionStorage.getItem('authUuid')}/allowance`;
    getAllowance += parameter.editType === 'PUT' ? `/${parameter.editUuid}` : '';
    const data = {
      eptags: parameter.tags,
      pid: parameter.pid,
    };

    if (parameter.type === 2) {
      data.allowance_fee = value;
    } else {
      data.commission_rate = value;
    }

    fetch(getAllowance, {
      method: parameter.editType,
      body: JSON.stringify({data: JSON.stringify(data)}),
    }).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            const lists = [];
            productsLists.forEach(val => {
              if (val.pid === parameter.pid) {
                val.edit = !val.edit;
              }
              lists.push(val);
            });
            this.setState({productsLists: lists});
            this.getAllowance(sessionStorage.getItem('authUuid'));
            message.success(`修改成功`);
          } else {
            message.error(`错误：[${info.message}]`);
          }
        });
      }
    });
  }

  render() {
    const {dealersLists, agentsLists, productsLists, allowanceLists} = this.state;

    productsLists.forEach(item => {
      if (allowanceLists) {
        allowanceLists.forEach(val => {
          if (item.pid === val.pid) {
            item.allowance_fee = val.allowance_fee || 0;
            item.commission_rate = val.commission_rate || 0;
            item.editType = 'PUT';
            item.editUuid = val.uuid;
          }
        });
      }
    });

    const columns = [
      {title: '缩略图', dataIndex: 'prev_image', render: (val) => (<img src={val} alt="" width={60} />)},
      {title: '标题', dataIndex: 'title'},
      {title: '描述', dataIndex: 'desc'},
      {title: '价格', dataIndex: 'price', render: (val) => `¥${val}.00`},
      {title: '标签', dataIndex: 'tags', render: (val) => val ? (<Tag color="blue">{val}</Tag>) : ''},
      {
        align: 'center',
        title: '补贴/返点（元/%）',
        render: (info) => !info.edit ? (
          <div>
            <span style={{paddingRight: 15}}>
              {info.type === 2 ? `${info.allowance_fee} %` : `${info.commission_rate} 元`}
            </span>
            <Icon
              type="form"
              theme="outlined"
              onClick={() => {
                const lists = [];
                productsLists.forEach(val => {
                  if (val.pid === info.pid) {
                    val.edit = !val.edit;
                  }
                  lists.push(val);
                });
                this.setState({productsLists: lists});
              }}
            />
          </div>
        ) : (
          <Input.Search
            defaultValue={info.type === 2 ? info.allowance_fee : info.commission_rate}
            onSearch={value => {
              this.editAllowance(value, info);
            }}
            enterButton={<Icon type="check" theme="outlined" />}
            style={{width: 100}}
          />
        ),
      },
    ];

    return (
      <PageHeaderLayout title="收益分配">
        {localStorage.getItem('antd-pro-authority') === 'vendors' ? (
          <div style={styles.search}>
            <div style={styles.searchRow}>
              <div style={styles.searchTit}>&nbsp;&nbsp;&nbsp;&nbsp;代理商：</div>
              <div style={{width: 300}}>
                <Select
                  defaultValue="请选择"
                  style={{width: 300}}
                  onChange={(value) => {
                    this.setState({productsLists: [], allowanceLists: []});
                    this.getProducts();
                    this.getAllowance(value);
                    sessionStorage.setItem('authUuid', value);
                  }}
                >
                  <Select.OptGroup label="代理商">
                    {agentsLists.map((item) => (
                      <Select.Option key={item.aid}>{item.contact}({item.mobile})</Select.Option>
                    ))}
                  </Select.OptGroup>
                </Select>
              </div>
            </div>
            <div style={styles.searchRow}>
              <div style={styles.searchTit}>&nbsp;&nbsp;&nbsp;&nbsp;经销商：</div>
              <div style={{width: 300}}>
                <Select
                  defaultValue="请选择"
                  style={{width: 300}}
                  onChange={(value) => {
                    this.setState({productsLists: [], allowanceLists: []});
                    this.getProducts();
                    this.getAllowance(value);
                    sessionStorage.setItem('authUuid', value);
                  }}
                >
                  <Select.OptGroup label="经销商">
                    {dealersLists.map((item) => (
                      <Select.Option key={item.did}>{item.contact}({item.mobile})</Select.Option>
                    ))}
                  </Select.OptGroup>
                </Select>
              </div>
            </div>
          </div>
        ) : ''}
        <Card title="产品 补贴/返点" bordered={false}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={productsLists}
          />
        </Card>
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

export default Distribution;
