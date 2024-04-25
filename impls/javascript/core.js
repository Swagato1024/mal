const { isEqual } = require("lodash");
const { MalNil, MalList } = require("./types");
const reader = require('./reader');

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
    '>=' : (...args) =>  a >= b,
    'not' : (a) => !(a),
    'read-string' : str => reader.read_str(str.value)
}

module.exports = {ns};
