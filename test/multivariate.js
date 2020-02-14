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
    var out = '', res = (Abacus.Integer===ring.NumberClass ? Abacus.Ring.Q(args[0].symbol) : ring).Zero(), gcd = ring.xgcd(args);
    for(i=0; i<args.length; i++)
    {
        out += (out.length ? ' + ' : '') + '('+args[i].toString()+')'+'('+gcd[i+1].toString()+')';
        res = res.add(gcd[i+1].mul(args[i]));
        if ( !args[i].mod(gcd[0]).equ(0) ) echo(args[i].toString()+' is not divided!');
    }
    out += ' = '+res.toString()+' (gcd: '+gcd[0].toString()+')';
    echo(out, res.equ(gcd[0]));
}

function check_recursive( p, x )
{
    var p_x = p.recur(x), p_xx = p_x.recur(x), p_xy = p_x.recur('x'===x?'y':'x'),
        p_x_x = p_x.d(x), p_x_y = p_x.d('x'===x?'y':'x'),
        p_x_xx = p_x.d(x, 2), p_x_yy = p_x.d('x'===x?'y':'x', 2),
        p_xs = p_x.shift(x, -1), p_xys = p_xy.shift('x'===x?'y':'x', -1),
        pp = p_x.recur(false), ppp = p_xy.recur(false);
    echo('Recursive representations by '+x+':');
    echo(p_x.toString()+', again: '+p_xx.toString()+'('+p_xx.equ(p_x)+'), again on other: '+p_xy.toString());
    echo(p.toString()+'='+pp.toString()+'='+ppp.toString(), p.equ(pp), p.equ(ppp));
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

var o, ring = Abacus.Ring.Q("x", "y");

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

echo('ring.fromString("1 - yx^2 + 3xy").toString()');
echo(ring.fromString("1 - yx^2 + 3xy").toString());

echo('ring.fromString("1 - yx").evaluate({"x":1,"y":2})');
echo(ring.fromString("1 - yx").evaluate({"x":1,"y":2}).toString());

echo('ring.fromString("1 - y+x").evaluate({"x":1,"y":2})');
echo(ring.fromString("1 - y+x").evaluate({"x":1,"y":2}).toString());

echo('ring.fromString("1+xy+xy^2").evaluate({"x":1,"y":2})');
echo(ring.fromString("1+xy+xy^2").evaluate({"x":1,"y":2}).toString());

echo('ring.fromString("1 - yx").compose({"x":ring.fromString("y^2+x")})');
echo(ring.fromString("1 - yx").compose({"x":ring.fromString("y^2+x")}).toString());

echo('ring.fromString("1+xy+xy^2").compose({"x":ring.fromString("y^2+x")})');
echo(ring.fromString("1+xy+xy^2").compose({"x":ring.fromString("y^2+x")}).toString());

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

echo('---');
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

echo('---');
ring = Abacus.Ring.Q("x", "y", "z");
echo('ring = Abacus.Ring.'+ring.toString()+' ('+ring.toTex()+')');
echo('---');
echo('ring.fromString("x^2y+x^2y^2+x+yx+2").recur("x")');
check_recursive( ring.fromString("x^2y+x^2y^2+x+yx+2"), "x" );
echo('ring.fromString("x^2y+x^2y^2+x+yx+2").recur("y")');
check_recursive( ring.fromString("x^2y+x^2y^2+x+yx+2"), "y" );
echo('ring.fromString("x^2y+x^2y^2+x+yx+2+zyx+zy").recur("x")');
check_recursive( ring.fromString("x^2y+x^2y^2+x+yx+2+zyx+zy"), "x" );
echo('ring.fromString("x^2y+x^2y^2+x+yx+2+zyx+zy").recur("y")');
check_recursive( ring.fromString("x^2y+x^2y^2+x+yx+2+zyx+zy"), "y" );
echo('ring.fromString("x^2y+x^2y^2+x+yx+2+zyx+zy").recur(true)');
o = ring.fromString("x^2y+x^2y^2+x+yx+2+zyx+zy");
echo(o.recur(true).toString()+' '+o.recur(true).recur(false).equ(o));
echo('----');
echo('ring.fromString("x^2y+x^2y^2+x+yx+2").evaluate({"x":1,"y":2})');
echo(ring.fromString("x^2y+x^2y^2+x+yx+2").evaluate({"x":1,"y":2}).toString());
echo('ring.fromString("x^2z+x^2z^2+x+zx+2").evaluate({"x":1,"z":2})');
echo(ring.fromString("x^2z+x^2z^2+x+zx+2").evaluate({"x":1,"z":2}).toString());
echo('ring.fromString("x^2y+x^2y^2+x+yx+2+zyx+zy").evaluate({"x":1,"y":2,"z":5})');
echo(ring.fromString("x^2y+x^2y^2+x+yx+2+zyx+zy").evaluate({"x":1,"y":2,"z":5}).toString());
