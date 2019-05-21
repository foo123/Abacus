var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

var o, N;
// solve exactly the Knapsack problem by Combinatorial methods using Abacus

// to do