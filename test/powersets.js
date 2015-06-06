var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var p, c;

echo('Note: Due to the large number of combinatorial samples,');
echo('Abacus combinatorics use an Iterator pattern to succesively and consistently');
echo('generate all combinatorial objects without storing all of them in memory at once');
echo("\n\n");

echo("\n\n");
echo('Abacus.PowerSets');
echo('---');

// PowerSets
echo('pset = Abacus.PowerSet(6)');
var pset = Abacus.PowerSet(6);

echo('pset.total()');
echo(pset.total());
//
//output 64 = cardinality of power set 2^6:
//64


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

echo('get just last 5 subsets'); 
echo('pset.range(-5,-1)');
echo(pset.range(-5,-1));

echo('get just last 5 subsets in reverse order'); 
echo('pset.range(-1,-5)');
echo(pset.range(-1,-5));


echo('pset.random()');
echo(pset.random());
//
//sample output:
//[0,2]

echo('get subsets in unique random order')
echo('pset.randomise()');
echo('while(pset.hasRandomNext()) echo(pset.randomNext())');
pset.randomise();
while(pset.hasRandomNext()) echo(pset.randomNext());



// dispose
echo('pset.dispose()');
pset.dispose();
