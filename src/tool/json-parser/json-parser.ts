import { ConvFunc, Key, TypeOf } from './interface';

export class JsonParser {

    public static typeOf(obj: any): TypeOf {
        if (obj === null) {
            return 'null';
        } else if (obj instanceof Date) {
            return 'date';
        } else if (obj instanceof Array) {
            return 'array';
        }
        
        switch (typeof obj) {
            case 'number':
                return 'number';
            case 'bigint':
                return 'bigint';
            case 'boolean':
                return 'boolean';
            case 'string':
                return 'string';
            case 'symbol':
                return 'symbol';
            case 'object':
                return 'object';
            case 'function':
                return 'function';
            default:
                return 'undefined';
        }
    }

    private _toObjectFunc: ConvFunc[];
    private _toStringFunc: ConvFunc[];
    
    private _space : string;
    public get space(): string {
        return this._space;
    }
    public set space(v: string) {
        this._space = v;
    }
    

    constructor(space?: string) {
        this._toObjectFunc = [];
        this._toStringFunc = [];
        this._space = space;
    }

    private _recursiveIteration(functions: ConvFunc[], key: Key, value: any): any {
        // Iterate in conversion
        for (const func of functions) {
            value = func(key, value);
        }

        // Iterate recursive
        const type = JsonParser.typeOf(value);
        switch (type) {
            case 'object':
                for (const k of Object.keys(value)) {
                    value[k] = this._recursiveIteration(functions, k, value[k]);
                }
                break;
            case 'array':
                for (let i = 0; i < (value as Array<any>).length; i++) {
                    value[i] = this._recursiveIteration(functions, i, value[i]);
                }
                break;
        }

        // Return converted value
        return value;
    }

    toString(obj: any) {
        const res = this._recursiveIteration(this._toStringFunc, null, obj);
        return JSON.stringify(res, null, this._space);
    }

    toObject(txt: string) {
        const res = JSON.parse(txt);
        return this._recursiveIteration(this._toObjectFunc, null, res);
    }

    addToStringFunc(func: ConvFunc): void {
        this._toStringFunc.push(func);
    }

    addToObjectFunc(func: ConvFunc): void {
        this._toObjectFunc.push(func);
    }
}
