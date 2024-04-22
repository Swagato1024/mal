const { log } = require("console");

const reader = (tokens) => {
    let position = 0;

    const next = () => {
        const token =  tokens[position];
        position += 1;
        return token;
    }

    const peek = () => {
        tokens[position];
    };

    return { next, peek };
}

const tokenize = (sourceCode) => {
    const re = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
    return [...sourceCode.matchAll(re)].map((x) => x[1]).slice(0, -1);
}; 

log(tokenize("(  + 2   (*  3  4)  )"));

const read_seq = (reader, closingSymbol) => {
    const ast = [];
  
    while(reader.peek() != closingSymbol) {
      ast.push(readForm(reader));
    }
  
    reader.next();
    return ast;
  }; 

const read_list = (reader) => read_seq(reader, ')');

const read_atom = reader => {
    const token = reader.next();

    if (token.match(/^[+-]?[0-9]+$/)) {
      return parseInt(token);
    }

    if(token.match(/^"[^"]*"$/)) {
        log("string");
      return token.slice(1,token.length-1);
    }
  };

const read_form = reader =>
      ((reader.peek() === '(') ? read_list : read_atom)(reader);

const readStr = (expStr) => 
    read_form(reader(tokenize(expStr)));

