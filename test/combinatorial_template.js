var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

var o;

echo('Abacus.CombinatorialIterator.Template (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('o = Abacus.CombinatorialIterator.Template("(n)(m)(1){2}x{3}(0)(n+1)(m+1){4}")');
o = Abacus.CombinatorialIterator.Template("(n)(m)(1){2}x{3}(0)(n+1)(m+1){4}");

echo('o.data'); 
echo(o.data);

