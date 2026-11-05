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
    else if (Abacus.Arithmetic.isNumber(x))
    {
        x = String(x).split('Infinity').join('Inf');
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
    // export
    context.Abacus = Abacus;
    // symbolics
    context.Expr = Abacus.Expr;
    context.Poly = Abacus.Poly;
    context.Series = Abacus.Series;
    context.PowerSeries = Abacus.PowerSeries;
    context.Ring = Abacus.Ring;
    context.Matrix = Abacus.Matrix;
    context.Evaluate = Abacus.Evaluate;
    context.Expand = Abacus.Expand;
    context.Factor = Abacus.Factor;
    context.Simplify = Abacus.Simplify;
    context.Roots = Abacus.Roots;
    context.Zeros = Abacus.Zeros;
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
    ignoreUndefined: true,
    writer: function(ans) {
        return null != ans ? str(ans) : '';
    },
    eval: function(code, context, replResourceName, cb) {
        code = String(code).trim();
        if (!code.length) return cb();
        initContext(context);
        let ans = null, err = null;
        try {
            ans = context.eval(code);
        } catch (e) {
            err = e.toString();
            ans = null;
        }
        cb(err, null == ans ? undefined : ans);
    }
});
//initContext(repl.context);
//repl.on('reset', () => initContext(repl.context));
})();