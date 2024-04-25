const readline = require('node:readline');
const { chunk, values } = require('lodash');
const { stdin: input, stdout: output } = require('node:process');

const printer = require('./printer');
const reader = require('./reader');

const { MalSymbol, MalList, MalVector, MalHashmap, MalString, MalNil, MalFn } = require('./types');
const { Env } = require('./env');
const { ns } = require('./core');

const rl = readline.createInterface({ input, output });

const createReplEnv = (env) => {
    Object.entries(ns).forEach(([key, value]) => {
        env.set(new MalSymbol(key), value);
    });  

    env.set(new MalSymbol('eval'), (ast) => EVAL(ast, env));
  };

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
createReplEnv(env);

const handleDef = ([, key, exp]) => {
    env.set(key, EVAL(exp, env));
    return env.get(key);
}

const handleLet = ([astValue, bindings, exprs], env) => {
    const letEnv = new Env(env);

    chunk(bindings.value, 2)
    .forEach(([symbol, exp]) => 
        letEnv.set(symbol, EVAL(exp, letEnv))
    );

   return exprs ? EVAL(exprs, letEnv) : new MalNil();
}

const handleIf = (ifParams, env) => {
    if(ifParams.length < 3) throw 'Too few arguments to if';

    const [, test, then, otherwise] = ifParams;
    return EVAL(test, env) ? then : otherwise;
}

const handleDo = ([, ...exprs], env) => {
    const [lastExpEvaluatedTo] = exprs
    .map(x => EVAL(x, env))
    .slice(-1);

    return lastExpEvaluatedTo;
}

const handleFn = ([, params, fnBody], env) => new MalFn(fnBody, params, env);
  
const EVAL = (ast, env) => {
    while(true) {

    if(!(ast instanceof MalList)) return eval_ast(ast, env);

    switch(ast.value[0].value) {
        case "def!" : return handleDef(ast.value);
        case "let*" : return handleLet(ast, env);
        case "do" : return handleDo(ast, env);
        case "if" : 
         ast = handleIf(ast.value, env);
         break;
        case "fn*" : return handleFn(ast.value, env);
        default:
          const [fn, ...args] = eval_ast(ast, env).value;

          if(fn instanceof MalFn) {
            env = new Env(fn.env, fn.params.value, args);
            ast = fn.fnBody;
           }
         else {
            return fn.apply(null, args);
          }
      }
    }
}

const READ = str => reader.read_str(str);
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