import React, {PureComponent} from 'react';
import {Layout, Menu, Icon} from 'antd';
import pathToRegexp from 'path-to-regexp';
import {Link} from 'dva/router';
import styles from './index.less';
import {urlToList} from '../_utils/pathTools';

const {Sider} = Layout;
const {SubMenu} = Menu;

// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'http://demo.com/icon.png',
//   icon: <Icon type="setting" />,
const getIcon = icon => {
  if (typeof icon === 'string' && icon.indexOf('http') === 0) {
    return <img src={icon} alt="icon" className={`${styles.icon} sider-menu-item-img`} />;
  }
  if (typeof icon === 'string') {
    return <Icon type={icon} />;
  }
  return icon;
};

export const getMeunMatcheys = (flatMenuKeys, path) => {
  return flatMenuKeys.filter(item => {
    return pathToRegexp(item).test(path);
  });
};

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.menus = props.menuData;
    this.flatMenuKeys = this.getFlatMenuKeys(props.menuData);
    this.state = {
      openKeys: this.getDefaultCollapsedSubMenus(props),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.setState({
        openKeys: this.getDefaultCollapsedSubMenus(nextProps),
      });
    }
  }

  /**
   * Convert pathname to openKeys
   * /list/search/articles = > ['list','/list/search']
   * @param  props
   */
  getDefaultCollapsedSubMenus(props) {
    const {location: {pathname}} = props || this.props;
    return urlToList(pathname)
      .map(item => {
        return getMeunMatcheys(this.flatMenuKeys, item)[0];
      })
      .filter(item => item);
  }

  /**
   * Recursively flatten the data
   * [{path:string},{path:string}] => {path,path2}
   * @param  menus
   */
  getFlatMenuKeys(menus) {
    let keys = [];
    menus.forEach(item => {
      if (item.children) {
        keys = keys.concat(this.getFlatMenuKeys(item.children));
      }
      keys.push(item.path);
    });
    return keys;
  }

  /**
   * 判断是否是http链接.返回 Link 或 a
   * Judge whether it is http link.return a or Link
   * @memberof SiderMenu
   */
  getMenuItemPath = item => {
    const itemPath = this.conversionPath(item.path);
    const icon = getIcon(item.icon);
    const {target, name} = item;
    // Is it a http link
    if (/^https?:\/\//.test(itemPath)) {
      return (
        <a href={itemPath} target={target}>
          {icon}
          <span>{name}</span>
        </a>
      );
    }
    return (
      <Link
        to={itemPath}
        target={target}
        replace={itemPath === this.props.location.pathname}
        onClick={
          this.props.isMobile
            ? () => {
            this.props.onCollapse(true);
          }
            : undefined
        }
      >
        {icon}
        <span>{name}</span>
      </Link>
    );
  };
  /**
   * get SubMenu or Item
   */
  getSubMenuOrItem = item => {
    if (item.children && item.children.some(child => child.name)) {
      const childrenItems = this.getNavMenuItems(item.children);
      // 当无子菜单时就不展示菜单
      if (childrenItems && childrenItems.length > 0) {
        return (
          <SubMenu
            title={
              item.icon ? (
                <span>
                  {getIcon(item.icon)}
                  <span>{item.name}</span>
                </span>
              ) : (
                item.name
              )
            }
            key={item.path}
          >
            {childrenItems}
          </SubMenu>
        );
      }
      return null;
    } else {
      return <Menu.Item key={item.path}>{this.getMenuItemPath(item)}</Menu.Item>;
    }
  };
  /**
   * 获得菜单子节点
   * @memberof SiderMenu
   */
  getNavMenuItems = menusData => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter(item => item.name && !item.hideInMenu)
      .map(item => {
        // make dom
        const ItemDom = this.getSubMenuOrItem(item);
        return this.checkPermissionItem(item.authority, ItemDom);
      })
      .filter(item => item);
  };
  // Get the currently selected menu
  getSelectedMenuKeys = () => {
    const {location: {pathname}} = this.props;
    return urlToList(pathname).map(itemPath => getMeunMatcheys(this.flatMenuKeys, itemPath).pop());
  };
  // conversion Path
  // 转化路径
  conversionPath = path => {
    if (path && path.indexOf('http') === 0) {
      return path;
    } else {
      return `/${path || ''}`.replace(/\/+/g, '/');
    }
  };
  // permission to check
  checkPermissionItem = (authority, ItemDom) => {
    if (this.props.Authorized && this.props.Authorized.check) {
      const {check} = this.props.Authorized;
      return check(authority, ItemDom);
    }
    return ItemDom;
  };
  isMainMenu = key => {
    return this.menus.some(item => key && (item.key === key || item.path === key));
  };
  handleOpenChange = openKeys => {
    const lastOpenKey = openKeys[openKeys.length - 1];
    const moreThanOne = openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
    this.setState({
      openKeys: moreThanOne ? [lastOpenKey] : [...openKeys],
    });
  };

  render() {
    const {collapsed, onCollapse} = this.props;
    const {openKeys} = this.state;

    // Don't show popup menu when it is been collapsed
    const menuProps = collapsed ? {} : {openKeys};
    // if pathname can't match, use the nearest parent's key
    let selectedKeys = this.getSelectedMenuKeys();
    if (!selectedKeys.length) {
      selectedKeys = [openKeys[openKeys.length - 1]];
    }
    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onCollapse={onCollapse}
        width={256}
        className={styles.sider}
      >
        <div className={styles.logo} key="logo">
          <Link to="/">
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALEAAAA9CAYAAADiW4hmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF32lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOC0wNC0wNVQyMjo0OToxMyswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTgtMDctMDdUMTA6NTg6MTErMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTgtMDctMDdUMTA6NTg6MTErMDg6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NjJhODlhODYtNmQ2OC00ZjAzLTkwMTctZWRlMTNjODAyYTdkIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOmEzN2I1Njg5LTI0Y2MtZjI0ZS1iZjg1LWFiYmRmNmNmNDM3YSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmEzN2I1Njg5LTI0Y2MtZjI0ZS1iZjg1LWFiYmRmNmNmNDM3YSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YTM3YjU2ODktMjRjYy1mMjRlLWJmODUtYWJiZGY2Y2Y0MzdhIiBzdEV2dDp3aGVuPSIyMDE4LTA0LTA1VDIyOjQ5OjEzKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo2MmE4OWE4Ni02ZDY4LTRmMDMtOTAxNy1lZGUxM2M4MDJhN2QiIHN0RXZ0OndoZW49IjIwMTgtMDctMDdUMTA6NTg6MTErMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5NDRYOAAAKa0lEQVR4nO2df4xcVRXHP202TUOaTUOwaRpTb5p1JYhaSFGCRdtioRhBUJRiW7EFI4rVmEIbpISQFpEoNv6oigasxRJFpKJUY2t/aPwFVmgQ64Zs1psNwaZpyLppGkM2M/7xnbHTdmbfe/fct3OnO59kM93OO+fevXPm/jrnnjulWq3SJQpTgTnAucAsoAeo1F5HgCPAa7V/d4lIT7sr0MHMBy4FLgIuBGYD8zJkPHAcOAy8ADwP7C6thpOEKdVq9Q7gHcDrJZdVAY4C/wFeBQbRhzlacrkx+QBwNXAZMBNwRn0e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"
              alt="logo"
            />
            <h1>智能平台</h1>
          </Link>
        </div>
        <Menu
          key="Menu"
          theme="light"
          mode="inline"
          {...menuProps}
          onOpenChange={this.handleOpenChange}
          selectedKeys={selectedKeys}
          style={{padding: '16px 0', width: '100%'}}
        >
          {this.getNavMenuItems(this.menus)}
        </Menu>
      </Sider>
    );
  }
}
