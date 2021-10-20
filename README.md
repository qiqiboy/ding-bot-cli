# DingTalk/Feishu robot messages sender

钉钉和飞书群机器人消息发送命令

<!-- vim-markdown-toc GFM -->

* [安装](#安装)
* [使用](#使用)
    - [`type`](#type)
    - [`jsonBody`](#jsonbody)
    - [`--feishu`](#--feishu)
    - [`-t, --token`](#-t---token)
    - [`-a, --at`](#-a---at)
* [使用示例](#使用示例)
    - [发送普通文本消息](#发送普通文本消息)
    - [发送钉钉带链接文本消息](#发送钉钉带链接文本消息)
    - [发送钉钉 markdown 语法消息](#发送钉钉-markdown-语法消息)
    - [发送钉钉 ActionCard 类型消息](#发送钉钉-actioncard-类型消息)
    - [发送钉钉 FeedCard 类型消息](#发送钉钉-feedcard-类型消息)
    - [发送飞书富文本消息](#发送飞书富文本消息)
    - [发送飞书群名片消息](#发送飞书群名片消息)
    - [发送飞书图片消息](#发送飞书图片消息)
    - [发送飞书卡片消息](#发送飞书卡片消息)
* [特殊场景](#特殊场景)
    - [`npm scrips`](#npm-scrips)
    - [`gitlab ci`](#gitlab-ci)

<!-- vim-markdown-toc -->

## 安装

```bash
$ npm install ding-bot-cli -g
```

## 使用

全局安装后就可以使用`dingding`命令了；如果是项目中本地安装，你可以在`package.json`的`scripts`里直接调用`dingding`命令，也可以通过`node_modules/.bin/dingding`调用.

```bash
dingding <type> <jsonBody> --token [access token] --at [mobiles]
```

### `type`

钉钉机器人[支持 `text` `link` `markdown` `feedCard` `actionCard`等类型](https://developers.dingtalk.com/document/robots/custom-robot-access/title-72m-8ag-pqw)，飞书机器人[支持`text` `post` `image` `share_chat` `interactive`等类型](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN)

另外从`v1.1.0`起，还支持一种`simpleCard`类型，这是跨钉钉和飞书的一种特殊约定的卡片类型，其结构类型定义如下：

```typescript
interface SimpleCardBody {
    head: { text: string; type: 'success' | 'erroor' | 'default' };
    title: { text: string };
    list: Array<{ label: string; text: string }>;
    actions: Array<{ text: string; url: string }>;
    foot: { text: string };
}
```

### `jsonBody`

与`type`对应的消息体，需要是 json 对象类型的字符串。具体消息解构请参考：[钉钉机器人消息类型及数据格式](https://developers.dingtalk.com/document/robots/custom-robot-access/title-72m-8ag-pqw)、[飞书机器人消息类型及数据格式](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN)

**注意**：`jsonBody`不要求严格的 json 格式，只要是能解析成`js Object`对象的字符串都可以，甚至你还可以插入一些表达式：

```bash
# 字符串拼接
$ dingding text '{content: "a" + "b" + "c"}' --token xxx

# 字符串拼接 + 数学运算
$ dingding text '{content: "我今年" + (10 + 15) + "岁了"}' --token xxx

# 调用数组方法
$ dingding text '{content: ["a", "b", "c"].join("-")}' --token xxx

# 对SHELL环境变量进行表达式运算
$ SOME_VARIABLE=a-b-c
$ dingding text "{content: '$SOME_VARIABLE'.replace(/-/g, '')}" --token xxx
```

### `--feishu`

默认为发送钉钉机器人消息，可以通过该参数指定为发送飞书机器人消息。

### `-t, --token`

通过该参数指定机器人的 token，该参数不可省略。

### `-a, --at`

> 对于飞书机器人，该方式仅支持`text`类型消息，其他类型消息要支持@提到的用户请[参考飞书文档](https://open.feishu.cn/document/ugTN1YjL4UTN24CO1UjN/uUzN1YjL1cTN24SN3UjN)

通过该参数提供要@的人的手机号或者飞书 openId。传递`all`表示@所有人。

钉钉版

```bash
# @指定的手机号
$ dingding text '{"content": "msg"}' --token xxx --at '14000000000,14000000001,14000000002'

# @所有人
$ dingding text '{"content": "msg"}' --token xxx --at all
```

飞书版

```bash
# @指定的手机号
$ dingding text '{"text": "msg"}' --token xxx --at 'ou_3ed85486e7a980de26cba6b70fffb0ad,ou_489eiodjjkowee9939930002jdlwkl' --feishu

# @所有人
$ dingding text '{"text": "msg"}' --token xxx --at all --feishu
```

## 使用示例

### 发送普通文本消息

钉钉版

```bash
$ dingding text '{
    content: "this is a text message"
  }' --token xxx
```

飞书版

```bash
$ dingding text '{
    text: "this is a text message"
  }' --feishu --token xxx
```

### 发送钉钉带链接文本消息

> 仅支持钉钉

```bash
$ dingding link '{
    "text": "这个即将发布的新版本，创始人陈航（花名“无招”）称它为“红树林”。而在此之前，每当面临重大升级，产品经理们 都会取一个应景的代号，这一次，为什么是“红树林”？",
    "title": "时代的火车向前开",
    "picUrl": "",
    "messageUrl": "https://github.com/qiqiboy/ding-bot-cli"
 }' --token xxx
```

### 发送钉钉 markdown 语法消息

> 仅支持钉钉

```bash
$ dingding markdown '{
     "title":"杭州天气",
     "text": "#### 杭州天气 @156xxxx8827\n" +
             "> 9度，西北风1级，空气良89，相对温度73%\n\n" +
             "> ![screenshot](https://gw.alipayobjects.com/zos/skylark-tools/public/files/84111bbeba74743d2771ed4f062d1f25.png)\n"  +
             "> ###### 10点20分发布 [天气](https://github.com/qiqiboy/ding-bot-cli) \n"
  }' --token xxx
```

### 发送钉钉 ActionCard 类型消息

> 仅支持钉钉

```bash
# 整体跳转
$ dingding actionCard '{
    "title": "乔布斯 20 年前想打造一间苹果咖啡厅，而它正是 Apple Store 的前身",
    "text": "Apple Store 的设计正从原来满满的科技感走向生活化，而其生活化的走向其实可以追溯到 20 年前苹果一个建立咖 啡馆的计划",
    "hideAvatar": "0",
    "btnOrientation": "0",
    "singleTitle" : "阅读全文",
    "singleURL" : "https://github.com/qiqiboy/ding-bot-cli"
  }' --token xxx

# 独立跳转
$ dingding actionCard actionCard '{
    "title": "乔布斯 20 年前想打造一间苹果咖啡厅，而它正是 Apple Store 的前身",
    "text": "Apple Store 的设计正从原来满满的科技感走向生活化，而其生活化的走向其实可以追溯到 20 年前苹果一个建立咖 啡馆的计划",
    "hideAvatar": "0",
    "btnOrientation": "0",
    "btns": [
        {
            "title": "内容不错",
            "actionURL": "https://github.com/qiqiboy/ding-bot-cli"
        },
        {
            "title": "不感兴趣",
            "actionURL": "https://github.com/qiqiboy/ding-bot-cli"
        }
    ]
  }' --token xxx
```

### 发送钉钉 FeedCard 类型消息

> 仅支持钉钉

```bash
$ dingding feedCard '{
    "links": [
        {
            "title": "时代的火车向前开",
            "messageURL": "https://github.com/qiqiboy/ding-bot-cli",
            "picURL": "https://avatars3.githubusercontent.com/u/3774036?s=460&v=4"
        },
        {
            "title": "时代的火车向前开2",
            "messageURL": "https://github.com/qiqiboy/ding-bot-cli",
            "picURL": "https://avatars3.githubusercontent.com/u/3774036?s=460&v=4"
        }
    ]
  }' --token xxx
```

### 发送飞书富文本消息

> 仅支持飞书

```bash
$ dingding post '{
    "post": {
			"zh_cn": {
				"title": "项目更新通知",
				"content": [
					[{
							"tag": "text",
							"text": "项目有更新: "
						},
						{
							"tag": "a",
							"text": "请查看",
							"href": "http://www.example.com/"
						},
						{
							"tag": "at",
							"user_id": "ou_18eac8********17ad4f02e8bbbb"
						}
					]
				]
			}
		}
  }' --feishu --token xxx
```

### 发送飞书群名片消息

> 仅支持飞书

```bash
$ dingding share_chat '{
    "share_chat_id": "oc_f5b1a7eb27ae2c7b6adc2a74faf339ff"
  }' --feishu --token xxx
```

### 发送飞书图片消息

> 仅支持飞书

```bash
$ dingding image '{
    "image_key": "img_ecffc3b9-8f14-400f-a014-05eca1a4310g"
  }' --feishu --token xxx
```

### 发送飞书卡片消息

> 仅支持飞书

```bash
$ dingding interactive '{
    "config": {
                "wide_screen_mode": true,
                "enable_forward": true
        },
        "elements": [{
                "tag": "div",
                "text": {
                        "content": "**西湖**，位于浙江省杭州市西湖区龙井路1号，杭州市区西部，景区总面积49平方千米，汇水面积为21.22平方千米，湖面面积为6.38平方千米。",
                        "tag": "lark_md"
                }
        }, {
                "actions": [{
                        "tag": "button",
                        "text": {
                                "content": "更多景点介绍 :玫瑰:",
                                "tag": "lark_md"
                        },
                        "url": "https://www.example.com",
                        "type": "default",
                        "value": {}
                }],
                "tag": "action"
        }],
        "header": {
                "title": {
                        "content": "今日旅游推荐",
                        "tag": "plain_text"
                }
        }
  }' --feishu --token xxx
```

## 特殊场景

### `npm scrips`

```json
{
    "name": "project",
    "version": "1.0.0",
    "scripts": {
        "deploy": "node ./scripts/deploy.js",
        "notify": "dingding text \"{ content: 'Deploy project succeed!' }\" --token xxx"
    }
}
```

### `gitlab ci`

```yaml
deploy:
    script:
        - node ./scripts/deploy.js
        # 有特殊字符，所以需要包裹双引号。具体可参考下方说明
        - 'dingding text "{ content: ''Deploy project succeed!'' }" --token xxx'
```

> **Note:**
> Sometimes, `script` commands will need to be wrapped in single or double quotes.
> For example, commands that contain a colon (`:`) need to be wrapped in quotes so
> that the YAML parser knows to interpret the whole thing as a string rather than
> a "key: value" pair. Be careful when using special characters:
> `:`, `{`, `}`, `[`, `]`, `,`, `&`, `*`, `#`, `?`, `|`, `-`, `<`, `>`, `=`, `!`, `%`, `@`, `` ` ``.
