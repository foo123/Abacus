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
    let out = '', field = ring.associatedField(),
        res = field.Zero(), gcd = ring.xgcd(args);
    for (let i=0; i<args.length; ++i)
    {
        out += (out.length ? ' + ' : '') + '('+args[i].toString()+')'+'('+gcd[i+1].toString()+')';
        res = res.add(gcd[i+1].mul(args[i]));
        if (!args[i].mod(gcd[0]).equ(0)) echo(args[i].toString()+' is not divided!', args[i].mod(gcd[0]).toString());
    }
    out += ' = '+res.toString()+' (gcd: '+gcd[0].toString()+')';
    echo(out, res.equ(gcd[0]));
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
function check_factors(p)
{
    const f = p.factors(), factors = f[0], constant = f[1];
    let out = p.toString() + ' = (' + String(constant)+')', res = Abacus.MultiPolynomial.One(p.symbol, p.ring);
    for (let i=0; i<factors.length; ++i)
    {
        out += '('+factors[i][0].toString()+')'+(1 < factors[i][1] ? ('^'+String(factors[i][1])) : '');
        res = res.mul(factors[i][0].pow(factors[i][1]));
    }
    echo(out, res.mul(constant).equ(p));
}
function check_resultant(p, q, x, res)
{
    let r = p.resultant(q, x);
    echo('resultant("' + p.toString() + '", "' + q.toString() + '", "'+x+'")=' + '"' + r.toString() + '"' + (res ? (' expected "' + res.toString() + '"') : ''));
}

let o, ring, rring, p1, p2, p3;


echo('Abacus.MultiPolynomials (VERSION = '+Abacus.VERSION+')');
echo('---');


ring = Abacus.Ring.Q("x", "y", "z");
o = ring.fromString("x^2 + y^2 + z^2 + x*y + x*z + y*z + x + y + z + 1");
echo('lex    :', o.order('lex').toString());
echo('grlex  :', o.order('grlex').toString());
echo('grevlex:', o.order('grevlex').toString());

echo('---');

ring = Abacus.Ring.Q("x", "y");
rring = Abacus.Ring.K(Abacus.Ring.K(Abacus.Ring.K(Abacus.Ring.Q()), "y"), "x");

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
echo('---');

echo('ring.fromString("1 - y*x").evaluate({"x":1,"y":2})');
echo(ring.fromString("1 - y*x").evaluate({"x":1,"y":2}).toString());
echo('rring.fromString("1 - y*x").evaluate({"x":1,"y":2})');
echo(rring.fromString("1 - y*x").evaluate({"x":1,"y":2}).toString());

echo('ring.fromString("1 - y+x").evaluate({"x":1,"y":2})');
echo(ring.fromString("1 - y+x").evaluate({"x":1,"y":2}).toString());
echo('rring.fromString("1 - y+x").evaluate({"x":1,"y":2})');
echo(rring.fromString("1 - y+x").evaluate({"x":1,"y":2}).toString());

echo('ring.fromString("1+x*y+x*y^2").evaluate({"x":1,"y":2})');
echo(ring.fromString("1+x*y+x*y^2").evaluate({"x":1,"y":2}).toString());
echo('rring.fromString("1+x*y+x*y^2").evaluate({"x":1,"y":2})');
echo(rring.fromString("1+x*y+x*y^2").evaluate({"x":1,"y":2}).toString());
echo('---');

echo('ring.fromString("1 - y*x").compose({"x":ring.fromString("y^2+x")})');
echo(ring.fromString("1 - y*x").compose({"x":ring.fromString("y^2+x")}).toString());
echo('rring.fromString("1 - y*x").compose({"x":rring.fromString("y^2+x")})');
echo(rring.fromString("1 - y*x").compose({"x":rring.fromString("y^2+x")}).toString());

echo('ring.fromString("1+x*y+x*y^2").compose({"x":ring.fromString("y^2+x")})');
echo(ring.fromString("1+x*y+x*y^2").compose({"x":ring.fromString("y^2+x")}).toString());
echo('rring.fromString("1+x*y+x*y^2").compose({"x":rring.fromString("y^2+x")})');
echo(rring.fromString("1+x*y+x*y^2").compose({"x":rring.fromString("y^2+x")}).toString());
echo('---');

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

