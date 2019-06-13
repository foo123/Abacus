var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;


function check_div( n, d, q, r )
{
    var nn = q.mul(d).add(r);
    console.log('('+n.toString()+')/('+d.toString()+')=('+d.toString()+')*('+q.toString()+')+('+r.toString()+')='+nn.toString(), nn.equ(n));
}
function check_xgcd( args, gcd )
{
    var out = '', res = Abacus.Polynomial(0);
    for(i=0; i<args.length; i++)
    {
        out += (out.length ? ' + ' : '') + '('+args[i].toString()+')'+'('+gcd[i+1].toString()+')';
        res = res.add(args[i].mul(gcd[i+1]));
    }
    out += ' = '+gcd[0].toString();
    console.log(out, res.equ(gcd[0]));
}
var o, d, qr, args;

echo('Abacus.Polynomials (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Polynomials and Polynomial operations');
echo('---');
echo('o=Abacus.Polynomial()');
o=Abacus.Polynomial();
echo('o.toString()');
echo(o.toString());
echo('o.valueOf()');
echo(o.valueOf());
echo('o.deriv()');
echo(o.deriv().toString());
echo('o.dispose()');
o.dispose();
echo('---');

echo('o=Abacus.Polynomial({"50":1,"2":2})');
o=Abacus.Polynomial({"50":1,"2":2});
echo('o.toString()');
echo(o.toString());
echo('o.mul(-1)');
echo(o.mul(-1).toString());
echo('o.deriv()');
echo(o.deriv().toString());
echo('o.toExpr()');
echo(o.toExpr().toString());
echo('Abacus.Polynomial.fromExpr(o.toExpr())');
echo(Abacus.Polynomial.fromExpr(o.toExpr()).toString());
echo('o.dispose()');
o.dispose();
echo('---');

echo('o=Abacus.Polynomial([1,2])');
o=Abacus.Polynomial([1,2]);
echo('o.toString()');
echo(o.toString());
echo('o.valueOf(3)');
echo(o.valueOf(3));
echo('o.neg()');
echo(o.neg().toString());
echo('o.add(1)');
echo(o.add(1).toString());
echo('o.add(Abacus.Polynomial([1,1]))');
echo(o.add(Abacus.Polynomial([1,1])).toString());
echo('o.mul(2)');
echo(o.mul(2).toString());
echo('o.mul(Abacus.Polynomial([1,1]))');
echo(o.mul(Abacus.Polynomial([1,1])).toString());
echo('o.shift(1)');
echo(o.shift(1).toString());
echo('o.shift(-1)');
echo(o.shift(-1).toString());
echo('o.pow(0)');
echo(o.pow(0).toString());
echo('o.pow(1)');
echo(o.pow(1).toString());
echo('o.pow(2)');
echo(o.pow(2).toString());
echo('o.pow(3)');
echo(o.pow(3).toString());
echo('o.div(2)');
d=2;
qr=o.div(d, true);
check_div( o, d, qr[0], qr[1] );
echo('o.div(Abacus.Polynomial([2]))');
d=Abacus.Polynomial([2]);
qr=o.div(d, true);
check_div( o, d, qr[0], qr[1] );
echo('o.div(Abacus.Polynomial([1,1]))');
d=Abacus.Polynomial([1,1]);
qr=o.div(d, true);
check_div( o, d, qr[0], qr[1] );
echo('o.deriv()');
echo(o.deriv().toString());
echo('o.toExpr()');
echo(o.toExpr().toString());
echo('Abacus.Polynomial.fromExpr(o.toExpr())');
echo(Abacus.Polynomial.fromExpr(o.toExpr()).toString());
echo('o.dispose()');
o.dispose();
echo('---');

echo('o=Abacus.Polynomial([-4,0,-2,1])');
o=Abacus.Polynomial([-4,0,-2,1]);
echo('o.toString()');
echo(o.toString());
echo('o.div(Abacus.Polynomial([-3,1]))');
d=Abacus.Polynomial([-3,1]);
qr=o.div(d, true);
check_div( o, d, qr[0], qr[1] );
echo('o.deriv()');
echo(o.deriv().toString());
echo('o.toExpr()');
echo(o.toExpr().toString());
echo('Abacus.Polynomial.fromExpr(o.toExpr())');
echo(Abacus.Polynomial.fromExpr(o.toExpr()).toString());
echo('o.dispose()');
o.dispose();
echo('---');

echo('Polynomial GCD, generalisation of GCD of numbers');
echo('---');
echo('Abacus.Math.polygcd(Abacus.Polynomial([6,7,1]),Abacus.Polynomial([-6,-5,1]))');
echo(Abacus.Math.polygcd(Abacus.Polynomial([6,7,1]),Abacus.Polynomial([-6,-5,1])).toString());

