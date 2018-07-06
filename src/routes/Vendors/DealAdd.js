/* eslint-disable prefer-destructuring */
import React, {PureComponent} from 'react';
import {Card, Button, Form, Icon, Input, Popover, DatePicker, InputNumber, message} from 'antd';
import moment from 'moment';
import {connect} from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './style.less';

const url = 'http://iot.dochen.cn/api';

// 输入框
const fieldLabels = {
  // 基础信息
  contract_no: '合同编号',
  begin_end: '签约周期',
  pledge: '累计押金',
  deposit: '累计保证金',
  goods: '发货额度',
  allowance_fee: '补贴金额',
  commission_rate: '滤芯返点',
  service_rate: '售后返点',
};

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

class AgentsAdd extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      BeginEnd: [],
      dealInfo:{},
    };
  }

  componentDidMount() {
    this.getDealList();
  }

  // 获取签约信息列表
  getDealList() {
    const {location: {search}} = this.props;
    const ad = search.slice(1).split('&');
    const prm = {};
    ad.forEach((val) => {
      prm[val.split('=')[0]] = val.split('=')[1];
    });

    const dealListUrl = `${url}/${prm.role}/${prm.id}/deal`;
    fetch(dealListUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({
            dealInfo: info.data[0],
            BeginEnd: [info.data[0].begin_at, info.data[0].end_at],
          });
        });
      }
    });
  }

  render() {
    const {form, submitting} = this.props;
    const {getFieldDecorator, validateFieldsAndScroll, getFieldsError} = form;

    const {location: {search}} = this.props;
    const ad = search.slice(1).split('&');

    const prm = {};
    ad.forEach((val) => {
      prm[val.split('=')[0]] = val.split('=')[1];
    });

    // 请求服务器
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          const data = JSON.stringify(values);
          fetch(`http://iot.dochen.cn/api/${prm.role}/${prm.id}/deal${prm.uuid ? `/${prm.uuid}` : ''}`, {
            method: prm.uuid ? 'PUT' : 'POST',
            body: JSON.stringify({data}),
          }).then((res) => {
            if (res.ok) {
              res.json().then((info) => {
                if (info.status) {
                  location.href = `#/vendors/ad-profile/${search}`;
                } else {
                  message.error(info.message);
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
        title="添加签约信息"
        wrapperClassName={styles.advancedForm}
      >
        <Card title="签约信息" className={styles.card} bordered={false}>
          <Form>
            <Form.Item label={fieldLabels.contract_no} {...formItemLayout} >
              {getFieldDecorator('contract_no', {
                initialValue: this.state.dealInfo.contract_no,
                rules: [{required: true, message: '合同编号必须填写'}],
              })(
                <Input placeholder="请输入合同编号" />
              )}
            </Form.Item>
            <Form.Item {...formItemLayout} >
              {getFieldDecorator('begin_at', {
                initialValue: this.state.dealInfo.begin_at || this.state.BeginEnd[0],
                rules: [{required: true, message: '必须选择签约周期'}],
              })(
                <Input type="hidden" placeholder="*" />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.begin_end} {...formItemLayout} >
              {getFieldDecorator('end_at', {
                initialValue: this.state.dealInfo.end_at || this.state.BeginEnd[1],
                rules: [{required: true, message: '必须选择签约周期'}],
              })(
                <Input type="hidden" placeholder="*" />
              )}
              <DatePicker.RangePicker
                style={{width: '100%'}}
                value={this.state.BeginEnd.length > 0 ? [moment(this.state.BeginEnd[0], 'YYYY-MM-DD'), moment(this.state.BeginEnd[1], 'YYYY-MM-DD')] : ''}
                onChange={(date, dateString) => {
                  this.setState({BeginEnd: dateString});
                }}
              />
            </Form.Item>
            <Form.Item label={fieldLabels.pledge} {...formItemLayout} >
              {getFieldDecorator('pledge', {
                initialValue: this.state.dealInfo.pledge || 0,
                // rules: [{required: true, message: '*'}],
              })(
                <InputNumber
                  style={{width: '100%'}}
                  min={0}
                  formatter={value => `${value}元`}
                  parser={value => value.replace('元', '')}
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.deposit} {...formItemLayout} >
              {getFieldDecorator('deposit', {
                initialValue: this.state.dealInfo.deposit || 0,
                // rules: [{required: true, message: '*'}],
              })(
                <InputNumber
                  style={{width: '100%'}}
                  min={0}
                  formatter={value => `${value}元`}
                  parser={value => value.replace('元', '')}
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.goods} {...formItemLayout} >
              {getFieldDecorator('goods', {
                initialValue: this.state.dealInfo.goods || 0,
                // rules: [{required: true, message: '*'}],
              })(
                <InputNumber
                  style={{width: '100%'}}
                  min={0}
                  formatter={value => `${value}台`}
                  parser={value => value.replace('台', '')}
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.allowance_fee} {...formItemLayout} >
              {getFieldDecorator('allowance_fee', {
                initialValue: this.state.dealInfo.allowance_fee || 0,
                // rules: [{required: true, message: '*'}],
              })(
                <InputNumber
                  style={{width: '100%'}}
                  min={0}
                  formatter={value => `${value}元`}
                  parser={value => value.replace('元', '')}
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.commission_rate} {...formItemLayout} >
              {getFieldDecorator('commission_rate', {
                initialValue: this.state.dealInfo.commission_rate || 0,
                // rules: [{required: true, message: '*'}],
              })(
                <InputNumber
                  style={{width: '100%'}}
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.service_rate} {...formItemLayout} >
              {getFieldDecorator('service_rate', {
                initialValue: this.state.dealInfo.service_rate || 0,
                // rules: [{required: true, message: '*'}],
              })(
                <InputNumber
                  style={{width: '100%'}}
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                />
              )}
            </Form.Item>
          </Form>
        </Card>
        <div style={{display: `flex`, alignItems: `center`, flexDirection: `row-reverse`}}>
          <Button type="primary" onClick={validate} loading={submitting}>提交</Button>
          {getErrorInfo()}
        </div>
      </PageHeaderLayout>
    );
  }
}

export default connect(({global, loading}) => ({
  collapsed: global.collapsed,
  submitting: loading.effects['form/submitAdvancedForm'],
}))(Form.create()(AgentsAdd));
