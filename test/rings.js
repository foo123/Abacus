"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

function check_xgcd(ring, args)
{
    let out = '', field = Abacus.Integer===ring.NumberClass ? Abacus.Ring.Q(args[0].symbol) : ring,
        res = field.Zero(), gcd = ring.xgcd(args), monicgcd = gcd[0].monic();
    for (let i=0; i<args.length; ++i)
    {
        out += (out.length ? ' + ' : '') + '('+args[i].toString()+')'+'('+gcd[i+1].toString()+')';
        res = res.add(gcd[i+1].mul(args[i]));
        if (!args[i].mod(gcd[0]).equ(0)) echo(args[i].toString()+' is not divided! '+(args[i].mod(monicgcd).equ(0)?'divided by monic':'neither by monic'));
    }
    out += ' = '+res.toString()+' (gcd: '+gcd[0].toString()+')';
    echo(out, res.equ(gcd[0]));
}

const util = require('util');
const log = x => echo(util.inspect(x, {showHidden: false, depth: null, colors: false}));
const Ring = Abacus.Ring;
let p, p1, p2, p3, ring, rring;

echo('Abacus.Rings (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Rings / Fields');
echo('--------------');

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

echo('ring=Ring.K(Ring.K(Ring.K(Ring.Q()), "y"), "x")');
echo((ring=Ring.K(Ring.K(Ring.K(Ring.Q()), "y"), "x")).toString());
//log(ring)
echo('ring.fromString("x*y+x+y-2").toString()');
echo((p=ring.fromString("x*y+x+y-2")).toString());
//log(p);

echo('---');

p1 = ring.fromString("x^2*y + x^3");
echo("x^2*y + x^3", ',', p1.toString());
p2 = ring.fromString("(x + y)^2");
echo("(x + y)^2", ',', p2.toString());
p3 = ring.fromString("x^2 + x*y^2 + x*y + x + y^3 + y");
echo("x^2 + x*y^2 + x*y + x + y^3 + y", ',', p3.toString());
//log(p3);
echo(ring.gcd(p1, p2, p3).toUnivariate(false, ["x", "y"], Ring.Q()).toString(), ',', "x + y");
check_xgcd(ring, [p3, p1, p2]);
