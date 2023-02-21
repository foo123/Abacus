var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

function print( o )
{
    if ( o ) echo(o.join('+'));
}
function print_all( o, prev, f )
{
    if ( -1 === prev )
        while ( o.hasNext(-1) ) echo( f ? f(o.next(-1)) : o.next(-1).join('+') );
    else
        //while ( o.hasNext() ) echo( o.next() );
        // iterator/iterable are supported
        for(let item of o) echo( f ? f(item) : item.join('+') );
}

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var o;

echo('Abacus.Compositions (VERSION = '+Abacus.VERSION+')');
echo('---');

// Restricted Compositions

echo('o = Abacus.Partition(7,{type:"composition","min=":3,"max=":4})');
o = Abacus.Partition(7,{type:"composition","min=":3,"max=":4});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(14,{type:"composition","min=":3,"max=":4})');
o = Abacus.Partition(14,{type:"composition","min=":3,"max=":4});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(23,{type:"composition","min=":3,"max=":4})');
o = Abacus.Partition(23,{type:"composition","min=":3,"max=":4});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(7,{type:"composition","min=":3,"parts=":2})');
o = Abacus.Partition(7,{type:"composition","min=":3,"parts=":2});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(14,{type:"composition","min=":3,"parts=":4})');
o = Abacus.Partition(14,{type:"composition","min=":3,"parts=":4});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(7,{type:"composition","parts=":3,"min=":1})');
o = Abacus.Partition(7,{type:"composition","parts=":3,"min=":1});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(14,{type:"composition","min=":2,"parts=":4})');
o = Abacus.Partition(14,{type:"composition","min=":2,"parts=":4});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(7,{type:"composition","min=":3,"max=":4,"parts=":2})');
o = Abacus.Partition(7,{type:"composition","min=":3,"max=":4,"parts=":2});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(14,{type:"composition","min=":2,"max=":5,"parts=":4})');
o = Abacus.Partition(14,{type:"composition","min=":2,"max=":5,"parts=":4});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(28,{type:"composition","min=":4,"max=":10,"parts=":4})');
o = Abacus.Partition(28,{type:"composition","min=":4,"max=":10,"parts=":4});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(14,{type:"composition","min=":3,"max=":4,"parts=":4})');
o = Abacus.Partition(14,{type:"composition","min=":3,"max=":4,"parts=":4});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(7,{type:"composition","min=":3})');
o = Abacus.Partition(7,{type:"composition","min=":3});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(14,{type:"composition","min=":3})');
o = Abacus.Partition(14,{type:"composition","min=":3});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(20,{type:"composition","min=":4})');
o = Abacus.Partition(20,{type:"composition","min=":4});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(7,{type:"composition","max=":4})');
o = Abacus.Partition(7,{type:"composition","max=":4});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

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

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(8,{type:"composition","max=":4})');
o = Abacus.Partition(8,{type:"composition","max=":4});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

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

echo('o = Abacus.Partition(8,{type:"composition","max=":3})');
o = Abacus.Partition(8,{type:"composition","max=":3});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

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

echo('o = Abacus.Partition(7,{type:"composition","parts=":4})');
o = Abacus.Partition(7,{type:"composition","parts=":4});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

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

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

echo('o = Abacus.Partition(8,{type:"composition","parts=":4})');
o = Abacus.Partition(8,{type:"composition","parts=":4});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

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

echo('o = Abacus.Partition(10,{type:"composition","max=":3,"parts=":4})');
o = Abacus.Partition(10,{type:"composition","max=":3,"parts=":4});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

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

echo('o = Abacus.Partition(20,{type:"composition","max=":5,"parts=":5})');
o = Abacus.Partition(20,{type:"composition","max=":5,"parts=":5});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

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

echo('o = Abacus.Partition(23,{type:"composition","max=":7,"parts=":5})');
o = Abacus.Partition(23,{type:"composition","max=":7,"parts=":5});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

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

echo('o = Abacus.Partition(51,{type:"composition","max=":7,"parts=":8})');
o = Abacus.Partition(51,{type:"composition","max=":7,"parts=":8});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();

/*echo('o = Abacus.Partition(23,{type:"composition","parts=":6}).filterBy(Abacus.Filter.MIN(2).AND(Abacus.Filter.MAX(5)))');
o = Abacus.Partition(23,{type:"composition","parts=":6}).filterBy(Abacus.Filter.MIN(2).AND(Abacus.Filter.MAX(5))).get();

echo(o.map(function(i){return i.join('+');}).join("\n"));
echo(o.length);*/

/*echo('o = Abacus.Partition(23,{type:"composition","min=":2,"max=":5,"parts=":6})');
o = Abacus.Partition(23,{type:"composition","min=":2,"max=":5,"parts=":6});

echo('o.total()');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind(), 1, function( item ){
    return [item.join('+'), o.index()-(o.hasNext()?1:0), Abacus.Partition.rank(item, o.n, o.$), Abacus.Partition.unrank(o.index()-(o.hasNext()?1:0), o.n, o.$).join('+')];
});

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

echo('o.random()');
print(o.random());

// dispose
echo('o.dispose()');
o.dispose();*/
