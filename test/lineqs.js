"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);


let o;

function print_solution(sol)
{
    return null == sol ? 'No solution' : sol.map(function(s) {
        return s.map(String).join("\n");
    }).join("\n\n");
}

echo('Abacus Linear Systems of Inequalities (VERSION = '+Abacus.VERSION+')');
echo('---');

// (General) Linear Systems of Inequalities

echo('Solve system AX <= B');
echo('4x + 5y <= 7');
echo('o=Abacus.Math.lineqs([[4,5]], [7], ["x", "y"])');
o=Abacus.Math.lineqs([[4,5]], [7], ["x", "y"]);
echo(print_solution(o));
echo('---');


echo('2x + y + z <= 4, -x -2y -z <= -4, x + y <= 4');
echo('o=Abacus.Math.lineqs([[2,1,1],[-1,-2,-1],[1,1,0]], [4,-4,4], ["x", "y", "z"])');
o=Abacus.Math.lineqs([[2,1,1],[-1,-2,-1],[1,1,0]], [4,-4,4], ["x", "y", "z"]);
echo(print_solution(o));
echo('---');

echo('2x + y + z <= 4, -x -2y -z <= -4');
echo('o=Abacus.Math.lineqs([[2,1,1],[-1,-2,-1]], [4,-4], ["x", "y", "z"])');
o=Abacus.Math.lineqs([[2,1,1],[-1,-2,-1]], [4,-4], ["x", "y", "z"]);
echo(print_solution(o));
echo('---');


echo('4x <= 4, -4x <= -5');
echo('o=Abacus.Math.lineqs([[4],[-4]], [4,-5], ["x"])');
o=Abacus.Math.lineqs([[4],[-4]], [4,-5], ["x"]);
echo(print_solution(o));
echo('---');
