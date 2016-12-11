var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus,
    echo = function( x ){ console.log("object" === typeof x ? JSON.stringify(x, null, 2) : x); };

var o;

echo('Abacus.CombinatorialIterator.Template (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('o = Abacus.CombinatorialIterator.Template("((n+1))(n)(m)(1){2}(){3}(0)((n+1))((m+1)){4}((n+m))")');
o = Abacus.CombinatorialIterator.Template("((n+1))(n)(m)(1){2}(){3}(0)((n+1))((m+1)){4}((n+m))");

echo('o.tree()'); 
echo(o.tree());

echo('o = Abacus.CombinatorialIterator.Template("(){2}(n)(m)(1)(0)((n+1))((n+m))")');
o = Abacus.CombinatorialIterator.Template("(){2}(n)(m)(1)(0)((n+1))((n+m))");

echo('o.tree()'); 
echo(o.tree());
