/* eslint-disable react/no-array-index-key,no-param-reassign */
import React, {PureComponent} from 'react';
import {Card, Button, Form, Icon, Input, Popover, Cascader, Select, Popconfirm} from 'antd';
import {connect} from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './style.less';
import Ares from '../../models/area';

const url = 'http://iot.dochen.cn/api';

// 输入框
const fieldLabels = {
  // 基础信息
  organization: '单位名称',
  area: '所在区域',
  contact: '联系人',
  mobile: '手机号',
  // 账户信息
  username: '用户名',
  password: '初始密码',
  region: '所属区域',
  superior: '所属代理商',
};

// 布局
const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 4},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 10},
  },
};

class DealerAdd extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      options: Ares,
      area: '',
      superior: '请选择',
      ADinfo: {},
      lists: [],
    };
  }

  componentDidMount() {
    this.getAgentsInfo();
    this.getAgentsList();
  }

  // 获取代理商列表
  getAgentsList() {
    const agentsListUrl = `${url}/agents`;
    fetch(agentsListUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({lists: info.data});
        });
      }
    });
  }

  // 获取商家信息
  getAgentsInfo() {
    const {location: {search}} = this.props;
    const ad = search.slice(1).split('&');
    const role = ad[0].slice(1).split('=')[1];
    const roleId = ad[1] ? ad[1].slice(1).split('=')[1] : '';

    const infoUrl = `${url}/${role}/${roleId}`;
    fetch(infoUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) {
            this.setState({
              superior: info.data[0].superior,
              ADinfo: info.data[0],
              area: info.data[0].area,
            });
          }
        });
      }
    });
  }

  render() {
    const {form, submitting} = this.props;
    const {getFieldDecorator, validateFieldsAndScroll, getFieldsError} = form;

    const {location: {search}} = this.props;
    const ad = search.slice(1).split('&');
    const role = ad[0].slice(1).split('=')[1];

    const {options, area, superior, ADinfo, lists} = this.state;

    const aMenu = [];
    lists.forEach((val, k) => {
      aMenu.push(<Select.Option key={k} value={val.aid}>{val.contact}</Select.Option>);
    });

    // 请求服务器
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          const data = JSON.stringify(values);
          fetch(`http://iot.dochen.cn/api/${role}${ad[1] ? `/${ad[1].slice(1).split('=')[1]}` : ''}`, {
            method: `${ad[1] ? 'PUT' : 'POST'}`,
            body: JSON.stringify({data}),
          }).then((res) => {
            if (res.ok) {
              res.json().then((info) => {
                if (info.status) {
                  location.href = `#/vendors/ad-profile/?role=${role}&id=${info.data[0].uuid}`;
                }
              });
            }
          });
        }
      });
    };

    const errors = getFieldsError();
    const getErrorInfo = () => {
      const errorCount = Object.keys(errors).filter(key => errors[key]).length;
      if (!errors || errorCount === 0) {
        return null;
      }
      const scrollToField = (fieldKey) => {
        const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
        if (labelNode) {
          labelNode.scrollIntoView(true);
        }
      };
      const errorList = Object.keys(errors).map((key) => {
        if (!errors[key]) {
          return null;
        }
        return (
          <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
            <Icon type="cross-circle-o" className={styles.errorIcon} />
            <div className={styles.errorMessage}>{errors[key][0]}</div>
            <div className={styles.errorField}>{fieldLabels[key]}</div>
          </li>
        );
      });
      return (
        <span className={styles.errorIcon} style={{float: 'right'}}>
          <Popover
            title="表单校验信息"
            content={errorList}
            overlayClassName={styles.errorPopover}
            trigger="click"
            getPopupContainer={trigger => trigger.parentNode}
          >
            <Icon type="exclamation-circle" />
          </Popover>
          {errorCount}
        </span>
      );
    };

    return (
      <PageHeaderLayout
        title={`添加${role === 'dealers' ? '经销商' : '代理商'}`}
        wrapperClassName={styles.advancedForm}
      >
        <Card title="基本信息" className={styles.card} bordered={false}>
          <Form>
            <Form.Item label={fieldLabels.organization} {...formItemLayout} >
              {getFieldDecorator('organization', {
                initialValue: ADinfo.organization,
                rules: [{required: true, message: '单位名称必须填写'}],
              })(
                <Input placeholder="请输入单位名称" />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.area} {...formItemLayout} >
              {getFieldDecorator('area', {
                initialValue: area,
                rules: [{required: true, message: '*'}],
              })(
                <Input type="hidden" placeholder="*" />
              )}
              <Cascader
                options={options}
                value={area.split("/").length > 1 ? area.split("/") : ''}
                onChange={(value) => {
                  this.setState({
                    area: value.join("/"),
                  })
                }}
                allowClear={false}
                placeholder="请选择"
              />
            </Form.Item>
            <Form.Item label={fieldLabels.superior} {...formItemLayout} >
              {getFieldDecorator('superior', {
                initialValue: superior,
              })(
                <Input type="hidden" placeholder="*" />
              )}
              <Select
                defaultValue={superior}
                value={superior}
                style={{width: '100%'}}
                onChange={(value) => this.setState({superior: value})}
              >
                <Select.Option value="请选择">请选择</Select.Option>
                <Select.Option value="DGK 智能平台">DGK 智能平台</Select.Option>
                {aMenu}
              </Select>
            </Form.Item>
            <Form.Item label={fieldLabels.contact} {...formItemLayout} >
              {getFieldDecorator('contact', {
                initialValue: ADinfo.contact,
                rules: [
                  {required: true, message: '联系人姓名必须输入'},
                  {pattern: /^[\u4E00-\u9FA5]{1,4}$/, message: '姓名格式错误！'},
                ],
              })(
                <Input placeholder="请输入联系人姓名" />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.mobile} {...formItemLayout} >
              {getFieldDecorator('mobile', {
                initialValue: ADinfo.mobile,
                rules: [
                  {required: true, message: '联系人手机号必须输入'},
                  {pattern: /^1\d{10}$/, message: '手机号格式错误！'},
                ],
              })(
                <Input maxLength={11} placeholder="请输入联系人手机号" />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.username} {...formItemLayout} >
              {getFieldDecorator('username', {
                initialValue: ADinfo.username,
                rules: [
                  {required: true, message: '用户名必须填写'},
                  {pattern: /^1\d{10}$/, message: '用户名必须为有效的手机号！'},
                ],
              })(
                <Input maxLength={11} placeholder="用户名必须是有效的手号" />
              )}
            </Form.Item>
            {
              ad[1] ? '' : (
                <Form.Item label={fieldLabels.password} {...formItemLayout} >
                  {getFieldDecorator('password', {
                    initialValue: '0123456789',
                  })(
                    <Input disabled />
                  )}
                </Form.Item>
              )
            }
          </Form>
        </Card>
        <div style={{display: `flex`, alignItems: `center`, flexDirection: `row-reverse`}}>
          <Popconfirm
            placement="left"
            title="请确认资料无误后，才把数据提交"
            onConfirm={validate}
            loading={submitting}
            okText="确定"
            cancelText="取消"
          >
            <Button type="primary">提交资料</Button>
          </Popconfirm>
          {getErrorInfo()}
        </div>
      </PageHeaderLayout>
    );
  }
}

export default connect(({global, loading}) => ({
  collapsed: global.collapsed,
  submitting: loading.effects['form/submitAdvancedForm'],
}))(Form.create()(DealerAdd));
