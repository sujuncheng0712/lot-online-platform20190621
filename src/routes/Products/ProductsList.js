/* eslint-disable no-shadow,no-param-reassign,radix */
import React, { PureComponent } from 'react';
import { Button, Table, Icon } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

class ProductsList extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      lists: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.getProducts();
  }

  // 获取产品列表
  getProducts() {
    const getProducts = `${url}/products`;
    fetch(getProducts).then(res => {
      if (res.ok) {
        res.json().then(info => {
          if (info.status) this.setState({ lists: info.data, loading: false });
        });
      }
    });
  }

  render() {
    const { lists, loading } = this.state;

    const data = [];
    let k = 0;
    lists.forEach(val => {
      if (val.state === 0 && val.type !== 8) {
        val.key = k + 1;
        data.push(val);
        k += 1;
      }
    });

    const columns = [
      // { title: '序号', dataIndex: 'order', align: 'center', sorter: (a, b) => a.order - b.order },
      { title: '序号', dataIndex: 'key', align: 'center' },
      {
        title: '主图',
        dataIndex: 'prev_image',
        align: 'center',
        render: val => <img alt="" src={val} height={100} />,
      },
      { title: '标题', dataIndex: 'title' },
      {
        title: '价格',
        dataIndex: 'price',
        align: 'right',
        sorter: (a, b) => a.price - b.price,
        render: val => `${val}元`,
      },
      {
        title: '库存(台)',
        dataIndex: 'stock',
        align: 'right',
        sorter: (a, b) => a.stock - b.stock,
      },
      {
        title: '运费',
        dataIndex: 'freight',
        align: 'right',
        sorter: (a, b) => a.freight - b.freight,
      },
      { title: '积分', dataIndex: 'bonus', align: 'right', sorter: (a, b) => a.bonus - b.bonus },
      {
        title: '发布时间',
        dataIndex: 'created_at',
        align: 'right',
        sorter: (a, b) => {
          const date1 = new Date(a.created_at);
          const date2 = new Date(b.created_at);
          return date1 - date2;
        },
      },
      {
        title: '操作',
        dataIndex: 'pid',
        align: 'right',
        render: (val, info) => (
          <Button.Group>
            <Button
              type="small"
              onClick={() => {
                location.hash = `/products/product-profile?pid=${val}`;
              }}
            >
              详情
            </Button>
            <Button
              type="small"
              onClick={() => {
                location.hash = `/products/add-edit-product?pid=${val}`;
              }}
            >
              编辑
            </Button>
            {info.state ? (
              <Button
                type="small"
                onClick={() => {
                  const delMerchants = `${url}/products/${val}`;
                  fetch(delMerchants, {
                    method: 'DELETE',
                  }).then(res => {
                    if (res.ok)
                      res.json().then(info => {
                        if (info.status) this.getProducts();
                      });
                  });
                }}
              >
                入库
              </Button>
            ) : (
              ''
            )}
          </Button.Group>
        ),
      },
    ];

    return (
      <PageHeaderLayout title="产品列表">
        <div style={{ padding: 20, backgroundColor: '#fff' }}>
          <Button
            type="primary"
            style={{ marginBottom: 20 }}
            onClick={() => {
              location.href = '#/products/add-edit-product';
            }}
          >
            <Icon type="plus" /> 发布产品
          </Button>
          <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />
        </div>
      </PageHeaderLayout>
    );
  }
}

export default ProductsList;
