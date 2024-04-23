const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

const printer = require('./printer');
const reader = require('./reader');
const { MalSymbol, MalList, MalVector, MalHashmap, MalString } = require('./types');
const { Env } = require('./env');

const rl = readline.createInterface({ input, output });

const READ = str => reader.read_str(str)

const eval_ast = (ast, env) => {
    if(ast instanceof MalSymbol) {
        return env.get(ast)
    }
   
    if(ast instanceof MalList) {
        const value = ast.value.map(x => EVAL(x, env));
        return new MalList(value);  
      }

    if(ast instanceof MalVector) {
        const value = ast.value.map(x => EVAL(x, env));
        return new MalVector(value);
     }

     if(ast instanceof MalHashmap) {
        const value = ast.value.map(x => EVAL(x, env));
        return new MalHashmap(value);
     }
   
    return ast;
}

const env = new Env();
env.set(new MalSymbol('+'), (...args) => args.reduce((a,b) => a + b));
env.set(new MalSymbol('-'), (...args) => args.reduce((a,b) => a - b),);
env.set(new MalSymbol('*'), (...args) => args.reduce((a,b) => a * b),);
env.set(new MalSymbol('/'), (...args) => args.reduce((a,b) => a / b),);

const handleDef = ([symbol, key, exp], env) => {
    env.set(key, EVAL(exp, env));
    return env.get(key);
}

const EVAL = (ast, env) => {
    if(!(ast instanceof MalList)) return eval_ast(ast, env);

    if(ast.isEmpty()) return ast;
  
    switch(ast.value[0].value) {
        case 'def!' : return handleDef(ast.value, env)
    }
  
    const [fn, ...args] = eval_ast(ast, env).value;
    return fn(...args);
}

const PRINT = str => printer.pr_str(str)

const rep = (str, env) => PRINT(EVAL(READ(str), env))

const repl = () => {
    rl.question('user> ', (input) => {
        try {
            console.log(rep(input, env));
        }
        catch(e) {
            console.log(e);
        }

        repl();
    });
}

repl();