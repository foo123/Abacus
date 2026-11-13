"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

function factor(f)
{
    let Arithmetic = Abacus.Arithmetic;
    return '('+String(f[0])+(Arithmetic.lt(Arithmetic.I, f[1]) ? '^'+String(f[1]) : '')+')';
}
function factorize(n)
{
    let Arithmetic = Abacus.Arithmetic, n2 = Arithmetic.I, i, ps = Abacus.Math.factorize(n);
    for (i=0; i<ps.length; i++) n2 = Arithmetic.mul(n2, Arithmetic.pow(ps[i][0], ps[i][1]));
    console.log(String(n)+'='+ps.map(factor).join('*')+'='+String(n2), Arithmetic.equ(n, n2));
}
let o, i, j;

echo('Abacus.Numbers (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Triangular numbers');
echo('-----------------');
for (i=0; i<=30; ++i) echo('Polygonal.Number('+i+',3)='+String(Abacus.Math.polygonal.number(i,3)));

echo();
echo('Fibonacci numbers');
echo('-----------------');
for (i=0; i<=30; ++i) echo('Fibonacci.Number('+i+')='+String(Abacus.Math.fibonacci.number(i)));

echo();
echo('Catalan numbers');
echo('---------------');
for (i=0; i<=30; ++i) echo('Catalan.Number('+i+')='+String(Abacus.Math.catalan.number(i)));

echo();
echo('Bell numbers');
echo('------------');
for (i=0; i<=30; ++i) echo('Bell.Number('+i+')='+String(Abacus.Math.bell.number(i)));

echo();
echo('Bernoulli numbers');
echo('------------');
for (i=0; i<=30; ++i) echo('Bernoulli.Number('+i+')='+String(Abacus.Math.bernoulli.number(i)));

echo();
echo('Factorial numbers');
echo('-----------------');
for (i=0; i<=30; ++i) echo('Factorial('+i+')='+String(Abacus.Math.factorial(i)));
//echo('Factorial(1000)='+String(Abacus.Math.factorial(1000)));

echo();
echo('SubFactorial numbers');
echo('--------------------');
for (i=0; i<=30; ++i) echo('Subfactorial('+i+')='+String(Abacus.Math.factorial(i,false)));

echo();
echo('Large factorization');
echo('--------------------');
factorize(o=Abacus.Math.factorial(30));
echo();
factorize(Abacus.Math.factorial(100));
echo();
factorize(Abacus.Math.nextPrime(o));

echo();
echo('Fibonacci polynomials');
echo('-----------------');
for (i=0; i<=10; ++i) echo('Fibonacci.Poly('+i+')='+String(Abacus.Math.fibonacci.poly(i)));

echo();
echo('Bernoulli polynomials');
echo('------------');
for (i=0; i<=10; ++i) echo('Bernoulli.Poly('+i+')='+String(Abacus.Math.bernoulli.poly(i)));

echo();
echo('Bell polynomials');
echo('------------');
for (j=0; j<=5; ++j) for (i=0; i<=j; ++i) echo('Bell.Poly('+j+','+i+')='+String(Abacus.Math.bell.poly(j, i)));

echo();
echo('Symmetric polynomials');
echo('------------');
for (j=0; j<=5; ++j) for (i=0; i<=j; ++i) echo('Symmetric.Poly('+i+','+j+')='+String(Abacus.Math.symmetric.poly(i, j)));
