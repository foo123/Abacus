var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;
var use_biginteger_arithmetic = require('./biginteger/arithmetic.js');

use_biginteger_arithmetic( Abacus );

function check_div( n, d )
{
    var nn, qr, q, r;
    if ( d instanceof Array )
    {
        qr = n.multidivmod(d); q = qr[0]; r = qr[1];
        nn = q.reduce(function(p, qi, i){return p.add(qi.mul(d[i]));}, r);
        echo('('+n.toString()+')/['+d.map(String).join(',')+']='+d.map(function(di, i){return '('+di.toString()+')*('+q[i].toString()+')';}).join('+')+'+('+r.toString()+')='+nn.toString(), nn.equ(n));
    }
    else
    {
        qr = n.divmod(d); q = qr[0]; r = qr[1];
        nn = q.mul(d).add(r);
        echo('('+n.toString()+')/('+d.toString()+')=('+d.toString()+')*('+q.toString()+')+('+r.toString()+')='+nn.toString(), nn.equ(n));
    }
}
function check_xgcd( ring, args )
{
    var out = '', res = ring.Zero(), gcd = ring.xgcd(args);
    for(i=0; i<args.length; i++)
    {
        out += (out.length ? ' + ' : '') + '('+args[i].toString()+')'+'('+gcd[i+1].toString()+')';
        res = res.add(args[i].mul(gcd[i+1]));
        if ( !args[i].mod(gcd[0]).equ(0) ) echo(args[i].toString()+' is not divided!');
    }
    out += ' = '+gcd[0].toString();
    echo(out, res.equ(gcd[0]));
}

var o, ring = Abacus.Ring.Q("x", "y");

echo('Abacus.MultiPolynomials (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Multivariate Polynomials and Polynomial operations');
echo('ring = Abacus.Ring.Q("x", "y")');
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

echo('ring.fromString("1 - yx^2 + 3xy").toString()');
echo(ring.fromString("1 - yx^2 + 3xy").toString());

echo('ring.fromString("1 - yx^2 + 3xy").add(1).toString()');
echo(ring.fromString("1 - yx^2 + 3xy").add(1).toString());

echo('ring.fromString("1 - yx^2 + 3xy").add(Abacus.Polynomial.fromString("1+x")).toString()');
echo(ring.fromString("1 - yx^2 + 3xy").add(Abacus.Polynomial.fromString("1+x")).toString());

echo('ring.fromString("1 - yx^2 + 3xy").add(ring.fromString("1 + x")).toString()');
echo(ring.fromString("1 - yx^2 + 3xy").add(ring.fromString("1 + x")).toString());

echo('ring.fromString("1 - yx^2 + 3xy").mul(ring.fromString("1 + x")).toString()');
echo(ring.fromString("1 - yx^2 + 3xy").mul(ring.fromString("1 + x")).toString());

echo('ring.fromString("1 - yx^2 + 3xy").div(ring.fromString("1 + x")).toString()');
echo(ring.fromString("1 - yx^2 + 3xy").div(ring.fromString("1 + x")).toString());

echo('ring.fromString("1 - yx^2 + 3xy").div(ring.fromString("1 + x")).toString()');
check_div(ring.fromString("1 - yx^2 + 3xy"), ring.fromString("1 + x"));

echo('ring.fromString("1 - yx^2 + 3xy + 8x^4y^4").multidiv([ring.fromString("1 + x"),ring.fromString("xy^2")]).toString()');
check_div(ring.fromString("1 - yx^2 + 3xy + 8x^4y^4"), [ring.fromString("1 + x"),ring.fromString("xy^2")]);

echo('ring.fromString("1 - yx^2 + 3xy").pow(3).toString()');
echo(ring.fromString("1 - yx^2 + 3xy").pow(3).toString());

echo('ring.fromString("1 - yx^2 + 3xy").d("x").toString()');
echo(ring.fromString("1 - yx^2 + 3xy").d("x").toString());

echo('ring.fromString("1 - yx^2 + 3xy").d("y").toString()');
echo(ring.fromString("1 - yx^2 + 3xy").d("y").toString());

echo('Abacus.Math.groebner([ring.fromString("x^2-y"),ring.fromString("x^3-x"),ring.fromString("xy-x"),ring.fromString("y^2-y")])');
echo(Abacus.Math.groebner([ring.fromString("x^2-y"),ring.fromString("x^3-x"),ring.fromString("xy-x"),ring.fromString("y^2-y")]).map(String).join(','));

/*
echo('Polynomial Extended GCD, generalisation of xGCD of numbers');
echo('---');
echo('ring.xgcd(ring.fromString("1+x"),ring.fromString("1+x"))');
check_xgcd(ring, [ring.fromString("1+x"),ring.fromString("1+x")]);

echo('ring.xgcd(ring.fromString("1-xy+x^2"),ring.fromString("1+xy"))');
check_xgcd(ring, [ring.fromString("1-xy+x^2"),ring.fromString("1+xy")]);
*/