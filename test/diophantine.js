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
