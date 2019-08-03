#!/usr/bin/env node

import request from 'request-promise';
import commander from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import pkg from '../package.json';

const spinner = ora();

const msgTypes = ['text', 'link', 'markdown', 'actionCard', 'feedCard'];

let validInput = false;

const dingCLI = commander
    .version(pkg.version, '-v, --version')
    .description('Send message by DingDing bot')
    .arguments('<type> <jsonBody>')
    .option('-t, --token <token>', '机器人的access token')
    .option(
        '-a, --at [mobiles]',
        '被@人的手机号（以空格或者半角逗号间隔多个手机号，如果传递 all 表示@全部人）',
        value => value && value.split(/\s*[\s,|]\s*/g)
    )
    .action(async (msgType, jsonBody) => {
        validInput = true;

        if (!dingCLI.token) {
            return spinner.fail(chalk.red(`error: You must pass the access token by --token option!`));
        }

        if (!msgTypes.includes(msgType)) {
            return spinner.fail(chalk.red(`<type> must be one of [text, link, markdown, actionCard, feedCard]`));
        }

        let body;

        try {
            const jsonParser = new Function('jsonData', `return ${jsonBody}`);

            body = jsonParser();
        } catch (error) {
            console.log(chalk.cyan((error.name || 'Error') + ':'), chalk.grey(error.message));
            console.log(chalk.cyan('<type>: '), chalk.grey(msgType));
            console.log(chalk.cyan('<jsonBody>: '), chalk.grey(jsonBody));
            console.log();

            return spinner.fail(chalk.red('<jsonBody> must be a json string'));
        }

        spinner.start(`Sending msg to DingBot[${dingCLI.token}]`);

        try {
            const resp = await sendDingMsg(msgType, body);

            if (resp.errcode) {
                throw new Error(JSON.stringify(resp));
            }

            spinner.succeed('Send msg succeed!');
        } catch (error) {
            spinner.fail(chalk.red('Fail to send msg: ' + chalk.grey(error.message)));
        }
    });

dingCLI.parse(process.argv);

if (!validInput) {
    spinner.fail(chalk.red(`You must input the correct command:`));
    console.log(`   ${chalk.cyan(dingCLI.name())} ${chalk.green(' <type>')} ${chalk.green(' <jsonBody>')}`);
    console.log();
    console.log('Example:');

    console.log(
        `   ${chalk.cyan(dingCLI.name())} ${chalk.green('text')} ${chalk.green(
            `'{ "content": "This is a text message." }'`
        )} ${chalk.grey('--token xxxxxxx')}`
    );
}

function sendDingMsg(msgtype, body) {
    return request({
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
                isAtAll: dingCLI.at.some(no => no.toLowerCase() === 'all')
            }
        },
        json: true
    });
}

export default dingCLI;
