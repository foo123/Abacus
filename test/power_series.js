"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

const  PowerSeries = Abacus.PowerSeries;

echo('Abacus.PowerSeries (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('PowerSeries("1+x+x^2", "x")');
echo(PowerSeries("1+x+x^2", "x").toString());
echo('f = PowerSeries("1/(1-x)", "x")');
let f = PowerSeries("1/(1-x)", "x");
echo(f.toString());
echo('f.inv()');
echo(f.inv().toString());
echo('sqrt = PowerSeries("sqrt(1+x)", "x")');
let sqrt = PowerSeries("sqrt(1+x)", "x");
echo(sqrt.toString());
echo('sqrt.pow(2)');
echo(sqrt.pow(2).toString());
echo('exp = (x) => PowerSeries("exp("+x+")", "x")');
let exp = (x) => PowerSeries("exp("+x+")", "x");
echo('exp("x")');
echo(exp("x").toString());
echo('exp("-x")');
echo(exp("-x").toString());
echo('exp("x").inv()');
echo(exp("x").inv().toString());
echo('exp("-x").equ(exp("x").inv())');
echo(exp("-x").equ(exp("x").inv()));
echo('exp("x").mul(exp("-x"))');
echo(exp("x").mul(exp("-x")).toString());
echo('exp("ax")');
echo(exp("ax").toString());
echo('exp("ax+b")');
echo(exp("ax+b").toString());
