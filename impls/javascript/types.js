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
        return `${this.value}`
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
        super(fnBody)
        this.fnBody = fnBody
        this.params = params;
        this.env = env;
        this.fn = fn;
    }

    pr_str() {
        return '#<function>';
    }

    apply (context, args) {
       return this.fn.apply(context, args);
    }
}

class MalAtom extends MalValue {
    constructor(value) {
      super(value);
    }
  
    pr_str() {
      return "(atom " + this.value + ")";
    }
  
    deref() {
      return this.value;
    }
  
    reset(value) {
      this.value = value;
      return this.value;
    }
  
    swap(f, ...args) {
     this.value = f.apply(null, [this.value, ...args]);
     return this.value;
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
    MalFn,
    MalAtom
 }