var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;


var o;

function print_solution( sol, vars )
{
    return null == sol ? 'No Integer solution' : sol.map(function(s, i){
        return vars[i] + ' = ' + String(s);
    }).join(', ');
}
function check_solution( sol, coeff, vars, modulo )
{
    if ( null == sol ) return 'No Integer solution';
    
    vars = vars || {};
    var out = '', i, l = sol.length, res = 0;
    for(i=0; i<l; i++)
    {
        res += coeff[i] * sol[i].valueOf(vars);
    }
    if ( null != modulo )
    {
        res = res % modulo;
        if ( 0 > res ) res += modulo;
    }
    return res;
}
function check_solution_system( sol, coeff, vars )
{
    if ( null == sol ) return 'No Integer solution';
    
    vars = vars || {};
    var out = '', i, m = coeff.length, j, k = coeff[0].length, res = new Array(m);
    for(i=0; i<m; i++)
    {
        res[i] = 0;
        for(j=0; j<k; j++)
            res[i] += coeff[i][j] * sol[j].valueOf(vars);
    }
    return res;
}
function check_solution2( sol, coeff, vars )
{
    if ( null == sol ) return 'No Integer solution';
    
    vars = vars || {};
    var out = '', i, l = sol.length, res = 0, s2;
    for(i=0; i<l; i++)
    {
        s2 = sol[i].valueOf(vars);
        res += coeff[i] * s2 * s2;
    }
    return res;
}
function random(m, M)
{
    return Abacus.Arithmetic.rnd(m, M);
}

echo('Abacus.Diophantine (VERSION = '+Abacus.VERSION+')');
echo('---');

// Diophantine Equations and Linear Congruences

echo('Solve a1x1 + a2x2 + a3x3 + .. = c');
echo('4x = 7');
echo('o=Abacus.Math.diophantine([4], 7)');
o=Abacus.Math.diophantine([4], 7);
echo(print_solution(o, ['x']));
echo(check_solution(o, [4]), 7);
echo(check_solution(o, [4], {"i_1":random(-100,100)}), 7);
echo('---');

echo('4x = 8');
echo('o=Abacus.Math.diophantine([4], 8)');
o=Abacus.Math.diophantine([4], 8);
echo(print_solution(o, ['x']));
echo(check_solution(o, [4]), 8);
echo(check_solution(o, [4], {"i_1":random(-100,100)}), 8);
echo('---');

echo('4x + 0y = 8');
echo('o=Abacus.Math.diophantine([4,0], 8)');
o=Abacus.Math.diophantine([4,0], 8);
echo(print_solution(o, ['x','y']));
echo(check_solution(o, [4,0]), 8);
echo(check_solution(o, [4,0], {"i_1":random(-100,100)}), 8);
echo('---');

echo('4x + 5y = 7');
echo('o=Abacus.Math.diophantine([4,5], 7)');
o=Abacus.Math.diophantine([4,5], 7);
echo(print_solution(o, ['x','y']));
echo(check_solution(o, [4,5]), 7);
echo(check_solution(o, [4,5], {"i_1":random(-100,100)}), 7);
echo('o=Abacus.Math.diophantine([4,5], 7, false)');
o=Abacus.Math.diophantine([4,5], 7, false);
echo(print_solution(o, ['x','y']));
echo(check_solution(o, [4,5]), 7);
echo('---');

echo('0x + 0z + 0y + 0w = 0');
echo('o=Abacus.Math.diophantine([0,0,0,0], 0)');
o=Abacus.Math.diophantine([0,0,0,0], 0);
echo(print_solution(o, ['x','z','y','w']));
echo(check_solution(o, [0,0,0,0]), 0);
echo(check_solution(o, [0,0,0,0], {"i_1":random(-100,100),"i_2":random(-100,100),"i_3":random(-100,100)}), 0);
echo('---');

