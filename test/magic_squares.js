var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

function print_square( s )
{
    var str = Abacus.MagicSquare.toString(s);
    echo(str.length ? str : 'null');
}

var o;

echo('Abacus.MagicSquares (VERSION = '+Abacus.VERSION+')');
echo('---');

// MagicSquares
o = Abacus.MagicSquare.make(1);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare.make(2);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare.make(3);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare.make(4);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare.make(5);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare.make(8);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare.make(6);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare.product(Abacus.MagicSquare.make(3),Abacus.MagicSquare.make(3));
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare.product(Abacus.MagicSquare.make(3),Abacus.MagicSquare.make(4));
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

o = Abacus.MagicSquare.make(12);
print_square(o);
echo(Abacus.MagicSquare.isMagic(o));
echo('---');

