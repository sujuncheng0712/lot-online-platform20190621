
# IoT 物联网云平台接口(API)说明书

> 说明: 本说明书用于指导物联网平台服务开发
>
> - 2018.03.20: v 0.9, 运营商业务更新
> - 2018.03.12: v 0.8, 运营商业务
> - 2018.01.16: v 0.7, 最小闭环系统分析
> - 2018.01.09: v 0.6, 根据业务完善接口
> - 2017.12.21: v 0.5, 订单业务接口及详细设计
> - 2017.12.19: v 0.4, 用户, 设备和商品详细设计
> - 2017.12.18: v 0.3, 错误信息, 交互细节和交互示意
> - 2017.12.17: v 0.2, 用户, 设备, 商品和订单业务接口设计
> - 2017.12.15: v 0.1, 设计系统接口框架

## 〇 概述

### 1 文档说明

#### 1.1 缩略词

- A*: Admin, Web管理后台 (仅限平台管理员调用)
- A#: Admin, Web管理后台 (仅限平台和品牌商调用)
- A: Admin, Web管理后台 (平台, 品牌商, 代理商/经销商)
- C: Client, 用户客户端 (包括App, 微信)
- UID: user_id, 用户ID, 用户唯一标识
- DID: device_id, 设备序列号, 设备唯一标识
- PID: product_id, 商品编码, 商品唯一标识
- OID: order_id, 订单单号, 订单唯一标识
- TID: ticket_id, 工单单号, 工单唯一标识

#### 1.2 编号规则

- 用户: XXXX0123456789ABCDEF, 其中X为客户(品牌商)代码, 后缀为流水号(不回收)
- 商品: XXXX0123456789ABCDEF, 其中X为客户(品牌商)代码, 后缀为流水号(不回收)
- 订单: D20171221XXXX000123456789, 其中X为客户(品牌商)代码, 前缀为日期, 后缀为流水号
- 工单: T20171221XXXX000123456789, 其中X为客户(品牌商)代码, 前缀为日期, 后缀为流水号

*[注意] 后台不会把订单号前面加'D', 也不会把工单号前面加'T', 由前端展现时处理.*

#### 1.3 其他规则

