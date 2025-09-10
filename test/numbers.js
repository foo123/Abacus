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
let o, i;

echo('Abacus.Numbers (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Triangular numbers');
echo('-----------------');
for (i=0; i<=100; i++) echo('Triangular('+i+')='+String(Abacus.Math.polygonal(i,3)));

echo();
echo('Fibonacci numbers');
echo('-----------------');
for (i=0; i<=100; i++) echo('Fibonacci('+i+')='+String(Abacus.Math.fibonacci(i)));

echo();
echo('Catalan numbers');
echo('---------------');
for (i=0; i<=30; i++) echo('Catalan('+i+')='+String(Abacus.Math.catalan(i)));

echo();
echo('Bell numbers');
echo('------------');
for (i=0; i<=30; i++) echo('Bell('+i+')='+String(Abacus.Math.bell(i)));

echo();
echo('Factorial numbers');
echo('-----------------');
for (i=0; i<=30; i++) echo('Factorial('+i+')='+String(Abacus.Math.factorial(i)));
 echo('Factorial(1000)='+String(Abacus.Math.factorial(1000)));
 
echo();
echo('SubFactorial numbers');
echo('--------------------');
for (i=0; i<=30; i++) echo('Subfactorial('+i+')='+String(Abacus.Math.factorial(i,false)));

echo();
echo('Large factorization');
echo('--------------------');
factorize(o=Abacus.Math.factorial(30));
factorize(Abacus.Math.factorial(50));
factorize(Abacus.Math.factorial(1000));
factorize(Abacus.Math.nextPrime(o));