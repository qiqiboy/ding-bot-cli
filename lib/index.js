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
const msgTypes = ['text', 'link', 'markdown', 'actionCard', 'feedCard', 'post', 'image', 'share_chat', 'interactive'];
let validInput = false;

const dingCLI = _commander.default.version(_package.default.version, '-v, --version').description('Send message by DingDing bot').arguments('<type> <jsonBody>').option('-t, --token <token>', '机器人的access token').option('--feishu', '飞书机器人').option('-a, --at [mobiles]', '被@人的手机号（以空格或者半角逗号间隔多个手机号，如果传递 all 表示@全部人）', value => value && value.split(/\s*[\s,|]\s*/g)).action(async (msgType, jsonBody) => {
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

  if (dingCLI.feishu) {
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