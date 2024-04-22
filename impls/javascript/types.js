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

    pr_str() {
       return '(' +
        this.value.map(toString).join(' ') +
        ')';
    }
}

const toString = (x) => (x instanceof MalValue) ? x.pr_str() : x

module.exports = { MalValue, MalList, MalVector }