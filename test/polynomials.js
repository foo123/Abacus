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
    }
    out += ' = '+gcd[0].toString();
    echo(out, res.equ(gcd[0]));
}
function check_factors( p, factors, constant )
{
    constant = constant || Abacus.Arithmetic.I;
    var out = p.toString() + ' = (' + String(constant)+')', res = Abacus.Polynomial([1], p.symbol), i;
    for(i=0; i<factors.length; i++)
    {
        out += '('+factors[i][0].toString()+')'+(1<factors[i][1]?('^'+String(factors[i][1])):'');
        res = res.mul(factors[i][0].pow(factors[i][1]));
    }
    echo(out, res.mul(constant).equ(p));
}
var o, d, ring = Abacus.Ring.Q("x");

echo('Abacus.Polynomials (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Polynomials and Polynomial operations');
echo('ring = Abacus.Ring.Q("x")');
echo('---');
echo('o=ring.create()');
o=ring.create();
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.evaluate()');
echo(o.evaluate().toString());
echo('o.d()');
echo(o.d().toString());
echo('o.dispose()');
o.dispose();
echo('---');

echo('ring.fromValues([[1,0],[1,1]])');
echo(ring.fromValues([[1,0],[1,1]]));

echo('ring.fromValues([[1,1],[2,1],[3,1]]).toString()');
echo(ring.fromValues([[1,1],[2,1],[3,1]]).toString());

echo('ring.fromValues([[1,1],[2,4],[3,9]]).toString()');
echo(ring.fromValues([[1,1],[2,4],[3,9]]).toString());

echo('ring.fromValues([[1,1],[2,4],[1,1],[3,9]]).toString()');
echo(ring.fromValues([[1,1],[2,4],[1,1],[3,9]]).toString());

echo('ring.fromValues([[1,1],[2,8],[3,27],[4,64]]).toString()');
echo(ring.fromValues([[1,1],[2,8],[3,27],[4,64]]).toString());
echo('---');

echo('o=ring.create({"50":1,"2":2})');
o=ring.create({"50":1,"2":2});
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.mul(-1)');
echo(o.mul(-1).toString());
echo('o.d()');
echo(o.d().toString());
echo('o.d(2)');
echo(o.d(2).toString(), o.d().d().equ(o.d(2)));
echo('o.d(4)');
echo(o.d(4).toString(), o.d().d().d().d().equ(o.d(4)));
echo('o.toExpr()');
echo(o.toExpr().toString());
echo(o.toExpr().toTex());
echo('ring.fromExpr(o.toExpr())');
echo(ring.fromExpr(o.toExpr()).toString());
echo('o.dispose()');
o.dispose();
echo('---');

echo('ring.fromString("1").toString()');
echo(ring.fromString("1").toString());
echo('ring.fromString("1 + x^2").toString()');
echo(ring.fromString("1 + x^2").toString());
echo('ring.fromString("1 - x^2").toString()');
echo(ring.fromString("1 - x^2").toString());
echo('ring.fromString("1 - (2/3)*x^2+x").toString()');
echo(ring.fromString("1 - (2/3)*x^2+x").toString());
echo('ring.fromString("1 - \\frac{2}{3}*x^{2}+x").toString()');
echo(ring.fromString("1 - \\frac{2}{3}*x^{2}+x").toString());

echo('ring.fromString("1 - x").add(ring.fromString("1 + y")).toString()');
echo(ring.fromString("1 - x").add(ring.fromString("1 + y")).toString());

echo('---');
echo('o=ring.create([2,0,1])');
o=ring.create([2,0,1]);
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.evaluate(3)');
echo(o.evaluate(3).toString());
echo('o.add(1)');
echo(o.add(1).toString());
echo('o.add(ring.create([1,1]))');
echo(o.add(ring.create([1,1])).toString());
echo('o.mul(2)');
echo(o.mul(2).toString());
echo('o.mul(ring.create([1,1]))');
echo(o.mul(ring.create([1,1])).toString());
echo('o.shift(1)');
echo(o.shift(1).toString());
echo('o.shift(-1)');
echo(o.shift(-1).toString());
echo('o.compose(ring.create([1]))');
echo(o.compose(ring.create([1])).toString());
echo('o.compose(ring.create([0,1]))');
echo(o.compose(ring.create([0,1])).toString());
echo('o.compose(ring.create([1,1]))');
echo(o.compose(ring.create([1,1])).toString());
o.dispose();
echo('---');

