var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

function print_all( o, prev, f )
{
    var count = 0;
    if ( -1 === prev )
        while ( o.hasNext(-1) ) {count++; echo( f ? f(o.next(-1)) : o.next(-1).join('') );}
    else
        //while ( o.hasNext() ) echo( o.next() );
        // iterator/iterable are supported
        for(let item of o) {count++; echo( f ? f(item) : item.join('') );}
}

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var o;

echo('Abacus.CatalanWords (VERSION = '+Abacus.VERSION+')');
echo('---');

// Binary Trees / Balanced Parentheses / Cataln Words

echo('o = Abacus.CatalanWord(1)');
o = Abacus.CatalanWord(1);

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind() );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.order("lex,reflected")');
print_all( o.order("lex,reflected") );

echo('o.order("colex")');
print_all( o.order("colex") );

echo('o.order("colex,reversed")');
print_all( o.order("colex,reversed") );

echo('o.order("random")');
print_all( o.order("random") );

echo('o.random()');
echo(o.random().join(''));

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.CatalanWord(2)');
o = Abacus.CatalanWord(2);

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind() );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.order("lex,reflected")');
print_all( o.order("lex,reflected") );

echo('o.order("colex")');
print_all( o.order("colex") );

echo('o.order("colex,reversed")');
print_all( o.order("colex,reversed") );

echo('o.order("random")');
print_all( o.order("random") );

echo('o.random()');
echo(o.random().join(''));

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.CatalanWord(5)');
o = Abacus.CatalanWord(5);

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind() );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.order("lex,reflected")');
print_all( o.order("lex,reflected") );

echo('o.order("colex")');
print_all( o.order("colex") );

echo('o.order("colex,reversed")');
print_all( o.order("colex,reversed") );

echo('o.order("random")');
print_all( o.order("random") );

echo('o.random()');
echo(o.random().join(''));

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.CatalanWord(8)');
o = Abacus.CatalanWord(8);

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind() );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.order("colex")');
print_all( o.order("colex") );

echo('o.order("colex,reversed")');
print_all( o.order("colex,reversed") );

echo('o.order("random")');
print_all( o.order("random") );

echo('o.random()');
echo(o.random().join(''));

// dispose
echo('o.dispose()');
o.dispose();

