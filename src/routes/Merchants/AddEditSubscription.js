/* eslint-disable prefer-destructuring */
import React, {PureComponent} from 'react';
import {Card, Button, Form, Input, DatePicker, InputNumber} from 'antd';
import moment from 'moment';
import {connect} from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const url = 'http://iot.dochen.cn/api';

// 输入框
const fieldLabels = {
  begin_at: '起始时间',
  end_at: '结束时间',
  contract: '合同编号',
  pledge: '累计押金(元)',
  deposit: '累计保证金(元)',
  amount: '累计发货额度(台)',
};

const formItemLayout = {
  labelCol: {xs: {span: 24}, sm: {span: 4}},
  wrapperCol: {xs: {span: 24}, sm: {span: 10}},
};

class AgentsAdd extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      subscriptionInfo: {},
      begin_at: '',
      end_at: '',
    };
  }

  componentDidMount() {
    this.getSubscriptionInfo();
  }

  // 获取签约信息列表
  getSubscriptionInfo() {
    const {location: {search}} = this.props;
    const prm = [];
    search.substring(1).split('&').forEach((val) => {
      prm[val.split('=')[0]] = val.split('=')[1];
    });

    const dealListUrl = `${url}/merchants/${prm.mid}/subscription`;
    fetch(dealListUrl).then((res) => {
      if (res.ok) {
        res.json().then((info) => {
          if (info.status) this.setState({subscriptionInfo: info.data[0]});
        });
      }
    });
  }

  render() {
    const {form, submitting, location: {search}} = this.props;
    const {getFieldDecorator, validateFieldsAndScroll} = form;
    const {subscriptionInfo, begin_at, end_at} = this.state;

    const prm = [];
    search.substring(1).split('&').forEach((val) => {
      prm[val.split('=')[0]] = val.split('=')[1];
    });

    // 请求服务器
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          let postSubscription = `${url}/merchants/${prm.mid}/subscription`;
          postSubscription += prm.id ? `/${prm.id}` : '';
          fetch(postSubscription, {
            method: prm.id ? 'PUT' : 'POST',
            body: JSON.stringify(values),
          }).then((res) => {
            if (res.ok) {
              res.json().then((info) => {
                if (info.status) location.hash = `/vendors/ad-profile?mid=${prm.mid}`;
              });
            }
          });
        }
      });
    };

    return (
      <PageHeaderLayout
        title="添加签约信息"
        wrapperClassName={styles.advancedForm}
      >
        <Card title="签约信息" className={styles.card} bordered={false}>
          <Form>
            <Form.Item label={fieldLabels.begin_at} {...formItemLayout} >
              {getFieldDecorator('begin_at', {
                initialValue: subscriptionInfo.begin_at || begin_at,
                rules: [{required: true, message: '必须选择签约周期'}],
              })(
                <Input type="hidden" />
              )}
              {prm.id ? (subscriptionInfo.begin_at ? (
                <DatePicker
                  style={{width: '100%'}}
                  onChange={(date, dateString) => this.setState({begin_at: dateString})}
                  defaultValue={moment(subscriptionInfo.begin_at, 'YYYY-MM-DD')}
                />
                ) : ''
              ) : (
                <DatePicker style={{width: '100%'}} onChange={(date, dateString) => this.setState({begin_at: dateString})} />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.end_at} {...formItemLayout} >
              {getFieldDecorator('end_at', {
                initialValue: subscriptionInfo.end_at || end_at,
                rules: [{required: true, message: '必须选择签约周期'}],
              })(
                <Input type="hidden" />
              )}
              {prm.id ? (subscriptionInfo.end_at ? (
                <DatePicker
                  style={{width: '100%'}}
                  onChange={(date, dateString) => this.setState({end_at: dateString})}
                  defaultValue={moment(subscriptionInfo.end_at, 'YYYY-MM-DD')}
                />
                ) : ''
              ) : (
                <DatePicker style={{width: '100%'}} onChange={(date, dateString) => this.setState({end_at: dateString})} />
              )}
            </Form.Item>

            <Form.Item label={fieldLabels.contract} {...formItemLayout} >
              {getFieldDecorator('contract', {
                initialValue: subscriptionInfo.contract,
                rules: [{required: true, message: '合同编号必须填写'}],
              })(
                <Input placeholder="请输入合同编号" />
              )}
            </Form.Item>
            <Form.Item label={fieldLabels.pledge} {...formItemLayout} >
              {getFieldDecorator('pledge', {
                initialValue: subscriptionInfo.pledge || 0,
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
                initialValue: subscriptionInfo.deposit || 0,
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
            <Form.Item label={fieldLabels.amount} {...formItemLayout} >
              {getFieldDecorator('amount', {
                initialValue: subscriptionInfo.amount || 0,
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
          </Form>
        </Card>
        <div style={{display: `flex`, alignItems: `center`, flexDirection: `row-reverse`}}>
          <Button type="primary" onClick={validate} loading={submitting}>提交</Button>
        </div>
      </PageHeaderLayout>
    );
  }
}

export default connect(({global, loading}) => ({
  collapsed: global.collapsed,
  submitting: loading.effects['form/submitAdvancedForm'],
}))(Form.create()(AgentsAdd));
