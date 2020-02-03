var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;
var use_biginteger_arithmetic = require('./biginteger/arithmetic.js');

use_biginteger_arithmetic( Abacus );

var o;

echo('Abacus.rationalFuncs (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Rational Functions and Operations');
echo('---');

echo('Abacus.RationalFunc().toString()');
echo(Abacus.RationalFunc().toString());

echo('Abacus.RationalFunc(Abacus.MultiPolynomial.fromString("1+xy", ["x","y"]), Abacus.MultiPolynomial.fromString("x-y", ["x","y"]), ["x","y"]).toString()');
echo(Abacus.RationalFunc(Abacus.MultiPolynomial.fromString("1+xy", ["x","y"]), Abacus.MultiPolynomial.fromString("x-y", ["x","y"]), ["x","y"]).toString());

echo('Abacus.RationalFunc(Abacus.MultiPolynomial.fromString("1+xy", ["x","y"]), Abacus.MultiPolynomial.fromString("x-y", ["x","y"]), ["x","y"]).add(2).toString()');
echo(Abacus.RationalFunc(Abacus.MultiPolynomial.fromString("1+xy", ["x","y"]), Abacus.MultiPolynomial.fromString("x-y", ["x","y"]), ["x","y"]).add(2).toString());

echo('Abacus.RationalFunc(Abacus.MultiPolynomial.fromString("1+xy", ["x","y"]), Abacus.MultiPolynomial.fromString("x-y", ["x","y"]), ["x","y"]).add(Abacus.Polynomial.fromString("x+2")).toString()');
echo(Abacus.RationalFunc(Abacus.MultiPolynomial.fromString("1+xy", ["x","y"]), Abacus.MultiPolynomial.fromString("x-y", ["x","y"]), ["x","y"]).add(Abacus.Polynomial.fromString("x+2")).toString());

echo('Abacus.RationalFunc(Abacus.MultiPolynomial.fromString("1+xy", ["x","y"]), Abacus.MultiPolynomial.fromString("x-y", ["x","y"]), ["x","y"]).mul(Abacus.Polynomial.fromString("x+2")).toString()');
echo(Abacus.RationalFunc(Abacus.MultiPolynomial.fromString("1+xy", ["x","y"]), Abacus.MultiPolynomial.fromString("x-y", ["x","y"]), ["x","y"]).mul(Abacus.Polynomial.fromString("x+2")).toString());

echo('Abacus.RationalFunc(Abacus.MultiPolynomial.fromString("1+xy", ["x","y"]), Abacus.MultiPolynomial.fromString("x-y", ["x","y"]), ["x","y"]).div(Abacus.Polynomial.fromString("x+2")).toString()');
echo(Abacus.RationalFunc(Abacus.MultiPolynomial.fromString("1+xy", ["x","y"]), Abacus.MultiPolynomial.fromString("x-y", ["x","y"]), ["x","y"]).div(Abacus.Polynomial.fromString("x+2")).toString());

