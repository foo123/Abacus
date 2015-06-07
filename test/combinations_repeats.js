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


echo('comb.rewind()');
/*comb.rewind();
while (comb.hasNext()) echo([c=comb.next(),p=Abacus.CombinationRepeat.index(c,6,3),Abacus.CombinationRepeat.item(p,6,3)]);*/
comb.rewind();
while (comb.hasNext()) echo(comb.next());

echo('comb.forward()');
comb.forward();
while (comb.hasPrev()) echo(comb.prev());

echo('comb.random()');
echo(comb.random());
//
//sample output:
//[0,2]

echo('get combinations in unique random order')
echo('comb.randomise()');
echo('while(comb.hasRandomNext()) echo(comb.randomNext())');
comb.randomise();
while(comb.hasRandomNext()) echo(comb.randomNext());

echo('get just last 5 combinations'); 
echo('comb.range(-5,-1)');
echo(comb.range(-5,-1));

echo('get just last 5 combinations in reverse order'); 
echo('comb.range(-1,-5)');
echo(comb.range(-1,-5));

// dispose
echo('comb.dispose()');
comb.dispose();
