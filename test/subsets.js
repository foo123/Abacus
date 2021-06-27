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

echo('Abacus.Subsets (VERSION = '+Abacus.VERSION+')');
echo('---');

// Powersets
echo('o = Abacus.Subset(6)');
o = Abacus.Subset(6);

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
print_all( o.rewind(), 1, function( item ){
    return [item.join(','), o.index()-(o.hasNext()?1:0), Abacus.Subset.rank(item, o.n, o.$), Abacus.Subset.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join(',')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.order("minimal")');
print_all( o.order("minimal"), 1, function( item ){
    return [item.join(','), o.index()-(o.hasNext()?1:0), Abacus.Subset.rank(item, o.n, o.$), Abacus.Subset.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join(',')];
});

echo('o.order("minimal,reversed")');
print_all( o.order("minimal,reversed"), 1, function( item ){
    return [item.join(','), o.index()-(o.hasNext()?1:0), Abacus.Subset.rank(item, o.n, o.$), Abacus.Subset.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join(',')];
});

echo('o.order("lex,reflected")');
print_all( o.order("lex,reflected") );

echo('o.order("lex,reversed")');
print_all( o.order("lex,reversed") );

echo('o.order("lex,reversed,reflected")');
print_all( o.order("lex,reversed,reflected") );

echo('o.order("colex")');
print_all( o.order("colex") );

echo('o.order("colex,reflected")');
print_all( o.order("colex,reflected") );

echo('o.order("colex,reversed")');
print_all( o.order("colex,reversed") );

echo('o.order("random")');
print_all( o.order("random") );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

// Powersets
echo('o = Abacus.Subset(6,{type:"binary"})');
o = Abacus.Subset(6,{type:"binary"});

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
print_all( o.rewind(), 1, function( item ){
    return [item.join(','), o.index()-(o.hasNext()?1:0), Abacus.Subset.rank(item, o.n, o.$), Abacus.Subset.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join(',')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.order("minimal")');
print_all( o.order("minimal"), 1, function( item ){
    return [item.join(','), o.index()-(o.hasNext()?1:0), Abacus.Subset.rank(item, o.n, o.$), Abacus.Subset.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join(',')];
});

echo('o.order("minimal,reversed")');
print_all( o.order("minimal,reversed"), 1, function( item ){
    return [item.join(','), o.index()-(o.hasNext()?1:0), Abacus.Subset.rank(item, o.n, o.$), Abacus.Subset.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join(',')];
});

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

echo('o.order("random")');
print_all( o.order("random") );

echo('o.random()');
print(o.random());

echo('o.order("colex").range(-5, -1)');
print_all(o.order("colex").range(-5, -1));


// dispose
echo('o.dispose()');
o.dispose();
