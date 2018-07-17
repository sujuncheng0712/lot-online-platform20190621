import {createElement} from 'react';
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp';
import {getMenuData} from './menu';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({namespace}) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach(model => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = {...item};
      keys = {...keys, ...getFlatMenuData(item.children)};
    } else {
      keys[item.path] = {...item};
    }
  });
  return keys;
}

export const getRouterData = app => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    },
    // 设备列表
    '/equipments/equipments-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Equipments/EquipmentsList')),
    },
    // 产品订单列表
    '/orders/orders-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Orders/OrdersList')),
    },
    // 产品订单详情
    '/orders/order-profile': {
      component: dynamicWrapper(app, [], () => import('../routes/Orders/OrderProfile')),
    },
    // 耗材订单列表
    '/orders/filters-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Orders/FiltersList')),
    },
    // 耗材订单详情
    '/orders/filters-profile': {
      component: dynamicWrapper(app, [], () => import('../routes/Orders/FilterProfile')),
    },
    // 退款列表
    '/orders/refunds-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Orders/RefundsList')),
    },
    // 补贴收益
    '/earnings/subsidy-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Earnings/SubsidyList')),
    },
    // 返点收益
    '/earnings/rebate-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Earnings/RebateList')),
    },
    // 结算列表
    '/earnings/clearing-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Earnings/ClearingList')),
    },
    // 钱包账户
    '/wallet/wallet-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Wallet/WalletList')),
    },
    // 提现申请
    '/wallet/withdrawal': {
      component: dynamicWrapper(app, [], () => import('../routes/Wallet/Withdrawal')),
    },
    // 代理商列表
    '/vendors/agents-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Vendors/AgentsList')),
      authority: ['admin', 'vendors'],
    },
    // 经销商列表
    '/vendors/dealers-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Vendors/DealerList')),
      authority: ['admin', 'vendors', 'agents'],
    },
    // 添加 编辑 代理商 经销商
    '/vendors/ad-add': {
      component: dynamicWrapper(app, [], () => import('../routes/Vendors/ADAdd')),
      authority: ['admin', 'vendors'],
    },
    // 代理商 经销商 详情
    '/vendors/ad-profile': {
      component: dynamicWrapper(app, [], () => import('../routes/Vendors/ADProfile')),
    },
    // 新增签约信息
    '/vendors/deal-add': {
      component: dynamicWrapper(app, [], () => import('../routes/Vendors/DealAdd')),
      authority: ['admin', 'vendors'],
    },
    // 团购订单列表
    '/group/group-orders-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Group/GroupOrdersList')),
    },
    // 团购码列表
    '/group/code-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Group/CodeList')),
    },
    // 退码列表
    '/group/refunds-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Group/RefundsList')),
    },
    // 用户列表
    '/users/users-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Users/UsersList')),
    },
    // 产品管理
    '/products/products-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Products/ProductsList')),
      authority: ['admin', 'vendors'],
    },
    // 产品详情
    '/products/product-profile': {
      component: dynamicWrapper(app, [], () => import('../routes/Products/ProductProfile')),
      authority: ['admin', 'vendors'],
    },
    // 添加/编辑产品
    '/products/product-add': {
      component: dynamicWrapper(app, [], () => import('../routes/Products/ProductAdd')),
      authority: ['admin', 'vendors'],
    },
    // 产品ID管理
    '/ids/machine': {
      component: dynamicWrapper(app, [], () => import('../routes/Ids/Machines')),
    },
    '/ids/machine-list': {
      component: dynamicWrapper(app, [], () => import('../routes/Ids/MachinesList')),
    },
    // 滤芯ID管理
    '/ids/element': {
      component: dynamicWrapper(app, [], () => import('../routes/Ids/Element')),
    },
    // 个人中心
    '/info/profile': {
      component: dynamicWrapper(app, [], () => import('../routes/Info/Profile')),
    },
    // 发货额度
    '/info/delivery-quota': {
      component: dynamicWrapper(app, [], () => import('../routes/Info/DeliveryQuota')),
    },
    // 登陆密码
    '/info/reset-password': {
      component: dynamicWrapper(app, [], () => import('../routes/Info/ResetPassword')),
    },
    // 支付密码
    '/info/pay-password': {
      component: dynamicWrapper(app, [], () => import('../routes/Info/PayPassword')),
    },
    // 银行卡
    '/info/bank-card': {
      component: dynamicWrapper(app, [], () => import('../routes/Info/BankCard')),
    },
    // 退出登录
    '/info/sign-out': {
      component: dynamicWrapper(app, [], () => import('../routes/Info/SignOut')),
    },

    // 框架自带
    '/result/success': {
      component: dynamicWrapper(app, [], () => import('../routes/Result/Success')),
    },
    '/result/fail': {
      component: dynamicWrapper(app, [], () => import('../routes/Result/Error')),
    },
    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/exception/trigger': {
      component: dynamicWrapper(app, ['error'], () => import('../routes/Exception/triggerException')),
    },
    '/user': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/user/login': {
      component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
    },
    '/user/register': {
      component: dynamicWrapper(app, ['register'], () => import('../routes/User/Register')),
    },
    '/user/register-result': {
      component: dynamicWrapper(app, [], () => import('../routes/User/RegisterResult')),
    },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
