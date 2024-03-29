var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

function print( o )
{
    if ( o ) echo(o.join(','));
}
function print_all( o, prev, f )
{
    if ( -1 === prev )
    {
        var item;
        while ( o.hasNext(-1) && (item=o.next(-1)) ) echo( f ? f(item) : item.join(',') );
    }
    else
        //while ( o.hasNext() ) echo( o.next() );
        // iterator/iterable are supported
        for(let item of o) echo( f ? f(item) : item.join(',') );
}

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var o;

echo('Abacus.Permutations (VERSION = '+Abacus.VERSION+')');
echo('---');

// Involutions
echo('o = Abacus.Permutation(2,{type:"involution"})');
o = Abacus.Permutation(2,{type:"involution"});

echo('o.total()');
echo(o.total());

echo('o.rewind()');
print_all(o.rewind(), 1, function(item){
    var index = o.index()-(o.hasNext()?1:0),
        rank = Abacus.Permutation.rank(item, o.n, o.$);
    return [item.join(','), index, rank, Abacus.Permutation.unrank(index, o.n, o.$).join(',')];
});

echo('o.rewind(-1)');
print_all(o.rewind(-1), -1);

echo('o.random()');
print(o.random());
o.dispose();

echo('o = Abacus.Permutation(3,{type:"involution"})');
o = Abacus.Permutation(3,{type:"involution"});

echo('o.total()');
echo(o.total());

echo('o.rewind()');
print_all(o.rewind(), 1, function(item){
    var index = o.index()-(o.hasNext()?1:0),
        rank = Abacus.Permutation.rank(item, o.n, o.$);
    return [item.join(','), index, rank, Abacus.Permutation.unrank(index, o.n, o.$).join(',')];
});

echo('o.rewind(-1)');
print_all(o.rewind(-1), -1);

echo('o.random()');
print(o.random());
o.dispose();

echo('o = Abacus.Permutation(4,{type:"involution"})');
o = Abacus.Permutation(4,{type:"involution"});

echo('o.total()');
echo(o.total());

echo('o.rewind()');
print_all(o.rewind(), 1, function(item){
    var index = o.index()-(o.hasNext()?1:0),
        rank = Abacus.Permutation.rank(item, o.n, o.$);
    return [item.join(','), index, rank, Abacus.Permutation.unrank(index, o.n, o.$).join(',')];
});

echo('o.rewind(-1)');
print_all(o.rewind(-1), -1);

echo('o.random()');
print(o.random());
o.dispose();

echo('o = Abacus.Permutation(6,{type:"involution"})');
o = Abacus.Permutation(6,{type:"involution"});

echo('o.total()');
echo(o.total());

echo('o.rewind()');
print_all(o.rewind(), 1, function(item){
    var index = o.index()-(o.hasNext()?1:0),
        rank = Abacus.Permutation.rank(item, o.n, o.$);
    return [item.join(','), index, rank, Abacus.Permutation.unrank(index, o.n, o.$).join(',')];
});

echo('o.rewind(-1)');
print_all(o.rewind(-1), -1);

echo('o.random()');
print(o.random());
o.dispose();

return;
echo('o = Abacus.Permutation(5).filterBy(Abacus.Permutation.isInvolution)');
o = Abacus.Permutation(5).filterBy(Abacus.Permutation.isInvolution);

echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all(o.rewind());

echo('o.random()');
print(o.random());
o.dispose();

echo('o = Abacus.Permutation(6).filterBy(Abacus.Permutation.isInvolution)');
o = Abacus.Permutation(6).filterBy(Abacus.Permutation.isInvolution);

echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */');
echo(o.total());

echo('default order is "lex", lexicographic-order');
echo('o.rewind()');
print_all( o.rewind() );

echo('o.random()');
print(o.random());
o.dispose();
