/* eslint-disable no-param-reassign */
import React, {PureComponent} from 'react';
import {Card, Select} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

class Distribution extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      dealersLists: [],
      agentsLists: [],
      productsLists: [],
      info: {},
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
    const {info, dealersLists, agentsLists, productsLists} = this.state;

    const html = (item, key) => (
      <div key={key} style={styles.item}>
        <img
          src={item.intro_image}
          alt={item.title}
          style={styles.itemImg}
        />
        <div style={styles.itemTitle}>{item.title}</div>
        <div style={styles.itemPrice}>¥{item.price}</div>
        <div style={styles.itemDistribution}>{item.distribution}</div>
      </div>
    );

    const lists01 = [];
    const lists02 = [];
    const lists03 = [];
    productsLists.forEach((val, key) => {
      if (val.type === 1 || val.type === 4) lists01.push(html(val, key));
      if (val.type === 2) lists02.push(html(val, key));
      if (val.type === 3) lists03.push(html(val, key));
    });

    console.log(lists01);

    return (
      <PageHeaderLayout title="收益分配">
        <Card title="商家" bordered={false}>
          <Select
            defaultValue="请选择"
            style={{width: '100%'}}
            onChange={(value) => {
              console.log(`selected ${value}`);
            }}
          >
            <Select.OptGroup label="代理商">
              {agentsLists.map((item, key) => (
                <Select.Option key={key} value={item.aid}>{item.contact}</Select.Option>
              ))}
            </Select.OptGroup>
            <Select.OptGroup label="经销商">
              {dealersLists.map((item, key) => (
                <Select.Option key={key} value={item.did}>{item.contact}</Select.Option>
              ))}
            </Select.OptGroup>
          </Select>
        </Card>
        <br />
        <Card title="产品" bordered={false}>{lists01}</Card>
        <br />
        <Card title="耗材" bordered={false}>{lists02}</Card>
        <br />
        <Card title="激活码" bordered={false}>{lists03}</Card>
      </PageHeaderLayout>
    );
  }
}

const styles = {
  item: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
  },
  itemImg: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  itemTitle: {
    width: 200,
  },
  itemPrice: {
    width: 100,
  },
};

export default Distribution;
