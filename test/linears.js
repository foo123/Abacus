"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);


let o;

function print_solution(sol, vars)
{
    return null == sol ? 'No solution' : sol.map(function(s, i) {
        return vars[i] + ' = ' + String(s);
    }).join(', ');
}
function print_tex(sol, vars)
{
    return null == sol ? 'No solution' : sol.map(function(s, i) {
        return vars[i] + ' = ' + (s.toTex ? s.toTex() : String(s));
    }).join(', ');
}
function check_solution_system(sol, coeff, vars)
{
    if (null == sol) return 'No solution';

    vars = vars || {};
    let out = '', i, m = coeff.length, j, k = coeff[0].length, res = new Array(m);
    for (i=0; i<m; i++)
    {
        res[i] = 0;
        for (j=0; j<k; j++)
            res[i] += coeff[i][j] * sol[j].valueOf(vars);
    }
    return res;
}

echo('Abacus Linear Systems (VERSION = '+Abacus.VERSION+')');
echo('---');

// (General) Solutions of Linear Systems

echo('Solve system AX = B');
echo('4x + 5y = 7');
echo('o=Abacus.Math.linears([[4,5]], [7], ["w", "z"])');
o=Abacus.Math.linears([[4,5]], [7], ["w", "z"]);
echo(print_solution(o, ['x','y']));
echo(print_tex(o, ['x','y']));
echo(check_solution_system(o, [[4,5]]), [7]);
echo('---');

echo('x - y = 6, -2x + 2y = 1');
echo('o=Abacus.Math.linears([[1,-1],[-2,2]], [6,1], ["w", "z"])');
o=Abacus.Math.linears([[1,-1],[-2,2]], [6,1], ["w", "z"]);
echo(print_solution(o, ['x','y']));
echo(print_tex(o, ['x','y']));
echo(check_solution_system(o, [[1,-1],[-2,2]]), [6,1]);
echo('---');

echo('2x + 5y = -1, -10x - 25y = 5');
echo('o=Abacus.Math.linears([[2,5],[-10,-25]], [-1,5], ["w", "z"])');
o=Abacus.Math.linears([[2,5],[-10,-25]], [-1,5], ["w", "z"]);
echo(print_solution(o, ['x','y']));
echo(print_tex(o, ['x','y']));
echo(check_solution_system(o, [[2,5],[-10,-25]]), [-1,5]);
echo('---');
