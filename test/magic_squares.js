var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

function print_square( s )
{
    var str = String(s);
    echo(str.length ? str : 'null');
}

var o;

echo('Abacus.MagicSquares (VERSION = '+Abacus.VERSION+')');
echo('---');

// MagicSquares
o = Abacus.MagicSquare(1);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare(2);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare(3);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare(4);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare(5);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare(8);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare(6);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare(3).mul(Abacus.MagicSquare(3));
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare(3).mul(Abacus.MagicSquare(4));
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare(12);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

