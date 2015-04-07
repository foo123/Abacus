var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once


// Permutations
var perm = Abacus.Permutation(3);

echo('Permutation(3)');
echo(perm.total());
//
//output 6 = 3!:
//6


echo(perm.next());
//
//output:
//[0,1,2]


echo(perm.hasNext());
echo(perm.next());
//
//output:
//true
//[0,2,1]

// permute an array, using the permutation
var arr = ["a","b","c"];
echo(Abacus.permute(arr, perm.next()));
//
//sample  output:
//["b","a","c"]


perm.rewind();
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


echo(perm.random());
//
//sample output:
//[2,0,1]


// dispose
perm.dispose();


// Partitions
var part = Abacus.Partition(3);

echo('Partition(3)');
echo(part.total());
//
//output 3 = num of (distinct) partitions of 3:
//3


echo(part.next());
//
//output:
//[3]


echo(part.hasNext());
echo(part.next());
//
//output:
//true
//[2,1]


part.rewind();
echo(part.all());
//
//output (in index-lexicographic order):
//[
//[3]
//[2,1]
//[1,1,1]
//]


echo(part.random());
//
//sample output:
//[2,1]


// dispose
part.dispose();

// Combinations
var comb = Abacus.Combination(3, 2);

echo('Combination(3, 2)');
echo(comb.total());
//
//output 3 = num of (distinct) combinations 3!/2!x1!:
//3


echo(comb.next());
//
//output:
//[0,1]


echo(comb.hasNext());
echo(comb.next());
//
//output:
//true
//[0,2]

// permute an array, using the permutation
var arr = ["a","b","c","d","e"];
echo(Abacus.choose(arr, comb.next()));
//
//sample  output:
//["b","c"]

comb.rewind();
echo(comb.all());
//
//output (in index-lexicographic order):
//[
//[0,1]
//[0,2]
//[1,2]
//]


echo(comb.random());
//
//sample output:
//[0,2]


// dispose
comb.dispose();


// PowerSets
var pset = Abacus.PowerSet(3);

echo('PowerSet(3)');
echo(pset.total());
//
//output 8 = cardinality of power set 2^3:
//8


echo(pset.next());
//
//output i.e empty set:
//[]


echo(pset.hasNext());
echo(pset.next());
//
//output:
//true
//[0]


pset.rewind();
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


echo(pset.random());
//
//sample output:
//[0,2]


// dispose
pset.dispose();
