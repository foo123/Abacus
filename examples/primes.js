"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = require('../test/biginteger/arithmetic.js');

use_biginteger_arithmetic(Abacus);

let N;

// utility methods
function make_mirror_image(ndigits, first, rest)
{
    if (1 === ndigits)
    {
        return function(item) {
            return first.charAt(item[0]);
        };
    }
    else if (ndigits & 1)
    {
        // odd
        return function(item) {
            let c = first.charAt(item[0]), l = c, r = c, i, n = item.length;
            for (i=1; i+1<n; ++i)
            {
                c = rest.charAt(item[i]);
                l = l + c;
                r = c + r;
            }
            return l + rest.charAt(item[n-1])+ r;
        };
    }
    else
    {
        // even
        return function(item) {
            let c = first.charAt(item[0]), l = c, r = c, i, n = item.length;
            for (i=1; i<n; ++i)
            {
                c = rest.charAt(item[i]);
                l = l + c;
                r = c + r;
            }
            return l + r;
        };
    }
}
function sum_of_two_primes(n)
{
    let Arithmetic = Abacus.Arithmetic,
        p1 = Arithmetic.div(n, 2), p2 = p1, sum;

    if (Abacus.Math.isPrime(p1))
        return String(n) + ' = ' + String(p1) + '+' + String(p2);

    p1 = Abacus.Math.nextPrime(p1, -1); p2 = Abacus.Math.nextPrime(p2);
    do {
        sum = Arithmetic.add(p1, p2);
        if (Arithmetic.equ(sum, n)) return String(n) + ' = ' + String(p1) + '+' + String(p2);
        else if (Arithmetic.lt(sum, n)) p2 = Abacus.Math.nextPrime(p2);
        else if (Arithmetic.gt(sum, n)) p1 = Abacus.Math.nextPrime(p1, -1);
        if (null == p1) return String(n) + ' is not the sum of 2 primes!';
    } while(true);
}

// compute and test prime numbers
function exhaustive_search1(N)
{
    // try filtering from all possible numbers from infinite arithmetic progression
    let o = Abacus.Progression(1 /*start*/, 1 /*step*/, Abacus.Arithmetic.INF /*end*/).filterBy(Abacus.Math.isPrime);
    let primes = o.get(N);
    o.dispose(); // lets free up the memory
    return primes;
}

function exhaustive_search2(N)
{
    // try filtering from all odd numbers only (plus 2) combining one constant and one infinite arithmetic progression
    let o = Abacus.Iterator([Abacus.Progression(2, 0, 2)/*only 2*/, Abacus.Progression(3, 2, Abacus.Arithmetic.INF)/*odds >= 3*/]).filterBy(Abacus.Math.isPrime);
    let primes = o.get(N);
    o.dispose(); // lets free up the memory
    return primes;
}

function sieve(N, filter)
{
    // try a more efficient prime sieve
    let o = Abacus.PrimeSieve().filterBy(filter || null);
    let primes = o.get(N);
    o.dispose(); // lets free up the memory
    return primes;
}

function prime_sequence(p, N)
{
    p = Abacus.Arithmetic.num(p)
    let primes = Abacus.Math.isPrime(p) ? [p] : [];
    while (primes.length < N)
    {
        // get next prime from value of previous run and also store it as current value
        primes.push(p = Abacus.Math.nextPrime(p));
    }
    return primes;
}

function mirror_image_primes(ndigits, N)
{
    if (1 > ndigits) return []; // none

    // since we are looking for mirror images which are also primes
    // and primes are odd, this means the first (and last) digits/symbols
    // can only be one of [1,3,5,7,9], the rest can be anything.
    let o, first = (1 === ndigits ? '2' : '1') + '3579', rest = '0123456789', primes;

    if (1 === ndigits)
    {
        o = Abacus.Tensor([first.length]);
    }
    else if (ndigits & 1)
    {
        // odd
        o = Abacus.Tensor(Abacus.Util.array((ndigits>>1)+1, function(i) {return 0 === i ? first.length : rest.length;}));
    }
    else
    {
        // even
        o = Abacus.Tensor(Abacus.Util.array(ndigits>>1, function(i) {return 0 === i ? first.length : rest.length;}));
    }
    o.mapTo(make_mirror_image(ndigits, first, rest)).filterBy(Abacus.Math.isPrime);
    primes = o.get(N);
    o.dispose();

    return primes;
}

function goldbach(N)
{
    let o = Abacus.Progression(4, 2, Abacus.Arithmetic.INF).mapTo(sum_of_two_primes);
    let result = o.get(N);
    o.dispose();
    return result;
}

N = 100;

echo('Exhaustive Search 1: First '+N+' Primes');
echo(exhaustive_search1(N).map(String).join(','));
echo('----');

echo('Exhaustive Search 2: First '+N+' Primes');
echo(exhaustive_search2(N).map(String).join(','));
echo('----');

echo('Prime Sieve: First '+N+' Primes');
echo(sieve(N).map(String).join(','));
echo('----');

echo('Prime Sequence: First '+N+' Primes');
echo(prime_sequence(1, N).map(String).join(','));
echo('----');


N = 1000000;
echo('Prime Sieve: #Primes < '+N);
echo(sieve(function(prime) {return Abacus.Arithmetic.lt(prime, N);}).length);
echo('----');


N = 100;
echo('First '+N+' Primes which are their own mirror image');
echo(sieve(N, Abacus.Util.is_mirror_image).map(String).join(','));
echo('----');


echo('Primes which are their own mirror image with 5 digits');
echo(mirror_image_primes(5).map(String).join(','));
echo('----');

N = 25;
echo('Goldbach\'s Conjecture (first '+N+' even numbers)');
echo(goldbach(N).join("\n"));
echo('----');
