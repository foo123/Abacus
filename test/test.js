var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once

echo('Note: Due to the large number of combinatorial samples,');
echo('Abacus combinatorics use an Iterator pattern to succesively and consistently');
echo('generate all combinatorial objects without storing all of them in memory at once');
echo("\n\n");

echo("\n\n");
echo('Abacus.Permutations');
echo('---');

// Permutations
echo('perm = Abacus.Permutation(3)');
var perm = Abacus.Permutation(3);

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

// compute inverse permutation (http://mathworld.wolfram.com/InversePermutation.html)
echo('compute inverse permutation');
echo('p = [2,7,4,9,8,3,5,0,6,1]')
p = [2,7,4,9,8,3,5,0,6,1];
echo('Abacus.Permutation.inverse(10, p)');
echo(Abacus.Permutation.inverse(10, p));
//
//output:
//[ 2, 7, 4, 9, 8, 3, 5, 0, 6, 1 ]
//[ 7, 9, 0, 5, 2, 6, 8, 1, 4, 3 ]

// factor permutation into cycles
echo('factor permutation into cycles');
echo('p = [2,7,5,6,3,0,4,1]')
p = [2,7,5,6,3,0,4,1];
echo('Abacus.Permutation.cycles(8, p)');
echo(Abacus.Permutation.cycles(8, p));
//
//output:
//[ [0,2,5], [1,7], [3,6,4] ]

echo('p = [5,4,1,3,2,0]')
p = [5,4,1,3,2,0];
echo('Abacus.Permutation.cycles(6, p)');
echo(Abacus.Permutation.cycles(6, p));
//
//output:
//[ [0,5], [1,4,2], [3] ]

// factor permutation into swaps
echo('factor permutation into swaps');
echo('p = [2,7,5,6,3,0,4,1]')
p = [2,7,5,6,3,0,4,1];
echo('Abacus.Permutation.swaps(8, p)');
echo(Abacus.Permutation.swaps(8, p));
//
//output:
//[ [0,5], [0,2], [1,7], [3,4], [3,6] ]

// permute an array, using the permutation
echo('permute an array, using the permutation');
echo('arr = ["a","b","c"]');
var arr = ["a","b","c"];
echo('Abacus.Permutation.permute(arr, perm.next())');
echo(Abacus.Permutation.permute(arr, perm.next()));
//
//sample  output:
//["b","a","c"]


echo('perm.rewind()');
perm.rewind();
echo('perm.all()');
echo(perm.all());
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


echo('perm.random()');
echo(perm.random());
//
//sample output:
//[2,0,1]

echo('Abacus.Permutation.shuffle(arr)');
echo(Abacus.Permutation.shuffle(arr));
//
//sample  output:
//["b","c","a"]

// dispose
echo('perm.dispose()');
perm.dispose();


echo("\n\n");
echo('Abacus.Partitions');
echo('---');

// Partitions
echo('part = Abacus.Partition(3)');
var part = Abacus.Partition(3);

echo('part.total()');
echo(part.total());
//
//output 3 = num of (distinct) partitions of 3:
//3


echo('part.next()');
echo(part.next());
//
//output:
//[3]


echo('part.hasNext()');
echo(part.hasNext());
echo('part.next()');
echo(part.next());
//
//output:
//true
//[2,1]


echo('part.rewind()');
part.rewind();
echo('part.all()');
echo(part.all());
//
//output (in index-lexicographic order):
//[
//[3]
//[2,1]
//[1,1,1]
//]


echo('part.random()');
echo(part.random());
//
//sample output:
//[2,1]


// dispose
echo('part.dispose()');
part.dispose();

echo("\n\n");
echo('Abacus.Combinations');
echo('---');

// Combinations
echo('comb = Abacus.Combination(3, 2)');
var comb = Abacus.Combination(3, 2);

echo('comb.total()');
echo(comb.total());
//
//output 3 = num of (distinct) combinations 3!/2!x1!:
//3


echo('comb.next()');
echo(comb.next());
//
//output:
//[0,1]


echo('comb.hasNext()');
echo(comb.hasNext());
echo('comb.next()');
echo(comb.next());
//
//output:
//true
//[0,2]

// choose from array, using the combination
echo('choose from array, using the combination');
echo('arr = ["a","b","c"]');
echo('c = comb.next()');
var arr = ["a","b","c"], c = comb.next();
echo('Abacus.Combination.choose(arr, c)');
echo(Abacus.Combination.choose(arr, c));
echo('c');
echo(c);
echo('Abacus.Combination.complement(3, 2, c)');
echo(Abacus.Combination.complement(3, 2, c));
//
//sample  output:
//["b","c"]
//[1,2]
//[0]

echo('comb.rewind()');
comb.rewind();
echo('comb.all()');
echo(comb.all());
//
//output (in index-lexicographic order):
//[
//[0,1]
//[0,2]
//[1,2]
//]


echo('comb.random()');
echo(comb.random());
//
//sample output:
//[0,2]


// dispose
echo('comb.dispose()');
comb.dispose();


echo("\n\n");
echo('Abacus.PowerSets');
echo('---');

// PowerSets
echo('pset = Abacus.PowerSet(3)');
var pset = Abacus.PowerSet(3);

echo('pset.total()');
echo(pset.total());
//
//output 8 = cardinality of power set 2^3:
//8


echo('pset.next()');
echo(pset.next());
//
//output i.e empty set:
//[]


echo('pset.hasNext()');
echo(pset.hasNext());
echo('pset.next()');
echo(pset.next());
//
//output:
//true
//[0]


echo('pset.rewind()');
pset.rewind();
echo('pset.all()');
echo(pset.all());
//
//output (in index-lexicographic order):
//[
//[]
//[ 0 ]
//[ 1 ]
//[ 1, 0 ]
//[ 2 ]
//[ 2, 0 ]
//[ 2, 1 ]
//[ 2, 1, 0 ]
//]


echo('pset.random()');
echo(pset.random());
//
//sample output:
//[0,2]


// dispose
echo('pset.dispose()');
pset.dispose();
