"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);


let o;

function factor(f)
{
    return '(' + String(f[0]) + (1<f[1] ? ('^' + String(f[1])) : '') + ')';
}

echo('Abacus.Primes (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Division Wheels');
echo('Abacus.Util.wheel(2)');
echo(Abacus.Util.wheel(2));

echo('Abacus.Util.wheel(2,3)');
echo(Abacus.Util.wheel(2,3));

echo('Abacus.Util.wheel(2,3,5)');
echo(Abacus.Util.wheel(2,3,5));

//echo('Abacus.Util.wheel(2,3,5,7)');
//echo(Abacus.Util.wheel(2,3,5,7));
echo('---');


echo('Primality Tests');
for (let i=1; i<1000; i++)
{
    if (Abacus.Math.isProbablePrime(i))
        echo(''+i+' Probable Prime '+(Abacus.Math.isPrime(i) ? '(Prime)' : '(Not Prime)'));
}
echo('---');

echo('Primes');
echo('o=Abacus.Math.nextPrime(2000000)');
echo(o=Abacus.Math.nextPrime(2000000));

echo('o=Abacus.Math.nextPrime(2000000,-1)');
echo(o=Abacus.Math.nextPrime(2000000,-1));

echo('---');

echo('o=Abacus.PrimeSieve().get(100000).filter(Abacus.Math.isPrime).length');
o=Abacus.PrimeSieve();
echo(o.get(100000).filter(Abacus.Math.isPrime).length);
o.dispose();
echo('o=Abacus.PrimeSieve().get(function(p){return p < 1000000;}).length');
o=Abacus.PrimeSieve();
echo(o.get(function(p) {return p < 1000000;}).length);
o.dispose();

echo('---');

echo('Prime Factorization');
echo('o=Abacus.Math.factorize(2)');
echo(Abacus.Math.factorize(2).map(factor).join(''));

echo('o=Abacus.Math.factorize(17)');
echo(Abacus.Math.factorize(17).map(factor).join(''));

echo('o=Abacus.Math.factorize(12345)');
echo(Abacus.Math.factorize(12345).map(factor).join(''));

echo('o=Abacus.Math.factorize(2000000)');
echo(Abacus.Math.factorize(2000000).map(factor).join(''));

echo('o=Abacus.Math.factorize(Abacus.Math.nextPrime(2000000))');
echo(Abacus.Math.factorize(Abacus.Math.nextPrime(2000000)).map(factor).join(''));

echo('---');
