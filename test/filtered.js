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

echo('Abacus.Combinatorics Filtered Combinatorial Objects (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Get all Permutations filtered from all possible Tuples (an inefficient way to generate permutations)');
echo('o = Abacus.Tensor(3,3,{"type":"tuple"}).filterBy(Abacus.Filter.UNIQUE())');
o = Abacus.Tensor(3,3,{"type":"tuple"}).filterBy(Abacus.Filter.UNIQUE());

echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
print_all( o );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

o.dispose();

echo("\n");

echo('Get all Combinations filtered from all possible Tuples (an inefficient way to generate combinations)');
echo('o = Abacus.Tensor(3,6,{"type":"tuple"}).filterBy(Abacus.Filter.SORTED("<"))');
o = Abacus.Tensor(3,6,{"type":"tuple"}).filterBy(Abacus.Filter.SORTED("<"));

echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
print_all( o );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

o.dispose();

echo("\n");

echo('Get all Combinations filtered from all possible Subsets (an inefficient way to generate combinations)');
echo('o = Abacus.Subset(6).filterBy(Abacus.Filter.LEN(3))');
o = Abacus.Subset(6).filterBy(Abacus.Filter.LEN(3));

echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
print_all( o );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

o.dispose();

echo("\n");

echo('Get all Variations filtered from all possible Tuples (an inefficient way to generate variations)');
echo('o = Abacus.Tensor(3,6,{"type":"tuple"}).filterBy(Abacus.Filter.UNIQUE()');
o = Abacus.Tensor(3,6,{"type":"tuple"}).filterBy(Abacus.Filter.UNIQUE());

echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
print_all( o );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

o.dispose();

echo("\n");

echo('Get all Repeated Combinations filtered from all possible Tuples (an inefficient way to generate combinations)');
echo('o = Abacus.Tensor(3,6,{"type":"tuple"}).filterBy(Abacus.Filter.SORTED("<=")');
o = Abacus.Tensor(3,6,{"type":"tuple"}).filterBy(Abacus.Filter.SORTED("<="));

echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
print_all( o );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

o.dispose();

echo("\n");

