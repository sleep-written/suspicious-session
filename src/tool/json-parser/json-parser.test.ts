import { assert } from 'chai';
import { JsonParser } from './json-parser';

describe('Testing "./tool/json-parser"', () => {
    describe('Testing "this.toString(obj);"', () => {
        it('Test 01', () => {
            const parser = new JsonParser();
            parser.addToStringFunc((_, value) => {
                if (typeof value === 'string') {
                    if (value.length > 0) {
                        value += '. Sebas deja de shitpostear';
                    }
                }
                return value;
            });
    
            const txt = parser.toString({
                text: 'hola mundo',
                data: [
                    {
                        reg: 'AAA87687',
                        amount: 874827
                    },
                    {
                        reg: 'AAA88888',
                        amount: 2749
                    },
                    {
                        reg: 'ZZZ11111',
                        amount: 666
                    }
                ]
            });
    
            const obj = JSON.parse(txt);
            assert.strictEqual(obj?.text, 'hola mundo. Sebas deja de shitpostear');
            assert.strictEqual(obj?.data[0]?.reg, 'AAA87687. Sebas deja de shitpostear');
            assert.strictEqual(obj?.data[0]?.amount, 874827);
            assert.strictEqual(obj?.data[1]?.reg, 'AAA88888. Sebas deja de shitpostear');
            assert.strictEqual(obj?.data[1]?.amount, 2749);
            assert.strictEqual(obj?.data[2]?.reg, 'ZZZ11111. Sebas deja de shitpostear');
            assert.strictEqual(obj?.data[2]?.amount, 666);
        });
        
        it('Test 02', () => {
            const parser = new JsonParser('  ');
            parser.addToStringFunc((_, value) => {
                if (typeof value === 'string') {
                    return `string(${value})`;
                } else if (value instanceof Date) {
                    return `date(${value.toJSON()})`;
                } else return value;
            });

            const txt = parser.toString([
                {
                    name: 'Hola',
                    date: new Date(2020, 11, 31),
                },
                {
                    name: 'Mundo',
                    date: new Date(2021, 0, 1),
                }
            ]);

            const obj = JSON.parse(txt);
            assert.strictEqual(obj[0].name, 'string(Hola)');
            assert.strictEqual(obj[0].date, 'date(2020-12-31T03:00:00.000Z)');
            assert.strictEqual(obj[1].name, 'string(Mundo)');
            assert.strictEqual(obj[1].date, 'date(2021-01-01T03:00:00.000Z)');
        });
    });

    describe('Testing "this.toObject(txt);"', () => {
        it('Test 01', () => {
            const txt = JSON.stringify([
                {
                    name: 'string(Hola)',
                    date: 'date(2020-12-31T03:00:00.000Z)'
                },
                {
                    name: 'string(Mundo)',
                    date: 'date(2021-01-01T03:00:00.000Z)'
                }
            ]);

            const parser = new JsonParser();
            parser.addToObjectFunc((_, value) => {
                if (typeof value != 'string') {
                    return value;
                }

                if (value.match(/string\(.*\)$/gi)) {
                    value = value.replace(/(^string\(|\)$)/gi, '');
                } else if (value.match(/date\(.*\)$/gi)) {
                    value = value.replace(/(^date\(|\)$)/gi, '');
                    value = new Date(value);
                }

                return value;
            });

            const obj = parser.toObject(txt);
            assert.strictEqual(obj[0].name, 'Hola');
            assert.strictEqual(obj[0].date?.toUTCString(), new Date(2020, 11, 31).toUTCString());
            assert.strictEqual(obj[1].name, 'Mundo');
            assert.strictEqual(obj[1].date?.toUTCString(), new Date(2021, 0, 1).toUTCString());
        });

        it('Test 02', () => {
            const txt = JSON.stringify({
                expires: {
                    _type: 'date',
                    _value: 'Sat, 30 Jan 2021 03:00:00 GMT'
                },
                value: {
                    id: 666,
                    name: 'Blame Hofmann',
                    createdAt: {
                        _type: 'date',
                        _value: 'Sat, 30 Jan 2021 03:00:00 GMT'
                    },
                    typeUser: {
                        id: 81,
                        cod: 'system'
                    },
                    cart: [
                        {
                            id: 435,
                            amount: 4
                        },
                        {
                            id: 3924,
                            amount: 2
                        }
                    ]
                }
            });

            const parser = new JsonParser();
            parser.addToObjectFunc((_, value) => {
                if (
                    (value?._type === 'date') &&
                    (value?._value)
                ) {
                    return new Date(value?._value);
                } else {
                    return value;
                }
            });

            const obj = parser.toObject(txt);
            assert.strictEqual(obj?.expires?.toUTCString(), new Date(2021, 0, 30).toUTCString());
            assert.exists(obj?.value);
            assert.strictEqual(obj?.value?.id, 666);
            assert.strictEqual(obj?.value?.name, 'Blame Hofmann');
            assert.strictEqual(obj?.value?.createdAt?.toUTCString(), new Date(2021, 0, 30).toUTCString());
            assert.exists(obj?.value?.typeUser);
            assert.strictEqual(obj?.value?.typeUser?.id, 81);
            assert.strictEqual(obj?.value?.typeUser?.cod, 'system');
            assert.exists(obj?.value?.cart);
            assert.strictEqual(obj?.value?.cart?.length, 2);
            assert.strictEqual(obj?.value?.cart[0]?.id, 435);
            assert.strictEqual(obj?.value?.cart[0]?.amount, 4);
            assert.strictEqual(obj?.value?.cart[1]?.id, 3924);
            assert.strictEqual(obj?.value?.cart[1]?.amount, 2);
        });
    });
});