echo('Polynomial Factorization');
echo('---');
ring = Abacus.Ring.Q("x", "y", "z");
echo("((x+1)(x^2 + x + 1)(x^3 - x + 2)^2).factors()");
check_factors(ring.fromString("(x+1)(x^2 + x + 1)(x^3 - x + 2)^2"));
echo("(xyz(x+y+z)).factors()");
check_factors(ring.fromString("xyz(x+y+z)"));
echo("(x^2*y + x^3).factors()");
check_factors(ring.fromString("x^2*y + x^3"));
echo("(z^3-3xyz+x^3+y^3).factors()");
check_factors(ring.fromString("z^3-3xyz+x^3+y^3"));
echo("((x+y)(x^2+y+z)).factors()");
check_factors(ring.fromString("(x+y)(x^2+y+z)"));
echo("((x+yz)(y^2+x+z)).factors()");
check_factors(ring.fromString("(x+yz)(y^2+x+z)"));
echo("((x+yz+1)(y^2+x+z)).factors()");
check_factors(ring.fromString("(x+yz+1)(y^2+x+z)"));
echo("((x+yz)(y^2+x)(z^2+y)).factors()");
check_factors(ring.fromString("(x+yz)(y^2+x)(z^2+y)"));
echo("((x+yz+2)(y^2+x)(z^2+y)).factors()");
check_factors(ring.fromString("(x+yz+2)(y^2+x)(z^2+y)"));
echo("((x+yz)(y^2+x)(z^2+y)(x^2+y^2)).factors()");
check_factors(ring.fromString("(x+yz)(y^2+x)(z^2+y)(x^2+y^2)"));
echo("((x^3+y^3)(x^2+2y+1)).factors()");
check_factors(ring.fromString("(x^3+y^3)(x^2+2y+1)"));
echo("((ax+by)(x-y)).factors()");
check_factors(ring.fromString("(ax+by)(x-y)"));
echo('---');

ring = Abacus.Ring.Q("x", "y");
rring = Abacus.Ring.K(Abacus.Ring.K(Abacus.Ring.K(Abacus.Ring.Q()), "y"), "x");
echo('Abacus.Math.groebner([ring.fromString("x^2-y"),ring.fromString("x^3-x"),ring.fromString("x*y-x"),ring.fromString("y^2-y")])');
echo(Abacus.Math.groebner([ring.fromString("x^2-y"),ring.fromString("x^3-x"),ring.fromString("x*y-x"),ring.fromString("y^2-y")]).map(String).join(','));

echo('Polynomial Extended GCD, generalisation of xGCD of numbers');
echo('---');

/*
echo('ring.xgcd(ring.fromString("1+x"),ring.fromString("1+x"))');
check_xgcd(ring, [ring.fromString("1+x"),ring.fromString("1+x")]);

echo('ring.xgcd(ring.fromString("1-xy+x^2"),ring.fromString("1+xy"))');
check_xgcd(ring, [ring.fromString("1-xy+x^2"),ring.fromString("1+xy")]);
echo('---');
*/

p1 = ring.fromString("x^2*y + x^3");
echo("x^2*y + x^3", ',', p1.toString());
p2 = ring.fromString("(x + y)^2");
echo("(x + y)^2", ',', p2.toString());
p3 = ring.fromString("x^2 + x*y^2 + x*y + x + y^3 + y");
echo("x^2 + x*y^2 + x*y + x + y^3 + y", ',', p3.toString());
echo(ring.gcd(p1, p2, p3).toString(), ',', "x + y");
check_xgcd(ring, [p3, p1, p2]);
p1 = ring.fromString("(ax+by)(x-y)");
echo(p1.toString());
p2 = ring.fromString("(ax+by)^2");
echo(p2.toString());
echo(ring.gcd(p1, p2).toString(), ',', "ax + by");

echo('---');

//check_resultant(ring.fromString("x^2*y+x^2*y^2+x+y*x+2"), ring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y"), "x");
check_resultant(ring.fromString("x^2+y"), ring.fromString("x-2*y"), "x", "4*y^2 + y");
check_resultant(ring.fromString("x^2+y"), ring.fromString("x-2*y"), "y", "2*x^2 + x");

ring = Abacus.Ring.C("x", "y", "z");
rring = Abacus.Ring.K(Abacus.Ring.K(Abacus.Ring.K(Abacus.Ring.C()), "y", "z"), "x");
echo('ring = '+ring.toString()+' ('+ring.toTex()+')'+' rring = '+rring.toString()+' ('+rring.toTex()+')');
echo('---');
echo('ring.fromString("x^2*y+x^2*y^2+x+y*x+2").evaluate({"x":1,"y":2})');
echo(ring.fromString("x^2*y+x^2*y^2+x+y*x+2").evaluate({"x":1,"y":2}).toString());
echo('rring.fromString("x^2*y+x^2*y^2+x+y*x+2").evaluate({"x":1,"y":2})');
echo(rring.fromString("x^2*y+x^2*y^2+x+y*x+2").evaluate({"x":1,"y":2}).toString());
echo('ring.fromString("x^2*z+x^2*z^2+x+z*x+2").evaluate({"x":1,"z":2})');
echo(ring.fromString("x^2*z+x^2*z^2+x+z*x+2").evaluate({"x":1,"z":2}).toString());
echo('rring.fromString("x^2*z+x^2*z^2+x+z*x+2").evaluate({"x":1,"z":2})');
echo(rring.fromString("x^2*z+x^2*z^2+x+z*x+2").evaluate({"x":1,"z":2}).toString());
echo('ring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y").evaluate({"x":1,"y":2,"z":5})');
echo(ring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y").evaluate({"x":1,"y":2,"z":5}).toString());
echo('rring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y").evaluate({"x":1,"y":2,"z":5})');
echo(rring.fromString("x^2*y+x^2*y^2+x+y*x+2+z*y*x+z*y").evaluate({"x":1,"y":2,"z":5}).toString());
