var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;
var use_biginteger_arithmetic = require('./biginteger/arithmetic.js');

use_biginteger_arithmetic( Abacus );

var o, i;

echo('Abacus.Integer (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('o=Abacus.Integer()');
o=Abacus.Integer();
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());

echo();

echo('o=Abacus.Integer(Abacus.Arithmetic.I)');
o=Abacus.Integer(Abacus.Arithmetic.I);
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.neg().toString()');
echo(o.neg().toString());
echo('o.add(2).toString()');
echo(o.add(2).toString());
echo('o.mul(2).toString()');
echo(o.mul(2).toString());
echo('o.add(2).pow(2).toString()');
echo(o.add(2).pow(2).toString());

echo();

echo('o=Abacus.Integer(Abacus.Rational.fromString("9/5"))');
o=Abacus.Integer(Abacus.Rational.fromString("9/5"));
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.neg().toString()');
echo(o.neg().toString());