echo('o=ring.create([1,2])');
o=ring.create([1,2]);
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.evaluate(3)');
echo(o.evaluate(3).toString());
echo('o.neg()');
echo(o.neg().toString());
echo('o.add(1)');
echo(o.add(1).toString());
echo('o.add(ring.create([1,1]))');
echo(o.add(ring.create([1,1])).toString());
echo('o.mul(2)');
echo(o.mul(2).toString());
echo('o.mul(ring.create([1,1]))');
echo(o.mul(ring.create([1,1])).toString());
echo('o.shift(1)');
echo(o.shift(1).toString());
echo('o.shift(-1)');
echo(o.shift(-1).toString());
echo('o.compose(ring.create([1]))');
echo(o.compose(ring.create([1])).toString());
echo('o.compose(ring.create([0,1]))');
echo(o.compose(ring.create([0,1])).toString());
echo('o.compose(ring.create([1,1]))');
echo(o.compose(ring.create([1,1])).toString());
echo('ring.create([1,1,1]).compose(o)');
echo(ring.create([1,1,1]).compose(o).toString());
echo('o.pow(0)');
echo(o.pow(0).toString());
echo('o.pow(1)');
echo(o.pow(1).toString());
echo('o.pow(2)');
echo(o.pow(2).toString());
echo('o.pow(3)');
echo(o.pow(3).toString());
echo('o.div(2)');
check_div( o, 2 );
echo('o.div(ring.create([2]))');
check_div( o, ring.create([2]) );
echo('o.div(ring.create([1,1]))');
check_div( o, ring.create([1,1]) );
echo('o.multidiv([ring.create([1,1]), ring.create([0,0,2])])');
check_div( o, [ring.create([1,1]), ring.create([0,0,2])] );
echo('o.d()');
echo(o.d().toString());
echo('o.toExpr()');
echo(o.toExpr().toString());
echo('ring.fromExpr(o.toExpr())');
echo(ring.fromExpr(o.toExpr()).toString());
echo('o.dispose()');
o.dispose();
echo('---');

echo('o=ring.create([6,12])');
o=ring.create([6,12]);
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
o.dispose();
echo('---');

echo('o=ring.create([-4,0,-2,1])');
o=ring.create([-4,0,-2,1]);
echo('o.toString()');
echo(o.toString());
echo('o.div(ring.create([-3,1]))');
check_div( o, ring.create([-3,1]) );
echo('o.multidiv([ring.create([-3,1]), ring.create([1,0,2])])');
check_div( o, [ring.create([-3,1]), ring.create([1,0,2])] );
echo('o.d()');
echo(o.d().toString());
echo('o.toExpr()');
echo(o.toExpr().toString());
echo('ring.fromExpr(o.toExpr())');
echo(ring.fromExpr(o.toExpr()).toString());
echo('o.dispose()');
o.dispose();
echo('---');

echo('Polynomial Rational Roots');
echo('---');

echo('ring.create([0]).roots()'); // no roots, here infinite roots actually, but for convience denote as no roots
echo(ring.create([0]).roots().map(function(r){return '('+r.toString()+')';}).join(', '));

echo('ring.create([1]).roots()'); // no roots
echo(ring.create([1]).roots().map(function(r){return '('+r.toString()+')';}).join(', '));

echo('ring.create([0,1]).roots()'); // one trivial root
echo(ring.create([0,1]).roots().map(function(r){return '('+r.toString()+')';}).join(', '));

echo('ring.create([0,0,3]).roots()'); // two trivial roots
echo(ring.create([0,0,3]).roots().map(function(r){return '('+r.toString()+')';}).join(', '));

echo('ring.create([1,1]).roots()'); // one root
echo(ring.create([1,1]).roots().map(function(r){return '('+r.toString()+')';}).join(', '));

echo('ring.create([-1,1,0,2]).roots()'); // no rational roots
echo(ring.create([-1,1,0,2]).roots().map(function(r){return '('+r.toString()+')';}).join(', '));

echo('ring.create([6,-7,0,1]).roots()'); // 1,2,-3
echo(ring.create([6,-7,0,1]).roots().map(function(r){return '('+r.toString()+')';}).join(', '));

echo('ring.create([6,-7,0,1]).shift(2).roots()'); // 0,0,1,2,-3
echo(ring.create([6,-7,0,1]).shift(2).roots().map(function(r){return '('+r.toString()+')';}).join(', '));

echo('ring.create([-2,5,-5,3]).roots()'); // one root
echo(ring.create([-2,5,-5,3]).roots().map(function(r){return '('+r.toString()+')';}).join(', '));

echo('ring.create([1,1]).pow(2).roots()'); // multiple root
echo(ring.create([1,1]).pow(2).roots().map(function(r){return '('+r.toString()+')';}).join(', '));

echo('ring.create([1,1]).pow(2).mul(ring.create([0,0,1])).roots()'); // multiple roots
echo(ring.create([1,1]).pow(2).mul(ring.create([0,0,1])).roots().map(function(r){return '('+r.toString()+')';}).join(', '));
echo('---');

echo('Polynomial Factorization');
echo('---');

echo('ring.create([1]).factors()');
o=ring.create([1]);
d=o.factors();
check_factors(o, d[0], d[1]);

echo('ring.create([1,1]).pow(2).factors()');
o=ring.create([1,1]).pow(2);
d=o.factors();
check_factors(o, d[0], d[1]);

echo('ring.create([3,2]).pow(2).factors()');
o=ring.create([3,2]).pow(2);
d=o.factors();
check_factors(o, d[0], d[1]);

echo('ring.create([ring.CoefficientRing.fromString("3/2"),1]).pow(2).factors()');
o=ring.create([ring.CoefficientRing.fromString("3/2"),1]).pow(2);
d=o.factors();
check_factors(o, d[0], d[1]);

