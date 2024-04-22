const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

const printer = require('./printer');
const reader = require('./reader');
const { MalSymbol, MalList, MalVector, MalHashmap } = require('./types');

const rl = readline.createInterface({ input, output });

const repl_env = {
    '+' : (...args) => args.reduce((a, b) => a + b), 
    '-' : (...args) => args.reduce((a, b) => a - b), 
    '*' : (...args) => args.reduce((a, b) => a * b), 
    '/' : (...args) => args.reduce((a, b) => a / b)
}

const READ = str => reader.read_str(str)

const eval_ast = (ast, env) => {
    if(ast instanceof MalSymbol) {
        return env[ast.value]
    }
   
    if(ast instanceof MalList) {
        const value = ast.value.map(x => EVAL(x, env));
        return new MalList(value);  
      }

    if(ast instanceof MalVector) {
        const value = ast.value.map(x => EVAL(x, env));
        return new MalVector(value);
     }
   
    return ast;
}

const EVAL = (ast, env) => {
    if(ast instanceof MalList) {
       if(ast.value.length === 0) return ast;

       const [fn, ...args] = eval_ast(ast, repl_env).value;
       return fn(...args);
    }

    return eval_ast(ast, repl_env);
}
const PRINT = str => printer.pr_str(str)

const rep = (str, env) => PRINT(EVAL(READ(str)), env)

const repl = () => {
    rl.question('user> ', (input) => {
        try {
            console.log(rep(input, repl_env));
        }
        catch(e) {
            console.log(e);
        }

        repl();
    });
}

repl();