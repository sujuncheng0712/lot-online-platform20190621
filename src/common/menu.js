import {isUrl} from '../utils/utils';

const menuData = [
  {
    name: '设备管理',
    icon: 'laptop',
    path: 'equipments',
    children: [
      {name: '已激活设备', path: 'equipments-list'},
    ],
  }, {
    name: '用户订单',
    icon: 'profile',
    path: 'orders',
    children: [
      {name: '产品订单', path: 'orders-list'},
      {name: '滤芯订单', path: 'filters-list'},
      {name: '预约订单', path: 'book-list'},
      {name: '退款列表', path: 'refunds-list'},
    ],
  }, {
    name: '团购订单',
    icon: 'dot-chart',
    path: 'group',
    children: [
      {name: '购码订单', path: 'group-orders-list'},
      {name: '我的激活码', path: 'code-list'},
    ],
  }, {
    name: '预估收益',
    icon: 'pay-circle-o',
    path: 'earnings/subsidy-list',
  }, {
    name: '我的收入',
    icon: 'red-envelope',
    path: 'wallet',
    children: [
      {name: '钱包账户', path: 'wallet-list'},
      {name: '提现申请', path: 'withdrawal'},
    ],
  }, {
    name: '财务管理',
    icon: 'bank',
    path: 'finance',
    authority: ['vendors'],
    children: [
      {name: '提现审核', path: 'finance-list'},
    ],
  }, {
    name: '商家列表',
    icon: 'idcard',
    path: 'merchants/merchants-list',
  }, {
    name: '用户管理',
    icon: 'team',
    path: 'users/users-list',
  }, {
    name: '产品管理',
    icon: 'shop',
    authority: ['vendors'],
    path: 'products/products-list',
  }, {
    name: '个人中心',
    icon: 'exclamation-circle-o',
    path: 'info/profile',
  },{
    name: '重置密码',
    icon: 'sync',
    authority: ['vendors'],
    path: 'info/reset-password',
  },
];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let {path} = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
