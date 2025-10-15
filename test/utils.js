"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);

let n,i,j,k,l,item,gray,igray;

/*a = [ 0, 2, 3, 4, 5, 1 ];//[0,2,4,5,3,1];
echo(Abacus.Util.reflection(a,a,0,4,5));
echo(Abacus.Util.sort(/*Abacus.Util.shuffle([0,1,2,3,4,5])* /[2,0,4,3,5,1], 1, true));*/

n = 3;
for (i=0; i<n; ++i)
{
    for (j=0; j<n; ++j)
    {
        for (k=0; k<n; ++k)
        {
            item = [i, j, k];
            gray = Abacus.Util.gray(new Array(n), item, n);
            igray = Abacus.Util.igray(new Array(n), gray, n);
            echo(item.join(','), gray.join(','), igray.join(','));
        }
    }
}
echo("\n");
n = 4;
for (i=0; i<n; ++i)
{
    for (j=0; j<n; ++j)
    {
        for (k=0; k<n; ++k)
        {
            for (l=0; l<n; ++l)
            {
                item = [i, j, k, l];
                gray = Abacus.Util.gray(new Array(n), item, n);
                igray = Abacus.Util.igray(new Array(n), gray, n);
                echo(item.join(','), gray.join(','), igray.join(','));
            }
        }
    }
}