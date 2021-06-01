const assert = require('assert/strict');
const { ObjectUtils } = require('jsobjectutils');

const { InlineKeyValueStringParser } = require('../index');

describe('InlineKeyValueStringParser Test', () => {
    describe('Parse one key-value', () => {
        it('Test String value', () => {
            // single quotes
            let obj1 = InlineKeyValueStringParser.parser(`name1: 'value1'`); // 'value1'
            assert(ObjectUtils.objectEquals(obj1, {name1: 'value1'}));

            // double quotes
            let obj2 = InlineKeyValueStringParser.parser(`name2: "value2"`); // "value2"
            assert(ObjectUtils.objectEquals(obj2, {name2: 'value2'}));

            // no quotes
            let obj3 = InlineKeyValueStringParser.parser(`name3: value3`); // value3
            assert(ObjectUtils.objectEquals(obj3, {name3: 'value3'}));

            // 中间单引号
            let obj4 = InlineKeyValueStringParser.parser(`name4: "foo ' and '' bar"`); // "foo ' and '' bar"
            assert(ObjectUtils.objectEquals(obj4, {name4: 'foo \' and \'\' bar'}));

            // 中间连续两个单引号
            let obj5 = InlineKeyValueStringParser.parser(`name5: 'foo '' bar'`); // 'foo '' bar'
            assert(ObjectUtils.objectEquals(obj5, {name5: 'foo \' bar'}));

            // 中间双引号
            let obj6 = InlineKeyValueStringParser.parser(`name6: 'foo " bar'`); // 'foo " bar'
            assert(ObjectUtils.objectEquals(obj6, {name6: 'foo " bar'}));

            // 中间特殊符号
            let obj7 = InlineKeyValueStringParser.parser(`name7: 'a [] b {} c = d : e - f | + g > h ! i'`); // 'a [] b {} c = d : e - f | + g > h ! i'
            assert(ObjectUtils.objectEquals(obj7, {name7: 'a [] b {} c = d : e - f | + g > h ! i'}));

            // 转义字符
            let obj8 = InlineKeyValueStringParser.parser('name8: "foo \\n \\t \\\\ bar"'); // "foo \n \t \\ bar"
            assert(ObjectUtils.objectEquals(obj8, {name8: 'foo \n \t \\ bar'}));

            // 在单引号内，'\' 不转义
            let obj9 = InlineKeyValueStringParser.parser('name9: \'foo \\n \\t \\\\ bar\''); // 'foo \n \t \\ bar'
            assert(ObjectUtils.objectEquals(obj9, {name9: 'foo \\n \\t \\\\ bar'}));
        });

        it('Test Number value', () => {
            // int
            let obj1 = InlineKeyValueStringParser.parser('name1: 123');
            assert(ObjectUtils.equals(obj1, {name1: 123}));

            // 小数点
            let obj2 = InlineKeyValueStringParser.parser('name2: 123.456');
            assert(obj2.name2 - 123.456 <= 0.001);

            // 负数
            let obj3 = InlineKeyValueStringParser.parser('name3: -123');
            assert(ObjectUtils.equals(obj3, {name3: -123}));
        });

        it('Test Boolean value', () => {
            let obj1 = InlineKeyValueStringParser.parser('name1: true');
            assert(ObjectUtils.equals(obj1, {name1: true}));

            let obj2 = InlineKeyValueStringParser.parser('name2: false');
            assert(ObjectUtils.equals(obj2, {name2: false}));
        });

        it('Test null value', () => {
            let obj1 = InlineKeyValueStringParser.parser('name1: null');
            assert(ObjectUtils.equals(obj1, {name1: null}));
        });

        it('Test Date value', () => {
            let obj1 = InlineKeyValueStringParser.parser('name1: 2021-06-01');
            assert(obj1.name1 instanceof Date);

            let obj2 = InlineKeyValueStringParser.parser('name2: 2021-6-1');
            assert(typeof obj2.name2 === 'string');
        });
    });

    describe('Parse default key', () => {
        it('Test String value', ()=>{
            // single quotes
            let obj1 = InlineKeyValueStringParser.parser(`'value1'`); // 'value1'
            assert(ObjectUtils.objectEquals(obj1, {_: 'value1'}));

            // double quotes
            let obj2 = InlineKeyValueStringParser.parser(`"value2"`); // "value2"
            assert(ObjectUtils.objectEquals(obj2, {_: 'value2'}));

            // no quotes
            let obj3 = InlineKeyValueStringParser.parser(`value3`); // value3
            assert(ObjectUtils.objectEquals(obj3, {_: 'value3'}));

            // 中间单引号
            let obj4 = InlineKeyValueStringParser.parser(`"foo ' and '' bar"`); // "foo ' and '' bar"
            assert(ObjectUtils.objectEquals(obj4, {_: 'foo \' and \'\' bar'}));

            // 中间连续两个单引号
            let obj5 = InlineKeyValueStringParser.parser(`'foo '' bar'`); // 'foo '' bar'
            assert(ObjectUtils.objectEquals(obj5, {_: 'foo \' bar'}));

            // 中间双引号
            let obj6 = InlineKeyValueStringParser.parser(`'foo " bar'`); // 'foo " bar'
            assert(ObjectUtils.objectEquals(obj6, {_: 'foo " bar'}));

            // 中间特殊符号
            let obj7 = InlineKeyValueStringParser.parser(`'a [] b {} c = d : e - f | + g > h ! i'`); // 'a [] b {} c = d : e - f | + g > h ! i'
            assert(ObjectUtils.objectEquals(obj7, {_: 'a [] b {} c = d : e - f | + g > h ! i'}));

            // 转义字符
            let obj8 = InlineKeyValueStringParser.parser('"foo \\n \\t \\\\ bar"'); // "foo \n \t \\ bar"
            assert(ObjectUtils.objectEquals(obj8, {_: 'foo \n \t \\ bar'}));

            // 在单引号内，'\' 不转义
            let obj9 = InlineKeyValueStringParser.parser('\'foo \\n \\t \\\\ bar\''); // 'foo \n \t \\ bar'
            assert(ObjectUtils.objectEquals(obj9, {_: 'foo \\n \\t \\\\ bar'}));
        });

        it('Test Number value', () => {
            // int
            let obj1 = InlineKeyValueStringParser.parser('123');
            assert(ObjectUtils.equals(obj1, {_: 123}));

            // 小数点
            let obj2 = InlineKeyValueStringParser.parser('123.456');
            assert(obj2._ - 123.456 <= 0.001);

            // 负数
            let obj3 = InlineKeyValueStringParser.parser('-123');
            assert(ObjectUtils.equals(obj3, {_: -123}));
        });

        it('Test Boolean value', () => {
            let obj1 = InlineKeyValueStringParser.parser('true');
            assert(ObjectUtils.equals(obj1, {_: true}));

            let obj2 = InlineKeyValueStringParser.parser('false');
            assert(ObjectUtils.equals(obj2, {_: false}));
        });

        it('Test null value', () => {
            let obj1 = InlineKeyValueStringParser.parser('null');
            assert(ObjectUtils.equals(obj1, {_: null}));
        });

        it('Test Date value', () => {
            let obj1 = InlineKeyValueStringParser.parser('2021-06-01');
            assert(obj1._ instanceof Date);

            let obj2 = InlineKeyValueStringParser.parser('2021-6-1');
            assert(typeof obj2._ === 'string');
        });
    });

    describe('Parse multiple key-values', ()=>{
        it('Test multiple string values', ()=>{
            let obj1 = InlineKeyValueStringParser.parser(`name: 'foo', city: "shenzhen", type: bar`); // name: 'foo', city: "shenzhen", type: bar
            assert(ObjectUtils.objectEquals(obj1, {
                name: 'foo',
                city: 'shenzhen',
                type: 'bar'
            }));
        });

        it('Test multiple data type values', ()=>{
            let obj1 = InlineKeyValueStringParser.parser(`name: foo, number: 123, checked: true, creationTime: 2021-06-01`); // name: foo, number: 123, checked: true, creationTime: 2021-06-01
            assert(ObjectUtils.objectEquals(obj1, {
                name: 'foo',
                number: 123,
                checked: true,
                creationTime: new Date('2021-06-01')
            }));
        });
    });
});