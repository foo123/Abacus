var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

function print_all( o, prev, f )
{
    if ( -1 === prev )
        while ( o.hasNext(-1) ) echo( f ? f(o.next(-1)) : o.next(-1) );
    else
        //while ( o.hasNext() ) echo( o.next() );
        // iterator/iterable are supported
        for(let item of o) echo( f ? f(item) : item );
}

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var o;

echo('Abacus Algebraic Composition: Permutations w/ Partial Conditions (VERSION = '+Abacus.VERSION+')');
echo('---');

// Permutations w/ Partial Conditions = (n-k)-Permutations completed w/ k-Conditional values
echo('6-Permutations where (unique)values in 0th position ARE (0,1,2) and in 4th position ARE NOT (3,4)')
//echo('o = Abacus.Tensor(Abacus.Permutation(6-2),{type:"partial",data:[[true,0,1,2],[false,3,4]],ordering:"!=",position:[0,4]})');
//o = Abacus.Tensor(Abacus.Permutation(6-2),{type:"partial",data:[[true,0,1,2],[false,3,4]],ordering:"!=",position:[0,4]});
echo('o = Abacus.Tensor(6,{type:"partial",data:[[true,0,1,2],[false,3,4]],ordering:"<>",position:[0,4]}).completeWith(Abacus.Permutation(6-2))');
o = Abacus.Tensor(6,{type:"partial",data:[[true,0,1,2],[false,3,4]],ordering:"<>",position:[0,4]}).completeWith(Abacus.Permutation(6-2));

echo('o.dimension()'); 
echo(o.dimension());

echo('o.total()'); 
echo(o.total());

echo('o.next()'); 
echo(o.next());

echo('o.hasNext()');
echo(o.hasNext());
echo('o.next()');
echo(o.next());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind());

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
echo(o.random());


// dispose
echo('o.dispose()');
o.dispose();


