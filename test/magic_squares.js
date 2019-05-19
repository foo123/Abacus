var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

function format_num( n, L )
{
    var s = String(n), l = s.length;
    return l < L ? (new Array(L-l+1).join(' '))+s : s; 
}
function print_square( s )
{
    if ( null == s )
    {
        echo('null');
        return;
    }
    var n = s.length, len = String(n*n).length, out = '';
    for(var i=0; i<n; i++)
        out += s[i].map(function(x){ return format_num(x, len); }).join(' ') + "\n"; 
    echo(out);
}

var o;

echo('Abacus.MagicSquares (VERSION = '+Abacus.VERSION+')');
echo('---');

// MagicSquares
o = Abacus.MagicSquare.make(1);
print_square(o);
echo(Abacus.MagicSquare.is_magic(o));
echo('---');

o = Abacus.MagicSquare.make(2);
print_square(o);
echo(Abacus.MagicSquare.is_magic(o));
echo('---');

o = Abacus.MagicSquare.make(3);
print_square(o);
echo(Abacus.MagicSquare.is_magic(o));
echo('---');

o = Abacus.MagicSquare.make(4);
print_square(o);
echo(Abacus.MagicSquare.is_magic(o));
echo('---');

o = Abacus.MagicSquare.make(5);
print_square(o);
echo(Abacus.MagicSquare.is_magic(o));
echo('---');

o = Abacus.MagicSquare.make(8);
print_square(o);
echo(Abacus.MagicSquare.is_magic(o));
echo('---');

o = Abacus.MagicSquare.make(6);
print_square(o);
echo(Abacus.MagicSquare.is_magic(o));
echo('---');

o = Abacus.MagicSquare.product(Abacus.MagicSquare.make(3),Abacus.MagicSquare.make(3));
print_square(o);
echo(Abacus.MagicSquare.is_magic(o));
echo('---');

o = Abacus.MagicSquare.product(Abacus.MagicSquare.make(3),Abacus.MagicSquare.make(4));
print_square(o);
echo(Abacus.MagicSquare.is_magic(o));
echo('---');

o = Abacus.MagicSquare.make(12);
print_square(o);
echo(Abacus.MagicSquare.is_magic(o));
echo('---');

