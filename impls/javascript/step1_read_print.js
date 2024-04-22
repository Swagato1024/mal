const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

const printer = require('./printer');
const {read_str} = require('./reader');

const rl = readline.createInterface({ input, output });

const READ = str => read_str(str)
const EVAL = str => str
const PRINT = str => printer.pr_str(str)

const rep = str => PRINT(EVAL(READ(str)))

const repl = () => {
    rl.question('user> ', (input) => {
        try {
            console.log(rep(input));
        }
        catch(e) {
            console.log(e);
        }

        repl();
    });
}

repl();
