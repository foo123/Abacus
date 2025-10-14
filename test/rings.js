"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

const util = require('util');
const log = x => echo(util.inspect(x, {showHidden: false, depth: null, colors: false}));
const Ring = Abacus.Ring;
let p, p1, p2, p3, ring, rring;

echo('Abacus.Rings (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Rings / Fields');
echo('--------------');
/*
ring = Ring.C("x", "y", "z");
rring = Ring.K(Ring.K(Ring.K(Ring.C()), "y", "z"), "x");
echo('ring = '+ring.toString()+' ('+ring.toTex()+')'+' rring = '+rring.toString()+' ('+rring.toTex()+')');

echo('---');

p1 = ring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y");
p2 = rring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y");

//echo("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y"+'->'+p1r.toString()+'='+p2r.toString()+(p1r.equ(p2r) ? ' true' : ' false')+(p1.equ(p2) ? ' true' : ' false'));
echo("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y -> "+p1.toString()+' = '+p2.toString()+(p1.equ(p2, false) ? ' true' : ' false'));
echo("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y -> "+p1.recur(false).toString()+' = '+p2.recur(false).toString()+(p1.recur(false).equ(p2.recur(false), true) ? ' true' : ' false'));
echo("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y -> "+p1.recur(false).recur('x').toString()+' = '+p2.recur(false).recur('x').toString()+(p1.recur(false).recur('x').equ(p2.recur(false).recur('x')) ? ' true' : ' false'));
echo("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y -> "+p1.recur(true).toString()+' = '+p2.recur(true).toString()+(p1.recur(true).equ(p2.recur(true)) ? ' true' : ' false'));

echo('---');

echo(p1.toString()+' + (x + y) = '+p1.add(ring.fromString('x+y')).toString())
echo(p2.toString()+' + (x + y) = '+p2.add(ring.fromString('x+y')).toString())
echo(p1.toString()+' + (x + y) = '+p1.add(rring.fromString('x+y')).toString())
echo(p2.toString()+' + (x + y) = '+p2.add(rring.fromString('x+y')).toString())

echo('---');
*/
echo('ring=Ring.K(Ring.K(Ring.K(Ring.Q()), "y"), "x")');
echo((ring=Ring.K(Ring.K(Ring.K(Ring.Q()), "y", true), "x", true)).toString());
echo('ring.fromString("x*y+x+y-2").toString()');
echo((p=ring.fromString("x*y+x+y-2")).toString());

echo('---');

ring = Ring.Q("x", "y");
rring = Ring.K(Ring.K(Ring.K(Ring.Q()), "y", true).associatedField(), "x", true);
p1 = ring.fromString("x^2 + x*y");
p2 = ring.fromString("x*y + y^2");
p3 = ring.gcd(p1, p2);
echo(p1.toString()+', '+p2.toString()+', '+p3.toString()+','+p1.mod(p3).toString()+','+p2.mod(p3).toString()+', x + y');
p1 = ring.fromString("x*(x+y)");
p2 = ring.fromString("(x+y)^2");
p3 = ring.gcd(p1, p2);
echo(p1.toString()+', '+p2.toString()+', '+p3.toString()+','+p1.mod(p3).toString()+','+p2.mod(p3).toString()+', x + y');
p1 = rring.fromString("x^2 + x*y");
p2 = rring.fromString("x*y + y^2");
p3 = rring.gcd(p1, p2);
echo(p1.toString()+', '+p2.toString()+', '+p3.toString()+','+p1.mod(p3).toString()+','+p2.mod(p3).toString()+', x + y');
p1 = rring.fromString("x*(x+y)");
p2 = rring.fromString("(x+y)^2");
p3 = rring.gcd(p1, p2);
echo(p1.toString()+', '+p2.toString()+', '+p3.toString()+','+p1.mod(p3).toString()+','+p2.mod(p3).toString()+', x + y');
