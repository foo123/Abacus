"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

function poly(expr, symbol)
{
    return Abacus.Expr(expr).toPoly(symbol);
}
function check_div(n, d)
{
    let nn, qr, q, r;
    if (d instanceof Array)
    {
        qr = n.multidivmod(d); q = qr[0]; r = qr[1];
        nn = q.reduce(function(p, qi, i) {return p.add(qi.mul(d[i]));}, r);
        echo('('+n.toString()+')/['+d.map(String).join(',')+']='+d.map(function(di, i) {return '('+di.toString()+')*('+q[i].toString()+')';}).join('+')+'+('+r.toString()+') = '+nn.toString(), nn.equ(n));
    }
    else
    {
        qr = n.divmod(d); q = qr[0]; r = qr[1];
        nn = q.mul(d).add(r);
        echo('('+n.toString()+')/('+d.toString()+')=('+d.toString()+')*('+q.toString()+')+('+r.toString()+') = '+nn.toString(), nn.equ(n));
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
function check_primitive(p)
{
    const prim = p.primitive(true);
    echo(p.toString()+' = ('+prim[1].toString()+')('+prim[0].toString()+')', p.equ(prim[0].mul(prim[1])));
}
function check_radical(p, k)
{
    const r = p.rad(k);
    echo(p.toString()+' = ('+r.toString()+')^'+String(k)+'', p.equ(r.pow(k)));
}
function check_factors(p)
{
    const f = p.factors(), factors = f[0], constant = f[1];
    let out = p.toString() + ' = (' + String(constant)+')', res = Abacus.Polynomial.One(p.symbol, p.ring);
    for (let i=0; i<factors.length; ++i)
    {
        out += '('+factors[i][0].toString()+')'+(1 < factors[i][1] ? ('^'+String(factors[i][1])) : '');
        res = res.mul(factors[i][0].pow(factors[i][1]));
    }
    echo(out, res.mul(constant).equ(p));
}
function check_roots(p, exact)
{
    const roots = exact ? p.exactroots() : p.roots();
    const pe = p.toExpr();
    const satisfied = roots.length === roots.filter(function(r) {
        let e = pe.substitute(r[0], p.symbol);
        return e.num.expand().equ(0);
    }).length;
    echo((exact ? 'exactroots' : 'roots')+'('+p.toString()+') = '+roots.map(r => String(r[0])).join(', '), satisfied);
}
function check_resultant(p, q, res)
{
    const r = p.resultant(q);
    echo('resultant(' + p.toString() + ', ' + q.toString() + ') = ' + '"' + r.toString() + '"' + (res ? (' expected "' + res.toString() + '"' + (res.equ(r) ? ' true' : ' false')) : ''));
}
function check_discriminant(p, res)
{
    if (res) res = Abacus.Expr(res);
    const d = p.discriminant();
    echo('discriminant(' + p.toString() + ') = ' + '"' + d.toString() + '"' + (res ? (' expected "' + res.toString() + '"' + (res.equ(d) ? ' true' : ' false')) : ''));
}

let o, d, p1, p2, p3, ring = Abacus.Ring.Q("x");

echo('Abacus.Polynomials (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Polynomials and Polynomial operations');

echo('ring = Abacus.Ring.'+ring.toString()+' ('+ring.toTex()+')');
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

echo('o=ring.create({"x^50":1,"x^2":2})');
o=ring.create({"x^50":1,"x^2":2});
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
echo('o.primitive()');
check_primitive(o);
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
echo('o.primitive()');
check_primitive(o);
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

echo('ring.fromString("x^2").rad(2)');
check_radical(ring.fromString("x^2"), 2);
echo('ring.fromString("x^2").pow(2).rad(2)');
check_radical(ring.fromString("x^2").pow(2), 2);
echo('ring.fromString("x+1").pow(5).rad(5)');
check_radical(ring.fromString("x+1").pow(5), 5);
echo('ring.fromString("9x^4+6x^3-11x^2-4x+4").rad(2)');
check_radical(ring.fromString("9x^4+6x^3-11x^2-4x+4"), 2);
echo('ring.fromString("x^4+10x^3+31x^2+30x+9").rad(2)');
check_radical(ring.fromString("x^4+10x^3+31x^2+30x+9"), 2);
echo('ring.fromString("x+1").rad(2)');
check_radical(ring.fromString("x+1"), 2);
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
echo('o.primitive()');
check_primitive(o);
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

echo('Polynomial Exact and Approximate Roots');
echo('---');

echo('ring.create([0])'); // no roots, here infinite roots actually, but for convience denote as no roots
check_roots(ring.create([0]));

echo('ring.create([1])'); // no roots
check_roots(ring.create([1]));

echo('ring.create([0,1])'); // one trivial root
check_roots(ring.create([0,1]));

echo('ring.create([0,0,3])'); // two trivial roots
check_roots(ring.create([0,0,3]));

echo('ring.create([1,1])'); // one root
check_roots(ring.create([1,1]));

echo('ring.create([-1,1,0,2])'); // no rational roots
check_roots(ring.create([-1,1,0,2]));

echo('ring.create([6,-7,0,1])'); // 1,2,-3
check_roots(ring.create([6,-7,0,1]));

echo('ring.create([6,-7,0,1]).shift(2)'); // 0,0,1,2,-3
check_roots(ring.create([6,-7,0,1]).shift(2));

echo('ring.create([-2,5,-5,3])'); // one root
check_roots(ring.create([-2,5,-5,3]));

echo('ring.create([1,1]).pow(2)'); // multiple root
check_roots(ring.create([1,1]).pow(2));

echo('ring.create([1,1]).pow(2).mul(ring.create([0,0,1]))'); // multiple roots
check_roots(ring.create([1,1]).pow(2).mul(ring.create([0,0,1])));

check_roots(poly("(x-1)(x-2)(x-3)(x-4)(x-5)(x-6)", "x"));
check_roots(poly("(x-a)(x-b)(x-c)", "x"));

check_roots(poly("x^2-1", "x"), true);
check_roots(poly("x^2+1", "x"), true);
check_roots(poly("x^3+3x^2+5x+1", "x"), true); // expr cannot simplify
check_roots(poly("x^4+3x^2+1", "x"), true);
check_roots(poly("x^4+5x^3+3x^2+2x+1", "x"), true); // expr cannot simplify

echo('---');

check_roots(poly("ax+b", "x"), true);
check_roots(poly("ax^2+bx+c", "x"), true);
check_roots(poly("(x-a)(x-b)(x-c)", "x"), true);
//check_roots(poly("ax^3+bx^2+cx+d", "x"), true); // slow and expr cannot simplify
//check_roots(poly("ax^4+bx^3+cx^2+dx+e", "x"), true); // slow and expr cannot simplify

echo('---');

echo('ring.create([-1,1,0,2]).zeros()'); // complex roots
echo(ring.create([-1,1,0,2]).zeros().map(r => '('+r.toDec()+')').join(', '));
echo('ring.create([6,-7,0,1]).zeros()'); // complex roots
echo(ring.create([6,-7,0,1]).zeros().map(r => '('+r.toDec()+')').join(', '));
echo('ring.fromString("x^2+1").zeros()'); // complex roots
echo(ring.fromString("x^2+1").zeros().map(r => '('+r.toDec()+')').join(', '));
echo('ring.fromString("(x-1)^2").zeros()'); // roots with multiplicity
echo(ring.fromString("(x-1)^2").zeros().map(r => '('+r.toDec()+')').join(', '));
echo('ring.fromString("(x-1)^3").zeros()'); // roots with multiplicity
echo(ring.fromString("(x-1)^3").zeros().map(r => '('+r.toDec()+')').join(', '));

echo('---');

echo('Polynomial Factorization');
echo('---');

echo('ring.create([1]).factors()');
check_factors(ring.create([1]));

echo('ring.create([1,1]).pow(2).factors()');
check_factors(ring.create([1,1]).pow(2));

echo('ring.create([3,2]).pow(2).factors()');
check_factors(ring.create([3,2]).pow(2));

echo('ring.create([ring.CoefficientRing.fromString("3/2"),1]).pow(2).factors()');
check_factors(ring.create([ring.CoefficientRing.fromString("3/2"),1]).pow(2));

echo('ring.create([1,1]).mul(ring.create([0,0,1])).factors()');
check_factors(ring.create([1,1]).mul(ring.create([0,0,1])));

echo('ring.create([1,1]).mul(ring.create([1,1,1])).factors()');
check_factors(ring.create([1,1]).mul(ring.create([1,1,1])));

echo('ring.fromString("x^2+x+1").factors()');
check_factors(ring.fromString("x^2+x+1"));

//echo(poly('x^5+x^4+x^2+x+2', 'x').mod(poly('2*x^2 + 2*x + 2', 'x')).toString());
echo('poly("(x+1)(x^2 + x + 1)(x^3 - x + 2)^2").factors()');
check_factors(poly(/*'x^5+x^4+x^2+x+2'*/'(x+1)(x^2 + x + 1)(x^3 - x + 2)^2', "x"));
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

echo('Abacus.Math.groebner([ring.fromString("x^2-x"),ring.fromString("x+1")])');
echo(Abacus.Math.groebner([ring.fromString("x^2-x"),ring.fromString("x+1")]).map(String).join(','));
echo('---');

ring = Abacus.Ring.Z("x");
echo('ring = Abacus.Ring.'+ring.toString());
echo('----------');
echo('ring.xgcd(ring.create([4,0,2]),ring.create([6,12]))');
check_xgcd(ring, [ring.create([4,0,2]),ring.create([6,12])]);

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

ring = Abacus.Ring.C("x");
echo('ring = Abacus.Ring.'+ring.toString());
echo('----------');
echo('ring.create(Abacus.Complex.One())');
o=ring.create(Abacus.Complex.One());
echo(o.toString());
echo('o.primitive()');
check_primitive(o);

echo('ring.create(Abacus.Complex.Img())');
o=ring.create(Abacus.Complex.Img());
echo(o.toString());
echo('o.primitive()');
check_primitive(o);

echo('ring.create([Abacus.Complex.Img(), Abacus.Complex(2,-1)]).add(ring.create(Abacus.Complex(1,2)))');
o=ring.create([Abacus.Complex.Img(), Abacus.Complex(2,-1)]).add(ring.create(Abacus.Complex(1,2)));
echo(o.toString());
echo('o.primitive()');
check_primitive(o);

echo('ring.fromString(ring.create([Abacus.Complex.Img(), Abacus.Complex(2,-1)]).toString())');
o=ring.fromString(ring.create([Abacus.Complex.Img(), Abacus.Complex(2,-1)]).toString());
echo(o.toString());
echo('o.primitive()');
check_primitive(o);

echo('ring.fromString("(1/2)*i*x^2+(1+(2/3)*i)*x")');
o=ring.fromString("(1/2)*i*x^2+(1+(2/3)*i)*x");
echo(o.toString());
echo('o.primitive()');
check_primitive(o);

echo('ring.fromString("(3/2+(1/2)*i)*x+1+(2/3)*i")');
o=ring.fromString("(3/2+(1/2)*i)*x+1+(2/3)*i");
echo(o.toString());
echo('o.primitive()');
check_primitive(o);

echo('------');

check_resultant(ring.fromString("(3/2+(1/2)*i)*x+1+(2/3)*i"), ring.fromString("(1/2)*i*x^2+(1+(2/3)*i)*x"));
check_discriminant(poly("ax^2 + bx + c", "x"), "b^2 - 4a*c");
p1 = poly("ax^2+bx+c", "x");
p2 = poly("bx+c", "x");
echo(String(p1)+','+String(p2)+' -> '+String(Abacus.Polynomial.gcd(p1, p2)));
