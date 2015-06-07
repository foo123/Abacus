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
echo('Abacus.Partitions');
echo('---');

// Partitions
echo('part = Abacus.Partition(10)');
var part = Abacus.Partition(10);

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


echo('part.all()');
echo(part.all());
//
//output (in index-lexicographic order):
//[
//[3]
//[2,1]
//[1,1,1]
//]

echo('part.forward()');
echo('while(part.hasPrev()) echo(part.prev())');
part.forward();
while(part.hasPrev()) echo(part.prev());

echo('part.random()');
echo(part.random());
//
//sample output:
//[2,1]


// dispose
echo('part.dispose()');
part.dispose();

echo('Abacus.Partition.pack([4,3,3,2,1,1])');
echo(Abacus.Partition.pack([4,3,3,2,1,1]));
//
//output:
//[[4,1],[3,2],[2,1],[1,2]]

echo('Abacus.Partition.unpack([[4,1],[3,2],[2,1],[1,2]])');
echo(Abacus.Partition.unpack([[4,1],[3,2],[2,1],[1,2]]));
//
//output:
//[4,3,3,2,1,1]

echo('Abacus.Partition.conjugate([6,4,3,1])');
echo(Abacus.Partition.conjugate([6,4,3,1]));
//
//output:
//[4,3,3,2,1,1]

echo('Abacus.Partition.conjugate([4,3,3,2,1,1])');
echo(Abacus.Partition.conjugate([4,3,3,2,1,1]));
//
//output:
//[6,4,3,1]

echo('Abacus.Partition.conjugate([4])');
echo(Abacus.Partition.conjugate([4]));
//
//output:
//[1,1,1,1]

echo('Abacus.Partition.conjugate([1,1,1,1])');
echo(Abacus.Partition.conjugate([1,1,1,1]));
//
//output:
//[4]