echo('4x + 0z + 5y + 0w = 7');
echo('o=Abacus.Math.diophantine([4,0,5,0], 7)');
o=Abacus.Math.diophantine([4,0,5,0], 7);
echo(print_solution(o, ['x','z','y','w']));
echo(check_solution(o, [4,0,5,0]), 7);
echo(check_solution(o, [4,0,5,0], {"i_1":random(-100,100),"i_2":random(-100,100),"i_3":random(-100,100)}), 7);
echo('---');

echo('4x + 6y + 3z = 2');
echo('o=Abacus.Math.diophantine([4,6,3], 2)');
o=Abacus.Math.diophantine([4,6,3], 2);
echo(print_solution(o, ['x','y','z']));
echo(check_solution(o, [4,6,3]), 2);
echo(check_solution(o, [4,6,3], {"i_1":random(-100,100),"i_2":random(-100,100)}), 2);
echo('o=Abacus.Math.diophantine([4,6,3], 2, false)');
o=Abacus.Math.diophantine([4,6,3], 2, false);
echo(print_solution(o, ['x','y','z']));
echo(check_solution(o, [4,6,3]), 2);
echo('---');

echo('4x + 0w + 6y + 3z + 0g = 2');
echo('o=Abacus.Math.diophantine([4,0,6,3,0], 2)');
o=Abacus.Math.diophantine([4,0,6,3,0], 2);
echo(print_solution(o, ['x','w','y','z','g']));
echo(check_solution(o, [4,0,6,3,0]), 2);
echo(check_solution(o, [4,0,6,3,0], {"i_1":random(-100,100),"i_2":random(-100,100),"i_3":random(-100,100),"i_4":random(-100,100)}), 2);
echo('---');

echo('Solve a1x1 + a2x2 + ..  = b mod m');
echo('3x = 3 mod 10');
echo('o=Abacus.Math.congruence([3], 3, 10)');
o=Abacus.Math.congruence([3], 3, 10);
echo(print_solution(o, ['x']));
echo(check_solution(o, [3], null, 10), 3);
echo(check_solution(o, [3], {"i_1":random(-100,100)}, 10), 3);
echo('o=Abacus.Math.congruence([3], 3, 10, false)');
o=Abacus.Math.congruence([3], 3, 10, false);
echo(print_solution(o, ['x']));
echo(check_solution(o, [3], null, 10), 3);
echo('---');

echo('4x + 6y = 2 mod 10');
echo('o=Abacus.Math.congruence([4,6], 2, 10)');
o=Abacus.Math.congruence([4,6], 2, 10);
echo(print_solution(o, ['x','y']));
echo(check_solution(o, [4,6], null, 10), 2);
echo(check_solution(o, [4,6], {"i_1":random(-100,100),"i_2":random(-100,100)}, 10), 2);
echo('o=Abacus.Math.congruence([4,6], 2, 10, false)');
o=Abacus.Math.congruence([4,6], 2, 10, false);
echo(print_solution(o, ['x','y']));
echo(check_solution(o, [4,6], null, 10), 2);
echo('---');

echo('4x + 5y = 7'); // x = -7+5*i_1, y = 7-4*i_1
echo('o=Abacus.Math.diophantines([[4,5]], [7])');
o=Abacus.Math.diophantines([[4,5]], [7]);
echo(print_solution(o, ['x','y']));
echo(check_solution_system(o, [[4,5]]), [7]);
echo(check_solution_system(o, [[4,5]], {"i_1":random(-100,100)}), [7]);
echo('---');

echo('4x + 5y = 7, 0x + 0y = 0'); // x = -7+5*i_1, y = 7-4*i_1
echo('o=Abacus.Math.diophantines([[4,5],[0,0]], [7,0])');
o=Abacus.Math.diophantines([[4,5],[0,0]], [7,0]);
echo(print_solution(o, ['x','y']));
echo(check_solution_system(o, [[4,5],[0,0]]), [7,0]);
echo(check_solution_system(o, [[4,5],[0,0]], {"i_1":random(-100,100)}), [7,0]);
echo('---');

