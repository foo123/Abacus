var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;
var use_biginteger_arithmetic = require('./biginteger/arithmetic.js');

use_biginteger_arithmetic( Abacus );


var o, o2;

echo('Abacus.Expressions (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Symbolic Expressions');
echo('---');
echo('o=Abacus.Expr()');
o=Abacus.Expr();
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.valueOf()');
echo(o.valueOf());
echo('o.d("x")');
echo(o.d("x").toString());
echo('o.dispose()');
o.dispose();
echo('---');

echo('o=Abacus.Expr(1, Abacus.Term("x", 2))');
o=Abacus.Expr(1, Abacus.Term("x", 2));
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.valueOf({"x":1})');
echo(o.valueOf({"x":1}));
echo('o.d("x")');
echo(o.d("x").toString());
echo('o.d("x",2)');
echo(o.d("x",2).toString(), o.d("x").d("x").equ(o.d("x",2)));
echo('o2=Abacus.Expr(Abacus.Term("y^2", 3))');
o2=Abacus.Expr(Abacus.Term("y^2", 3));
echo(o2.toString());
o2=o.add(o2);
echo('o.add(o2)');
echo(o2.toString());
echo('o.add(o2).d("x")');
echo(o2.d("x").toString());
echo('o.add(o2).d("y")');
echo(o2.d("y").toString());
echo('o.add(o2).d("y",2)');
echo(o2.d("y",2).toString());
echo('o2=Abacus.Expr(Abacus.Term("y^2", 3))');
o2=Abacus.Expr(Abacus.Term("y^2", 3));
echo(o2.toString());
echo('o.mul(o2)');
o2=o.mul(o2);
echo(o2.toString());
echo('o.mul(o2).d("x")');
echo(o2.d("x").toString());
echo('o.mul(o2).d("y")');
echo(o2.d("y").toString());
echo('o.mul(o2).d("y",2)');
echo(o2.d("y",2).toString(), o2.d("y").d("y").equ(o2.d("y",2)));
echo('o.dispose()');
o.dispose();
echo('---');
