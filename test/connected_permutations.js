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

echo('Abacus.Permutations (VERSION = '+Abacus.VERSION+')');
echo('---');

// Connected Permutations (ie of only one cycle, indecomposable, cyclic)
echo('o = Abacus.Permutation(2,{type:"connected"})');
o = Abacus.Permutation(2,{type:"connected"});

echo('o.total()'); 
echo(o.total());

echo('o.rewind()');
print_all(o.rewind(), 1, function(item){
    var index = o.index()-(o.hasNext()?1:0), rank = Abacus.Permutation.rank(item, o.n, o.$);
    return [item.join(','), index, rank, Abacus.Permutation.unrank(index, o.n, o.$).join(','), Abacus.Permutation.isConnected(item) ? "cyclic" : "ERROR"];
});

echo('o.rewind(-1)');
print_all(o.rewind(-1), -1);

echo('o.random()');
print(o.random());
o.dispose();

echo('o = Abacus.Permutation(3,{type:"connected"})');
o = Abacus.Permutation(3,{type:"connected"});

echo('o.total()'); 
echo(o.total());

echo('o.rewind()');
print_all(o.rewind(), 1, function(item){
    var index = o.index()-(o.hasNext()?1:0), rank = Abacus.Permutation.rank(item, o.n, o.$);
    return [item.join(','), index, rank, Abacus.Permutation.unrank(index, o.n, o.$).join(','), Abacus.Permutation.isConnected(item) ? "cyclic" : "ERROR"];
});

echo('o.rewind(-1)');
print_all(o.rewind(-1), -1);

echo('o.random()');
print(o.random());
o.dispose();

echo('o = Abacus.Permutation(4,{type:"connected"})');
o = Abacus.Permutation(4,{type:"connected"});

echo('o.total()'); 
echo(o.total());

echo('o.rewind()');
print_all(o.rewind(), 1, function(item){
    var index = o.index()-(o.hasNext()?1:0), rank = Abacus.Permutation.rank(item, o.n, o.$);
    return [item.join(','), index, rank, Abacus.Permutation.unrank(index, o.n, o.$).join(','), Abacus.Permutation.isConnected(item) ? "cyclic" : "ERROR"];
});

echo('o.rewind(-1)');
print_all(o.rewind(-1), -1);

echo('o.random()');
print(o.random());
o.dispose();

echo('o = Abacus.Permutation(5,{type:"connected"})');
o = Abacus.Permutation(5,{type:"connected"});

echo('o.total()'); 
echo(o.total());

echo('o.rewind()');
print_all(o.rewind(), 1, function(item){
    var index = o.index()-(o.hasNext()?1:0), rank = Abacus.Permutation.rank(item, o.n, o.$);
    return [item.join(','), index, rank, Abacus.Permutation.unrank(index, o.n, o.$).join(','), Abacus.Permutation.isConnected(item) ? "cyclic" : "ERROR"];
});

echo('o.rewind(-1)');
print_all(o.rewind(-1), -1);

echo('o.random()');
print(o.random());
o.dispose();

echo('o = Abacus.Permutation(6,{type:"connected"})');
o = Abacus.Permutation(6,{type:"connected"});

echo('o.total()'); 
echo(o.total());

echo('o.rewind()');
print_all(o.rewind(), 1, function(item){
    var index = o.index()-(o.hasNext()?1:0), rank = Abacus.Permutation.rank(item, o.n, o.$);
    return [item.join(','), index, rank, Abacus.Permutation.unrank(index, o.n, o.$).join(','), Abacus.Permutation.isConnected(item) ? "cyclic" : "ERROR"];
});

echo('o.rewind(-1)');
print_all(o.rewind(-1), -1);

echo('o.random()');
print(o.random());
o.dispose();