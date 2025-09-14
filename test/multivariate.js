"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

function check_div(n, d)
{
    let nn, qr, q, r;
    if (d instanceof Array)
    {
        qr = n.multidivmod(d); q = qr[0]; r = qr[1];
        nn = q.reduce(function(p, qi, i) {return p.add(qi.mul(d[i]));}, r);
        echo('('+n.toString()+')/['+d.map(String).join(',')+']='+d.map(function(di, i) {return '('+di.toString()+')*('+q[i].toString()+')';}).join('+')+'+('+r.toString()+')='+nn.toString(), nn.equ(n));
    }
    else
    {
        qr = n.divmod(d); q = qr[0]; r = qr[1];
        nn = q.mul(d).add(r);
        echo('('+n.toString()+')/('+d.toString()+')=('+d.toString()+')*('+q.toString()+')+('+r.toString()+')='+nn.toString(), nn.equ(n));
    }
}
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
function check_primitive(p)
{
    let prim = p.primitive(true);
    echo(p.toString()+'=('+prim[1].toString()+')*('+prim[0].toString()+')', p.equ(prim[0].mul(prim[1])));
}
function check_radical(p, k)
{
    let r = p.rad(k);
    echo(p.toString()+'=('+r.toString()+')^'+k+'', p.equ(r.pow(k)));
}
function check_resultant(p, q, x, res)
{
    let r = p.resultant(q, x);
    echo('resultant("' + p.toString() + '", "' + q.toString() + '", "'+x+'")=' + '"' + r.toString() + '"' + (res ? (' expected "' + res.toString() + '"' + (res.equ(r) ? ' true' : ' false')) : ''));
}

let o, ring = Abacus.Ring.Q("x", "y");

echo('Abacus.MultiPolynomials (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Multivariate Polynomials and Polynomial operations');
echo('ring = Abacus.Ring.'+ring.toString()+' ('+ring.toTex()+')');
echo('---');

echo('ring.create().toString()');
echo(ring.create().toString());

echo('ring.create({"y*x^2":2,"x*y^2":1,"1":4}).toString()');
echo(ring.create({"y*x^2":2,"x*y^2":1,"1":4}).toString());

echo('ring.create({"y*x^2":2,"x*y^2":1,"1":4}).toTex()');
echo(ring.create({"y*x^2":2,"x*y^2":1,"1":4}).toTex());

echo('ring.create({"y*x^2":2,"x*y":1,"1":4}).toExpr().toString()');
echo(ring.create({"y*x^2":2,"x*y":1,"1":4}).toExpr().toString());

echo('ring.fromExpr(ring.create({"y*x^2":2,"x*y":1,"1":4}).toExpr()).toString()');
echo(ring.fromExpr(ring.create({"y*x^2":2,"x*y":1,"1":4}).toExpr()).toString());

echo('ring.fromString("1 - y*x^2 + 3x*y").toString()');
echo(ring.fromString("1 - y*x^2 + 3x*y").toString());

echo('ring.fromString("1 - y*x").evaluate({"x":1,"y":2})');
echo(ring.fromString("1 - y*x").evaluate({"x":1,"y":2}).toString());

echo('ring.fromString("1 - y+x").evaluate({"x":1,"y":2})');
echo(ring.fromString("1 - y+x").evaluate({"x":1,"y":2}).toString());

echo('ring.fromString("1+x*y+x*y^2").evaluate({"x":1,"y":2})');
echo(ring.fromString("1+x*y+x*y^2").evaluate({"x":1,"y":2}).toString());

echo('ring.fromString("1 - y*x").compose({"x":ring.fromString("y^2+x")})');
echo(ring.fromString("1 - y*x").compose({"x":ring.fromString("y^2+x")}).toString());

echo('ring.fromString("1+x*y+x*y^2").compose({"x":ring.fromString("y^2+x")})');
echo(ring.fromString("1+x*y+x*y^2").compose({"x":ring.fromString("y^2+x")}).toString());

echo('ring.fromString("1 - y*x^2 + 3x*y").add(1).toString()');
echo(ring.fromString("1 - y*x^2 + 3x*y").add(1).toString());

echo('ring.fromString("1 - y*x^2 + 3x*y").add(Abacus.Polynomial.fromString("1+x")).toString()');
echo(ring.fromString("1 - y*x^2 + 3x*y").add(Abacus.Polynomial.fromString("1+x")).toString());

echo('ring.fromString("1 - y*x^2 + 3x*y").add(ring.fromString("1 + x")).toString()');
echo(ring.fromString("1 - y*x^2 + 3x*y").add(ring.fromString("1 + x")).toString());

echo('ring.fromString("1 - y*x^2 + 3x*y").mul(ring.fromString("1 + x")).toString()');
echo(ring.fromString("1 - y*x^2 + 3x*y").mul(ring.fromString("1 + x")).toString());

echo('ring.fromString("1 - y*x^2 + 3x*y").div(ring.fromString("1 + x")).toString()');
echo(ring.fromString("1 - y*x^2 + 3x*y").div(ring.fromString("1 + x")).toString());

echo('ring.fromString("1 - y*x^2 + 3x*y").div(ring.fromString("1 + x")).toString()');
check_div(ring.fromString("1 - y*x^2 + 3x*y"), ring.fromString("1 + x"));

