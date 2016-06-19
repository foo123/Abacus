var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;
var bigInt = require('./BigInteger.js');

// plug-in bigInteger arithmetic routines
Abacus.ARITHMETIC.equ = function(a, b){ return bigInt(a).eq(bigInt(b)); };
Abacus.ARITHMETIC.gte = function(a, b){ return bigInt(a).geq(bigInt(b)); };
Abacus.ARITHMETIC.lte = function(a, b){ return bigInt(a).leq(bigInt(b)); };
Abacus.ARITHMETIC.gt = function(a, b){ return bigInt(a).gt(bigInt(b)); };
Abacus.ARITHMETIC.lt = function(a, b){ return bigInt(a).lt(bigInt(b)); };
Abacus.ARITHMETIC.add = function(a, b){ return bigInt(a).plus(bigInt(b)); };
Abacus.ARITHMETIC.sub = function(a, b){ return bigInt(a).minus(bigInt(b)); };
Abacus.ARITHMETIC.mul = function(a, b){ return bigInt(a).times(bigInt(b)); };
Abacus.ARITHMETIC.div = function(a, b){ return bigInt(a).over(bigInt(b)); };
Abacus.ARITHMETIC.mod = function(a, b){ return bigInt(a).mod(bigInt(b)); };
Abacus.ARITHMETIC.shl = function(a, b){ return bigInt(a).shiftLeft(bigInt(b)); };
Abacus.ARITHMETIC.shr = function(a, b){ return bigInt(a).shiftRight(bigInt(b)); };
Abacus.ARITHMETIC.pow = function(a, b){ return bigInt(a).pow(bigInt(b)); };
Abacus.ARITHMETIC.rnd = function(a, b){ return bigInt.randBetween(bigInt(a),bigInt(b)); };
Abacus.ARITHMETIC.min = bigInt.min;
Abacus.ARITHMETIC.max = bigInt.max;

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var o, i;

echo('Abacus.Permutations (VERSION = '+Abacus.VERSION+')');
echo('---');

// Permutations
echo('o = Abacus.Permutation(50)');
o = Abacus.Permutation(50);

echo('o.total()'); 
echo(String(o.total()));
/*
echo('default order is "lex", lexicographic-order');

echo('o.next()'); 
echo(o.next());

echo('o.hasNext()');
echo(o.hasNext());
echo('o.next()');
echo(o.next());
*/
/*
echo('o.rewind()');
o.rewind();
for(i=0; i<10&&o.hasNext(); i++) echo (o.next());

echo('o.forward()');
o.forward();
for(i=0; i<10&&o.hasNext(); i++) echo (o.prev());

echo('o.order("revlex")');
o.order("revlex");
for(i=0; i<10&&o.hasNext(); i++) echo (o.next());

echo('o.order("colex")');
o.order("colex");
for(i=0; i<10&&o.hasNext(); i++) echo (o.next());

echo('o.order("revcolex")');
o.order("revcolex");
for(i=0; i<10&&o.hasNext(); i++) echo (o.next());
*/

echo('o.random()');
echo(o.random());

echo('o.item(78043612608166064768844377641568960512000000000000,"lex")');
echo(o.item(bigInt("78043612608166064768844377641568960512000000000000"),"lex"));

echo('o.item(78043612608166064768844377641568960512000000000000,"colex")');
echo(o.item(bigInt("78043612608166064768844377641568960512000000000000"),"colex"));

echo('o.item(78043612608166064768844377641568960512000000000000,"revlex")');
echo(o.item(bigInt("78043612608166064768844377641568960512000000000000"),"revlex"));

echo('o.item(78043612608166064768844377641568960512000000000000,"revcolex")');
echo(o.item(bigInt("78043612608166064768844377641568960512000000000000"),"revcolex"));

// dispose
echo('o.dispose()');
o.dispose();


