const {MalValue} = require('./types');

const pr_str = (exp) => 
    (exp instanceof MalValue) ? exp.pr_str() : exp;


module.exports = {pr_str};