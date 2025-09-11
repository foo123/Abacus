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

echo('Abacus Algebraic Composition: Permutations w/ Partial Boolean & Algebraic Conditions (VERSION = '+Abacus.VERSION+')');
echo('---');

// Permutations w/ Partial Boolean & Algebraic Conditions = (n-k)-Permutations completed w/ k-Conditional values
echo('6-Permutations where (unique)values in 0th position ARE (0,1,2), in 4th position ARE NOT (3,4) and in 5th = (4)+1')
echo('o = Abacus.Tensor(6,{type:"partial",data:[[true,0,1,2],[false,3,4],"[4]+1"],ordering:"<>",position:[0,4,5]}).completeWith(Abacus.Permutation(6-3))');
o = Abacus.Tensor(6,{type:"partial",data:[[true,0,1,2],[false,3,4],"[4]+1"],ordering:"<>",position:[0,4,5]}).completeWith(Abacus.Permutation(6-3));

//echo(o.$.position);
//echo(o.$.data);

echo('o.dimension()');
echo(o.dimension());

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

// dispose
echo('o.dispose()');
o.dispose();

echo();
echo('o = Abacus.Tensor(7,{type:"partial",data:["{0..4}","[0]+1","[1]+1","[3]-1","[4]-1"],ordering:"<>",position:[0,1,2,4,5]}).completeWith(Abacus.Permutation(7-5))');
o = Abacus.Tensor(7,{type:"partial",data:["{0..4}","[0]+1","[1]+1","[3]-1","[4]-1"],ordering:"<>",position:[0,1,2,4,5]}); o.completeWith(Abacus.Permutation(7-o.dimension()));

//echo(o.$.position);
//echo(o.$.data);

echo('o.dimension()');
echo(o.dimension());

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

// dispose
echo('o.dispose()');
o.dispose();

echo('Abacus.Tensor(6,{type:"partial",data:{0:"{0..4}",1:"[0]+1",2:"[0]+[1]"},ordering:"<>"}).completeWith(Abacus.Permutation(6-3))');
o = Abacus.Tensor(6,{type:"partial",data:{0:"{0..4}",1:"[0]+1",2:"[0]+[1]"},ordering:"<>"}).completeWith(Abacus.Permutation(6-3));

echo('o.total()');
echo(o.total());

echo('o.rewind()');
print_all( o.rewind());

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('Abacus.Tensor(6,{type:"partial",data:{0:"{0..4}",1:"[0]+1",2:"[0]+[1]",3:"5"},ordering:"<>"}).completeWith(Abacus.Permutation(6-4))');
o = Abacus.Tensor(6,{type:"partial",data:{0:"{0..4}",1:"[0]+1",2:"[0]+[1]",3:"5"},ordering:"<>"}).completeWith(Abacus.Permutation(6-4));

echo('o.total()');
echo(o.total());

echo('o.rewind()');
print_all( o.rewind());

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();
