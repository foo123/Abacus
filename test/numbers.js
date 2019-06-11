var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;
var use_biginteger_arithmetic = require('./biginteger/arithmetic.js');

use_biginteger_arithmetic( Abacus );


var o, i;

echo('Abacus.Numbers (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Triangular numbers');
echo('-----------------');
for(i=0; i<=100; i++) echo('Triangular('+i+')='+String(Abacus.Math.polygonal(i,3)));

echo('Fibonacci numbers');
echo('-----------------');
for(i=0; i<=100; i++) echo('Fibonacci('+i+')='+String(Abacus.Math.fibonacci(i)));

echo('Catalan numbers');
echo('---------------');
for(i=0; i<=30; i++) echo('Catalan('+i+')='+String(Abacus.Math.catalan(i)));

echo('Bell numbers');
echo('------------');
for(i=0; i<=30; i++) echo('Bell('+i+')='+String(Abacus.Math.bell(i)));

echo('Factorial numbers');
echo('-----------------');
for(i=0; i<=30; i++) echo('Factorial('+i+')='+String(Abacus.Math.factorial(i)));

echo('SubFactorial numbers');
echo('--------------------');
for(i=0; i<=30; i++) echo('Subfactorial('+i+')='+String(Abacus.Math.factorial(i,false)));
