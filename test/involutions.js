var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

function print_all( o, prev, f )
{
    if ( -1 === prev )
        while ( o.hasNext(-1) ) echo( f ? f(o.next(-1)) : o.next(-1) );
    else
        //while ( o.hasNext() ) echo( o.next() );
        // iterator/iterable are supported
        for(let item of o) echo( f ? f(item) : item );
}

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var o;

echo('Abacus.Permutations (VERSION = '+Abacus.VERSION+')');
echo('---');

// Involutions
echo('o = Abacus.Permutation(2,{type:"involution"})');
o = Abacus.Permutation(2,{type:"involution"});

echo('o.total()'); 
echo(o.total());

echo('o.random()');
echo(o.random());
o.dispose();

echo('o = Abacus.Permutation(3,{type:"involution"})');
o = Abacus.Permutation(3,{type:"involution"});

echo('o.total()'); 
echo(o.total());

echo('o.random()');
echo(o.random());
o.dispose();

echo('o = Abacus.Permutation(4,{type:"involution"})');
o = Abacus.Permutation(4,{type:"involution"});

echo('o.total()'); 
echo(o.total());

echo('o.random()');
echo(o.random());
o.dispose();

echo('o = Abacus.Permutation(5,{type:"involution"})');
o = Abacus.Permutation(5,{type:"involution"});

echo('o.total()'); 
echo(o.total());

echo('o.random()');
echo(o.random());
o.dispose();

echo('o = Abacus.Permutation(6,{type:"involution"})');
o = Abacus.Permutation(6,{type:"involution"});

echo('o.total()'); 
echo(o.total());

echo('o.random()');
echo(o.random());
o.dispose();
