const { MalList } = require("./types");

class Env {
    #outer
    constructor(outer = null, binds = [], exprs = []) {
        this.#outer = outer;
        this.data = {};
        this.#bindExprs(binds, exprs);
    }

    #bindExprs(binds, exprs) {
        let index = 0;
        while(index < binds.length && binds[index].value !== '&') {
          this.set(binds[index], exprs[index]);
          index++;
        }
  
        if(index >= binds.length) return;
  
        this.set(binds[index + 1], new MalList(exprs.slice(index)));
    }

    set(symbol, malValue) {
        this.data[symbol.value] = malValue;
    }

    find(symbol) {
        if(symbol.value in this.data) return this;
        if(this.#outer) return this.#outer.find(symbol);
        return null;
    }

    get(symbol) {
        const env = this.find(symbol);
        if(!env) throw `${symbol.value} not found in env`;
        return env.data[symbol.value];
    }
}

module.exports = {Env}