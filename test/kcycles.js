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
function print_all2( o, prev, f )
{
    if ( -1 === prev )
        while ( o.hasNext(-1) ) echo( f ? f(o.next(-1)) : '{'+o.next(-1).join('},{')+'}' );
    else
        //while ( o.hasNext() ) echo( o.next() );
        // iterator/iterable are supported
        for(let item of o) echo( f ? f(item) : '{'+item.join('},{')+'}' );
}

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var o;

echo('Abacus.Permutations (VERSION = '+Abacus.VERSION+')');
echo('---');

// k-Cycle Permutations
/*
print(Abacus.Permutation.initial(5, {"cycles=":3}, 1));
print(Abacus.Permutation.initial(5, {"cycles=":3}, -1));
*/
/*echo(Abacus.SetPartition.initial(5, {"parts=":3}, 1));
echo(Abacus.SetPartition.initial(5, {"parts=":3}, -1));
echo(Abacus.SetPartition.initial(6, {"parts=":3}, 1));
echo(Abacus.SetPartition.initial(6, {"parts=":3}, -1));*/

o = Abacus.SetPartition(5, {"parts=":3}).fuse(
(partition, permutation) => {
    if (!Array.isArray(permutation[0])) permutation = [permutation];
    return Abacus.Permutation.fromCycles(partition.filter(p => 1 < p.length).map((p, i) => [p[p.length-1]].concat(Abacus.Permutation.permute(p.slice(0, -1), permutation[i], true))), 5);
}, Abacus.CombinatorialProxy(item => item.reverse().reduce((p,i) => 1 < i.length ? Abacus.Permutation(i.length-1).juxtaposeWith(p) : p, null)));

echo(Abacus.Permutation.count(5, {"cycles=":3}));

echo('o.rewind()');
print_all(o.rewind());

echo('o.rewind(-1)');
print_all(o.rewind(-1), -1);

echo('o.dispose()');
o.dispose();
