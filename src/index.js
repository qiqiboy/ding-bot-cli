#!/usr/bin/env node

import http from 'axios';
import commander from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import pkg from '../package.json';

const spinner = ora();

const msgTypes = [
    'text',
    'link',
    'markdown',
    'actionCard',
    'feedCard',
    'post',
    'image',
    'share_chat',
    'interactive',
    'simpleCard'
];

let validInput = false;

const dingCLI = commander
    .version(pkg.version, '-v, --version')
    .description('Send message by DingDing bot')
    .arguments('<type> <jsonBody>')
    .option('-t, --token <token>', '机器人的access token')
    .option('--feishu', '飞书机器人')
    .option(
        '-a, --at [mobiles]',
        '被@人的手机号(仅限钉钉机器人)或者飞书openId（以空格或者半角逗号间隔多个值，如果传递 all 表示@全部人）',
        (value) => value && value.split(/\s*[\s,|]\s*/g)
    )
    .action(async (msgType, jsonBody) => {
        validInput = true;

        if (!dingCLI.token) {
            return spinner.fail(chalk.red(`error: You must pass the access token by --token option!`));
        }

        if (!msgTypes.includes(msgType)) {
            return spinner.fail(chalk.red(`<type> must be one of [${msgTypes.join(', ')}]`));
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
            const { data } = await sendDingMsg(msgType, body);

            if (data.errcode || data.code) {
                throw new Error(JSON.stringify(data));
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
                    cardBody.elements.push({
                        tag: 'markdown',
                        content: `**${body.title.text}**`
                    });
                }

                if (body.list) {
                    cardBody.elements.push({
                        tag: 'div',
                        fields: body.list.filter(Boolean).map(({ label, text }) => {
                            return {
                                text: {
                                    tag: 'lark_md',
                                    content: `**${label}: **${text}`
                                }
                            };
                        })
                    });
                }

                if (body.actions) {
                    cardBody.elements.push({
                        tag: 'action',
                        actions: body.actions.filter(Boolean).map(({ text, url }) => {
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
                        elements: [
                            {
                                tag: 'lark_md',
                                content: body.foot.text
                            }
                        ]
                    });
                }

                return http.post('https://open.feishu.cn/open-apis/bot/v2/hook/' + dingCLI.token, {
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
            }

            if (body.list) {
                body.list.forEach(({ label, text }) => {
                    elements.push(`**${label}: **${text}`);
                });
            }

            if (body.actions) {
                elements.push(
                    body.actions
                        .map(({ text, url }) => {
                            return `[${text}](${url})`;
                        })
                        .join('  |  ')
                );
            }

            if (body.foot) {
                elements.push(`\n> ${body.foot.text}`);
            }

            cardBody.text = elements.join('\n');

            return http.post(
                'https://oapi.dingtalk.com/robot/send',
                {
                    msgtype: 'actionCard',
                    actionCard: cardBody
                },
                {
                    params: {
                        access_token: dingCLI.token
                    }
                }
            );
        } catch (error) {
            spinner.fail(`${chalk.red('<jsonBody> structure is invalid：')}
{
    head: { text: string; type: 'success' | 'error' | 'default' };
    title: { text: string; };
    list: Array<{ label: string; text: string; }>;
    actions: Array<{ text: string; url: string; }>
    foot: { text: string; }
}`);

            throw error;
        }
    }

    // 使飞书兼容钉钉text消息格式
    if (msgtype === 'text' && dingCLI.feishu && 'content' in body) {
        body.text = body.content;
    }

    if (dingCLI.feishu) {
        if (dingCLI.at && msgtype === 'text') {
            body.text += `\n${dingCLI.at.map((no) => `<at user_id="${no}"></at>`).join(' ')}`;
        }

        return http.post('https://open.feishu.cn/open-apis/bot/v2/hook/' + dingCLI.token, {
            msg_type: msgtype,
            [msgtype === 'interactive' ? 'card' : 'content']: body
        });
    }

    return http.post(
        'https://oapi.dingtalk.com/robot/send',
        {
            msgtype,
            [msgtype]: body,
            at: dingCLI.at && {
                atMobiles: dingCLI.at?.filter((no) => no.toLowerCase() !== 'all'),
                isAtAll: dingCLI.at?.some((no) => no.toLowerCase() === 'all')
            }
        },
        {
            params: {
                access_token: dingCLI.token
            }
        }
    );
}

export default dingCLI;
