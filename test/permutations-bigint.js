"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
let o, i;

echo('Abacus.Permutations (VERSION = '+Abacus.VERSION+')');
echo('---');

// Permutations
echo('o = Abacus.Permutation(50)');
o = Abacus.Permutation(50);

echo('o.dimension()');
echo(o.dimension());

echo('o.total()');
echo(String(o.total()));

echo('o.random()');
echo(o.random().join(','));

echo('o.item(78043612608166064768844377641568960512000000000000,"lex")');
echo(o.item("78043612608166064768844377641568960512000000000000","lex").join(','));

echo('o.item(78043612608166064768844377641568960512000000000000,"colex")');
echo(o.item("78043612608166064768844377641568960512000000000000","colex").join(','));

echo('o.item(78043612608166064768844377641568960512000000000000,"revlex")');
echo(o.item("78043612608166064768844377641568960512000000000000","revlex").join(','));

echo('o.item(78043612608166064768844377641568960512000000000000,"revcolex")');
echo(o.item("78043612608166064768844377641568960512000000000000","revcolex").join(','));

echo('o.order("lex").range(30414093201713378043612608166064768844377641568960511999999999998)');
echo(o.order("lex").range("30414093201713378043612608166064768844377641568960511999999999998").map(function(x){return x.join(',')}).join("\n"));

// dispose
echo('o.dispose()');
o.dispose();