echo('Abacus.Math.polygcd(Abacus.Polynomial([6,7,1]),Abacus.Polynomial([-6,-5,1]),Abacus.Polynomial([1,1]))');
echo(Abacus.Math.polygcd(Abacus.Polynomial([6,7,1]),Abacus.Polynomial([-6,-5,1]),Abacus.Polynomial([1,1])).toString());

echo('Abacus.Math.polygcd(Abacus.Polynomial([6]),Abacus.Polynomial([4]))');
echo(Abacus.Math.polygcd(Abacus.Polynomial([6]),Abacus.Polynomial([4])).toString(), Abacus.Math.gcd(6,4));

echo('Abacus.Math.polygcd(Abacus.Polynomial([12]),Abacus.Polynomial([6]),Abacus.Polynomial([3]))');
echo(Abacus.Math.polygcd(Abacus.Polynomial([12]),Abacus.Polynomial([6]),Abacus.Polynomial([3])).toString(), Abacus.Math.gcd(12,6,3));

echo('Abacus.Math.polygcd(Abacus.Polynomial([2]),Abacus.Polynomial([0]),Abacus.Polynomial([0]),Abacus.Polynomial([3]))');
echo(Abacus.Math.polygcd(Abacus.Polynomial([2]),Abacus.Polynomial([0]),Abacus.Polynomial([0]),Abacus.Polynomial([3])).toString(), Abacus.Math.gcd(2,0,0,3));

echo('Abacus.Math.polygcd(Abacus.Polynomial([74]),Abacus.Polynomial([32]),Abacus.Polynomial([16]),Abacus.Polynomial([153]))');
echo(Abacus.Math.polygcd(Abacus.Polynomial([74]),Abacus.Polynomial([32]),Abacus.Polynomial([16]),Abacus.Polynomial([153])).toString(), Abacus.Math.gcd(74, 32, 16, 153));
echo('---');

echo('Polynomial Extended GCD, generalisation of xGCD of numbers');
echo('---');
echo('Abacus.Math.polyxgcd(Abacus.Polynomial([6,7,1]),Abacus.Polynomial([-6,-5,1]))');
args=[Abacus.Polynomial([6,7,1]),Abacus.Polynomial([-6,-5,1])];
o=Abacus.Math.polyxgcd(args);
check_xgcd(args, o);

echo('Abacus.Math.polyxgcd(Abacus.Polynomial([6,7,1]),Abacus.Polynomial([-6,-5,1]),Abacus.Polynomial([1,1]))');
args=[Abacus.Polynomial([6,7,1]),Abacus.Polynomial([-6,-5,1]),Abacus.Polynomial([1,1])];
o=Abacus.Math.polyxgcd(args);
check_xgcd(args, o);

echo('Abacus.Math.polyxgcd(Abacus.Polynomial([6]),Abacus.Polynomial([4]))');
args=[Abacus.Polynomial([6]),Abacus.Polynomial([4])];
o=Abacus.Math.polyxgcd(args);
check_xgcd(args, o);
echo(Abacus.Math.xgcd(6,4)); // should coincide with this

echo('Abacus.Math.polyxgcd(Abacus.Polynomial([12]),Abacus.Polynomial([6]),Abacus.Polynomial([3]))');
args=[Abacus.Polynomial([12]),Abacus.Polynomial([6]),Abacus.Polynomial([3])];
o=Abacus.Math.polyxgcd(args);
check_xgcd(args, o);
echo(Abacus.Math.xgcd(12,6,3)); // should coincide with this

echo('Abacus.Math.polyxgcd(Abacus.Polynomial([2]),Abacus.Polynomial([0]),Abacus.Polynomial([0]),Abacus.Polynomial([3]))');
args=[Abacus.Polynomial([2]),Abacus.Polynomial([0]),Abacus.Polynomial([0]),Abacus.Polynomial([3])];
o=Abacus.Math.polyxgcd(args);
check_xgcd(args, o);
echo(Abacus.Math.xgcd(2,0,0,3)); // should coincide with this

echo('Abacus.Math.polyxgcd(Abacus.Polynomial([74]),Abacus.Polynomial([32]),Abacus.Polynomial([16]),Abacus.Polynomial([153]))');
args=[Abacus.Polynomial([74]),Abacus.Polynomial([32]),Abacus.Polynomial([16]),Abacus.Polynomial([153])];
o=Abacus.Math.polyxgcd(args);
check_xgcd(args, o);
echo(Abacus.Math.xgcd(74,32,16,153)); // should coincide with this
echo('---');
