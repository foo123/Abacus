var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;
var use_biginteger_arithmetic = require('./biginteger/arithmetic.js');

use_biginteger_arithmetic( Abacus );


var o;

echo('Abacus.MultiPolynomials (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Multivariate Polynomials and Polynomial operations');
echo('---');

echo('Abacus.MultiPolynomial().toString()');
echo(Abacus.MultiPolynomial().toString());

echo('Abacus.MultiPolynomial({"y*x^2":2,"x*y^2":1,"1":4}, ["x","y"]).toString()');
echo(Abacus.MultiPolynomial({"y*x^2":2,"x*y^2":1,"1":4}, ["x","y"]).toString());


echo('Abacus.MultiPolynomial({"y*x^2":2,"x*y":1,"1":4}, ["x","y"]).toExpr().toString()');
echo(Abacus.MultiPolynomial({"y*x^2":2,"x*y":1,"1":4}, ["x","y"]).toExpr().toString());

echo('Abacus.MultiPolynomial.fromExpr(Abacus.MultiPolynomial({"y*x^2":2,"x*y":1,"1":4}, ["x","y"]).toExpr(), ["x", "y"]).toString()');
echo(Abacus.MultiPolynomial.fromExpr(Abacus.MultiPolynomial({"y*x^2":2,"x*y":1,"1":4}, ["x","y"]).toExpr(), ["x", "y"]).toString());

echo('Abacus.MultiPolynomial.fromString("1 - yx^2 + 3xy", ["x","y"]).toString()');
echo(Abacus.MultiPolynomial.fromString("1 - yx^2 + 3xy", ["x","y"]).toString());

echo('Abacus.MultiPolynomial.fromString("1 - yx^2 + 3xy", ["x","y"]).add(Abacus.MultiPolynomial.fromString("1 + x", ["x","y"])).toString()');
echo(Abacus.MultiPolynomial.fromString("1 - yx^2 + 3xy", ["x","y"]).add(Abacus.MultiPolynomial.fromString("1 + x", ["x","y"])).toString());

echo('Abacus.MultiPolynomial.fromString("1 - yx^2 + 3xy", ["x","y"]).mul(Abacus.MultiPolynomial.fromString("1 + x", ["x","y"])).toString()');
echo(Abacus.MultiPolynomial.fromString("1 - yx^2 + 3xy", ["x","y"]).mul(Abacus.MultiPolynomial.fromString("1 + x", ["x","y"])).toString());

echo('Abacus.MultiPolynomial.fromString("1 - yx^2 + 3xy", ["x","y"]).div(Abacus.MultiPolynomial.fromString("1 + x", ["x","y"])).toString()');
echo(Abacus.MultiPolynomial.fromString("1 - yx^2 + 3xy", ["x","y"]).div(Abacus.MultiPolynomial.fromString("1 + x", ["x","y"])).toString());

echo('Abacus.MultiPolynomial.fromString("1 - yx^2 + 3xy", ["x","y"]).pow(3).toString()');
echo(Abacus.MultiPolynomial.fromString("1 - yx^2 + 3xy", ["x","y"]).pow(3).toString());

