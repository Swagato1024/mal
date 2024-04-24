const readline = require('node:readline');
const { chunk } = require('lodash');
const { stdin: input, stdout: output } = require('node:process');

const printer = require('./printer');
const reader = require('./reader');
const { MalSymbol, MalList, MalVector, MalHashmap, MalString, MalNil } = require('./types');
const { Env } = require('./env');
const { ns } = require('./core');

const rl = readline.createInterface({ input, output });

const READ = str => reader.read_str(str)

const eval_ast = (ast, env) => {
    if(ast instanceof MalSymbol) return env.get(ast)

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
Object.entries(ns).forEach(([key, value]) => {
    env.set(new MalSymbol(key), value);
});

const handleDef = ([symbol, key, exp]) => {
    env.set(key, EVAL(exp, env));
    return env.get(key);
}

const handleLet = ([_, bindings, exprs], env) => {
    const newEnv = new Env(env);

    chunk(bindings.value, 2)
    .forEach(([symbol, exp]) => 
        newEnv.set(symbol, EVAL(exp, newEnv))
    );

   return exprs ? EVAL(exprs, newEnv) : new MalNil();
}

const handleIf = (ifParams, env) => {
    if(ifParams.length < 3) throw 'Too few arguments to if';
    const [, test, then, otherwise] = ifParams;
   return EVAL(test, env) ?  EVAL(then, env) : EVAL(otherwise, env);
}

const handleDo = ([, ...exprs], env) => {
    const [lastExpEvaluatedTo] = exprs
    .map(x => EVAL(x, env))
    .slice(-1);

    return lastExpEvaluatedTo;
}

const handleFn = ([, bindings, exprs], env) => {
    return (...args) => {
        const newEnv = new Env(env, bindings.value, args);
        return EVAL(exprs, newEnv);
    }
}  
  
const EVAL = (ast, env) => {
    if(!(ast instanceof MalList)) return eval_ast(ast, env);

    switch(ast.value[0].value) {
        case 'def!' : return handleDef(ast.value);
        case 'let*' : return handleLet(ast.value, env);
        case 'if'   : return handleIf(ast.value, env);
        case 'do'   : return handleDo(ast.value, env);
        case 'fn*'  : return handleFn(ast.value, env);
        default :
          const [fn, ...args] = eval_ast(ast, env).value;
          if(fn instanceof Function) return fn(...args);
          throw 'First param should be fn'
    }
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
