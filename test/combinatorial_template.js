var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus,
    echo = function( x ){ console.log("object" === typeof x ? JSON.stringify(x, null, 2) : x); };


var o;

echo('Abacus.CombinatorialIterator.Template (VERSION = '+Abacus.VERSION+')');
echo('---');

/*echo('Abacus.CombinatorialTest(4, 0, 5, "inc")');
var combtest = Abacus.CombinatorialTest(new Array(4), 0, 5, "inc");
while( combtest )
{
    console.log(combtest.slice());
    combtest = Abacus.CombinatorialTest(combtest, 0, 5, "inc"/*"nondec","indie"* /);
}*/

/*echo('o = Abacus.CombinatorialIterator.Template("((n+1))(n)(m)(1){2}(){3}(0)((n+1))((m+1)){4}((n+m))")');
o = Abacus.CombinatorialIterator.Template("((n+1))(n)(m)(1){2}(){3}(0)((n+1))((m+1)){4}((n+m))");

echo('o.ast'); 
echo(o.ast);

echo('o = Abacus.CombinatorialIterator.Template("(){2}(n)(m)(1)(0)((n+1))((n+m))")');
o = Abacus.CombinatorialIterator.Template("(){2}(n)(m)(1)(0)((n+1))((n+m))");

echo('o.ast'); 
echo(o.ast);
*/
echo('o = Abacus.CombinatorialIterator.Template("(){2}(n)(m)(4)(5)((3*n+4))((m+4))")');
o = Abacus.CombinatorialIterator.Template("(){2}(n)(m)(4)(5)((3*n+4))((m+4))");

echo('o.ast'); 
echo(o.ast);

echo('o = Abacus.CombinatorialIterator.Template("(n)(m)(k)(l)((l))((k))((m+2*n+1))((n))")');
o = Abacus.CombinatorialIterator.Template("(n)(m)(k)(l)((l))((k))((m+2*n+1))((n))");

echo('o.ast'); 
echo(o.ast);