echo('ring.create([1,1]).mul(ring.create([0,0,1])).factors()');
o=ring.create([1,1]).mul(ring.create([0,0,1]));
d=o.factors();
check_factors(o, d[0], d[1]);

echo('ring.create([1,1]).mul(ring.create([1,1,1])).factors()');
o=ring.create([1,1]).mul(ring.create([1,1,1]));
d=o.factors();
check_factors(o, d[0], d[1]);
echo('---');

echo('Polynomial GCD, generalisation of GCD of numbers');
echo('---');
echo('ring.gcd(ring.create([1,2]),ring.create([1,3,4]))');
echo(ring.gcd(ring.create([1,2]),ring.create([1,3,4])).toString());

echo('ring.gcd(ring.create([1,1,1,1,5]),ring.create([2,1,3]))');
echo(ring.gcd(ring.create([1,1,1,1,5]),ring.create([2,1,3])).toString());

echo('ring.gcd(ring.create([6,7,1]),ring.create([-6,-5,1]))');
echo(ring.gcd(ring.create([6,7,1]),ring.create([-6,-5,1])).toString());

echo('ring.gcd(ring.create([6,7,1]),ring.create([-6,-5,1]),ring.create([1,1]))');
echo(ring.gcd(ring.create([6,7,1]),ring.create([-6,-5,1]),ring.create([1,1])).toString());

echo('ring.gcd(ring.create([6]),ring.create([4]))');
echo(ring.gcd(ring.create([6]),ring.create([4])).toString(), Abacus.Math.gcd(6,4).toString());

echo('ring.gcd(ring.create([12]),ring.create([6]),ring.create([3]))');
echo(ring.gcd(ring.create([12]),ring.create([6]),ring.create([3])).toString(), Abacus.Math.gcd(12,6,3).toString());

echo('ring.gcd(ring.create([2]),ring.create([0]),ring.create([0]),ring.create([3]))');
echo(ring.gcd(ring.create([2]),ring.create([0]),ring.create([0]),ring.create([3])).toString(), Abacus.Math.gcd(2,0,0,3).toString());

echo('ring.gcd(ring.create([74]),ring.create([32]),ring.create([16]),ring.create([153]))');
echo(ring.gcd(ring.create([74]),ring.create([32]),ring.create([16]),ring.create([153])).toString(), Abacus.Math.gcd(74, 32, 16, 153).toString());
echo('---');

echo('Polynomial Extended GCD, generalisation of xGCD of numbers');
echo('---');
echo('ring.xgcd(ring.create([2,0,1]),ring.create([6,12]))');
check_xgcd(ring, [ring.create([2,0,1]),ring.create([6,12])]);

echo('ring.xgcd(ring.create([1,2]),ring.create([1,3,4]))');
check_xgcd(ring, [ring.create([1,2]),ring.create([1,3,4])]);

echo('ring.xgcd(ring.create([1,1,1,1,5]),ring.create([2,1,3]))');
check_xgcd(ring, [ring.create([1,1,1,1,5]),ring.create([2,1,3])]);

echo('ring.xgcd(ring.create([6,7,1]),ring.create([-6,-5,1]))');
check_xgcd(ring, [ring.create([6,7,1]),ring.create([-6,-5,1])]);

echo('ring.xgcd(ring.create([6,7,1]),ring.create([-6,-5,1]),ring.create([1,1]))');
check_xgcd(ring, [ring.create([6,7,1]),ring.create([-6,-5,1]),ring.create([1,1])]);

echo('ring.xgcd(ring.create([6]),ring.create([4]))');
check_xgcd(ring, [ring.create([6]),ring.create([4])]);
echo(Abacus.Math.xgcd(6,4).map(function(x){return x.toString();})); // should coincide with this

echo('ring.xgcd(ring.create([12]),ring.create([6]),ring.create([3]))');
check_xgcd(ring, [ring.create([12]),ring.create([6]),ring.create([3])]);
echo(Abacus.Math.xgcd(12,6,3).map(function(x){return x.toString();})); // should coincide with this

echo('ring.xgcd(ring.create([2]),ring.create([0]),ring.create([0]),ring.create([3]))');
check_xgcd(ring, [ring.create([2]),ring.create([0]),ring.create([0]),ring.create([3])]);
echo(Abacus.Math.xgcd(2,0,0,3).map(function(x){return x.toString();})); // should coincide with this

echo('ring.xgcd(ring.create([74]),ring.create([32]),ring.create([16]),ring.create([153]))');
check_xgcd(ring, [ring.create([74]),ring.create([32]),ring.create([16]),ring.create([153])]);
echo(Abacus.Math.xgcd(74,32,16,153).map(function(x){return x.toString();})); // should coincide with this
echo('---');

echo('Abacus.Math.groebner([ring.fromString("x^2-x", "x"),ring.fromString("x+1", "x")])');
echo(Abacus.Math.groebner([ring.fromString("x^2-x", "x"),ring.fromString("x+1", "x")]).map(String).join(','));
