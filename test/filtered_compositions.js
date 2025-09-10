"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

function print(o)
{
    if (o) echo(o.join('+'));
}
function print_all(o, prev, f)
{
    if (-1 === prev)
        while (o.hasNext(-1)) echo(f ? f(o.next(-1)) : o.next(-1).join('+'));
    else
        //while (o.hasNext()) echo(o.next());
        // iterator/iterable are supported
        for (let item of o) echo(f ? f(item) : item.join('+'));
}

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
let o;

echo('Abacus.Compositions Filtered (VERSION = '+Abacus.VERSION+')');
echo('---');

// Restricted Compositions to all unique items by filtering
echo('o = Abacus.Partition(10,{type:"composition"}).filterBy(Abacus.Filter.UNIQUE())');
o = Abacus.Partition(10,{type:"composition"}).filterBy(Abacus.Filter.UNIQUE());

echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */'); 
echo(o.total());

echo('default order is "lex", lexicographic-order');
print_all( o );
echo('backwards');
echo('o.rewind(-1)');
print_all( o.rewind(-1), -1 );
o.dispose();

// Restricted Compositions to fixed Max value M by filtering
echo('o = Abacus.Partition(7,{type:"composition"}).filterBy(Abacus.Filter.MAX(4))');
o = Abacus.Partition(7,{type:"composition"}).filterBy(Abacus.Filter.MAX(4));
echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */'); 
echo(o.total());
echo(Abacus.Partition(7,{type:"composition","max=":4}).total());
echo('default order is "lex", lexicographic-order');
print_all( o );
o.dispose();

// Restricted Compositions to fixed Max value M by filtering
echo('o = Abacus.Partition(8,{type:"composition"}).filterBy(Abacus.Filter.MAX(4))');
o = Abacus.Partition(8,{type:"composition"}).filterBy(Abacus.Filter.MAX(4));
echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */'); 
echo(o.total());
echo(Abacus.Partition(8,{type:"composition","max=":4}).total());
echo('default order is "lex", lexicographic-order');
print_all( o );
o.dispose();

// Restricted Compositions to fixed Max value M by filtering
echo('o = Abacus.Partition(8,{type:"composition"}).filterBy(Abacus.Filter.MAX(3))');
o = Abacus.Partition(8,{type:"composition"}).filterBy(Abacus.Filter.MAX(3));
echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */'); 
echo(o.total());
echo(Abacus.Partition(8,{type:"composition","max=":3}).total());
echo('default order is "lex", lexicographic-order');
print_all( o );
o.dispose();

// Restricted Compositions to fixed Max value M by filtering
echo('o = Abacus.Partition(10,{type:"composition"}).filterBy(Abacus.Filter.MAX(5))');
o = Abacus.Partition(10,{type:"composition"}).filterBy(Abacus.Filter.MAX(5));
echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */'); 
echo(o.total());
echo(Abacus.Partition(10,{type:"composition","max=":5}).total());
echo('default order is "lex", lexicographic-order');
print_all( o );
o.dispose();

// Restricted Compositions to fixed Parts value K by filtering
echo('o = Abacus.Partition(10,{type:"composition"}).filterBy(Abacus.Filter.LEN(5))');
o = Abacus.Partition(10,{type:"composition"}).filterBy(Abacus.Filter.LEN(5));
echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */'); 
echo(o.total());
echo(Abacus.Partition(10,{type:"composition","parts=":5}).total());
echo('default order is "lex", lexicographic-order');
print_all( o );
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

echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */'); 
echo(o.total());
echo(Abacus.Partition(10,{type:"composition","max=":3,"parts=":4}).total());
echo('default order is "lex", lexicographic-order');
print_all( o );
o.dispose();

// Restricted Compositions to fixed K parts and Max value M by filtering
echo('o = Abacus.Partition(20,{type:"composition"}).filterBy(Abacus.Filter.LEN(5).AND(Abacus.Filter.MAX(5)))');
o = Abacus.Partition(20,{type:"composition"}).filterBy(Abacus.Filter.LEN(5).AND(Abacus.Filter.MAX(5)));
echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */'); 
echo(o.total());
echo(Abacus.Partition(20,{type:"composition","max=":5,"parts=":5}).total());
echo('default order is "lex", lexicographic-order');
print_all( o );
o.dispose();

// Restricted Compositions to fixed K parts and Max value M by filtering
echo('o = Abacus.Partition(23,{type:"composition"}).filterBy(Abacus.Filter.LEN(5).AND(Abacus.Filter.MAX(7)))');
o = Abacus.Partition(23,{type:"composition"}).filterBy(Abacus.Filter.LEN(5).AND(Abacus.Filter.MAX(7)));
echo('o.total() /* with filtering applied .total() and some other functions still return original data not the filtered ones */'); 
echo(o.total());
echo(Abacus.Partition(23,{type:"composition","max=":7,"parts=":5}).total());
echo('default order is "lex", lexicographic-order');
print_all( o );
o.dispose();
