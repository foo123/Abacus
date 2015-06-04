var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var p, c, perm;
var arr = ["a","b","c"];

echo('Note: Due to the large number of combinatorial samples,');
echo('Abacus combinatorics use an Iterator pattern to succesively and consistently');
echo('generate all combinatorial objects without storing all of them in memory at once');
echo("\n\n");


echo("\n\n");
echo('Abacus.Permutations');
echo('---');

// Permutations
echo('perm = Abacus.Permutation(4)');
perm = Abacus.Permutation(4);

echo('perm.total()'); 
echo(perm.total());
//
//output 6 = 3!:
//6

echo('perm.next()'); 
echo(perm.next());
//
//output:
//[0,1,2]


echo('perm.hasNext()');
echo(perm.hasNext());
echo('perm.next()');
echo(perm.next());
//
//output:
//true
//[0,2,1]


/*echo('perm.all()');
echo(perm.all());*/
perm.rewind();
while (perm.hasNext()) 
    echo([
    p=perm.next(), 
    c=Abacus.Permutation.index(p,4),
    Abacus.Permutation.item(c,4)
    ]);
//
//output (in index-lexicographic order):
//[
//[0,1,2]
//[0,2,1]
//[1,0,2]
//[1,2,0]
//[2,0,1]
//[2,1,0]
//]

echo('perm.forward()');
echo('while (perm.hasPrev()) echo(perm.prev())');
perm.forward();
while (perm.hasPrev()) 
    echo([
    p=perm.prev(), 
    c=Abacus.Permutation.index(p,4)
    ]);
//
// output
/*
[ 2, 1, 0 ]
[ 2, 0, 1 ]
[ 1, 2, 0 ]
[ 1, 0, 2 ]
[ 0, 2, 1 ]
[ 0, 1, 2 ]
*/


echo('perm.random()');
echo(perm.random());
//
//sample output:
//[2,0,1]

// dispose
echo('perm.dispose()');
perm.dispose();

echo('perm = Abacus.Permutation(15)');
perm = Abacus.Permutation(15);

echo('perm.total()'); 
echo(perm.total());

echo('get just last 5 permutations'); 
echo('perm.range(-5,-1)');
echo(perm.range(-5,-1));


// permute an array, using a permutation
echo('permute an array, using a permutation');
echo('Abacus.Permutation.permute(["a","b","c"], [2,0,1])');
echo(Abacus.Permutation.permute(["a","b","c"], [2,0,1]));
//
//sample  output:
//["c","a","b"]

echo('Abacus.Permutation.shuffle(["a","b","c"])');
echo(Abacus.Permutation.shuffle(["a","b","c"]));
//
//sample  output:
//["b","c","a"]

// compute inverse permutation (http://mathworld.wolfram.com/InversePermutation.html)
echo('compute inverse permutation');
echo('Abacus.Permutation.inverse([2,7,4,9,8,3,5,0,6,1], 10)');
echo(Abacus.Permutation.inverse([2,7,4,9,8,3,5,0,6,1], 10));
//
//output:
//[ 2, 7, 4, 9, 8, 3, 5, 0, 6, 1 ]
//[ 7, 9, 0, 5, 2, 6, 8, 1, 4, 3 ]

// factor permutation into cycles
echo('factor permutation into cycles');
echo('Abacus.Permutation.toCycles([2,7,5,6,3,0,4,1], 8)');
echo(Abacus.Permutation.toCycles([2,7,5,6,3,0,4,1], 8));
//
//output:
//[ [0,2,5], [1,7], [3,6,4] ]

echo('Abacus.Permutation.toCycles([5,4,1,3,2,0], 6)');
echo(Abacus.Permutation.toCycles([5,4,1,3,2,0], 6));
//
//output:
//[ [0,5], [1,4,2], [3] ]

echo('Abacus.Permutation.fromCycles([ [0,5], [1,4,2], [3] ], 6)');
echo(Abacus.Permutation.fromCycles([ [0,5], [1,4,2], [3] ], 6));
//
//output:
//[5,4,1,3,2,0]

// factor permutation into swaps
echo('factor permutation into swaps');
echo('Abacus.Permutation.toSwaps([2,7,5,6,3,0,4,1], 8)');
echo(Abacus.Permutation.toSwaps([2,7,5,6,3,0,4,1], 8));
//
//output:
//[ [0,5], [0,2], [1,7], [3,4], [3,6] ]

// permutation from swaps
echo('permutation from swaps');
echo('Abacus.Permutation.fromSwaps([ [0,5], [0,2], [1,7], [3,4], [3,6] ], 8)');
echo(Abacus.Permutation.fromSwaps([ [0,5], [0,2], [1,7], [3,4], [3,6] ], 8));
//
//output:
//[2,7,5,6,3,0,4,1]

// permutation to permutation matrix
echo('permutation to permutation matrix');
echo('Abacus.Permutation.toMatrix([2,0,1], 3)');
echo(Abacus.Permutation.toMatrix([2,0,1], 3));
//
//output:
//[ [ 0, 0, 1 ], [ 1, 0, 0 ], [ 0, 1, 0 ] ]

// permutation matrix to permutation
echo('permutation matrix to permutation');
echo('Abacus.Permutation.fromMatrix([ [ 0, 0, 1 ], [ 1, 0, 0 ], [ 0, 1, 0 ] ], 3)');
echo(Abacus.Permutation.fromMatrix([ [ 0, 0, 1 ], [ 1, 0, 0 ], [ 0, 1, 0 ] ]/*[ [ 0, 1, 0 ], [ 0, 0, 1 ], [ 1, 0, 0 ] ]*/, 3));
//
//output:
//[2,0,1]
