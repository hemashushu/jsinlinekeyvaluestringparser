const jsyaml = require('js-yaml');

/**
 * 解析行内（in-line）Key-value 字符串为一个数据对象的模块
 *
 * 这里行内 Key-value 是指单行的、格式如：
 * “key1: value1, key2: value2, ...”
 *
 * 这样的字符串。然后将会被解析为如下的一个对象：
 * {key1: value1, key2:value, ...}
 *
 * 示例：
 * id:1234, name:foo -> {id:1234, name:'foo'}
 *
 * 关于值的数据格式：
 * - 字符串类型的值，可以使用单引号（'），也可以使用双引号（"）包括起来，比如：
 *   name: 'foo', city: "shenzhen"
 *
 * - 如果要在 **单引号** 里面表示单引号，可以使用两个连续的单引号表示一个单引号，比如：
 *   name: 'shen''zhen'
 *
 * - 字符串类型的值在不引起歧义的情况下，也可以不用任何引号，比如：
 *   name: 'foo', city: "shenzhen", type: bar
 *
 * - 如果字符串值里面含有特殊符号或者空格，需要使用引号，比如：
 *   name: 'a [] b {} c = d : e - f | + g > h ! i'
 *
 * - 如果字符串值里面需要表示单引号或者双引号，还可以把值使用双引号或者
 *   单引号包括起来，比如：
 *   name: 'foo"bar', city: "shen'zhen"
 *
 * - 在 **双引号** 包括起来的字符串中，符号 "\" 表示转义，比如：
 *   name: "foo \n \t \\ bar"
 *   其中的 '\n' 会转义为换行符，'\t' 转义为制表符， '\\' 转义为 '\' 符号。
 *   注意不支持 (\") 和 (\') 等转义，
 *
 * - 在 **单引号** 内，符号 “\” **不**表示转义，即原样输出。
 *
 * - 数字会解析为 Number 类型
 * - true/false 会解析为 Boolean 类型
 * - yyyy-MM-dd 会解析为 Date 类型
 *   注意月和日都要两位数字才能被解析为 Date，否则会被解析为字符串，比如：
 *   2021-06-01 解析为 Date
 *   2021-6-1 解析为 String
 *
 * - 'null' 会解析为 null
 *
 * - 如果只有一对 key-value，可以省略 key 名称，只写 value 部分，
 *   key 名称会自动采用默认名称 "_" （即下划线），如下都是正确的默认 key 的写法：
 *   + 'value only'
 *   + "value only"
 *   + value only
 *
 *   它们都会被解析为对象：{_:'value only'}
 *
 */
class InlineKeyValueStringParser {

    /**
     * 解析字符串
     *
     * @param {*} keyValueString
     * @returns
     */
    static parser(keyValueString) {
        if (keyValueString === undefined || keyValueString === null) {
            return {};
        }

        keyValueString = keyValueString.trim();

        if (keyValueString === '') {
            return {};
        }

        // 只有一对 key-value，且 key 名称为默认名称的形式
        if (keyValueString.startsWith('"') ||
            keyValueString.startsWith('\'') ||
            keyValueString.indexOf(':') === -1) {
            let value = InlineKeyValueStringParser._getValue(keyValueString);
            return {
                _:value
            };
        }

        // 这里使用偷懒的方法，使用 js-yaml 包来解析字符串，
        // 等以后有空再慢慢补完吧 😆。
        let dataObject;

        try {
            dataObject = jsyaml.load('{' + keyValueString + '}');
        }catch(err) {
            dataObject = {};
        }

        return dataObject;
    }

    /**
     * 解析只有 value 的情况的值
     *
     * @param {*} text
     * @returns
     */
    static _getValue(text) {
        // 被双引号包括起来的字符串被视为文本，且转义 '\' 符号
        if (text.startsWith('"') && text.length > 2 && text.endsWith('"')){
            text = text.substring(1, text.length - 1);
            // 反转转义字符
            return InlineKeyValueStringParser._unescapeText(text);
        }

        // 被单引号包括起来的字符串被视为文本，且转义 '' 符号（即连续两个单引号）
        if (text.startsWith('\'') && text.length > 2 && text.endsWith('\'')) {
            text = text.substring(1, text.length - 1);
            // 解析连续的两个单引号
            return text.replace(/''/g, '\'');
        }

        // 判断是否为数字类型
        if (/^[+-]?\d+(\.\d+)?$/.test(text)) {
            return Number(text);
        }

        // 判断是否为 Boolean 类型
        if (/^(true|false)$/i.test(text)) {
            return (text.toLowerCase() === 'true');
        }

        // 判断是否为 Date 类型
        if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
            return new Date(text);
        }

        // 判断是否为 null
        if (text === 'null') {
            return null;
        }

        // 按文本返回
        return text;
    }

    /**
     * 反转 \n, \t, \\
     * 为换行符、制表符和符号 '\'
     * 其他转义暂不支持。
     *
     * @param {*} text
     * @returns
     */
    static _unescapeText(text) {
        const reverseTextEntityMap = {
            '\\n': '\n',
            '\\t': '\t',
            '\\\\': '\\'
        };

        return text.replace(/(\\n|\\t|\\\\)/g, (s) => {
            return reverseTextEntityMap[s];
        });
    }
}

module.exports = InlineKeyValueStringParser;