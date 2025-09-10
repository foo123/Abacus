"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

let o, i, ring;

echo('Abacus.Integer (VERSION = '+Abacus.VERSION+')');
echo('---');
echo('o=Abacus.Integer.rnd(1,100)');
o=Abacus.Integer.rnd(1,100);
echo('o.toString()');
echo(o.toString());
echo('o.rad(2).toString()');
echo(o.rad(2).toString());
echo('o.rad(2).pow(2).toString()');
echo(o.rad(2).pow(2).toString());

echo();

echo('Abacus.Integer(1).rad(2)');
echo(Abacus.Integer(1).rad(2).toString());
echo('Abacus.Integer(4).rad(2)');
echo(Abacus.Integer(4).rad(2).toString());
echo('Abacus.Integer(9).rad(2)');
echo(Abacus.Integer(9).rad(2).toString());
echo('Abacus.Integer(27).rad(3)');
echo(Abacus.Integer(27).rad(3).toString());

echo();

ring = Abacus.Ring.Z(); // Z ring
echo('ring=Abacus.Ring.'+ring.toString());
echo('ring.isField()', ring.isField());
echo();

echo('o=ring.Zero()');
o=ring.Zero();
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());

echo();

echo('o=ring.create(1)');
o=ring.create(1);
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
echo('o.rad(2).toString()');
echo(o.rad(2).toString());
echo('o.rad(2).pow(2).toString()');
echo(o.rad(2).pow(2).toString());

echo();

echo('o=ring.create(Abacus.Rational.fromString("9/5"))');
o=ring.create(Abacus.Rational.fromString("9/5"));
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.neg().toString()');
echo(o.neg().toString());

echo();
ring = Abacus.Ring.Zn(5)(); // Zn modulo 5 a finite field
echo('ring=Abacus.Ring.'+ring.toString());
echo('ring.isField()', ring.isField());
echo();

echo('o=ring.Zero()');
o=ring.Zero();
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo();

echo('o=ring.create(2)');
o=ring.create(2);
echo('o.toString()');
echo(o.toString());
echo('o.neg().toString()');
echo(o.neg().toString());
echo('o.add(ring.create(3)).toString()');
echo(o.add(ring.create(3)).toString());
echo('o.mul(ring.create(3)).toString()');
echo(o.mul(ring.create(3)).toString());
