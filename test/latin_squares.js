var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

function print_square( s )
{
    var str = String(s);
    echo(str.length ? str : 'null');
}

var o;

echo('Abacus.LatinSquares (VERSION = '+Abacus.VERSION+')');
echo('---');

// LatinSquares
o = Abacus.LatinSquare(1);
print_square(o);
echo(Abacus.LatinSquare.isLatin(o));
echo('---');

o = Abacus.LatinSquare(2);
print_square(o);
echo(Abacus.LatinSquare.isLatin(o));
echo('---');

o = Abacus.LatinSquare(3);
print_square(o);
echo(Abacus.LatinSquare.isLatin(o));
echo('---');

o = Abacus.LatinSquare(4);
print_square(o);
echo(Abacus.LatinSquare.isLatin(o));
echo('---');

o = Abacus.LatinSquare(5);
print_square(o);
echo(Abacus.LatinSquare.isLatin(o));
echo('---');

o = Abacus.LatinSquare(6);
print_square(o);
echo(Abacus.LatinSquare.isLatin(o));
echo('---');

o = Abacus.LatinSquare(9);
print_square(o);
echo(Abacus.LatinSquare.isLatin(o));
echo('---');
