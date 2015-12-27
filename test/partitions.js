var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var o;

echo('Abacus.Partitions (VERSION = '+Abacus.VERSION+')');
echo('---');

// Partitions
echo('o = Abacus.Partition(5)');
o = Abacus.Partition(5);

echo('o.total()'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');

echo('o.next()'); 
echo(o.next());

echo('o.hasNext()');
echo(o.hasNext());
echo('o.next()');
echo(o.next());


echo('o.rewind()');
o.rewind();
while (o.hasNext()) echo (o.next());

echo('o.forward()');
o.forward();
while (o.hasPrev()) echo (o.prev());

// dispose
echo('o.dispose()');
o.dispose();


