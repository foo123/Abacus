"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);


function print_solution(sol, vars)
{
    return !sol ? 'No solution' : (!sol.length ? 'No rational solutions' : sol.map(function(s) {
        return '(' + vars.join(',') + ') = (' + s.map(String).join(',') + ')';
    }).join(', '));
}
function check_solution_system(sol, p)
{
    if (!sol) return 'No solution';
    if (!sol.length) return 'No rational solutions';

    let out = '', i, m = p.length, j, k = sol.length, res = new Array(k);
    for (j=0; j<k; ++j)
    {
        res[j] = new Array(m);
        for (i=0; i<m; i++)
        {
            let o = sol[j].reduce(function(o, s, xi) {
                o[p[i].symbol[xi]] = s.evaluate ? s.evaluate() : s;
                return o;
            }, {});
            res[j][i] = p[i].evaluate(o).toString();
        }
    }
    return res;
}

echo('Abacus Polynomial Systems (VERSION = '+Abacus.VERSION+')');
echo('---');

// Solutions of Polynomial Systems
const ring1 = Abacus.Ring.Q("x", "y", "z");
const ring2 = Abacus.Ring.K(Abacus.Rational, "x", true);
let o, p1, p2, p3;

p1 = ring1.fromString("x^2 + y + z - 1");
p2 = ring1.fromString("x + y^2 + z - 1");
p3 = ring1.fromString("x + y + z^2 - 1");
echo('Solve: '+[p1,p2,p3].map(String).join(','));
echo('o=Abacus.Math.polynomials(['+[p1,p2,p3].map(String).join(',')+'], ["x", "y", "z"])');
o=Abacus.Math.polynomials([p1,p2,p3], ["x", "y", "z"]);
echo(print_solution(o, ["x", "y", "z"]));
echo(check_solution_system(o, [p1,p2,p3]));
echo('---');

p1 = ring1.fromString("x^2 + y^2 + z - 1");
p2 = ring1.fromString("y^2 + z");
echo('Solve: '+[p1,p2].map(String).join(','));
echo('o=Abacus.Math.polynomials(['+[p1,p2].map(String).join(',')+'], ["x", "y", "z"])');
o=Abacus.Math.polynomials([p1,p2], ["x", "y", "z"]);
echo(print_solution(o, ["x", "y", "z"]));
echo(check_solution_system(o, [p1,p2]));
echo('---');

p1 = ring1.fromString("x^2 + y^2 + z - 1");
echo('Solve: '+[p1].map(String).join(','));
echo('o=Abacus.Math.polynomials(['+[p1].map(String).join(',')+'], ["x", "y", "z"])');
o=Abacus.Math.polynomials([p1], ["x", "y", "z"]);
echo(print_solution(o, ["x", "y", "z"]));
echo(check_solution_system(o, [p1]));
echo('---');

p1 = ring1.fromString("(x+y)(y^2+z)");
echo('Solve: '+[p1].map(String).join(','));
echo('o=Abacus.Math.polynomials(['+[p1].map(String).join(',')+'], ["x", "y", "z"])');
o=Abacus.Math.polynomials([p1], ["x", "y", "z"]);
echo(print_solution(o, ["x", "y", "z"]));
echo(check_solution_system(o, [p1]));
echo('---');

p1 = ring2.fromString("(x+1)^2");
p2 = ring2.fromString("x+1");
p3 = ring2.fromString("x*(x+1)");
echo('Solve: '+[p1,p2,p3].map(String).join(','));
echo('o=Abacus.Math.polynomials(['+[p1,p2,p3].map(String).join(',')+'], ["x"])');
o=Abacus.Math.polynomials([p1,p2,p3], ["x"]);
echo(print_solution(o, ["x"]));
echo(check_solution_system(o, [p1,p2,p3]));
echo('---');

p1 = ring1.fromString("2x + y + z - 1");
p2 = ring1.fromString("x + 2y + z - 1");
p3 = ring1.fromString("x + y + 2z - 1");
echo('Solve: '+[p1,p2,p3].map(String).join(','));
echo('o=Abacus.Math.polynomials(['+[p1,p2,p3].map(String).join(',')+'], ["x", "y", "z"])');
o=Abacus.Math.polynomials([p1,p2,p3], ["x", "y", "z"]);
echo(print_solution(o, ["x", "y", "z"]));
echo(check_solution_system(o, [p1,p2,p3]));
echo('---');

p1 = ring1.fromString("x + 2y + z - 4");
p2 = ring1.fromString("x + y + 2z - 4");
echo('Solve: '+[p1,p2].map(String).join(','));
echo('o=Abacus.Math.polynomials(['+[p1,p2].map(String).join(',')+'], ["x", "y", "z"])');
o=Abacus.Math.polynomials([p1,p2], ["x", "y", "z"]);
echo(print_solution(o, ["x", "y", "z"]));
echo(check_solution_system(o, [p1,p2]));
echo('---');
