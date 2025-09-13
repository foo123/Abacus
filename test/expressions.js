"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

const Expr = Abacus.Expr, Ring = Abacus.Ring;


let o, o2, ring;

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

echo('Expr("1+2*x").toString()');
echo(Expr("1+2*x").toString());
echo('Expr("1+2x^2").toString()');
echo(Expr("1+2x^2").toString());
echo('Expr("1/2+2*x_{1}*x_2^2").toString()');
echo(Expr("1/2+2*x_{1}*x_2^2").toString());

/*
echo("(3/2)/x",
Expr("(3/2)/x").evaluate({x:10}).valueOf(),
Expr("(3/2)/x").toString(),
Expr(Expr("(3/2)/x").toString()).evaluate({x:10}).valueOf(),
"3/2*x",
Expr("3/2*x").evaluate({x:10}).valueOf(),
"3/2*x",
Expr("3/(2*x)").evaluate({x:10}).valueOf()
); // 0.15 0.15 15 0.15
echo(2/1*2, 1/(2/1)*2, Expr("2/1*2").valueOf(), Expr("1/(2/1)*2").valueOf()); // 4 1 4 1
*/
echo("-1*x+y", Expr("-1*x+y").toString(), Expr("-1*x+y").toTex());

try {
    echo('Expr("1+*2").toString()');
    echo(Expr("1+*2").toString());
} catch (e) {
    echo(e.message)
}
echo('---');


echo('o=Expr("x+1")');
o=Expr("x+1");
echo('o2=Expr("(x+1)*(x+a)+1/b")');
o2=Expr("(x+1)*(x+a)+1/b");
echo('o.toString()');
echo(o.toString());
echo('o2.toString()');
echo(o2.toString());
echo('o.toPoly("x")');
echo(o.toPoly("x").toString());
echo('o.toPoly("x").toExpr()');
echo(o.toPoly("x").toExpr().toString());
echo('o2.toPoly("x")');
echo(o2.toPoly("x").toString());
echo('o2.toPoly("x").toExpr()');
echo(o2.toPoly("x").toExpr().toString());
echo('o2.toPoly(["x","a"])');
echo(o2.toPoly(["x","a"]).toString());
echo('o2.toPoly(["x","a"]).toExpr()');
echo(o2.toPoly(["x","a"]).toExpr().toString());
echo('o.d("x")');
echo(o.d("x").toString());
echo('o2.d("x")');
echo(o2.d("x").toString());
echo('o2.d("a")');
echo(o2.d("a").toString());
echo('o.pow(2)');
echo(o.pow(2).toString());
echo('o.pow(2).expand()');
echo(o.pow(2).expand().toString());
echo('o.pow(2).rad(2)');
echo(o.pow(2).rad(2).toString());
echo('o.add(o2)');
echo(o.add(o2).toString());
echo('o.add(o2).expand()');
echo(o.add(o2).expand().toString());
echo('o.mul(o2)');
echo(o.mul(o2).toString());
echo('o.mul(o2).expand()');
echo(o.mul(o2).expand().toString());
