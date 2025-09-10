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
