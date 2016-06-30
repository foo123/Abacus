var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;


function print_all( o, prev )
{
    if ( -1 === prev )
        while ( o.hasPrev() ) echo( o.prev() );
    else
        //while ( o.hasNext() ) echo( o.next() );
        // iterator/iterable are supported
        for(let item of o) echo( item );
}

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var o;

echo('Abacus.Permutations (VERSION = '+Abacus.VERSION+')');
echo('---');

// Permutations
echo('o = Abacus.Permutation(4)');
o = Abacus.Permutation(4);

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
print_all( o.rewind() );

echo('backwards');
echo('o.forward()');
print_all( o.forward(), -1 );

echo('o.order("lex,reflected")');
print_all( o.order("lex,reflected") );

echo('o.order("lex,reversed")');
print_all( o.order("lex,reversed") );

echo('o.order("colex")');
print_all( o.order("colex") );

echo('o.order("colex,reflected")');
print_all( o.order("colex,reflected") );

echo('o.order("colex,reversed")');
print_all( o.order("colex,reversed") );

echo('o.order("minimal")');
print_all( o.order("minimal") );

echo('o.order("random")');
print_all( o.order("random") );

echo('o.random()');
echo(o.random());

echo('o.order("colex").range(-5, -1)');
print_all(o.order("colex").range(-5, -1));


echo('o.order("stochastic", [ [ 0, 1, 0, 0 ], [ 1/3, 0, 1/3, 1/3 ], [ 1/3, 0, 1/3, 1/3 ], [ 1/3, 0, 1/3, 1/3 ] ]).range(0, 9)');
print_all(o.order("stochastic", [ [ 0, 1, 0, 0 ], [ 1/3, 0, 1/3, 1/3 ], [ 1/3, 0, 1/3, 1/3 ], [ 1/3, 0, 1/3, 1/3 ] ]).range(0, 9));


// dispose
echo('o.dispose()');
o.dispose();


