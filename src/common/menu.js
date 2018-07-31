import {isUrl} from '../utils/utils';

const menuData = [
  {
    name: '设备管理',
    icon: 'laptop',
    path: 'equipments',
    children: [
      {
        name: '已激活设备',
        path: 'equipments-list',
      },
    ],
  },
  {
    name: '用户订单',
    icon: 'profile',
    path: 'orders',
    children: [
      {
        name: '产品订单',
        path: 'orders-list',
      },
      {
        name: '滤芯订单',
        path: 'filters-list',
      },
      {
        name: '退款列表',
        path: 'refunds-list',
      },
    ],
  },
  {
    name: '团购订单',
    icon: 'dot-chart',
    path: 'group',
    children: [
      {
        name: '购码订单',
        path: 'group-orders-list',
      },
      {
        name: '我的激活码',
        path: 'code-list',
      },
      // {
      //   name: '退码列表',
      //   path: 'refunds-list',
      // },
    ],
  },
  {
    name: '收益管理',
    icon: 'pay-circle-o',
    path: 'earnings',
    children: [
      {
        name: '补贴收益',
        path: 'subsidy-list',
      },
      {
        name: '返点收益',
        path: 'rebate-list',
      },
      {
        name: '结算中心',
        path: 'clearing-list',
        // authority: ['admin', 'vendors'],
      },
    ],
  },
  {
    name: '我的钱包',
    icon: 'red-envelope',
    path: 'wallet',
    // authority: ['admin', 'vendors'],
    children: [
      {
        name: '钱包账户',
        path: 'wallet-list',
      },
      {
        name: '提现申请',
        path: 'withdrawal',
      },
    ],
  },
  {
    name: '财务管理',
    icon: 'bank',
    path: 'finance',
    authority: ['admin', 'vendors'],
    children: [
      {
        name: '提现审核',
        path: 'finance-list',
      },
    ],
  },
  {
    name: '客户管理',
    icon: 'idcard',
    path: 'vendors',
    children: [
      {
        name: '代理商列表',
        path: 'agents-list',
        authority: ['admin', 'vendors'],

      },
      {
        name: '经销商列表',
        path: 'dealers-list',
        authority: ['admin', 'vendors', 'agents'],
      },
    ],
  },
  {
    name: '用户管理',
    icon: 'team',
    path: 'users',
    children: [
      {
        name: '用户列表',
        path: 'users-list',
      },
    ],
  },
  {
    name: '产品管理',
    icon: 'shop',
    authority: ['admin', 'vendors'],
    path: 'products',
    children: [
      {
        name: '产品列表',
        path: 'products-list',
      },
      {
        name: '发布商品',
        path: 'product-add',
        authority: ['admin', 'vendors'],
      },
    ],
  },
  {
    name: 'ID管理',
    icon: 'api',
    path: 'ids',
    authority: ['admin', 'vendors'],
    children: [
      {
        name: '产品ID',
        path: 'machine',
      },
      {
        name: '滤芯ID',
        path: 'element',
      },
    ],
  },
  {
    name: '个人中心',
    icon: 'exclamation-circle-o',
    path: 'info',
    children: [
      {
        name: '个人信息',
        path: 'profile',
      },
      {
        name: '发货额度',
        path: 'delivery-quota',
        authority: ['admin', 'vendors'],
      },
      {
        name: '登陆密码',
        path: 'reset-password',
      },
      {
        name: '支付密码',
        path: 'pay-password',
        authority: ['admin', 'vendors'],
      },
      {
        name: '绑定银行卡',
        path: 'bank-card',
        authority: ['admin', 'vendors'],
      },
      {
        name: '退出账号',
        path: 'sign-out',
      },
    ],
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
