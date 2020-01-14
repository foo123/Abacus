var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

function print_square( s )
{
    var str = Abacus.LatinSquare.toString(s);
    echo(str.length ? str : 'null');
}

var o;

echo('Abacus.LatinSquares (VERSION = '+Abacus.VERSION+')');
echo('---');

// LatinSquares
o = Abacus.LatinSquare.make(1);
print_square(o);
echo(Abacus.LatinSquare.isLatin(o));
echo('---');

o = Abacus.LatinSquare.make(2);
print_square(o);
echo(Abacus.LatinSquare.isLatin(o));
echo('---');

o = Abacus.LatinSquare.make(3);
print_square(o);
echo(Abacus.LatinSquare.isLatin(o));
echo('---');

o = Abacus.LatinSquare.make(4);
print_square(o);
echo(Abacus.LatinSquare.isLatin(o));
echo('---');

o = Abacus.LatinSquare.make(5);
print_square(o);
echo(Abacus.LatinSquare.isLatin(o));
echo('---');

o = Abacus.LatinSquare.make(6);
print_square(o);
echo(Abacus.LatinSquare.isLatin(o));
echo('---');

o = Abacus.LatinSquare.make(9);
print_square(o);
echo(Abacus.LatinSquare.isLatin(o));
echo('---');
