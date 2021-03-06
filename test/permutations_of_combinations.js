var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

function print( o )
{
    if ( o ) echo(o.join(','));
}
function print_all( o, prev, f )
{
    if ( -1 === prev )
        while ( o.hasNext(-1) ) echo( f ? f(o.next(-1)) : o.next(-1).join(',') );
    else
        //while ( o.hasNext() ) echo( o.next() );
        // iterator/iterable are supported
        for(let item of o) echo( f ? f(item) : item.join(',') );
}

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var o;

echo('Abacus Algebraic Composition: Permutations OF Combinations (VERSION = '+Abacus.VERSION+')');
echo('---');

// All Combinations = All Permutations of All Unique Combinations
echo('o = Abacus.Permutation(Abacus.Combination(6,3))');
o = Abacus.Permutation(Abacus.Combination(6,3));

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

echo('o.order("lex").range(-5, -1)');
print_all(o.order("lex").range(-5, -1));


// dispose
echo('o.dispose()');
o.dispose();


