#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _commander = _interopRequireDefault(require("commander"));

var _chalk = _interopRequireDefault(require("chalk"));

var _ora = _interopRequireDefault(require("ora"));

var _package = _interopRequireDefault(require("../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const spinner = (0, _ora.default)();
const msgTypes = ['text', 'link', 'markdown', 'actionCard', 'feedCard', 'post', 'image', 'share_chat', 'interactive', 'simpleCard'];
let validInput = false;

const dingCLI = _commander.default.version(_package.default.version, '-v, --version').description('Send message by DingDing bot').arguments('<type> <jsonBody>').option('-t, --token <token>', '机器人的access token').option('--feishu', '飞书机器人').option('-a, --at [mobiles]', '被@人的手机号(仅限钉钉机器人)或者飞书openId（以空格或者半角逗号间隔多个值，如果传递 all 表示@全部人）', value => value === null || value === void 0 ? void 0 : value.split(/\s*[\s,|]\s*/g)).action(async (msgType, jsonBody) => {
  validInput = true;

  if (!dingCLI.token) {
    return spinner.fail(_chalk.default.red(`error: You must pass the access token by --token option!`));
  }

  if (!msgTypes.includes(msgType)) {
    return spinner.fail(_chalk.default.red(`<type> must be one of [${msgTypes.join(', ')}]`));
  }

  let body;

  try {
    const jsonParser = new Function('jsonData', `return ${jsonBody}`);
    body = jsonParser();
  } catch (error) {
    console.log(_chalk.default.cyan((error.name || 'Error') + ':'), _chalk.default.grey(error.message));
    console.log(_chalk.default.cyan('<type>: '), _chalk.default.grey(msgType));
    console.log(_chalk.default.cyan('<jsonBody>: '), _chalk.default.grey(jsonBody));
    console.log();
    return spinner.fail(_chalk.default.red('<jsonBody> must be a json string'));
  }

  spinner.start(`Sending msg to DingBot[${dingCLI.token}]`);

  try {
    const {
      data
    } = await sendDingMsg(msgType, body);

    if (data.errcode || data.code) {
      throw new Error(JSON.stringify(data));
    }

    spinner.succeed('Send msg succeed!');
  } catch (error) {
    spinner.fail(_chalk.default.red('Fail to send msg: ' + _chalk.default.grey(error.message)));
  }
});

dingCLI.parse(process.argv);

if (!validInput) {
  spinner.fail(_chalk.default.red(`You must input the correct command:`));
  console.log(`   ${_chalk.default.cyan(dingCLI.name())} ${_chalk.default.green(' <type>')} ${_chalk.default.green(' <jsonBody>')}`);
  console.log();
  console.log('Example:');
  console.log(`   ${_chalk.default.cyan(dingCLI.name())} ${_chalk.default.green('text')} ${_chalk.default.green(`'{ "content": "This is a text message." }'`)} ${_chalk.default.grey('--token xxxxxxx')}`);
}

function sendDingMsg(msgtype, body) {
  var _dingCLI$at, _dingCLI$at2;

  /**
   * {
   *      head: { text: string; type: 'success' | 'erroor' | 'default' };
   *      title: { text: string; };
   *      list: Array<{ label: string; text: string; }>;
   *      actions: Array<{ text: string; url: string; }>
   *      foot: { text: string; }
   * }
   */
  if (msgtype === 'simpleCard') {
    try {
      if (dingCLI.feishu) {
        const cardBody = {
          config: {
            wide_screen_mode: true
          },
          elements: []
        };

        if (body.head) {
          cardBody.header = {
            title: {
              content: body.head.text,
              tag: 'plain_text'
            }
          };

          if (body.head.type && body.head.type !== 'default') {
            cardBody.header.template = body.head.type === 'success' ? 'green' : 'red';
          }
        }

        if (body.title) {
          var _body$title$text;

          cardBody.elements.push({
            tag: 'markdown',
            content: `**${(_body$title$text = body.title.text) === null || _body$title$text === void 0 ? void 0 : _body$title$text.trim()}**`
          });
        }

        if (body.list) {
          cardBody.elements.push({
            tag: 'div',
            fields: body.list.filter(Boolean).map(({
              label,
              text
            }) => {
              return {
                text: {
                  tag: 'lark_md',
                  content: `**${label}:** ${text}`
                }
              };
            })
          });
        }

        if (body.actions) {
          cardBody.elements.push({
            tag: 'action',
            actions: body.actions.filter(Boolean).map(({
              text,
              url
            }) => {
              return {
                tag: 'button',
                text: {
                  tag: 'plain_text',
                  content: text
                },
                url
              };
            })
          });
        }

        if (body.foot) {
          cardBody.elements.push({
            tag: 'note',
            elements: [{
              tag: 'lark_md',
              content: body.foot.text
            }]
          });
        }

        return _axios.default.post('https://open.feishu.cn/open-apis/bot/v2/hook/' + dingCLI.token, {
          msg_type: 'interactive',
          card: cardBody
        });
      }

      const cardBody = {
        hideAvatar: '1',
        btnOrientation: '0'
      };

      if (body.head) {
        cardBody.title = body.head.text;
      }

      const elements = [];

      if (body.title) {
        elements.push(`### ${body.title.text}`);
      } else if (cardBody.title) {
        elements.push(`### ${cardBody.title}`);
      }

      if (body.list) {
        body.list.forEach(({
          label,
          text
        }) => {
          elements.push(`**${label}:** ${text}`);
        });
      }

      if (body.actions) {
        elements.push(`\n` + body.actions.map(({
          text,
          url
        }) => {
          return `[${text}](${url})`;
        }).join('  |  '));
      }

      if (body.foot) {
        elements.push(`>_${body.foot.text}_`);
      }

      cardBody.text = elements.join('\n\n');
      return _axios.default.post('https://oapi.dingtalk.com/robot/send', {
        msgtype: 'actionCard',
        actionCard: cardBody
      }, {
        params: {
          access_token: dingCLI.token
        }
      });
    } catch (error) {
      spinner.fail(`${_chalk.default.red('<jsonBody> structure is invalid：')}
{
    head: { text: string; type: 'success' | 'error' | 'default' };
    title: { text: string; };
    list: Array<{ label: string; text: string; }>;
    actions: Array<{ text: string; url: string; }>
    foot: { text: string; }
}`);
      throw error;
    }
  } // 使飞书兼容钉钉text消息格式


  if (msgtype === 'text' && dingCLI.feishu && 'content' in body) {
    body.text = body.content;
  }

  if (dingCLI.feishu) {
    if (dingCLI.at && msgtype === 'text') {
      body.text += `\n${dingCLI.at.map(no => `<at user_id="${no}"></at>`).join(' ')}`;
    }

    return _axios.default.post('https://open.feishu.cn/open-apis/bot/v2/hook/' + dingCLI.token, {
      msg_type: msgtype,
      [msgtype === 'interactive' ? 'card' : 'content']: body
    });
  }

  return _axios.default.post('https://oapi.dingtalk.com/robot/send', {
    msgtype,
    [msgtype]: body,
    at: dingCLI.at && {
      atMobiles: (_dingCLI$at = dingCLI.at) === null || _dingCLI$at === void 0 ? void 0 : _dingCLI$at.filter(no => no.toLowerCase() !== 'all'),
      isAtAll: (_dingCLI$at2 = dingCLI.at) === null || _dingCLI$at2 === void 0 ? void 0 : _dingCLI$at2.some(no => no.toLowerCase() === 'all')
    }
  }, {
    params: {
      access_token: dingCLI.token
    }
  });
}

var _default = dingCLI;
exports.default = _default;