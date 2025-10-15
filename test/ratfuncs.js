"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

function check_radical(p, k, do_pow)
{
    let pp = do_pow ? p.pow(k) : p;
    let r = pp.rad(k);
    echo((do_pow ? '('+p.toString()+')^'+k+'=' : '')+pp.toString()+'=('+r.toString()+')^'+k+'', pp.equ(r.pow(k)));
}

let o, pring = Abacus.Ring.C("x", "y"), ring = pring.associatedField();

echo('Abacus.RationalFuncs (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Rational Functions and Operations');
echo('pring = '+pring.toString()+', ring = '+ring.toString());
echo('---');

echo('ring.create().toString()');
echo(ring.create().toString());

echo();

echo('ring.fromString(ring.create().toString()).toString()');
echo(ring.fromString(ring.create().toString()).toString());

echo('ring.create(pring.fromString("1+x*y"), pring.fromString("x-y")).toString()');
echo(ring.create(pring.fromString("1+x*y"), pring.fromString("x-y")).toString());

echo('ring.fromString("(1+x*y)/(x-y)").toString()');
echo(ring.fromString("(1+x*y)/(x-y)").toString());

echo('ring.fromString("(1+x*y)/(x-y)").d("x").toString()');
echo(ring.fromString("(1+x*y)/(x-y)").d("x").toString());

echo('ring.fromString("(1+x*y)/(x-y)").d("y").toString()');
echo(ring.fromString("(1+x*y)/(x-y)").d("y").toString());

echo('ring.fromString(ring.create(pring.fromString("1+x*y"), pring.fromString("x-y")).toTex()).toString()');
echo(ring.fromString(ring.create(pring.fromString("1+x*y"), pring.fromString("x-y")).toTex()).toString());

echo('ring.fromString(ring.create(pring.fromString("1+x*y"), pring.fromString("x-y")).toString()).toString()');
echo(ring.fromString(ring.create(pring.fromString("1+x*y"), pring.fromString("x-y")).toString()).toString());

echo('ring.fromString("(1+i)/(x-y)").toString()');
echo(ring.fromString("(1+i)/(x-y)").toString());

echo('ring.fromString("(3x+(1+i))/(1+i)").toString()');
echo(ring.fromString("(3x+(1+i))/(1+i)").toString());

echo('ring.fromString("1/(x-y)").toString()');
echo(ring.fromString("1/(x-y)").toString());

echo('ring.fromString("1/(3/2)*x").toString()');
echo(ring.fromString("1/(3/2)*x").toString());

echo('ring.fromString("(3/2)/x").toString()');
echo(ring.fromString("(3/2)/x").toString());

echo('ring.fromString("(3/2)/(i*x)").toString()');
echo(ring.fromString("(3/2)/(i*x)").toString());

echo('ring.fromString("x-y").toString()');
echo(ring.fromString("x-y").toString());

echo('ring.fromString("3/2").toString()');
echo(ring.fromString("3/2").toString());

echo('ring.fromString("x*y+3/2").toString()');
echo(ring.fromString("x*y+3/2").toString());

echo('pring.fromString("x*y+3/2").toString()');
echo(pring.fromString("x*y+3/2").toString());

echo('ring.fromString(pring.fromString("x*y+3/2").toString()).toString()');
echo(ring.fromString(pring.fromString("x*y+3/2").toString()).toString());

echo('ring.create(pring.fromString("1+x*y"), pring.fromString("x-y")).add(2).toString()');
echo(ring.create(pring.fromString("1+x*y"), pring.fromString("x-y")).add(2).toString());

echo('ring.create(pring.fromString("1+x*y"), pring.fromString("x-y")).add(pring.fromString("x+2")).toString()');
echo(ring.create(pring.fromString("1+x*y"), pring.fromString("x-y")).add(pring.fromString("x+2")).toString());

echo('ring.create(pring.fromString("1+x*y"), pring.fromString("x-y")).mul(pring.fromString("x+2")).toString()');
echo(ring.create(pring.fromString("1+x*y"), pring.fromString("x-y")).mul(pring.fromString("x+2")).toString());

echo('ring.create(pring.fromString("1+x*y"), pring.fromString("x-y")).div(pring.fromString("x+2")).toString()');
echo(ring.create(pring.fromString("1+x*y"), pring.fromString("x-y")).div(pring.fromString("x+2")).toString());

echo('ring.fromString("x^2").rad(2)');
check_radical(ring.fromString("x^2"), 2);
echo('ring.fromString("1/(x^2)").rad(2)');
check_radical(ring.fromString("1/(x^2)"), 2);
echo('ring.fromString("x+1").pow(5).rad(5)');
check_radical(ring.fromString("x+1"), 5, true);
echo('ring.fromString("x+y").pow(2).rad(2)');
check_radical(ring.fromString("x+y"), 2, true);
echo('ring.fromString("x*y+1").pow(2).rad(2)');
check_radical(ring.fromString("x*y+1"), 2, true);
//echo('ring.fromString("x").rad(2)');
//check_radical(ring.fromString("x"), 2);
