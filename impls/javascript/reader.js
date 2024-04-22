const { log } = require("console");

class Reader {
    #tokens
    #position

    constructor(tokens) {
        this.#tokens = tokens;
        this.#position = 0;
    }

    next() {
        const token =  this.#tokens[this.#position];
        this.#position += 1;
        return token;
    }

    peek() {
        return this.#tokens[this.#position];
    }
}

const tokenize = (sourceCode) => {
    const re = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
    return [...sourceCode.matchAll(re)].map((x) => x[1]).slice(0, -1);
}; 

const read_seq = (reader, closingSymbol) => {
    const ast = [];
  
    while(reader.peek() != closingSymbol) {
      ast.push(read_form(reader));
    }
  
    reader.next();
    return ast;
  }; 

const read_list = (reader) => read_seq(reader, ')')

const read_atom = reader => {
    const token = reader.next();

    if (token.match(/^[+-]?[0-9]+$/)) {
      return parseInt(token);
    }

    return token;
  };

  const read_form = reader => {
    const token = reader.peek();

    switch (token) {
      case '(' :
        reader.next();
        return read_list(reader);
      default :
        return read_atom(reader);
    }
  }; 

const readStr = (expStr) => {
    const tokens = tokenize(expStr);
    const reader = new Reader(tokens);
    return read_form(reader);
}