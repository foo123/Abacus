var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;
var use_biginteger_arithmetic = require('./biginteger/arithmetic.js');

use_biginteger_arithmetic( Abacus );

var o, i;

echo('Abacus.Complex (VERSION = '+Abacus.VERSION+')');
echo('---');

//Abacus.Rational.autoSimplify = true; // default

echo('o=Abacus.Complex()');
o=Abacus.Complex();
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());

echo();

echo('o=Abacus.Complex(Abacus.Arithmetic.I)');
o=Abacus.Complex(Abacus.Arithmetic.I);
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());
echo('o.neg().toString()');
echo(o.neg().toString());
echo('o.conj().toString()');
echo(o.conj().toString());
echo('o.inv().toString()');
echo(o.inv().toString());
echo('o.rev().toString()');
echo(o.rev().toString());
echo('o.rev().toTex()');
echo(o.rev().toTex());
echo('o.rev().neg().toString()');
echo(o.rev().neg().toString());
echo('o.rev().neg().toTex()');
echo(o.rev().neg().toTex());
echo('o.rev().mul(2).toString()');
echo(o.rev().mul(2).toString());
echo('o.rev().mul(2).toTex()');
echo(o.rev().mul(2).toTex());
echo('o.rev().mul(2).neg().toString()');
echo(o.rev().mul(2).neg().toString());
echo('o.rev().mul(2).neg().toTex()');
echo(o.rev().mul(2).neg().toTex());
echo('o.pow(2).toString()');
echo(o.pow(2).toString());

echo();

echo('o=Abacus.Complex(Abacus.Rational.fromString("5/9"), Abacus.Rational.fromDec("0.[3]"))');
o=Abacus.Complex(Abacus.Rational.fromString("5/9"), Abacus.Rational.fromDec("0.[3]"));
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());
echo('o.inv().toString()');
echo(o.inv().toString());
echo('o.inv().toTex()');
echo(o.inv().toTex());
echo('o.neg().toString()');
echo(o.neg().toString());
echo('o.neg().toTex()');
echo(o.neg().toTex());
echo('o.conj().toString()');
echo(o.conj().toString());
echo('o.conj().toTex()');
echo(o.conj().toTex());
echo('o.rev().toString()');
echo(o.rev().toString());
echo('o.rev().toTex()');
echo(o.rev().toTex());

echo('o.add(o.rev()).toString()');
echo(o.add(o.rev()).toString());
echo('o.add(o.rev()).toTex()');
echo(o.add(o.rev()).toTex());

echo('o.mul(o.rev()).toString()');
echo(o.mul(o.rev()).toString());
echo('o.mul(o.rev()).toTex()');
echo(o.mul(o.rev()).toTex());

echo('o.div(o.rev()).toString()');
echo(o.div(o.rev()).toString());
echo('o.div(o.rev()).toTex()');
echo(o.div(o.rev()).toTex());

echo('o.div(o).toString()');
echo(o.div(o).toString());
echo('o.div(o).toTex()');
echo(o.div(o).toTex());

echo('o.pow(2).toString()');
echo(o.pow(2).toString());
echo('o.pow(2).toTex()');
echo(o.pow(2).toTex());

echo();

