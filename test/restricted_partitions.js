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

echo('Abacus.Partitions (VERSION = '+Abacus.VERSION+')');
echo('---');

// Restricted Partitions

echo('o = Abacus.Partition(7,{"max=":4})');
o = Abacus.Partition(7,{"max=":4});

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind() );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(8,{"max=":4})');
o = Abacus.Partition(8,{"max=":4});

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind() );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(12,{"max=":4})');
o = Abacus.Partition(12,{"max=":4});

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind() );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

// dispose
echo('o.dispose()');
o.dispose();


echo('o = Abacus.Partition(20,{"max=":4})');
o = Abacus.Partition(20,{"max=":4});

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind() );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

// dispose
echo('o.dispose()');
o.dispose();


echo('o = Abacus.Partition(7,{"parts=":4})');
o = Abacus.Partition(7,{"parts=":4});

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind() );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(8,{"parts=":4})');
o = Abacus.Partition(8,{"parts=":4});

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind() );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(12,{"parts=":4})');
o = Abacus.Partition(12,{"parts=":4});

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind() );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(20,{"parts=":4})');
o = Abacus.Partition(20,{"parts=":4});

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind() );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(20,{"parts=":4,"max=":7})');
o = Abacus.Partition(20,{"parts=":4,"max=":7});

echo('o.total()'); 
echo(o.total());

// dispose
echo('o.dispose()');
o.dispose();
