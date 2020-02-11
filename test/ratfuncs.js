var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;
var use_biginteger_arithmetic = require('./biginteger/arithmetic.js');

use_biginteger_arithmetic( Abacus );

var o, pring = Abacus.Ring.Q("x", "y"), ring = pring.fieldOfFractions();

echo('Abacus.RationalFuncs (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Rational Functions and Operations');
echo('pring = Abacus.Ring.'+ring.toString()+', ring = pring.fieldOfFractions()');
echo('---');

echo('ring.create().toString()');
echo(ring.create().toString());

echo('ring.create(pring.fromString("1+xy"), pring.fromString("x-y")).toString()');
echo(ring.create(pring.fromString("1+xy"), pring.fromString("x-y")).toString());

echo('ring.create(pring.fromString("1+xy"), pring.fromString("x-y")).add(2).toString()');
echo(ring.create(pring.fromString("1+xy"), pring.fromString("x-y")).add(2).toString());

echo('ring.create(pring.fromString("1+xy"), pring.fromString("x-y")).add(pring.fromString("x+2")).toString()');
echo(ring.create(pring.fromString("1+xy"), pring.fromString("x-y")).add(pring.fromString("x+2")).toString());

echo('ring.create(pring.fromString("1+xy"), pring.fromString("x-y")).mul(pring.fromString("x+2")).toString()');
echo(ring.create(pring.fromString("1+xy"), pring.fromString("x-y")).mul(pring.fromString("x+2")).toString());

echo('ring.create(pring.fromString("1+xy"), pring.fromString("x-y")).div(pring.fromString("x+2")).toString()');
echo(ring.create(pring.fromString("1+xy"), pring.fromString("x-y")).div(pring.fromString("x+2")).toString());

