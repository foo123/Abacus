var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

function print( o )
{
    if ( o ) echo(o.map(x=>'{'+x.join(',')+'}').join(','));
}
function print_all( o, prev, f )
{
    var count = 0;
    if ( -1 === prev )
        while ( o.hasNext(-1) ) {count++; echo( f ? f(o.next(-1)) : o.next(-1).map(x=>'{'+x.join(',')+'}').join(',') );}
    else
        //while ( o.hasNext() ) echo( o.next() );
        // iterator/iterable are supported
        for(let item of o) {count++; echo( f ? f(item) : item.map(x=>'{'+x.join(',')+'}').join(',') );}
    echo(count);
}

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var o;

echo('Abacus.SetPartitions (VERSION = '+Abacus.VERSION+')');
echo('---');

// SetPartitions

echo('o = Abacus.SetPartition(2)');
o = Abacus.SetPartition(2);

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
print_all(o.rewind());

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.order("lex,reflected")');
print_all( o.order("lex,reflected") );

echo('o.order("lex,reversed")');
print_all( o.order("lex,reversed") );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.SetPartition(3)');
o = Abacus.SetPartition(3);

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all(o.rewind());

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.order("lex,reflected")');
print_all( o.order("lex,reflected") );

echo('o.order("lex,reversed")');
print_all( o.order("lex,reversed") );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.SetPartition(4, {"parts=":2})');
o = Abacus.SetPartition(4, {"parts=":2});

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all(o.rewind());

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.SetPartition(4, {"parts=":3})');
o = Abacus.SetPartition(4, {"parts=":3});

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all(o.rewind());

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.SetPartition(5, {"parts=":3})');
o = Abacus.SetPartition(5, {"parts=":3});

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all(o.rewind());

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.SetPartition(6, {"parts=":5})');
o = Abacus.SetPartition(6, {"parts=":5});

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all(o.rewind());

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.SetPartition(7, {"parts=":5})');
o = Abacus.SetPartition(7, {"parts=":5});

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all(o.rewind());

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.SetPartition(9, {"parts=":6})');
o = Abacus.SetPartition(9, {"parts=":6});

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all(o.rewind());

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.SetPartition(6)');
o = Abacus.SetPartition(6);

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all(o.rewind());

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.order("lex,reflected")');
print_all( o.order("lex,reflected") );

echo('o.order("lex,reversed")');
print_all( o.order("lex,reversed") );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.SetPartition(9)');
o = Abacus.SetPartition(9);

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
print_all( o.rewind() );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.order("lex,reflected")');
print_all( o.order("lex,reflected") );

echo('o.order("lex,reversed")');
print_all( o.order("lex,reversed") );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();
