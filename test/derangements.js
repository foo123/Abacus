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
echo('Abacus.Derangements');
echo('---');

// Derangements
var i, n = 4, count = Abacus.Derangement.count( n );
echo('Abacus.Derangement.count( 4 )');
echo(count);
for (i=0; i<count; i++) echo( Abacus.Derangement.rand( n ) );