echo('4x + 5y = 7, 8x + 10y = 14'); // x = -7+5*i_1, y = 7-4*i_1
echo('o=Abacus.Math.diophantines([[4,5],[8,10]], [7,14])');
o=Abacus.Math.diophantines([[4,5],[8,10]], [7,14]);
echo(print_solution(o, ['x','y']));
echo(check_solution_system(o, [[4,5],[8,10]]), [7,14]);
echo(check_solution_system(o, [[4,5],[8,10]], {"i_1":random(-100,100)}), [7,14]);
echo('---');

echo('5x + 6y + 8z = 1, 6x - 11y + 7z = 9'); // x = 5+10*i_1, y = i_1, z = -3-7*i_1
echo('o=Abacus.Math.diophantines([[5,6,8],[6,-11,7]], [1,9])');
o=Abacus.Math.diophantines([[5,6,8],[6,-11,7]], [1,9]);
echo(print_solution(o, ['x','y','z']));
echo(check_solution_system(o, [[5,6,8],[6,-11,7]]), [1,9]);
echo(check_solution_system(o, [[5,6,8],[6,-11,7]], {"i_1":random(-100,100)}), [1,9]);
echo('---');

echo('Solve a1^2x1^2 + a2^2x2^2 + ..  = 0');
echo('x^2 + y^2 + z^2 = 0');
echo('o=Abacus.Math.pythagorean([1,1,1])');
o=Abacus.Math.pythagorean([1,1,1]);
echo(print_solution(o, ['x','y','z']));
echo(check_solution2(o, [1,1,1]), 0);
echo(check_solution2(o, [1,1,1], {"i_1":random(-100,100),"i_2":random(-100,100)}), 0);
echo('2x^2 + 3y^2 - z^2 = 0');
echo('o=Abacus.Math.pythagorean([2,3,-1])');
o=Abacus.Math.pythagorean([2,3,-1]);
echo(print_solution(o, ['x','y','z']));
echo(check_solution2(o, [2,3,-1]), 0);
echo(check_solution2(o, [2,3,-1], {"i_1":random(-100,100),"i_2":random(-100,100)}), 0);
echo('9x^2 - 4y^2 = 0');
echo('o=Abacus.Math.pythagorean([9,-4])');
o=Abacus.Math.pythagorean([9,-4]);
echo(print_solution(o, ['x','y']));
echo(check_solution2(o, [9,-4]), 0);
echo(check_solution2(o, [9,-4], {"i_1":random(-100,100)}), 0);
echo('x^2 + y^2 - z^2 = 0 /* pythagorean triples */');
echo('o=Abacus.Math.pythagorean([1,1,-1])');
o=Abacus.Math.pythagorean([1,1,-1]);
echo(print_solution(o, ['x','y','z']));
echo(check_solution2(o, [1,1,-1]), 0);
echo(check_solution2(o, [1,1,-1], {"i_1":random(-100,100),"i_2":random(-100,100)}), 0);
echo('a^2 + b^2 + c^2 - d^2 = 0');
echo('o=Abacus.Math.pythagorean([1,1,1,-1])');
o=Abacus.Math.pythagorean([1,1,1,-1]);
echo(print_solution(o, ['a','b','c','d']));
echo(check_solution2(o, [1,1,1,-1]), 0);
echo(check_solution2(o, [1,1,1,-1], {"i_1":random(-100,100),"i_2":random(-100,100),"i_3":random(-100,100)}), 0);
echo('9x^2 - 4y^2 + 16z^2 + 25w^2 + g^2 = 0');
echo('o=Abacus.Math.pythagorean([9,-4,16,25,1])');
o=Abacus.Math.pythagorean([9,-4,16,25,1]);
echo(print_solution(o, ['x','y','z','w','g']));
echo(check_solution2(o, [9,-4,16,25,1]), 0);
echo(check_solution2(o, [9,-4,16,25,1], {"i_1":random(-100,100),"i_2":random(-100,100),"i_3":random(-100,100),"i_4":random(-100,100)}), 0);
echo('---');
