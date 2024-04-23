class Env {
    #outer
    constructor(outer = null) {
        this.#outer = outer;
        this.data = {};
    }

    set(symbol, malValue) {
        this.data[symbol.value] = malValue;
        console.log(this.data);
    }

    find(symbol) {
        if(symbol.value in this.data) return this;
        if(this.#outer) return this.#outer.find(symbol);
        return null;
    }

    get(symbol) {
        const env = this.find(symbol);
        if(!env) throw `${symbol.value} not found`;
        return env.data[symbol.value];
    }
}

module.exports = {Env}