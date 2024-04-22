const { MalList, MalVector, MalHashmap, MalSymbol, MalString } = require("./types");

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
        if(reader.peek() === undefined) {
            throw 'unbalanced';
        }

      ast.push(read_form(reader));
    }
  
    reader.next();
    return ast;
  }; 

const read_list = (reader) => new MalList(read_seq(reader, ')'))
const read_vector = (reader) => new MalVector(read_seq(reader, ']'))
const read_hashmap = (reader) => new MalHashmap(read_seq(reader, '}'))


const read_atom = reader => {
    const token = reader.next();
    
    if (token.match(/^[+-]?[0-9]+$/)) {
      return parseInt(token);
    }

    if(result = token.match(/"([^"]*)"$/)) {
      return new MalString(result[1]);
    }

    return new MalSymbol(token);
  };

  const read_form = reader => {
    const token = reader.peek();

    switch (token) {
      case '(' :
        reader.next();
        return read_list(reader);

      case '[' :
        reader.next();
        return read_vector(reader); 

     case '{' :
        reader.next();
        return read_hashmap(reader); 

      default :
        return read_atom(reader);
    }
  }; 

const read_str = (expStr) => {
    const tokens = tokenize(expStr);
    const reader = new Reader(tokens);
    return read_form(reader);
}


module.exports = {read_str};