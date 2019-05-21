var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

function print_all( o, prev, f )
{
    if ( -1 === prev )
    {
        var item;
        while ( o.hasNext(-1) && (item=o.next(-1)) ) echo( f ? f(item) : item );
    }
    else
        //while ( o.hasNext() ) echo( o.next() );
        // iterator/iterable are supported
        for(let item of o) echo( f ? f(item) : item );
}

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var o;

echo('Abacus.Combinatorics (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Another way to generate N-Permutations from appropriate (1,2,..,N-1,N)-Tensors');
echo('o = Abacus.Tensor(1,2,3,{"output":"inversion"})');
o = Abacus.Tensor(1,2,3,{"output":"inversion"});

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order (for original tensor)');
print_all( o );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

o.dispose();

echo("\n");

echo('Still another way to generate N-Permutations from appropriate Tensors, recursive this time, including generating all N-1 Permutations along the way..');
echo('o = Abacus.Tensor(3).intersperseWith(Abacus.Tensor(2).intersperseWith(Abacus.Tensor(1)))');
o = Abacus.Tensor(3).intersperseWith(Abacus.Tensor(2).intersperseWith(Abacus.Tensor(1)));

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order (for original tensor)');
print_all( o );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

o.dispose();

echo("\n");

echo('Still another way to generate N-Permutations incrementaly from appropriate Tensors and previous N-1-Permutations');
echo('o = Abacus.Tensor(3).intersperseWith(Abacus.Permutation(2))');
o = Abacus.Tensor(3).intersperseWith(Abacus.Permutation(2));

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order (for original tensor)');
print_all( o );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

o.dispose();

echo("\n");
