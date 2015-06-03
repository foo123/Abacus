var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var p, c, comb;

echo('Note: Due to the large number of combinatorial samples,');
echo('Abacus combinatorics use an Iterator pattern to succesively and consistently');
echo('generate all combinatorial objects without storing all of them in memory at once');
echo("\n\n");

echo("\n\n");
echo('Abacus.Combinations with Repeats');
echo('---');

// Combinations
echo('comb = Abacus.CombinationRepeat(6, 3)');
comb = Abacus.CombinationRepeat(6, 3);

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

/*echo('comb.all()');
echo(comb.all());*/
//
//output (in index-lexicographic order):
//[
//[0,1]
//[0,2]
//[1,2]
//]
comb.rewind();
while (comb.hasNext()) 
    echo([
    c=comb.next()
    ]);

echo('comb.random()');
echo(comb.random());
//
//sample output:
//[0,2]


// dispose
echo('comb.dispose()');
comb.dispose();
