var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var o;

echo('Abacus.Powersets');
echo('---');

// Powersets
echo('o = Abacus.Powerset(4)');
o = Abacus.Powerset(4);

echo('o.total()'); 
echo(o.total());

echo('o.next()'); 
echo(o.next());

echo('o.hasNext()');
echo(o.hasNext());
echo('o.next()');
echo(o.next());


echo('o.rewind()');
o.rewind();
while (o.hasNext()) echo (o.next());

echo('o.order("revlex")');
o.order("revlex");
while (o.hasNext()) echo (o.next());

echo('o.order("colex")');
o.order("colex");
while (o.hasNext()) echo (o.next());

echo('o.order("revcolex")');
o.order("revcolex");
while (o.hasNext()) echo (o.next());


echo('o.random()');
echo(o.random());

echo('o.order("random")');
o.order("random");
while (o.hasNext()) echo (o.next());

echo('o.order("colex").range(-5, -1)');
echo (o.order("colex").range(-5, -1));


// dispose
echo('o.dispose()');
o.dispose();


