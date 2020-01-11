var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;
var use_biginteger_arithmetic = require('./biginteger/arithmetic.js');

use_biginteger_arithmetic( Abacus );

var o, i;

echo('Abacus.Rationals (VERSION = '+Abacus.VERSION+')');
echo('---');

//Abacus.Rational.autoSimplify = true; // default

echo('o=Abacus.Rational()');
o=Abacus.Rational();
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());

echo();

echo('o=Abacus.Rational.fromString("5/9")');
o=Abacus.Rational.fromString("5/9");
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());
echo('Abacus.Rational.fromDec(o.toDec()).toString()');
echo(Abacus.Rational.fromDec(o.toDec()).toString());
echo('Abacus.Rational.fromTex(o.toTex()).toString()');
echo(Abacus.Rational.fromTex(o.toTex()).toString());
echo('Abacus.Rational(5, 9).toString()');
echo(Abacus.Rational(5, 9).toString());
echo('Abacus.Rational("5", 9).toString()');
echo(Abacus.Rational("5", 9).toString());
echo('o.inv().toString()');
echo(o.inv().toString());
echo('o.inv().toTex()');
echo(o.inv().toTex());
echo('o.inv().toDec()');
echo(o.inv().toDec());
echo('o.neg().toString()');
echo(o.neg().toString());
echo('o.neg().toTex()');
echo(o.neg().toTex());
echo('o.neg().toDec()');
echo(o.neg().toDec());

echo();

echo('o=Abacus.Rational.fromDec("0.[5]")');
o=Abacus.Rational.fromDec("0.[5]");
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());

echo();

echo('o=Abacus.Rational.fromIntRem(3, 1, 3)');
o=Abacus.Rational.fromIntRem(3, 1, 3);
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());
echo('[o.integer(), o.remainder()]');
echo([String(o.integer()), String(o.remainder())]);

echo();

echo('o=Abacus.Rational.fromDec("0.[5]").add(Abacus.Rational.fromDec("0.[3]"))');
o=Abacus.Rational.fromDec("0.[5]").add(Abacus.Rational.fromDec("0.[3]"));
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());

echo();

echo('o=Abacus.Rational.fromDec("0.[5]").mul(Abacus.Rational.fromDec("0.[3]"))');
o=Abacus.Rational.fromDec("0.[5]").mul(Abacus.Rational.fromDec("0.[3]"));
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());

echo();

echo('o=Abacus.Rational.fromDec("0.[5]").equ(Abacus.Rational.fromString("5/9"))');
echo(Abacus.Rational.fromDec("0.[5]").equ(Abacus.Rational.fromString("5/9")));

// Decimals to Fractions
echo('Decimals to Fractions (with optional repeating decimals)');
echo('o=Abacus.Rational.fromDec(-3)');
echo(String(o=Abacus.Rational.fromDec(-3)));

echo('o=Abacus.Rational.fromDec("-3.0")');
echo(String(o=Abacus.Rational.fromDec("-3.0")));

echo('o=Abacus.Rational.fromDec("-3.[0]")');
echo(String(o=Abacus.Rational.fromDec("-3.[0]")));

echo('o=Abacus.Rational.fromDec(0.9)');
echo(String(o=Abacus.Rational.fromDec(0.9)));

echo('o=Abacus.Rational.fromDec("0.[9]")');
echo(String(o=Abacus.Rational.fromDec("0.[9]")));

echo('o=Abacus.Rational.fromDec(0.5)');
echo(String(o=Abacus.Rational.fromDec(0.5)));

echo('o=Abacus.Rational.fromDec("0.[5]")');
echo(String(o=Abacus.Rational.fromDec("0.[5]")));

echo('o=Abacus.Rational.fromDec("0.55[5]")');
echo(String(o=Abacus.Rational.fromDec("0.55[5]")));

echo('o=Abacus.Rational.fromDec("0.555[55]")');
echo(String(o=Abacus.Rational.fromDec("0.555[55]")));

echo('o=Abacus.Rational.fromDec("0.[3]")');
echo(String(o=Abacus.Rational.fromDec("0.[3]")));

echo('o=Abacus.Rational.fromDec("0.1[6]")');
echo(String(o=Abacus.Rational.fromDec("0.1[6]")));

echo('o=Abacus.Rational.fromDec("0.1[7]")');
echo(String(o=Abacus.Rational.fromDec("0.1[7]")));

echo('o=Abacus.Rational.fromDec("3.[3]")');
echo(String(o=Abacus.Rational.fromDec("3.[3]")));

echo('o=Abacus.Rational.fromDec("1.0[42]")');
echo(String(o=Abacus.Rational.fromDec("1.0[42]")));

echo('o=Abacus.Rational.fromDec("1.04242[42]")');
echo(String(o=Abacus.Rational.fromDec("1.04242[42]")));

echo('---');

// Fractions to Decimals
echo('Fractions to Decimals (with optional repeating decimals)');
echo('o=Abacus.Rational.fromString("-3/1").toDec()');
echo(String(o=Abacus.Rational.fromString("-3/1").toDec()));

echo('o=Abacus.Rational.fromString("-3/-1").toDec()');
echo(String(o=Abacus.Rational.fromString("-3/-1").toDec()));

echo('o=Abacus.Rational.fromString("1/6").toDec()');
echo(String(o=Abacus.Rational.fromString("1/6").toDec()));

echo('o=Abacus.Rational.fromString("5/9").toDec()');
echo(String(o=Abacus.Rational.fromString("5/9").toDec()));

echo('o=Abacus.Rational.fromString("9/10").toDec()');
echo(String(o=Abacus.Rational.fromString("9/10").toDec()));

echo('o=Abacus.Rational.fromString("172/165").toDec()');
echo(String(o=Abacus.Rational.fromString("172/165").toDec()));

echo('---');
