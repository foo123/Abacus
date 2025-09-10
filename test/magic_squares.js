"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

function print_square(s)
{
    let str = String(s);
    echo(str.length ? str : 'null');
}

let o;

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

