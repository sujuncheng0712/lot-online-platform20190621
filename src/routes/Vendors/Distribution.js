/* eslint-disable no-param-reassign */
import React, {PureComponent} from 'react';
import {Card, Select, Table, InputNumber, Tag} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

class Distribution extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      dealersLists: [],
      agentsLists: [],
      productsLists: [],
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

  render() {
    const {dealersLists, agentsLists, productsLists} = this.state;

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
            defaultValue={30}
            min={0}
            max={100}
            formatter={value => `${value}%`}
            parser={value => value.replace('%', '')}
            onChange={(value) => {
              console.log('changed', value);
            }}
          />
        ) : (
          <InputNumber
            defaultValue={200}
            min={0}
            max={100}
            formatter={value => `${value}元`}
            parser={value => value.replace('元', '')}
            onChange={(value) => {
              console.log('changed', value);
            }}
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
                    console.log(value);
                  }}
                >
                  <Select.OptGroup label="代理商">
                    {agentsLists.map((item) => (
                      <Select.Option value={`agents,${item.aid}`}>{item.contact}({item.mobile})</Select.Option>
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
                    console.log(value);
                  }}
                >
                  <Select.OptGroup label="经销商">
                    {dealersLists.map((item) => (
                      <Select.Option value={`dealers,${item.did}`}>{item.contact}({item.mobile})</Select.Option>
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
