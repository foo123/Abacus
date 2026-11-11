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
echo('sqrt3 = PowerSeries("sqrt[3](1+x)", "x")');
let sqrt3 = PowerSeries("sqrt[3](1+x)", "x");
echo(sqrt3.toString());
echo('sqrt3.pow(3)');
echo(sqrt3.pow(3).toString());
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
echo('PowerSeries("exp(x+y)", ["x","y"])')
echo(PowerSeries("exp(x+y)", ["x","y"]).sum(12).toString());
echo('y(x) = Series((nth) => Expr("", 0 === nth[0] ? 0 : "a_"+String(nth[0])), "x")');
let y = Abacus.Series((nth) => Abacus.Expr('', 0 === nth[0] ? 0 : 'a_'+String(nth[0])), "x");
echo(y.toString());
echo('x(y) = y(x).cinv()');
let x = y.cinv();
echo(x.sum(4).toString());
echo('x(y(x)) = x.compose(y)');
echo(x.compose(y).sum(4).toString());

