(function() {
"use strict";

const Abacus = require('./Abacus.js');

// optionally use arbitrary precision arithmetic
require('./arithmetic.js')(Abacus);

function stringify(x)
{
    if (null == x)
    {
        // pass
        x = '';
    }
    else if ("function" === typeof x.toTex)
    {
        x = x.toString();
    }
    else if (Array.isArray(x))
    {
        x = '(' + x.map(stringify).join(',') + ')';
    }
    else if (("object" === typeof x) || ("function" === typeof x))
    {
        // pass
        x = '';
    }
    else
    {
        x = String(x);
    }
    return x;
}

function str(x)
{
    if (Array.isArray(x))
    {
        x = x.map(stringify).join("\n\n");
    }
    else
    {
        x = stringify(x);
    }
    return x;
}

function initContext(context)
{
    // export it
    context.Abacus = Abacus;
    // symbolics
    context.Expr = Abacus.Expr;
    context.Poly = Abacus.Poly;
    context.Ring = Abacus.Ring;
    context.Matrix = Abacus.Matrix;
    // combinatorics
    context.Tensor = Abacus.Tensor;
    context.Permutation = Abacus.Permutation;
    context.Combination = Abacus.Combination;
    context.Subset = Abacus.Subset;
    context.Partition = Abacus.Partition;
    context.SetPartition = Abacus.SetPartition;
}

const repl = require('repl').start({
    prompt: '>> ',
    useGlobal: true,
    writer: function(res) {
        return null != res ? str(res) : '';
    },
    eval: function(code, context, replResourceName, cb) {
        code = String(code).trim();
        if (!code.length) return cb(null, null);
        let res = null, err = null;
        try {
            res = context.eval(code);
        } catch (e) {
            err = e;
            res = null;
        }
        cb(err, res);
    }
});
initContext(repl.context);
repl.on('reset', () => initContext(repl.context));
})();