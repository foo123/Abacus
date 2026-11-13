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
    console.log(String(n)+'='+ps.map(factor).join('')+'='+String(n2),Arithmetic.equ(n, n2));
}
let o, i, j;

echo('Abacus.Numbers (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Triangular numbers');
echo('-----------------');
for (i=0; i<=100; ++i) echo('Triangular('+i+')='+String(Abacus.Math.number.polygonal(i,3)));

echo();
echo('Fibonacci numbers');
echo('-----------------');
for (i=0; i<=100; ++i) echo('Fibonacci('+i+')='+String(Abacus.Math.number.fibonacci(i)));

echo();
echo('Catalan numbers');
echo('---------------');
for (i=0; i<=30; ++i) echo('Catalan('+i+')='+String(Abacus.Math.number.catalan(i)));

echo();
echo('Bell numbers');
echo('------------');
for (i=0; i<=30; ++i) echo('Bell('+i+')='+String(Abacus.Math.number.bell(i)));

echo();
echo('Bernoulli numbers');
echo('------------');
for (i=0; i<=30; ++i) echo('Bernoulli('+i+')='+String(Abacus.Math.number.bernoulli(i)));

echo();
echo('Factorial numbers');
echo('-----------------');
for (i=0; i<=30; ++i) echo('Factorial('+i+')='+String(Abacus.Math.factorial(i)));
 echo('Factorial(1000)='+String(Abacus.Math.factorial(1000)));

echo();
echo('SubFactorial numbers');
echo('--------------------');
for (i=0; i<=30; ++i) echo('Subfactorial('+i+')='+String(Abacus.Math.factorial(i,false)));

echo();
echo('Large factorization');
echo('--------------------');
factorize(o=Abacus.Math.factorial(30));
factorize(Abacus.Math.factorial(50));
factorize(Abacus.Math.factorial(1000));
factorize(Abacus.Math.nextPrime(o));

echo();
echo('Fibonacci polynomials');
echo('-----------------');
for (i=0; i<=10; ++i) echo('FibonacciPoly('+i+')='+String(Abacus.Math.poly.fibonacci(i)));

echo();
echo('Bernoulli polynomials');
echo('------------');
for (i=0; i<=10; ++i) echo('BernoulliPoly('+i+')='+String(Abacus.Math.poly.bernoulli(i)));

echo();
echo('Bell polynomials');
echo('------------');
for (j=0; j<=5; ++j) for (i=0; i<=j; ++i) echo('BellPoly('+j+','+i+')='+String(Abacus.Math.poly.bell(j, i)));

echo();
echo('Symmetric polynomials');
echo('------------');
for (j=0; j<=5; ++j) for (i=0; i<=j; ++i) echo('SymmetricPoly('+i+','+j+')='+String(Abacus.Math.poly.symmetric(i, j)));
