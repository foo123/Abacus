var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;
var use_biginteger_arithmetic = require('./biginteger/arithmetic.js');

use_biginteger_arithmetic( Abacus );

function check_xgcd( args )
{
    var out = '', res = Abacus.Complex.Zero(), gcd = Abacus.Complex.xgcd(args), d;
    for(i=0; i<args.length; i++)
    {
        out += (out.length ? ' + ' : '') + '('+args[i].toString()+')'+'('+gcd[i+1].toString()+')';
        res = res.add(args[i].mul(gcd[i+1]));
        d = args[i].div(gcd[0]);
        if ( !d.real.isInt() || !d.imag.isInt() ) echo(args[i].toString() + ' is NOT divided!');
    }
    out += ' = '+gcd[0].toString();
    echo(out, res.toString(), res.equ(gcd[0]));
}

var o, i;

echo('Abacus.Complex (VERSION = '+Abacus.VERSION+')');
echo('---');

//Abacus.Rational.autoSimplify = true; // default

echo('o=Abacus.Complex()');
o=Abacus.Complex();
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());

echo();

echo('o=Abacus.Complex.rnd("0", "1+i")');
o=Abacus.Complex.rnd("0", "1+i");
echo('o.toString()');
echo(o.toString());
echo('o.toDec()');
echo(o.toDec());
echo('o.rad(2).toString()');
echo(o.rad(2).toString());
echo('o.sub(o.rad(2).pow(2)).toString()');
echo(o.sub(o.rad(2).pow(2)).toString());

echo();

echo('Abacus.Complex(1).rad(2)');
echo(Abacus.Complex(1).rad(2).toString());
echo('Abacus.Complex(-1).rad(2)');
echo(Abacus.Complex(-1).rad(2).toString());
echo('Abacus.Complex(4).rad(2)');
echo(Abacus.Complex(4).rad(2).toString());
echo('Abacus.Complex(9).rad(2)');
echo(Abacus.Complex(9).rad(2).toString());
echo('Abacus.Complex(27).rad(3)');
echo(Abacus.Complex(27).rad(3).toString());

echo();

echo('Abacus.Complex.fromString("+i")');
echo(Abacus.Complex.fromString("+i").toString());

echo('Abacus.Complex.fromString("-i")');
echo(Abacus.Complex.fromString("-i").toString());

echo('Abacus.Complex.fromString("(2/3)i")');
echo(Abacus.Complex.fromString("(2/3)i").toString());

echo('Abacus.Complex.fromString("1+i")');
echo(Abacus.Complex.fromString("1+i").toString());

echo('Abacus.Complex.fromString("1")');
echo(Abacus.Complex.fromString("1").toString());

echo('Abacus.Complex.fromString("1+0i")');
echo(Abacus.Complex.fromString("1+0i").toString());

echo('Abacus.Complex.fromString("0+1i")');
echo(Abacus.Complex.fromString("0+1i").toString());

echo('Abacus.Complex.fromString("-3/2+(1/2)*i")');
echo(Abacus.Complex.fromString("-3/2+(1/2)*i").toString());

echo('Abacus.Complex.fromString("-0.2+(1/2)*i")');
echo(Abacus.Complex.fromString("-0.2+(1/2)*i").toString());

echo('Abacus.Complex.fromString("-0.2[8]+(1/2)*i")');
echo(Abacus.Complex.fromString("-0.2[8]+(1/2)*i").toString());

echo('Abacus.Complex.fromString("-0.[8]+(1/2)*i")');
echo(Abacus.Complex.fromString("-0.[8]+(1/2)*i").toString());

echo('Abacus.Complex.fromString("-\\frac{3}{2}+\\frac{1}{2}i")');
echo(Abacus.Complex.fromString("-\\frac{3}{2}+\\frac{1}{2}i").toString());

echo('o=Abacus.Complex(Abacus.Arithmetic.I)');
o=Abacus.Complex(Abacus.Arithmetic.I);
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());
echo('o.neg().toString()');
echo(o.neg().toString());
echo('o.conj().toString()');
echo(o.conj().toString());
echo('o.inv().toString()');
echo(o.inv().toString());
echo('o.rev().toString()');
echo(o.rev().toString());
echo('o.rev().toTex()');
echo(o.rev().toTex());
echo('o.rev().neg().toString()');
echo(o.rev().neg().toString());
echo('o.rev().neg().toTex()');
echo(o.rev().neg().toTex());
echo('o.rev().mul(2).toString()');
echo(o.rev().mul(2).toString());
echo('o.rev().mul(2).toTex()');
echo(o.rev().mul(2).toTex());
echo('o.rev().mul(2).neg().toString()');
echo(o.rev().mul(2).neg().toString());
echo('o.rev().mul(2).neg().toTex()');
echo(o.rev().mul(2).neg().toTex());
echo('o.pow(2).toString()');
echo(o.pow(2).toString());

