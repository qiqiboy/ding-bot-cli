# DingTalk robot messages sender

钉钉群机器人消息发送命令

<!-- vim-markdown-toc GFM -->

* [安装](#安装)
* [使用](#使用)
    - [`type`](#type)
    - [`jsonBody`](#jsonbody)
    - [`-t, --token`](#-t---token)
    - [`-a, --at`](#-a---at)
* [使用示例](#使用示例)
    - [发送普通文本消息](#发送普通文本消息)
    - [发送带链接文本消息](#发送带链接文本消息)
    - [发送 markdown 语法消息](#发送-markdown-语法消息)
    - [发送 ActionCard 类型消息](#发送-actioncard-类型消息)
    - [发送 FeedCard 类型消息](#发送-feedcard-类型消息)
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

支持 `text` `link` `markdown` `feedCard` `actionCard`等类型

### `jsonBody`

与`type`对应的消息体，需要是 json 对象类型的字符串。具体消息解构请参考：[钉钉机器人消息类型及数据格式](https://open-doc.dingtalk.com/microapp/serverapi2/qf2nxq#-3)

**注意**：`jsonBody`不要求严格的 json 格式，只要是能解析成`js Object`对象的字符串都可以，甚至你还可以插入一些表达式：

```bash
# 字符串拼接
$ dingding text '{content: "a" + "b" + "c"}' --token xxx

# ES6字符串模板 + 数学运算
$ dingding text '{content: `我今年${10 + 15}岁了`}' --token xxx

# 调用数组方法
$ dingding text '{content: ["a", "b", "c"].join("-")}' --token xxx

# 对SHELL环境变量进行表达式运算
$ SOME_VARIABLE=a-b-c
$ dingding text "{content: '$SOME_VARIABLE'.replace(/-/g, '')}" --token xxx
```

### `-t, --token`

通过该参数指定机器人的 token，该参数不可省略。

### `-a, --at`

通过该参数提供要@的人的手机号。传递`all`表示@所有人。

```bash
# @指定的手机号
$ dingding text '{"content": "msg"}' --token xxx --at '14000000000,14000000001,14000000002'

# @所有人
$ dingding text '{"content": "msg"}' --token xxx --at all
```

## 使用示例

### 发送普通文本消息

```bash
$ dingding text '{
    content: "this is a text message"
  }' --token xxx
```

### 发送带链接文本消息

```bash
$ dingding link '{
    "text": "这个即将发布的新版本，创始人陈航（花名“无招”）称它为“红树林”。而在此之前，每当面临重大升级，产品经理们 都会取一个应景的代号，这一次，为什么是“红树林”？",
    "title": "时代的火车向前开",
    "picUrl": "",
    "messageUrl": "https://github.com/qiqiboy/ding-bot-cli"
 }' --token xxx
```

### 发送 markdown 语法消息

```bash
$ dingding markdown '{
     "title":"杭州天气",
     "text": "#### 杭州天气 @156xxxx8827\n" +
             "> 9度，西北风1级，空气良89，相对温度73%\n\n" +
             "> ![screenshot](https://gw.alipayobjects.com/zos/skylark-tools/public/files/84111bbeba74743d2771ed4f062d1f25.png)\n"  +
             "> ###### 10点20分发布 [天气](https://github.com/qiqiboy/ding-bot-cli) \n"
  }' --token xxx
```

### 发送 ActionCard 类型消息

```bash
# 整体跳转
$ dingding actionCard '{
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

### 发送 FeedCard 类型消息

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

## 特殊场景

### `npm scrips`

```json
{
    "name": "project",
    "version": "1.0.0",
    "scripts": {
        "deploy": "node ./scripts/deploy.js",
        "notify": "dingding text '{ content: `Deploy project succeed!` }' --token xxx"
    }
}
```

### `gitlab ci`

```yaml
deploy:
    script:
        - node ./scripts/deploy.js
        # 有特殊字符，所以需要包裹双引号。具体可参考下方说明
        - "dingding text '{ title: `Deploy project succeed!` }' --token xxx"
```

> **Note:**
> Sometimes, `script` commands will need to be wrapped in single or double quotes.
> For example, commands that contain a colon (`:`) need to be wrapped in quotes so
> that the YAML parser knows to interpret the whole thing as a string rather than
> a "key: value" pair. Be careful when using special characters:
> `:`, `{`, `}`, `[`, `]`, `,`, `&`, `*`, `#`, `?`, `|`, `-`, `<`, `>`, `=`, `!`, `%`, `@`, `` ` ``.
