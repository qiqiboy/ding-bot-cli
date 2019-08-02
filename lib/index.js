#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _requestPromise = _interopRequireDefault(require("request-promise"));

var _commander = _interopRequireDefault(require("commander"));

var _chalk = _interopRequireDefault(require("chalk"));

var _ora = _interopRequireDefault(require("ora"));

var _package = _interopRequireDefault(require("../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const spinner = (0, _ora.default)();
const msgTypes = ['text', 'link', 'markdown', 'actionCard', 'feedCard'];
let validInput = false;

const dingCLI = _commander.default.version(_package.default.version, '-v, --version').description('Send message by DingDing bot').arguments('<type> <jsonBody>').option('-t, --token <token>', '机器人的access token').option('-a, --at <mobiles>', '被@人的手机号（以空格或者半角逗号间隔多个手机号，如果传递 all 表示@全部人）', value => value.split(/\s*[\s,|]\s*/g)).action(async (msgType, jsonBody) => {
  validInput = true;

  if (!dingCLI.token) {
    return spinner.fail(_chalk.default.red(`error: You must pass the access token by --token option!`));
  }

  if (!msgTypes.includes(msgType)) {
    return spinner.fail(_chalk.default.red(`<type> must be one of [text, link, markdown, actionCard, freeCard]`));
  }

  let body;

  try {
    const jsonParser = new Function('jsonData', `return ${jsonBody}`);
    body = jsonParser();
  } catch (error) {
    return spinner.fail(_chalk.default.red('<jsonBody> must be a json string'));
  }

  spinner.start(`Sending msg to DingBot[${dingCLI.token}]`);

  try {
    const resp = await sendDingMsg(msgType, body);

    if (resp.errcode) {
      throw new Error(JSON.stringify(resp));
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
  return (0, _requestPromise.default)({
    method: 'POST',
    url: 'https://oapi.dingtalk.com/robot/send',
    qs: {
      access_token: dingCLI.token
    },
    body: {
      msgtype,
      [msgtype]: body,
      at: dingCLI.at && {
        atMobiles: dingCLI.at.filter(no => no.toLowerCase() !== 'all'),
        isAtAll: dingCLI.some(no => no.toLowerCase() === 'all')
      }
    },
    json: true
  });
}

var _default = dingCLI;
exports.default = _default;