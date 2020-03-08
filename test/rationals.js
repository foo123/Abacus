var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;
var use_biginteger_arithmetic = require('./biginteger/arithmetic.js');

use_biginteger_arithmetic( Abacus );

function check_xgcd( args )
{
    var out = '', res = Abacus.Rational.Zero(), gcd = Abacus.Rational.xgcd(args);
    for(i=0; i<args.length; i++)
    {
        out += (out.length ? ' + ' : '') + '('+args[i].toString()+')'+'('+gcd[i+1].toString()+')';
        res = res.add(args[i].mul(gcd[i+1]));
    }
    out += ' = '+gcd[0].toString();
    echo(out, res.toString(), res.equ(gcd[0]));
}

var o, i;

echo('Abacus.Rationals (VERSION = '+Abacus.VERSION+')');
echo('---');

//Abacus.Rational.autoSimplify = true; // default

echo('o=Abacus.Rational()');
o=Abacus.Rational();
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());

echo();

echo('o=Abacus.Rational.rnd01()');
o=Abacus.Rational.rnd01();
echo('o.toString()');
echo(o.toString());
echo('o.toDec()');
echo(o.toDec());

echo();

echo('o=Abacus.Rational.rnd("0.5","1")');
o=Abacus.Rational.rnd("0.5","1");
echo('o.toString()');
echo(o.toString());
echo('o.toDec()');
echo(o.toDec());
echo('o.rad(2).toString()');
echo(o.rad(2).toString());
//echo('o.sub(o.rad(2).pow(2)).toString()');
//echo(o.sub(o.rad(2).pow(2)).toString());

echo();

echo('Abacus.Rational(1).rad(2)');
echo(Abacus.Rational(1).rad(2).toString());
echo('Abacus.Rational(4).rad(2)');
echo(Abacus.Rational(4).rad(2).toString());
echo('Abacus.Rational(9).rad(2)');
echo(Abacus.Rational(9).rad(2).toString());
echo('Abacus.Rational(27).rad(3)');
echo(Abacus.Rational(27).rad(3).toString());
echo('Abacus.Rational(1,3).pow(2).rad(2)');
echo(Abacus.Rational(1,3).pow(2).rad(2).toString());

echo();


echo('o=Abacus.Rational.fromString("5/9")');
o=Abacus.Rational.fromString("5/9");
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());
echo('o.toDec(2)');
echo(o.toDec(2));
echo('o.toDec(7)');
echo(o.toDec(7));
echo('o.rad(2).toString()');
echo(o.rad(2).toString());
echo('o.sub(o.rad(2).pow(2)).toString()');
echo(o.sub(o.rad(2).pow(2)).toString());
echo('Abacus.Rational.fromString(o.toDec()).toString()');
echo(Abacus.Rational.fromString(o.toDec()).toString());
echo('Abacus.Rational.fromString(o.toTex()).toString()');
echo(Abacus.Rational.fromString(o.toTex()).toString());
echo('Abacus.Rational(5, 9).toString()');
echo(Abacus.Rational(5, 9).toString());
echo('Abacus.Rational("5", 9).toString()');
echo(Abacus.Rational("5", 9).toString());
echo('o.inv().toString()');
echo(o.inv().toString());
echo('o.inv().toTex()');
echo(o.inv().toTex());
echo('o.inv().toDec()');
echo(o.inv().toDec());
echo('o.neg().toString()');
echo(o.neg().toString());
echo('o.neg().toTex()');
echo(o.neg().toTex());
echo('o.neg().toDec()');
echo(o.neg().toDec());

echo();

echo('o=Abacus.Rational.fromString("0.[5]")');
o=Abacus.Rational.fromString("0.[5]");
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());
echo('o.toDec(2)');
echo(o.toDec(2));
echo('o.toDec(7)');
echo(o.toDec(7));

echo();

echo('o=Abacus.Rational.fromString("3.125e7")');
o=Abacus.Rational.fromString("3.125e7");
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());

echo();

echo('o=Abacus.Rational.fromIntRem(3, 1, 3)');
o=Abacus.Rational.fromIntRem(3, 1, 3);
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());
echo('[o.integer(), o.remainder()]');
echo([String(o.integer()), String(o.remainder())]);

echo();

