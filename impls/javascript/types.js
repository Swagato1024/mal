class MalValue {
    constructor(value) {
        this.value = value
    }

    pr_str() {
        return this.value.toString();
    }
}

class MalVector extends MalValue {
    constructor(value) {
        super(value);
    }

    pr_str() {
       return '[' +
        this.value.map(toString).join(' ') +
        ']';
    }
}

class MalList extends MalValue {
    constructor(value) {
        super(value);
    }

    isEmpty() {
        return this.value.length === 0;
    }

    pr_str() {
       return '(' +
        this.value.map(toString).join(' ') +
        ')';
    }
}

class MalSymbol extends MalValue {
    constructor(value) {
        super(value)
    }
}

class MalHashmap extends MalValue {
    constructor(value) {
        super(value);
    }
    
    pr_str() {
        return '{' +
        this.value.map(toString).join(' ') +
        '}';
    }
}

class MalString extends MalValue {
    constructor(value) {
        super(value);
    }

    pr_str() {
        return `"${this.value}"`
    }
}

class MalKeyword extends MalValue {
    constructor(value) {
        super(value);
    }

    pr_str() {
        return `:${this.value}`
    }
}

class MalNil extends MalValue {
    constructor() {
        super(null)
    }

    pr_str() {
        return 'nil';
    }
}

class MalFn extends MalValue {
    constructor(fnBody, params, env, fn) {
        super(fn)
        this.fnBody = fnBody
        this.params = params;
        this.env = env;
    }

    pr_str() {
        return '#<function>';
    }
}

const toString = (x) => (x instanceof MalValue) ? x.pr_str() : x

module.exports = { 
    MalValue,
    MalList,
    MalVector,
    MalHashmap,
    MalSymbol,
    MalString,
    MalKeyword,
    MalNil,
    MalFn
 }