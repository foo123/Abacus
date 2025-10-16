"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);


function print_solution(sol, vars)
{
    return null == sol ? 'No solution' : sol.map(function(s) {
        return '(' + vars.join(',') + ') = (' + s.map(String).join(',') + ')';
    }).join(', ');
}
function check_solution_system(sol, p)
{
    if (null == sol) return 'No solution';

    let out = '', i, m = p.length, j, k = sol.length, res = new Array(k);
    for (j=0; j<k; ++j)
    {
        res[j] = new Array(m);
        for (i=0; i<m; i++)
        {
            let o = sol[j].reduce(function(o, s, xi) {
                o[p[i].symbol[xi]] = s;
                return o;
            }, {});
            res[j][i] = p[i].evaluate(o).toString();
        }
    }
    return res;
}

echo('Abacus Polynomial Systems (VERSION = '+Abacus.VERSION+')');
echo('---');

// Rational Solutions of Polynomial Systems
let o, p1, p2, p3;
const ring = Abacus.Ring.Q("x", "y", "z");
p1 = ring.fromString("x^2 + y + z - 1");
p2 = ring.fromString("x + y^2 + z - 1");
p3 = ring.fromString("x + y + z^2 - 1");
echo('Solve: '+[p1,p2,p3].map(String).join(','));
echo('o=Abacus.Math.polynomials(['+[p1,p2,p3].map(String).join(',')+'], ["x", "y", "z"])');
o=Abacus.Math.polynomials([p1,p2,p3], ["x", "y", "z"]);
echo(print_solution(o, ["x", "y", "z"]));
echo(check_solution_system(o, [p1,p2,p3]));
echo('---');

p1 = ring.fromString("x^2 + y + z - 1");
p2 = ring.fromString("x + y^2 + z - 1");
p3 = ring.fromString("x + y + z^2 - 1");
echo('Solve approximately: '+[p1,p2,p3].map(String).join(','));
echo('o=Abacus.Math.polynomials(['+[p1,p2,p3].map(String).join(',')+'], ["x", "y", "z"], "approximate")');
o=Abacus.Math.polynomials([p1,p2,p3], ["x", "y", "z"], "approximate");
echo(print_solution(o, ["x", "y", "z"]));
echo(check_solution_system(o, [p1,p2,p3]));
echo('---');
