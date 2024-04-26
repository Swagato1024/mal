const { readFileSync } = require("fs");
const { isEqual } = require("lodash");
const { MalNil, MalList, MalString, MalAtom } = require("./types");
const reader = require('./reader');
const printer = require('./printer');


const str = (...args) => new MalString(args.map(x => x.value).join(''))

const ns = {
    '+' : (...args) => args.reduce((a,b) => a + b),
    '-' : (...args) => args.reduce((a,b) => a - b),
    '*' : (...args) => args.reduce((a,b) => a * b),
    '/' : (...args) => args.reduce((a,b) => a / b),
    '=' : (a, b) => isEqual(a, b),
    'prn' : (...args) => {
        const output = args.map(x => x.value? `"${x.value}"` : x);
        console.log(...output);
        return new MalNil();
      },
    'list' : (...args) => new MalList(args),
    'list?' : (args) => args instanceof MalList,
    'empty?' : (args) => args.value.length === 0,
    'count' : (args) => args.value.length, 
    '>' : (a, b) => a > b,
    '<' : (a, b) => a < b,
    '<=' : (a, b) => a <= b,
    '>=' : (a, b) =>  a >= b,
    'not' : (a) => !(a),
    'read-string' : str => reader.read_str(str.value),
    'slurp' : (filePath) =>  new MalString(readFileSync(filePath.value, 'utf8')),
    'str' : str,
    'swap!' : (atom, f, ...args) => atom instanceof MalAtom && atom.swap(f, ...args),
    'atom' : (value) => new MalAtom(value),
    'deref' : (value) => value instanceof MalAtom && value.deref(),
    'reset!' : (symbol, resetTo) => symbol instanceof MalAtom && symbol.reset(resetTo),
    'cons': (value, list) => new MalList([value, ...list.value]),
    'concat': (...lists) => new MalList(lists.flatMap(x => x.value)),
}

module.exports = {ns};
