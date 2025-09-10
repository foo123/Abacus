"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

const Expr = Abacus.Expr;


let o, o2;

echo('Abacus.Expressions (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Symbolic Expressions');
echo('---');
echo('o=Expr()');
o=Expr();
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.evaluate()');
echo(o.evaluate().toString());
echo('o.d("x")');
echo(o.d("x").toString());
echo('o.dispose()');
o.dispose();
echo('---');

echo('Expr.fromString("1+2*x").toString()');
echo(Expr.fromString("1+2*x").toString());
echo('Expr.fromString("1+2x^2").toString()');
echo(Expr.fromString("1+2x^2").toString());
echo('Expr.fromString("1/2+2*x_{1}*x_2^2").toString()');
echo(Expr.fromString("1/2+2*x_{1}*x_2^2").toString());
try {
    echo('Expr.fromString("1+*2").toString()');
    echo(Expr.fromString("1+*2").toString());
} catch (e) {
    echo(e.message)
}
echo('---');


echo('o=Expr.fromString("x+1")');
o=Expr.fromString("x+1");
echo('o2=Expr.fromString("(x+1)*(x+a)")');
o2=Expr.fromString("(x+1)*(x+a)");
echo('o.toPoly("x")');
echo(o.toPoly("x").toString());
echo();
echo('o2.toPoly("x")');
echo(o2.toPoly("x").toString());
echo();
echo('o.d("x")');
echo(o.d("x").toString());
echo();
echo('o.toString()');
echo(o.toString());
echo();
echo('o2.toString()');
echo(o2.toString());
echo();
echo('o.pow(2)');
echo(o.pow(2).toString());
echo('o.pow(2, true)');
echo(o.pow(2, true).toString());
echo('o.add(o2)');
echo(o.add(o2).toString());
echo('o.add(o2).expand()');
echo(o.add(o2).expand().toString());
echo('o.mul(o2)');
echo(o.mul(o2).toString());
echo('o.mul(o2).expand()');
echo(o.mul(o2).expand().toString());
