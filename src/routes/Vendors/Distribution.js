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
        title: '补贴()',
        render: () => (
          <InputNumber
            defaultValue={10}
            min={0}
            max={100}
            formatter={value => `${value}%`}
            parser={value => value.replace('%', '')}
            onChange={(value) => {
              console.log('changed', value);
            }}
          />
        ),
      },
    ];

    return (
      <PageHeaderLayout title="收益分配">
        <Select
          defaultValue="请选择"
          style={{width: 200, marginBottom: 15}}
          onChange={(value) => {
            console.log(`selected ${value}`);
          }}
        >
          <Select.OptGroup label="代理商">
            {agentsLists.map((item) => (
              <Select.Option value={item.aid}>{item.contact}</Select.Option>
            ))}
          </Select.OptGroup>
          <Select.OptGroup label="经销商">
            {dealersLists.map((item) => (
              <Select.Option value={item.did}>{item.contact}</Select.Option>
            ))}
          </Select.OptGroup>
        </Select>
        <Card title="产品 补贴/返点" bordered={false}>
          <Table columns={columns} dataSource={productsLists} />
        </Card>
      </PageHeaderLayout>
    );
  }
}

export default Distribution;