echo();

echo('o=Abacus.Complex(Abacus.Rational.fromString("5/9"), Abacus.Rational.fromDec("0.[3]"))');
o=Abacus.Complex(Abacus.Rational.fromString("5/9"), Abacus.Rational.fromDec("0.[3]"));
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());
echo('o.inv().toString()');
echo(o.inv().toString());
echo('o.inv().toTex()');
echo(o.inv().toTex());
echo('o.neg().toString()');
echo(o.neg().toString());
echo('o.neg().toTex()');
echo(o.neg().toTex());
echo('o.conj().toString()');
echo(o.conj().toString());
echo('o.conj().toTex()');
echo(o.conj().toTex());
echo('o.rev().toString()');
echo(o.rev().toString());
echo('o.rev().toTex()');
echo(o.rev().toTex());

echo('o.add(o.rev()).toString()');
echo(o.add(o.rev()).toString());
echo('o.add(o.rev()).toTex()');
echo(o.add(o.rev()).toTex());

echo('o.mul(o.rev()).toString()');
echo(o.mul(o.rev()).toString());
echo('o.mul(o.rev()).toTex()');
echo(o.mul(o.rev()).toTex());

echo('o.div(o.rev()).toString()');
echo(o.div(o.rev()).toString());
echo('o.div(o.rev()).toTex()');
echo(o.div(o.rev()).toTex());

echo('o.div(o).toString()');
echo(o.div(o).toString());
echo('o.div(o).toTex()');
echo(o.div(o).toTex());

echo('o.pow(2).toString()');
echo(o.pow(2).toString());
echo('o.pow(2).toTex()');
echo(o.pow(2).toTex());

echo();

// (X)GCD, LCM of complex
echo('(X)GCD, LCM of Complex');
echo('Abacus.Complex.xgcd(Abacus.Complex.One(), Abacus.Complex(3))');
check_xgcd([Abacus.Complex.One(), Abacus.Complex(3)]); // 1

echo('Abacus.Complex.xgcd(Abacus.Complex(6), Abacus.Complex(4))');
check_xgcd([Abacus.Complex(6), Abacus.Complex(4)]); // 2

echo('Abacus.Complex.xgcd(Abacus.Complex(11, 7), Abacus.Complex(18, -1))');
check_xgcd([Abacus.Complex(11, 7), Abacus.Complex(18, -1)]); // 1
echo(Abacus.Complex.gcd([Abacus.Complex(11, 7), Abacus.Complex(18, -1)]).toString());

echo('Abacus.Complex.xgcd(Abacus.Complex(135, -14), Abacus.Complex(155, 34))');
check_xgcd([Abacus.Complex(135, -14), Abacus.Complex(155, 34)]); // 12 - 5i
echo(Abacus.Complex.gcd([Abacus.Complex(135, -14), Abacus.Complex(155, 34)]).toString());

echo('Abacus.Complex.xgcd(Abacus.Complex(Abacus.Rational(3,7)), Abacus.Complex(Abacus.Rational(12,22)))');
check_xgcd([Abacus.Complex(Abacus.Rational(3,7)), Abacus.Complex(Abacus.Rational(12,22))]); // 3/77
echo(Abacus.Complex.gcd([Abacus.Complex(Abacus.Rational(3,7)), Abacus.Complex(Abacus.Rational(12,22))]).toString());

echo('Abacus.Complex.xgcd(Abacus.Complex(Abacus.Rational(13,6)), Abacus.Complex(Abacus.Rational(3,4)))');
check_xgcd([Abacus.Complex(Abacus.Rational(13,6)), Abacus.Complex(Abacus.Rational(3,4))]); // 1/12
echo(Abacus.Complex.gcd([Abacus.Complex(Abacus.Rational(13,6)), Abacus.Complex(Abacus.Rational(3,4))]).toString());
