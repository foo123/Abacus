var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

function print_all( o, prev, f )
{
    if ( -1 === prev )
    {
        var item;
        while ( o.hasNext(-1) && (item=o.next(-1)) ) echo( f ? f(item) : item );
    }
    else
        //while ( o.hasNext() ) echo( o.next() );
        // iterator/iterable are supported
        for(let item of o) echo( f ? f(item) : item );
}

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var o;

echo('Abacus.Compositions Filtered (VERSION = '+Abacus.VERSION+')');
echo('---');

// Restricted Compositions to all unique items by filtering
echo('o = Abacus.Partition(10,{type:"composition"}).filterBy(Abacus.Filter.UNIQUE())');
o = Abacus.Partition(10,{type:"composition"}).filterBy(Abacus.Filter.UNIQUE());

echo('o.total() /* with filtering applied .total() and some other functions are in general not accurate */'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
print_all( o );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

o.dispose();

// Restricted Compositions to fixed K parts and Max value M by filtering
echo('o = Abacus.Partition(10,{type:"composition"}).filterBy(Abacus.Filter.LEN(4).AND(Abacus.Filter.MAX(3)))');
o = Abacus.Partition(10,{type:"composition"}).filterBy(Abacus.Filter.LEN(4).AND(Abacus.Filter.MAX(3)));
/*
equivalent to above with a simple custom function used for filtering:

o = Abacus.Partition(10,{type:"composition"}).filterBy(function(item){
    var i, M, n = item.length;
    if ( n !== 4 ) return false;
    M = item[0];
    if ( M > 3 ) return false;
    for(i=1; i<n; i++)
    {
        if ( item[i] > M )
        {
            M = item[i];
            if ( M > 3 ) return false;
        }
    }
    return true;
});
*/

echo('o.total() /* with filtering applied .total() and some other functions are in general not accurate */'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
print_all( o );

echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );

o.dispose();
