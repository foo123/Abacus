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

echo('Abacus Algebraic Composition: k-Derangements (VERSION = '+Abacus.VERSION+')');
echo('---');

// k-Derangements (derangements with exactly k fixed points)= (n,k)-Combinations combinedWith (n-k)-Derangements

echo('o = Abacus.Combination(6,3).combineWith(Abacus.Permutation(6-3,{type:"derangement"}))');
o = Abacus.Combination(6,3).combineWith(Abacus.Permutation(6-3,{type:"derangement"}));

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
print_all( o.rewind(), 1, function(item){
    return [
    item.join(','),
    Abacus.Permutation.is_derangement(item, 3, true) ? 'exactly 3 fixed points' : 'ERROR'
    ];
} );

echo('o = Abacus.Combination(8,4).combineWith(Abacus.Permutation(8-4,{type:"derangement"}))');
o = Abacus.Combination(8,4).combineWith(Abacus.Permutation(8-4,{type:"derangement"}));

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
print_all( o.rewind(), 1, function(item){
    return [
    item.join(','),
    Abacus.Permutation.is_derangement(item, 4, true) ? 'exactly 4 fixed points' : 'ERROR'
    ];
} );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1, function(item){
    return [
    item.join(','),
    Abacus.Permutation.is_derangement(item, 4, true) ? 'exactly 4 fixed points' : 'ERROR'
    ];
} );

echo('o.random()');
echo(o.random());

echo('o.order("lex").range(-5, -1)');
print_all(o.order("lex").range(-5, -1));


// dispose
echo('o.dispose()');
o.dispose();