All timestamps return in ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`

### 2 系统描述

#### 2.1 系统需求

- 支持用户注册 和 推广 (如二维码)
- 支持设备接入, 控制 和 分享
- 支持扫码出水 (出水量可控)
- 支持按时间或流量计费的租赁模式 (含保底消费)
- 支持在线购买, 支付
- 支持三级分销 (实时)
- 支持多渠道收款 (多种收款渠道)
- 支持银行卡付款 (单一付款渠道)
- 支持品牌商, 代理商, 经销商 和 合作人 (结算)
- 支持自动工单, 派单 和 评价
- 支持用户后台分级 和 权限控制
- 支持广告推送
- 支持促销活动 (拼多多)

#### 2.2 系统模块

- 会员管理 (品牌商+代理商) ↑
- 设备管理 (品牌商+代理商) ↑
- 订单管理 (品牌商+代理商) 
- 工单管理 (品牌商+代理商) ↓
- 佣(租)金管理 (品牌商+代理商) ↑
- 商城管理 (品牌商) 
- 客户(代理商)管理 (品牌商) ↑
- 促销系统
- 广告系统
- 用户权限
- 企业配置

*收款隐含在订单系统; 付款隐含在佣金系统*

### 3 接口说明

#### 3.1 响应码

- 200 OK - [GET]：服务器成功返回用户请求的数据，该操作是幂等的（Idempotent）。
- 201 CREATED - [POST/PUT/PATCH]：用户新建或修改数据成功。
- 202 Accepted - [*]：表示一个请求已经进入后台排队（异步任务）
- 204 NO CONTENT - [DELETE]：用户删除数据成功。
- 400 INVALID REQUEST - [POST/PUT/PATCH]：用户发出的请求有错误，用户应该修正错误后再提交请求。
- 401 Unauthorized - [*]：表示用户没有权限（令牌、用户名、密码错误）。
- 403 Forbidden - [*] 表示用户得到授权（与401错误相对），但是访问是被禁止的。
- 404 NOT FOUND - [*]：用户发出的请求针对的是不存在的记录，服务器没有进行操作，该操作是幂等的。
- 406 Not Acceptable - [GET]：用户请求的格式不可得（比如用户请求JSON格式，但是只有XML格式）。
- 410 Gone -[GET]：用户请求的资源被永久删除，且不会再得到的。
- 422 Unprocesable entity - [POST/PUT/PATCH] 当创建一个对象时，发生一个验证错误。
- 500 INTERNAL SERVER ERROR - [*]：服务器发生错误，用户将无法判断发出的请求是否成功。

#### 3.2 错误信息

接口调用成功与否, 通过返回的状态值(status)表示, true表示成功, false表示失败. 失败时将由code和message给出具体的错误信息. 

``` json
{
    "total": 0, // 数据长度 (仅调试用)
    "data": "", // 数据数组
    "status": "", // false OR true (必须验证此值, 确认请求调用的状态)
    "code": "", // 状态码 
    "message": "Problems parsing JSON" //错误信息
}
```

#### 3.3 筛选条件

- ?limit=10&offset=10：指定返回记录的数量和指定返回记录的开始位置。
- ?sort=name&order=asc：指定返回结果按照哪个属性排序，以及排序顺序。
- ?xxx=1：指定其他筛选条件, 如(type=1)

### 4 登录鉴权

#### 4.1 签名算法

*Pending*

#### 4.2 交互过程

*Pending*

## 一 会员管理 - 用户 (User)

> 会员(用户)配置
>
> 会员(用户)状态: 
>
> - 0 - 禁用 (disable)
> - 1 - 未激活 (inactive)
> - 2 - 已激活 (active)

| 编号 | 接口API | 接口描述 | 请求数据 | 响应数据 | 使用范围 | 备注 |
|:------ |:------ |:------ |:------ |:------ |:------ |:------ |
| AA-01 | GET /users | 获取用户(会员)列表 | \<None\> |  | A | *[注1]* |
| AA-02 | POST /users/code | 获取注册验证码 | \<None\> |  | C | 验证码 |
| AA-03 | POST /users | 注册新用户(会员) |  |  | C |  |
| AA-04 | GET /users/\<UID\> | 查询用户(会员)资料 | \<None\> |  | A+C |  |
| AA-05 | PUT /users/\<UID\> | 修改用户(会员)资料 |  |  | A#+C |  |
| AA-06 | PUT /users/\<UID\>/pwd | 修改用户(会员)登录密码 |  |  | A#+C |  |
| AA-06A | GET /users/\<UID\>/mob/code | 获取修改手机验证码 | \<None\> |  | A#+C |  |
| AA-06B | PUT /users/\<UID\>/mob | 修改用户(会员)手机号码 |  |  | A#+C |  |
| AA-07 | POST /users/rst | 找回用户(会员)登录密码 |  |  | A#+C | 未实现 |
| AA-08 | POST /users/bind | 绑定用户微信(会员) |  |  | C | 不存在则注册 |
| AA-09 | DELETE /users/\<UID\>bind | 解绑用户微信(会员) | \<None\> |  | A#+C |  |

| AA-10 | DELETE /users/\<UID\> | 注销用户(会员) | \<None\> |  | A* | *[注2]* |

*[注1] 不同权限的用户获得的结果不同*

*[注2] A*代表只有厂商可以调用, 其他用户调用失败*

### AA-01 获取用户(会员)列表

请求:

`<None>`

响应: 

``` json
{
    "users": [
        {
            "state": 0, // 状态
            "type": 0,
            "uid": "", // 用户ID (user_id)
            // infos
            "name":"John", // 姓名
            "avatar":"", // 头像
            "mobile":"01234567890", // 手机
            "email":"marvin.nps@gmail.com", // 邮箱
            "area":"广东省珠海市香洲区", // 地址(区域)
            "address":"南方软件园A123", // 地址(详细)
            "reg_tms":"2018-01-02T03:04:05Z", // 注册时间
            "remark":"", // 标注
            "vip":false, // VIP
            "bonus":123, // 积分
            "devices": 3, // 绑定设备(数量) -> 列表
            //"role": "admin", // 角色 <管理员可见>
            "vid": "13900000000", // 所属品牌商(运营商) <管理员可见> (vendor_id)
            //"dealers_id": "13900000000", // 所属经销商 <管理员可见>
            "rid":"13900000000", // 推荐人 (referrer_id)
            "weixin": { // 绑定微信(信息)
                "nick":"John", // 昵称
                "avatar":"", // 头像
                "sex": 1, // 性别
                "sbc_tms": 1386160805, //关注时间
                "OpenID":"", // 微信 OpenID
                "UnionID":"" // 微信 唯一ID
            }
        }, 
        {
            "state": 0, // 状态
            "type": 0,
            "uid": "", // 用户ID (user_id)
            // infos
            "name":"John", // 姓名
            "avatar":"", // 头像
            // ... 
        }, 
        { 
            "state": 0, // 状态
            "type": 0,
            "uid": "", // 用户ID (user_id)
            // infos
            "name":"John", // 姓名
            "avatar":"", // 头像
            // ... 
        }
    ]
}
```

### AA-02A 获取注册验证码

请求:

``` json
{
    "vid": "13900000000", // 所属品牌商(运营商)
    "mobile":"01234567890" // 手机号码
}
```

响应: 

`<None>`

### AA-02B 注册新用户(会员)

请求:

``` json
{
    "mobile":"01234567890", // 手机
    "code": "123456", // 验证码
    "name":"John", // 姓名
    // ... (选填)
    "vid": "13900000000", // 所属品牌商(运营商)
}
```

响应: 

`<None>`

### AA-04 修改用户(会员)资料

请求:

``` json
{
    "uid": "", // 用户ID
    "name":"John", // 姓名
    "avatar":"", // 头像
    "mobile":"01234567890", // 手机
    "email":"marvin.nps@gmail.com", // 邮箱
    "area":"广东省珠海市香洲区", // 地址(区域)
    "address":"南方软件园A123", // 地址(详细)
    "remark":"", // 标注
    "vid": "13900000000", // 所属品牌商(运营商)
    "rid":"13900000000", // 推荐人
}
```

响应: 

`<None>`

### AA-02B 修改用户(会员)登录密码

请求:

``` json
{
    "uid": "", // 用户ID
    "old_pwd":"", // 旧密码 (MD5)
    "new_pwd":"" // 新密码 (MD5)
}
```

响应: 

`<None>`

### AA-02B 获取修改手机验证码

请求:

``` json
{
    "uid": "", // 用户ID
    "mobile":"" // 手机号码
}
```

响应: 

`<None>`

### AA-02B 修改用户(会员)手机号码

请求:

``` json
{
    "uid": "", // 用户ID
    "mobile":"", // 手机号码
    "code":"" // 验证码
}
```

响应: 

`<None>`

### AA-02B 获取找回密码验证码

请求:

``` json
{
    "uid": "", // 用户ID
    "mobile":"" // 手机号码
}
```

响应: 

`<None>`

### AA-02B 找回用户(会员)登录密码

请求:

``` json
{
    "uid": "", // 用户ID
    "pwd":"", // 新密码 (MD5)
    "code":"" // 验证码
}
```

响应: 

`<None>`

### AA-02B  绑定用户微信(会员)

```
Pending
```

### AA-02B 解绑用户微信(会员)

```
Pending
```

### AA-02B 注销用户(会员)

请求:

``` json
{
    "uid": "" // 用户ID
}
```

响应: 

`<None>`

## 二 设备管理 - 设备 (Device)

> 设备配置
>
> 设备类型: *Pending*
>
> - 0 - 未知
> - 1 - 销售模式
> - 2 - 计时租赁
> - 3 - 计量租赁
> - 4 - 贩卖模式
> - 8 - 测试
>
> 如何显示设备状态? 

| 编号 | 接口API | 接口描述 | 请求数据 | 响应数据 | 使用范围 | 备注 |
|:------ |:------ |:------ |:------ |:------ |:------ |:------ |
| AB-01 | GET /devices | 获取设备列表 | \<None\> |  | A |  |
| AB-02 | POST /devices | 注册设备 |  |  | A* |  |
| AB-03 | GET /devices/\<DID\> | 查询设备信息 | \<None\> |  | A+C | 厂商配置 |
| AB-04 | PUT /devices/\<DID\> | 配置设备信息 |  |  | A+C | 厂商配置 |
| AB-05 | GET /devices/\<DID\>/prof | 获取设备基础信息 | \<None\> |  | A+C | 用户配置 |
| AB-06 | PUT /devices/\<DID\>/prof | 修改设备基础信息 |  |  | A# | 用户配置 |
| AB-07 | GET /devices/\<DID\>/svc | 获取设备服务状态 | \<None\> |  | A+C |  |
| AB-08 | PUT /devices/\<DID\>/svc | 修改设备服务状态 |  |  | A# |  |
| AB-09 | GET /devices/\<DID\>/stat | 获取设备运行状态 | \<None\> |  | A+C |  |
| AB-10 | GET /devices/\<DID\>/stat | 获取设备统计信息 | \<None\> |  | A+C |  |
| AB-11 | POST /devices/\<DID\>/bind | 用户设备绑定 |  |  | A+C |  |
| AB-12 | DELETE /devices/\<DID\>/infos | 清空设备信息 | \<None\> |  | A# | 恢复出厂 |
| AB-13 | DELETE /devices/\<DID\>/bind | 用户设备解绑 | \<None\> |  | A#+C |  |
| AB-14 | DELETE /devices/\<DID\> | 注销设备 | \<None\> |  | A* |  |
| AB-15 | POST /devices/\<DID\>/bind | 创建设备分享 |  |  | C |  |
| AB-16 | DELETE /devices/\<DID\>/share | 删除设备分享 | \<None\> |  | A+C |  |

### AB-01 获取设备列表

请求:

`<None>`

响应: 

``` json
{
    "devices": [
        {
            "state": 0,
            "type": 0, // 类型 ()
            "device_id": "XXXX01234567YYYY", // 设备ID数组
            // infos
            "brand": "", // 品牌
            "model":"000000", // 型号
            "fw_version": "1.0", // 固件版本
            "asm_tms":"20121221", // 生产时间戳(模块时间)
            "vendor_id": "0123456789", // 所属品牌商(运营商)
            "name": "智能净水机", // 设备名称
            //"remark": "办公室净水机", // 设备备注
            "atv_tms": "", // 激活时间
            "user_id": "0123456789", // 所属用户
            "user_share": [], // 分享列表
            "manufacture": { // 生产信息
                "product_id": "0123456789", // 所属商品
                "qc_id": "0123456789", // 质检员
                "qc_tms": "20121221" // 质检时间戳(出厂时间)
            },
            "installation": { // 安装信息 (租赁需要)
                // 代理商信息
                // 安装工信息
                "installer_id": "", // 安装工
                "install_tms": "" // 安装时间
                // 合同信息 (编号)
                // 姓名+身份证+手机号+地址
            },
            "service": { // 服务信息
                "state": 0, // 状态
                "expire": 0 // 过期时间 (TODO)
            },
            "basic": { // 设备基础信息 (采集)
                "platform": "ESP8266", // 设备平台
                "project": "工程", // 项目代号
                "net_entry": "gw.xxx.site", // 网络接入点
                "net_type": "GPRS", // 网络类型
                "dev_idcd": "", // MAC OR IMEI
                "sim_iccid": "" // SIM ICCID
            },
            "state": { // 设备运行信息 (采集)
                //"online": true, // ??? 
                //是否开机
                //是否故障
                //状态位值
                "online_tms": "", // 上线时间 (TODO @ 20171221)
                "offline_tms": "" // 离线时间
                "lbs_coord": "" // 地理位置
            },
            "statistics": { // 设备统计信息 (采集)

            }
        }, 
        {
            "device_ids": "XXXX01234567YYYY", // 设备ID数组
            "type": 0, // 类型
            "model":"000000", // 型号
            "hw_version": "1.0", // 硬件版本
            "sw_version": "1.0", // 软件版本
            "manufacture_tms":"20121221", // 生产时间戳
            "vendor_id": "0123456789" // 所属品牌商(运营商)
        }, 
        {
            "device_ids": "XXXX01234567YYYY", // 设备ID数组
            "type": 0, // 类型
            "model":"000000", // 型号
            "hw_version": "1.0", // 硬件版本
            "sw_version": "1.0", // 软件版本
            "manufacture_tms":"20121221", // 生产时间戳
            "vendor_id": "0123456789" // 所属品牌商(运营商)
        }
    ]
}
```

### AB-02 注册设备

请求:

``` json
{
    "device_ids": ["XXXX01234567YYYY"], // 设备ID数组
    "type": 0, // 类型
    "model":"000000", // 型号
    "hw_version": "1.0", // 硬件版本
    "sw_version": "1.0", // 软件版本
    "manufacture_tms":"20121221", // 出厂时间戳
    "vendor_id": "0123456789" // 所属品牌商(运营商)
}
```

响应: 

`<None>`

## 三 商城管理 - 商品 (Product)

> 参考 (支援界面美化) 
> 
> - 天猫商城
> - 京东商城
> - 微商

| 编号 | 接口API | 接口描述 | 请求数据 | 响应数据 | 使用范围 | 备注 |
|:------ |:------ |:------ |:------ |:------ |:------ |:------ |
| AC-01 | GET /products | 获取商品列表 | \<None\> |  | A+C |  |
| AC-02 | POST /products | 添加新商品 |  |  | A# |  |
| AC-03 | GET /products/\<PID\> | 查询商品信息 | \<None\> |  | A+C |  |
| AC-04 | PUT /products/\<PID\> | 修改商品信息 |  |  | A# |  |
| AC-05 | GET /products/\<PID\>/prof | 查询商品属性 | \<None\> |  | A+C |  |
| AC-06 | PUT /products/\<PID\>/prof | 修改商品属性 |  |  | A# |  |
| AC-07 | DELETE /products/\<PID\> | 删除商品 | \<None\> |  | A# | 删除确认 |

### AC-01 获取商品列表

*Pending*

### AC-02 添加新商品

> 商品配置
>
> - 商品类型: 1-购买; 2-预约.
> - 计费方案: 0-保留; 1-销售; 2-计时; 4-计量; 8-贩卖.
> - 计量模式: 0-直接上报; 1-计时上报; 2-计量上报.

请求:

``` json
{
    "state": 0, // 状态
    "type": 1, // 类型
    "prod_id": "", // 商品ID
    // infos
    "name": "智能净水机", // 名称
    "desc": "免安装移动水吧", // 描述
    "tags": "智能, 净水机, 水吧", // 标签
    "sequence": 1, // 排序
    "bonus": true, // 积分
    "price": 2980, // 价格
    "freight": 0, // 运费
    "install": false, // 安装服务
    "maintain": false, // 维护服务
    "install_cost": 0, // 安装费(一次)
    "maintain_cost": 0, // 维护费(每次)
    "orig_price": 4999, // 原价
    "resource": { // 商品资源(链接)
        "prev_res": "", // 预览
        "intro_res": [], // 介绍
        "detail_res": "", // 详情
    },
    "notify_url": "", // ? 
    "rent": { // 租金配置
        "deposit": 0, // 押金
        "config": [
            {"name": "30天", "key": "30d", "value": 60}, 
            {"name": "60天", "key": "60d", "value": 120}, 
            {"name": "90天", "key": "90d", "value": 180}, 
            {"name": "180天", "key": "180d", "value": 360}, 
            {"name": "360天", "key": "360d", "value": 720}
        ]
    },
    "commis": { // 佣金配置
        "enabled": true, // 是否返佣
        // 返佣方式
        "config": [21, 9, 0] // 返佣比例?/固定值?
    },
    "specification": { // 产品规格
        "mode": 0, // 模式
        "filters": [ // 滤芯
            {
                "order": 1, // 序号
                "name": "PPC复合滤芯", // 名称
                "timer_mode": 0, // 模式: 0-双计时, 1-以上电时间为准, 2-以工作时间为准
                "lifetime": 4320, // 上电寿命(小时)
                "worklife": 540 // 工作寿命(小时)
            },
            {
                "order": 2,
                "name": "CPP复合滤芯",
                "timer_mode": 0,
                "lifetime": 4320,
                "worklife": 540
            },
            {
                "order": 3,
                "name": "RO反渗透滤芯",
                "timer_mode": 0,
                "lifetime": 17280,
                "worklife": 2160
            }
        ],
        "flowmeter": { // 流量计
            "measure_mode": 0, // 模式: 0-设备上传, 1-计时, 2-计量
            "config": [ // 出水流量(常温, 冷水, 温水, 热水)
                {"name": "常温", "key": "normal", "value": 30}, 
                {"name": "冰水", "key": "cold", "value": 30},
                {"name": "温水", "key": "warm", "value": 30}, 
                {"name": "热水", "key": "hot", "value": 30}
            ] 
        }
    }
}
```

响应: 

`<None>`

## 四 订单管理 - 订单 (Order)

> 参考
> 
> - 天猫商城
> - 京东商城
> - 微商

> 订单状态: 
>
> - 创建订单 -> 支付订单 -> 物流发货 -> 确认收货 -> 申请退货 -> 同意退货 -> 已退货 | 已关闭 | 已完成
> - obligation -> paid -> delivered -> received (OK) -> return -> consent -> refund | close | done

| 编号 | 接口API | 接口描述 | 请求数据 | 响应数据 | 使用范围 | 备注 |
|:------ |:------ |:------ |:------ |:------ |:------ |:------ |
| AD-01 | GET /orders | 获取订单列表 | \<None\> |  | A+C |  |
| AD-02 | POST /orders | 创建新订单 |  |  | C |  |
| AD-03 | GET /orders/\<OID\> | 查询订单详情 | \<None\> |  | A+C |  |
| AD-04 | GET /orders/\<OID\>/delivery | 查询订单物流信息 | \<None\> |  | A+C | 优先级 ↓ |
| AD-05 | POST /orders/\<OID\>/delivery | 提交订单物流信息 |  |  | A | 发货(物流)信息 |
| AD-06 | PUT /orders/\<OID\>/delivery | 修改订单物流信息 |  |  | A# | 客服通道 |
| AD-07 | POST /orders/\<OID\>/prepay/weixin | 微信预支付 | \<None\> |  | C | *[注3]* |
| AD-08 | POST /orders/\<OID\>/prepay/credit | 信用卡预支付 | \<None\> |  | C | *[注3]* |
| AD-09 | POST /orders/\<OID\>/prepay/debit | 银行卡预支付 | \<None\> |  | C | *[注3]* |
| AD-10 | GET /orders/\<OID\>/payment | 获取订单支付信息 | \<None\> |  | A+C | 支付状态 |
| AD-11 | POST /orders/\<OID\>/status/confirm | 确认收货 | \<None\> |  | C |  |
| AD-12 | POST /orders/\<OID\>/status/return | 申请退货 | \<None\> |  | C |  |
| AD-13 | POST /orders/\<OID\>/status/consent | 同意退货 | \<None\> |  | A# |  |
| AD-14 | PUT /orders/\<OID\>/status/refund | 已退货 |  |  | A# |  |
| AD-15 | DELETE /orders/\<OID\> | 删除订单 | \<None\> |  | A* | 删除确认 |

*[注3] 调用预支付成功后, 应按支付平台的文档, 调起相应的接口或库完成支付*

### AD-01 获取订单列表

请求:

``` json
{
    "orders": [
        {
            "state": 0, // 状态
            "type":"商品", // 订单类型
            "order_id": "0123456789", // 订单单号            
            // infos
            "user_id": "", // 客户编码
            "create_tms": "20171221", // 创建时间
            "complete_tms": "20171221", // 完成时间
            "content": [ // 商品 (TODO 虚拟 @ 20171221)
                {"product_id":"0123456789", "quantity":1, "price": 1}, // TODO
                {"product_id":"0123456788", "quantity":2, "price": 2}, 
                {"product_id":"0123456787", "quantity":3, "price": 3}, 
            ],
            "receiver": { // 收件人信息 (Consignee)
                "name": "",
                "phone": "",
                "addr_area":"广东省珠海市香洲区", // 地址(区域)
                "addr_deatil":"南方软件园A123", // 地址(详细)
                "zipcode": "123456"
            },
            "delivery": { // 物流信息
                "company":"", // 物流公司
                "tracking_num":"", // 物流单号 
                "delivery_tms":"", // 发货时间
                "delivery_clerk":"" // 发货员
            },
            "payment": { // 支付信息
                "pay_ch": "", // 支付通道, weixin, alipay, wallet, xiaotong, tonglian
                "pay_tms": "", // 支付时间
                "bill_no": "", // 支付号
                "transaction_no": "", // 交易号 
            },
            "return": { // 退货信息
                "return_tms": "", // 申请退货时间
                ""
            }, 
            "memo":"" // 备注
            // 订单金额
            // 运费
            // 安装费
            // 押金
        }
    ]
}
```

响应: 

`<None>`

### AD-02 创建新订单

请求:

``` json
{
    "content": [ // 商品 (TODO 虚拟 @ 20171221)
        {"product_id":"0123456789", "quantity":1}, 
        {"product_id":"0123456788", "quantity":2}, 
        {"product_id":"0123456787", "quantity":3}, 
    ],
    "receiver": { // 收件人 (Consignee)
        "name": "",
        "phone": "",
        "area":"广东省珠海市香洲区", // 地址(区域)
        "address":"南方软件园A123", // 地址(详细)
        "zipcode": "123456"
    },
    "memo":"" // 备注
}
```

响应: 

`<None>`

## 五 工单系统 - 工单 (Ticket)

创建 审核 派单 正在处理 等待回应 完成

增加一条工单记录

工单的优先级

> 工单配置
>
> 工单状态 ?
> 
> 工单类型:
> - 安装工单 (根据用户下单情况自动产生)
> - 换货工单 (用户申请)
> - 退货工单 (用户申请)
> - 故障工单 (用户申请/系统自检)
> - 维护工单 (滤芯到期自动产生)
> - 拆机工单 (租期合约到期后超时未续费自动产生)
>
> 工单派送:
> - 基于上级的设置派送
> - 基于LBS的地址位置派送
>
> 工单评价

| 编号 | 接口API | 接口描述 | 请求数据 | 响应数据 | 使用范围 | 备注 |
|:------ |:------ |:------ |:------ |:------ |:------ |:------ |
| AE-01 | GET /tickets | 获取工单列表 | \<None\> |  | A# |  |
| AE-02 | GET /tickets/summary |  | \<None\> |  | A+C |  |
| AE-03 | POST /tickets/ |  | \<None\> |  | A+C |  |

``` json
{
    "status": 1, // 工单状态
    "type": 1, // 工单类型
    "ticket_id": "1234567890", // 编号
    // infos
    "detail": "制水故障", // 工单详情
    "create_tms": "20180102", // 创建时间
    "appoint_tms": "20180105", // 预约时间
    "user_id": "0123456789", // 客户编码
    "device_id": "0123456789", // 设备编码
    "approval": { // 工单审核
        "check_result": true, // 审核结果
        "check_tms": "20180102", // 审核时间
        "check_usr": "0123456789", // 审核用户
    },
    "ratings": { // 工单评价
        "rate_value": 5, // 工单评分
        "rate_tms": "", // 评价时间
        "rate_detail": "", // 评价详情
    }
}
```

## 六 客户管理 - 代理 (Agent)

> 品牌商(运营商) -> 代理商 -> 经销商
> 
> 下级代理列表
> 添加下级代理
> 删除下级代理
> 佣金列表

## 七 佣金管理 - 佣金 (Commission)

> 参考
> 
> 阿里妈妈

| 编号 | 接口API | 接口描述 | 请求数据 | 响应数据 | 使用范围 | 备注 |
|:------ |:------ |:------ |:------ |:------ |:------ |:------ |
| AE-01 | GET /commission | 获取佣金列表 | \<None\> |  | A# | 分销佣金 |
| AE-02 | GET /commission/summary | 获取佣金汇总 | \<None\> |  | A+C | 可用/待激 |
| AE-03 | POST /commission/ | 提取可用佣金 | \<None\> |  | A+C | 间隔30秒以上(用于对账) |

## 八 租金管理 - 租金 (Rental)

## 九 企业管理 - 配置 (Setting)

## 十 促销系统 - 促销 (Promotion)

> 参考

> 优惠券
> 促销(折扣/立减)
> 有奖分享

*Pending ↓*

## 十一 营销系统 - 营销 (marketing)

> - 拼多多
> - 京东众筹

> 广告 (AD)
> 团购
> 众筹
> 聚划算
> 三级分销

*Pending ↓*

## 十二 用户权限 - 权限 (Right)

*Pending ↑*

## A. FAQ

1. 租赁的商品, 如何退租? (退租按钮由谁触发?) 
2. 租赁的商品, 租期如何购买? 如何在服务中查询租期信息?
3. 工单派送给谁? 如何派单? 谁审核谁确认? 
4. 设备质检通道(如何让租赁设备质检前可用)?
5. 设备试用通道(如何让客户或品牌商拿到设备后可以免费试用)?
6. 申请阿里大于和云主机
7. 用户可以先预定再注册? 未注册可以看商城?
8. 可选是否填写推荐码? 在预约商品时填写推荐码? 

## 平台用户

- 运营商列表
- 创建运营商
- 删除运营商
- 修改运营商企业资料
- 修改运营商公众号信息 (用于信息推送)
- 修改运营商权限配置

```json
{
    "orders": [
        {
            "state": 0, // 状态
            "type":"商品", // 订单类型
            "order_id": "0123456789", // 订单单号            
            // infos

        },
        {

        }
    ]
}
```

## 运营用户

> 营商配置
>
> 营商状态: 
>
> - 0 - 禁用 (disable)
> - 1 - 未激活 (inactive)
> - 2 - 已激活 (active)

| 编号 | 接口API | 接口描述 | 请求数据 | 响应数据 | 使用范围 | 备注 |
|:------ |:------ |:------ |:------ |:------ |:------ |:------ |
| AX-01 | GET /vendors | 获取运营商列表 | \<None\> |  | A* |  |
| AX-02 | POST /vendors | 注册新运营商 |  |  | A* |  |
| AX-03 | GET /vendors/\<UID\> | 获取运营商资料 | \<None\> |  | A* |  |
| AX-04 | PUT /vendors/\<UID\> | 修改运营商资料 |  |  | A* |  |
| AX-05 | PUT /vendors/\<UID\>/pwd | 修改运营商登录密码 |  |  | A* |  |
| AX-06 | PUT /vendors/\<UID\>/mob | 修改运营商手机号码 |  |  | A* |  |
| AX-07 | PUT /vendors/\<UID\>/mxx | 修改运营商公众号和商户号信息 |  |  | A* |  |
| AX-08 | PUT /vendors/\<UID\>/cfg | 修改运营商配置选项 |  |  | A* |  |
| AX-09 | GET /vendors/\<UID\>/signing | 新增运营商签约记录 |  |  | A* | Pending |
| AX-10 | POST /vendors/\<UID\>/signing | 新增运营商签约记录 |  |  | A* | Pending |
| AX-11 | PUT /vendors/\<UID\>/signing | 修改运营商签约记录 |  |  | A* | Pending |
| AX-12 | DELETE /vendors/\<UID\>/signing | 删除运营商签约记录 |  |  | A* | Pending |
| AX-13 | DELETE /vendors/\<UID\> | 注销运营商 | \<None\> |  | A* |  |

### AX-01 获取运营商列表

请求:

`<None>`

响应: 

``` json
{
    "vendors": [
        {
            "state": 0, // 状态
            "type": 0,
            "vid": "", // 运营商ID
            // infos
            "user":"dochen", // 用户名
            "pwd":"", // 密码 (MD5)
            "name":"广东东臣科技实业有限公司", // 名称
            "abbv":"东臣科技", // 简称
            "logo":"", // Logo
            "domain":"www.dochen.cn", // 域名
            "contact":"周成华", // 联系人
            "mobile":"01234567890", // 手机
            "wechat":"01234567890", // 微信
            "email":"marvin.nps@gmail.com", // 邮箱
            "area":"广东省珠海市香洲区", // 地址(区域)
            "address":"南方软件园A123", // 地址(详细)
            "reg_tms":"2018-01-02T03:04:05Z", // 注册时间
            "remark":"", // 标注(备用)
            "mp_gid":"", // 公众号 ID
            "mp_appid":"", // 公众号 AppKey
            "mp_secret":"", // 公众号 App秘钥
            "mch_gid":"", // 商户号 ID
            "mch_appid":"", // 商户号 AppKey
            "mch_secret":"", // 商户号 App密钥
            "reserved":"" // 保留
        }, 
        {
            "state": 0, // 状态
            "type": 0,
            "vid": "", // 运营商ID
            // infos
            "user":"", // 用户名
            "pwd":"", // 密码
            // ...
        }, 
        { 
            "state": 0, // 状态
            "type": 0,
            "vid": "", // 运营商ID
            // infos
            "user":"", // 用户名
            "pwd":"", // 密码
            // ...
        }
    ]
}
```

注意: 密码, 公众号和商户号的秘钥将不返回 (只允许修改, 不允许查询). 

### AX-02 注册新运营商

请求:

``` json
{
    "user":"", // 用户名
    "pwd":"", // 密码 (MD5)
    "name":"John", // 名称 (运营商全称)
    "abbv":"", // 简称
    "logo":"", // Logo
    "domain":"", // 域名
    "contact":"联络人", // 联系人
    "mobile":"01234567890", // 手机
    "wechat":"01234567890", // 微信
    "email":"marvin.nps@gmail.com", // 邮箱
    "area":"广东省珠海市香洲区", // 地址(区域)
    "address":"南方软件园A123", // 地址(详细)
    "mp_gid":"", // 公众号 ID
    "mp_appid":"", // 公众号 AppKey
    "mp_secret":"", // 公众号 App秘钥
    "mch_gid":"", // 商户号 ID
    "mch_appid":"", // 商户号 AppKey
    "mch_secret":"", // 商户号 App密钥
    "remark":"", // 标注(备用)
}
```

响应: 

``` json
{
    "vid": "XXXXXXXXXXXXXXXX"
}
```

### AX-04 修改运营商资料

请求:

``` json
{
    "vid": "", // 用户ID
    "user":"", // 用户名
    "name":"John", // 名称
    "abbv":"", // 简称
    "logo":"", // Logo
    "domain":"", // 域名
    "contact":"联络人", // 联系人
    "mobile":"01234567890", // 手机
    "wechat":"01234567890", // 微信
    "email":"marvin.nps@gmail.com", // 邮箱
    "area":"广东省珠海市香洲区", // 地址(区域)
    "address":"南方软件园A123", // 地址(详细)
}
```

响应: 

``` json
{
    "vid": "XXXXXXXXXXXXXXXX"
}
```

### AX-05 修改运营商登录密码

请求:

``` json
{
    "vid": "", // 用户ID
    "pwd":"" // 用户密码
}
```

响应: 

``` json
{
    "vid": "XXXXXXXXXXXXXXXX"
}
```

### AX-06 修改运营商手机号码

请求:

``` json
{
    "vid": "", // 用户ID
    "mobile":"" // 手机号码
}
```

响应: 

``` json
{
    "vid": "XXXXXXXXXXXXXXXX"
}
```

### AX-07 修改运营商公众号信息

请求:

``` json
{
    "mp_gid":"", // 公众号 ID
    "mp_appid":"", // 公众号 AppKey
    "mp_secret":"", // 公众号 App秘钥
    "mch_gid":"", // 商户号 ID
    "mch_appid":"", // 商户号 AppKey
    "mch_secret":"" // 商户号 App密钥
}
```

响应: 

``` json
{
    "vid": "XXXXXXXXXXXXXXXX"
}
```

### AX-09 修改运营商配置选项

请求:

``` json
{
    // Pending ...
}
```

响应: 

``` json
{
    "vid": "XXXXXXXXXXXXXXXX"
}
```

## 代理用户

## 消息推送

报告? 异常? 