echo('o=Abacus.Rational.fromDec("0.[5]").add(Abacus.Rational.fromDec("0.[3]"))');
o=Abacus.Rational.fromDec("0.[5]").add(Abacus.Rational.fromDec("0.[3]"));
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());
echo('o.toDec(2)');
echo(o.toDec(2));
echo('o.toDec(7)');
echo(o.toDec(7));

echo();

echo('o=Abacus.Rational.fromDec("0.[5]").mul(Abacus.Rational.fromDec("0.[3]"))');
o=Abacus.Rational.fromDec("0.[5]").mul(Abacus.Rational.fromDec("0.[3]"));
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.toDec()');
echo(o.toDec());
echo('o.toDec(2)');
echo(o.toDec(2));
echo('o.toDec(7)');
echo(o.toDec(7));

echo();

echo('o=Abacus.Rational.fromString("0.[5]").equ(Abacus.Rational.fromString("5/9"))');
echo(Abacus.Rational.fromString("0.[5]").equ(Abacus.Rational.fromString("5/9")));

// Decimals to Fractions
echo('Decimals to Fractions (with optional repeating decimals)');
echo('o=Abacus.Rational.fromDec(-3)');
echo(String(o=Abacus.Rational.fromDec(-3)));

echo('o=Abacus.Rational.fromDec("-3.0")');
echo(String(o=Abacus.Rational.fromDec("-3.0")));

echo('o=Abacus.Rational.fromDec("-3.[0]")');
echo(String(o=Abacus.Rational.fromDec("-3.[0]")));

echo('o=Abacus.Rational.fromDec(0.9)');
echo(String(o=Abacus.Rational.fromDec(0.9)));

echo('o=Abacus.Rational.fromDec("0.[9]")');
echo(String(o=Abacus.Rational.fromDec("0.[9]")));

echo('o=Abacus.Rational.fromDec(0.5)');
echo(String(o=Abacus.Rational.fromDec(0.5)));

echo('o=Abacus.Rational.fromDec("0.[5]")');
echo(String(o=Abacus.Rational.fromDec("0.[5]")));

echo('o=Abacus.Rational.fromDec("0.55[5]")');
echo(String(o=Abacus.Rational.fromDec("0.55[5]")));

echo('o=Abacus.Rational.fromDec("0.555[55]")');
echo(String(o=Abacus.Rational.fromDec("0.555[55]")));

echo('o=Abacus.Rational.fromDec("0.[3]")');
echo(String(o=Abacus.Rational.fromDec("0.[3]")));

echo('o=Abacus.Rational.fromDec("0.1[6]")');
echo(String(o=Abacus.Rational.fromDec("0.1[6]")));

echo('o=Abacus.Rational.fromDec("0.1[7]")');
echo(String(o=Abacus.Rational.fromDec("0.1[7]")));

echo('o=Abacus.Rational.fromDec("3.[3]")');
echo(String(o=Abacus.Rational.fromDec("3.[3]")));

echo('o=Abacus.Rational.fromDec("1.0[42]")');
echo(String(o=Abacus.Rational.fromDec("1.0[42]")));

echo('o=Abacus.Rational.fromDec("1.04242[42]")');
echo(String(o=Abacus.Rational.fromDec("1.04242[42]")));

echo('---');

// Fractions to Decimals
echo('Fractions to Decimals (with optional repeating decimals)');
echo('o=Abacus.Rational.fromString("-3/1").toDec()');
echo(String(o=Abacus.Rational.fromString("-3/1").toDec()));

echo('o=Abacus.Rational.fromString("-3/-1").toDec()');
echo(String(o=Abacus.Rational.fromString("-3/-1").toDec()));

echo('o=Abacus.Rational.fromString("1/6").toDec()');
echo(String(o=Abacus.Rational.fromString("1/6").toDec()));

echo('o=Abacus.Rational.fromString("5/9").toDec()');
echo(String(o=Abacus.Rational.fromString("5/9").toDec()));

echo('o=Abacus.Rational.fromString("9/10").toDec()');
echo(String(o=Abacus.Rational.fromString("9/10").toDec()));

echo('o=Abacus.Rational.fromString("172/165").toDec()');
echo(String(o=Abacus.Rational.fromString("172/165").toDec()));