echo('ring.fromString("1 - y*x^2 + 3x*y + 8x^4*y^4").multidiv([ring.fromString("1 + x"),ring.fromString("xy^2")]).toString()');
check_div(ring.fromString("1 - y*x^2 + 3x*y + 8x^4*y^4"), [ring.fromString("1 + x"),ring.fromString("xy^2")]);

echo('ring.fromString("1 - y*x^2 + 3x*y").pow(3).toString()');
echo(ring.fromString("1 - y*x^2 + 3x*y").pow(3).toString());

echo('ring.fromString("1 - y*x^2 + 3x*y").d("x").toString()');
echo(ring.fromString("1 - y*x^2 + 3x*y").d("x").toString());

echo('ring.fromString("1 - y*x^2 + 3x*y").d("y").toString()');
echo(ring.fromString("1 - y*x^2 + 3x*y").d("y").toString());
echo('---');

echo('ring.fromString("x^2").rad(2)');
check_radical(ring.fromString("x^2"), 2);
echo('ring.fromString("x^2*y^4").rad(2)');
check_radical(ring.fromString("x^2*y^4"), 2);
echo('ring.fromString("x+1").pow(2).rad(2)');
check_radical(ring.fromString("x+1").pow(2), 2);
echo('ring.fromString("x+y").pow(5).rad(5)');
check_radical(ring.fromString("x+y").pow(5), 5);
echo('ring.fromString("4x^2-12x*y+9y^2").rad(2)');
check_radical(ring.fromString("4x^2-12x*y+9y^2"), 2);
echo('ring.fromString("x+y+1").rad(2)');
check_radical(ring.fromString("x+y+1"), 2);
echo('---');

echo('Abacus.Math.groebner([ring.fromString("x^2-y"),ring.fromString("x^3-x"),ring.fromString("x*y-x"),ring.fromString("y^2-y")])');
echo(Abacus.Math.groebner([ring.fromString("x^2-y"),ring.fromString("x^3-x"),ring.fromString("x*y-x"),ring.fromString("y^2-y")]).map(String).join(','));

/*
echo('Polynomial Extended GCD, generalisation of xGCD of numbers');
echo('---');
echo('ring.xgcd(ring.fromString("1+x"),ring.fromString("1+x"))');
check_xgcd(ring, [ring.fromString("1+x"),ring.fromString("1+x")]);

echo('ring.xgcd(ring.fromString("1-xy+x^2"),ring.fromString("1+xy"))');
check_xgcd(ring, [ring.fromString("1-xy+x^2"),ring.fromString("1+xy")]);
*/

echo('---');
ring = Abacus.Ring.C("x", "y", "z");
echo('ring = Abacus.Ring.'+ring.toString()+' ('+ring.toTex()+')');
echo('---');
echo('ring.fromString("x^2*y+x^2*y^2+x+y*x+2").recur("x")');
check_recursive(ring.fromString("x^2*y+x^2*y^2+x+y*x+2"), "x");
echo('ring.fromString("x^2*y+x^2*y^2+x+y*x+2").recur("y")');
check_recursive(ring.fromString("x^2*y+x^2*y^2+x+y*x+2"), "y");
echo('ring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y").recur("x")');
check_recursive(ring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y"), "x");
echo('ring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y").recur("y")');
check_recursive(ring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y"), "y");
echo('ring.fromString("(4+2i)*x^2*y+(2+2i)*x^2*y^2+2x+4y*x+6z*y*x+(2+4i)*z*y+2").recur("x")');
check_recursive(ring.fromString("(4+2i)*x^2*y+(2+2i)*x^2*y^2+2x+4y*x+6z*y*x+(2+4i)*z*y+2"), "x");
echo('ring.fromString("(4+2i)*x^2*y+(2+2i)*x^2*y^2+2x+4y*x+6z*y*x+(2+4i)*z*y+2").recur("y")');
check_recursive(ring.fromString("(4+2i)*x^2*y+(2+2i)*x^2*y^2+2x+4y*x+6z*y*x+(2+4i)*z*y+2"), "y");
echo('ring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y").recur(true)');
o = ring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y");
echo(o.recur(true).toString()+' '+o.recur(true).recur(false).equ(o));
echo('----');
echo('ring.fromString("x^2*y+x^2*y^2+x+y*x+2").evaluate({"x":1,"y":2})');
echo(ring.fromString("x^2*y+x^2*y^2+x+y*x+2").evaluate({"x":1,"y":2}).toString());
echo('ring.fromString("x^2*z+x^2*z^2+x+z*x+2").evaluate({"x":1,"z":2})');
echo(ring.fromString("x^2*z+x^2*z^2+x+z*x+2").evaluate({"x":1,"z":2}).toString());
echo('ring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y").evaluate({"x":1,"y":2,"z":5})');
echo(ring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y").evaluate({"x":1,"y":2,"z":5}).toString());

echo('------');

//check_resultant(ring.fromString("x^2*y+x^2*y^2+x+y*x+2"), ring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y"), "x");
check_resultant(ring.fromString("x^2+y"), ring.fromString("x-2*y"), "x", ring.fromString("4*y^2 + y"));
check_resultant(ring.fromString("x^2+y"), ring.fromString("x-2*y"), "y", ring.fromString("2*x^2 + x"));