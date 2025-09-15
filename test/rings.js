"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

function check_xgcd(ring, args)
{
    let out = '', field = Abacus.Integer===ring.NumberClass ? Abacus.Ring.Q(args[0].symbol) : ring,
        res = field.Zero(), gcd = ring.xgcd(args);
    for (let i=0; i<args.length; ++i)
    {
        out += (out.length ? ' + ' : '') + '('+args[i].toString()+')'+'('+gcd[i+1].toString()+')';
        res = res.add(gcd[i+1].mul(args[i]));
        if (!args[i].mod(gcd[0]).equ(0)) echo(args[i].toString()+' is not divided!');
    }
    out += ' = '+res.toString()+' (gcd: '+gcd[0].toString()+')';
    echo(out, res.equ(gcd[0]));
}

function check_recursive(p, x)
{
    let p_x = p.recur(x), p_xx = p_x.recur(x), p_xy = p_x.recur('x'===x?'y':'x'),
        p_x_x = p_x.d(x), p_x_y = p_x.d('x'===x?'y':'x'),
        p_x_xx = p_x.d(x, 2), p_x_yy = p_x.d('x'===x?'y':'x', 2),
        p_xs = p_x.shift(x, -1), p_xys = p_xy.shift('x'===x?'y':'x', -1),
        pp = p_x.recur(false), ppp = p_xy.recur(false);
    echo('Recursive representations by '+x+':');
    echo(p_x.toString()+', again: '+p_xx.toString()+'('+p_xx.equ(p_x)+'), again on other: '+p_xy.toString());
    echo(p.toString()+'='+pp.toString()+'='+ppp.toString(), p.equ(pp), p.equ(ppp));
    echo('---------------------------');
    echo('Primitive (on original, same and other):');
    check_primitive(p);
    check_primitive(p_x);
    check_primitive(p_xy);
    echo('---------------------------');
    echo('Derivatives:');
    echo('on same='+p_x_x.toString()+', on other: '+p_x_y.toString());
    echo('on same='+p_x_xx.toString()+', on other: '+p_x_yy.toString());
    echo('---------------------------');
    echo('Recursive operations:');
    echo('('+p_xy.toString()+')+('+p_x.toString()+')='+p_xy.add(p_x).toString());
    echo('('+p_xy.toString()+')*('+p_x.toString()+')='+p_xy.mul(p_x).toString());
    echo('---------------------------');
    echo('Negative Shifts:');
    echo('on same='+p_xs.toString()+', on other: '+p_xys.toString());
    echo('---------------------------');
}
const util = require('util');
const log = x => echo(util.inspect(x, {showHidden: false, depth: null, colors: false}));
const Ring = Abacus.Ring;
let p, p1, p2, p3, ring;

echo('Abacus.MultiPolynomials (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Rings / Fields');
echo('--------------');

echo('ring=Ring.K(Ring.K(Ring.K(Ring.Q()), "y"), "x")');
echo((ring=Ring.K(Ring.K(Ring.K(Ring.Q()), "y"), "x")).toString());
//log(ring)
echo('ring.fromString("x*y+x+y-2").toString()');
echo((p=ring.fromString("x*y+x+y-2")).toString());
//log(p);
echo('---');

p1 = ring.fromString("x^2*y + x^3");
echo(p1.toString());
p2 = ring.fromString("(x + y)^2");
echo(p2.toString());
p3 = ring.fromString("x^2 + x*y^2 + x*y + x + y^3 + y");
echo(p3.toString());
//echo(ring.gcd(p1, p2, p3).toString(), "x + y"); // ans x + y