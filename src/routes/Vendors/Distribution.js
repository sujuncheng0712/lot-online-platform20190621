/* eslint-disable no-param-reassign */
import React, {PureComponent} from 'react';
import {Card, Select, Table, Input, InputNumber, Tag, Icon} from 'antd';
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
            info.data.forEach((val) => {
              val.distribution = '0%';
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
          if (info.status) this.setState({allowanceLists:info.date});
        });
      }
    });
  }

  render() {
    const {dealersLists, agentsLists, productsLists, allowanceLists} = this.state;

    console.log(allowanceLists)

    const columns = [
      {title: '缩略图', dataIndex: 'prev_image', render: (val) => (<img src={val} alt="" width={60} />)},
      {title: '标题', dataIndex: 'title'},
      {title: '描述', dataIndex: 'desc'},
      {title: '价格', dataIndex: 'price', render: (val) => `¥${val}.00`},
      {title: '标签', dataIndex: 'tags', render: (val) => val ? (<Tag color="blue">{val}</Tag>) : ''},
      {
        title: '补贴/返点',
        render: (info) => info.type === 2 ? (
          <InputNumber
            defaultValue={info.allowance_free || 0}
            min={0}
            max={100}
            formatter={value => `${value}%`}
            parser={value => value.replace('%', '')}
            onPressEnter={(value) => {
              const getAllowance = `${url}/agents/${sessionStorage.getItem('authUuid')}/allowance`;
              const data = JSON.stringify({
                eptags: info.tags,
                pid: info.pid,
                allowance_free: value,
              });
              fetch(getAllowance, {
                method: 'POST',
                body: JSON.stringify({data}),
              }).then((res) => {
                if (res.ok) {
                  res.json().then((_info) => {
                    if (_info.status) {
                      console.log(_info.date);
                    }
                  });
                }
              });
            }}
          />
        ) : (
          <Input.Search
            placeholder="input search text"
            defaultValue={info.commission_rate || 0}
            onSearch={value => {
              const getAllowance = `${url}/agents/${sessionStorage.getItem('authUuid')}/allowance`;
              const data = JSON.stringify({
                eptags: info.tags,
                pid: info.pid,
                commission_rate: value,
              });
              fetch(getAllowance, {
                method: 'POST',
                body: JSON.stringify({data}),
              }).then((res) => {
                if (res.ok) {
                  res.json().then((_info) => {
                    if (_info.status) {
                      console.log(_info.date);
                    }
                  });
                }
              });
            }}
            enterButton={<Icon type="form" theme="outlined" />}
            style={{ width: 200 }}
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
                    sessionStorage.setItem('authUuid', value);
                    this.getAllowance(value);
                  }}
                >
                  <Select.OptGroup label="代理商">
                    {agentsLists.map((item) => (
                      <Select.Option value={item.aid}>{item.contact}({item.mobile})</Select.Option>
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
                    sessionStorage.setItem('authUuid', value);
                    this.getAllowance(value);
                  }}
                >
                  <Select.OptGroup label="经销商">
                    {dealersLists.map((item) => (
                      <Select.Option value={item.did}>{item.contact}({item.mobile})</Select.Option>
                    ))}
                  </Select.OptGroup>
                </Select>
              </div>
            </div>
          </div>
        ) : ''}
        <Card title="产品 补贴/返点" bordered={false}>
          <Table columns={columns} dataSource={productsLists} />
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
