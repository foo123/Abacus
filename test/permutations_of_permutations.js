"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

function print(o)
{
    if (o) echo(o.join(','));
}
function print_all(o, prev, f)
{
    if (-1 === prev)
        while (o.hasNext(-1)) echo(f ? f(o.next(-1)) : o.next(-1).join(','));
    else
        //while (o.hasNext()) echo(o.next());
        // iterator/iterable are supported
        for (let item of o) echo(f ? f(item) : item.join(','));
}

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
let o;

echo('Abacus Algebraic Composition: Permutations OF Permutations (VERSION = '+Abacus.VERSION+')');
echo('---');

//echo('o = Abacus.Permutation(Abacus.Permutation(2), {submethod:"compose"})');
//o = Abacus.Permutation(Abacus.Permutation(2), {submethod:"compose"});
echo('o = Abacus.Permutation(2).multiplyWith(Abacus.Permutation(2))');
o = Abacus.Permutation(2).multiplyWith(Abacus.Permutation(2));

echo('o.total()');
echo(o.total());

echo('o.next()');
print(o.next());

echo('o.hasNext()');
echo(o.hasNext());
echo('o.next()');
print(o.next());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind());

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

echo('o.order("lex|lex").range(1,-1)');
print_all(o.order("lex|lex").range(1,-1));


// dispose
echo('o.dispose()');
o.dispose();