echo('o=Abacus.Rational.fromString("0.12566").toDec(4)');
echo(String(o=Abacus.Rational.fromString("0.12566").toDec(4)));

echo('o=Abacus.Rational.fromString("0.99999").toDec(4)');
echo(String(o=Abacus.Rational.fromString("0.99999").toDec(4)));

echo('o=Abacus.Rational.fromString("-9.99999").toDec(4)');
echo(String(o=Abacus.Rational.fromString("-9.99999").toDec(4)));

echo('o=Abacus.Rational.fromString("-9.99999").toDec(0)');
echo(String(o=Abacus.Rational.fromString("-9.99999").toDec(0)));

echo('o=Abacus.Rational.fromString("0.9[5]").toDec(4)');
echo(String(o=Abacus.Rational.fromString("0.9[5]").toDec(4)));

echo('o=Abacus.Rational.fromString("0.999[5]").toDec(4)');
echo(String(o=Abacus.Rational.fromString("0.999[5]").toDec(4)));

echo('o=Abacus.Rational.fromString("1.11").round()');
echo(String(o=Abacus.Rational.fromString("1.11").round()));

echo('o=Abacus.Rational.fromString("-1.11").round()');
echo(String(o=Abacus.Rational.fromString("-1.11").round()));

echo('o=Abacus.Rational.fromString("1.75").round()');
echo(String(o=Abacus.Rational.fromString("1.75").round()));

echo('o=Abacus.Rational.fromString("-1.75").round()');
echo(String(o=Abacus.Rational.fromString("-1.75").round()));

echo('---');

// Continued Fractions
echo('Continued Fractions');

echo('Abacus.Rational.fromString("3.14").toContFrac()');
echo(Abacus.Rational.fromString("3.14").toContFrac());

echo('Abacus.Rational.fromString("3.1415926535897932384626433").toContFrac()');
echo(Abacus.Rational.fromString("3.1415926535897932384626433").toContFrac());

echo('---');

// Approximations
echo('Approximations');

echo('Abacus.Rational.fromString("3.14").approximate(100).toString()');
echo(Abacus.Rational.fromString("3.14").approximate(100).toString());

echo('Abacus.Rational.fromString("3.1415926535897932384626433").approximate(100).toString()');
echo(Abacus.Rational.fromString("3.1415926535897932384626433").approximate(100).toString());

echo('Abacus.Rational.fromString("3.1415926535897932384626433").approximate(200).toString()');
echo(Abacus.Rational.fromString("3.1415926535897932384626433").approximate(200).toString());

echo('---');

// (X)GCD, LCM of rational
echo('(X)GCD, LCM of Rationals');
echo('Abacus.Rational.xgcd(Abacus.Rational.One(), Abacus.Rational(3))');
check_xgcd([Abacus.Rational.One(), Abacus.Rational(3)]);

echo('Abacus.Rational.xgcd(Abacus.Rational(6), Abacus.Rational(4))');
check_xgcd([Abacus.Rational(6), Abacus.Rational(4)]);

echo('Abacus.Rational.xgcd(Abacus.Rational(12), Abacus.Rational(6), Abacus.Rational(3))');
check_xgcd([Abacus.Rational(12), Abacus.Rational(6), Abacus.Rational(3)]);

echo('Abacus.Rational.xgcd(Abacus.Rational(3,7), Abacus.Rational(12,22))');
check_xgcd([Abacus.Rational(3,7), Abacus.Rational(12,22)]); // 3/77
echo(Abacus.Rational.gcd([Abacus.Rational(3,7), Abacus.Rational(12,22)]).toString());

echo('Abacus.Rational.xgcd(Abacus.Rational(13,6), Abacus.Rational(3,4))');
check_xgcd([Abacus.Rational(13,6), Abacus.Rational(3,4)]); // 1/12
echo(Abacus.Rational.gcd([Abacus.Rational(13,6), Abacus.Rational(3,4)]).toString());

echo('Abacus.Rational.xgcd(Abacus.Rational(1,3), Abacus.Rational(3,4), Abacus.Rational(3))');
check_xgcd([Abacus.Rational(1,3), Abacus.Rational(3,4), Abacus.Rational(3)]); // 1/12
echo(Abacus.Rational.gcd([Abacus.Rational(1,3), Abacus.Rational(3,4), Abacus.Rational(3)]).toString());