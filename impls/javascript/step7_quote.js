const readline = require('node:readline');
const { chunk, values } = require('lodash');
const { stdin: input, stdout: output } = require('node:process');

const printer = require('./printer');
const reader = require('./reader');

const { MalSymbol, MalList, MalVector, MalHashmap, MalString, MalNil, MalFn, MalValue, Seq } = require('./types');
const { Env } = require('./env');
const { ns } = require('./core');
const { log } = require('node:console');

const READ = str => reader.read_str(str);
const PRINT = str => printer.pr_str(str)

const rl = readline.createInterface({ input, output });
const rep = (str, env) => PRINT(EVAL(READ(str), env))

const createReplEnv = (env) => {
    Object.entries(ns).forEach(([key, value]) => {
        env.set(new MalSymbol(key), value);
    });  

    env.set(new MalSymbol('eval'), (ast) => EVAL(ast, env));
    rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))', env)
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

const handleFn = ([, params, fnBody], env) => {
    const fn = (...args) => 
        EVAL(fnBody, new Env(env, params.value, args));

   return new MalFn(fnBody, params, env, fn)
};
const quote = (x) => {
    return new MalList([new MalSymbol('quote'), x])
}

const quasiquote = ([, x], env) => {
    let result = new MalList();

    if(!(x instanceof MalValue) || x instanceof MalNil ) return x;

    if(!(x instanceof Seq)) return new MalList([new MalSymbol('quote'), x]);

    if(x.value.length === 2 && x.value[0]?.value === 'unquote') return x.value[1]; 

      const reverseList =  x.value
        .slice()
        .reverse()


// TODO:  Reduce 
     for (const e of reverseList) {
        if(!(e instanceof MalValue)) {
            result = new MalList([new MalSymbol('cons'), e, result]);
            continue;
        }

        if(e.value && e.value[0]?.value === 'unquote') {
            result = new MalList([new MalSymbol('cons'), e.value[1], result])
        }

        else if(e.value && e.value[0]?.value === 'splice-unquote') {
            result = new MalList([new MalSymbol('concat'), e.value[1], result])
        }
        
        else if((e instanceof Seq)) {
             const abc = new Seq([new MalSymbol('cons'), e, result]);
             result =  e instanceof MalVector ?
              new Seq([new MalSymbol('cons'), new Seq([new MalSymbol("vec"), new Seq(e.value)]), result]) 
              : abc;
        }
        else{  
            result =  new MalList([new MalSymbol('cons'), quote(e), result]);
        }
     }

    return x instanceof MalVector ?  new Seq([new MalSymbol("vec"), result]) : result;

}
  
const EVAL = (ast, env) => {
    // console.log({ast})
    while(true) {
    if(ast instanceof MalVector) return eval_ast(ast, env);
    if(!(ast instanceof Seq)) return eval_ast(ast, env);

    if(ast.isEmpty()) return ast;

    switch(ast.value[0].value) {
        case "def!" : return handleDef(ast.value);
        case "let*" : return handleLet(ast.value, env);
        case "do" : return handleDo(ast.value, env);
        case "if" : 
         ast = handleIf(ast.value, env);
         break;
        case "fn*" : return handleFn(ast.value, env);
        case "quote" : {
            return ast.value[1]
        };
        case "quasiquote" : {
            ast = quasiquote(ast.value, env);
            break;
        };
        case 'quasiquoteexpand':
            return quasiquote(ast.value);
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

createReplEnv(env);

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