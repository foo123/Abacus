var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var p, c, t;

echo('Note: Due to the large number of combinatorial samples,');
echo('Abacus combinatorics use an Iterator pattern to succesively and consistently');
echo('generate all combinatorial objects without storing all of them in memory at once');
echo("\n\n");


echo("\n\n");
echo('Abacus.Tensors');
echo('---');

// Tensors
echo('t = Abacus.Tensor([1,2,3])');
t = Abacus.Tensor([1,2,3]);

echo('t.total()'); 
echo(t.total());
//
//output 6 = 1 x 2 x 3:
//6

echo('t.next()'); 
echo(t.next());
//
//output:
//[0,0,0]


echo('t.hasNext()');
echo(t.hasNext());
echo('t.next()');
echo(t.next());


t.rewind();
while (t.hasNext()) 
    echo([
    p=t.next(), 
    c=Abacus.Tensor.index(p,t.$n),
    Abacus.Tensor.item(c,t.$n),
    Abacus.Tensor.component(p, [['a1'],['b1','b2'],['c1','c2','c3']])
    ]);
//
//output (in index-lexicographic order):

echo('t.forward()');
echo('while (t.hasPrev()) echo(t.prev())');
t.forward();
while (t.hasPrev()) 
    echo([
    p=t.prev(), 
    c=Abacus.Tensor.index(p,t.$n)
    ]);


echo('t.random()');
echo(t.random());
//
//sample output:
//[0,1,2]

echo('get tensors in unique random order')
echo('t.randomise()');
echo('while(t.hasRandomNext()) echo(t.randomNext())');
t.randomise();
while(t.hasRandomNext()) echo(t.randomNext());

// dispose
echo('t.dispose()');
t.dispose();

echo('t = Abacus.Tensor([1,2,3])');
t = Abacus.Tensor([1,2,3]);

echo('get just last 3 tensors'); 
echo('t.range(-3,-1)');
echo(t.range(-3,-1));

echo('get just last 3 tensors in reverse order'); 
echo('t.range(-1,-3)');
echo(t.range(-1,-3));

t.dispose();

echo();
echo("Abacus.Tensor.product(['a1'],['b1','b2'],['c1','c2','c3'])");
echo(Abacus.Tensor.product(['a1'],['b1','b2'],['c1','c2','c3']));
echo("Abacus.Tensor.product(Abacus.Tensor.product(['a1'],['b1','b2']),['c1','c2','c3'])");
echo(Abacus.Tensor.product(Abacus.Tensor.product(['a1'],['b1','b2']),['c1','c2','c3']));
echo("Abacus.Tensor.product(['a1'],Abacus.Tensor.product(['b1','b2'],['c1','c2','c3']))");
echo(Abacus.Tensor.product(['a1'],Abacus.Tensor.product(['b1','b2'],['c1','c2','c3'])));