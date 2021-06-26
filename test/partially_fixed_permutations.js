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

echo('Abacus Algebraic Composition: Permutations w/ Fixed Partial Data (VERSION = '+Abacus.VERSION+')');
echo('---');

// Permutations w/ Fixed Partial Data = (n-k)-Permutations completed w/ k-Fixed values
echo('6-Permutations where 0th position can have 0,1,2 values and 4th position can have 3,4 values')
echo('o = Abacus.Tensor(Abacus.Permutation(6-2),{type:"partial",data:[[0,3],[0,4],[1,3],[1,4],[2,3],[2,4]],position:[0,4]})');
o = Abacus.Tensor(Abacus.Permutation(6-2),{type:"partial",data:[[0,3],[0,4],[1,3],[1,4],[2,3],[2,4]],position:[0,4]});

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


