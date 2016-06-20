"use strict";

function use_biginteger_arithmetic( Abacus )
{
    // plug-in bigInteger arithmetic routines
    var bigInt = require( './BigInteger.js' );
    Abacus.Arithmetic.equ = function(a, b){ return bigInt(a).eq(bigInt(b)); };
    Abacus.Arithmetic.gte = function(a, b){ return bigInt(a).geq(bigInt(b)); };
    Abacus.Arithmetic.lte = function(a, b){ return bigInt(a).leq(bigInt(b)); };
    Abacus.Arithmetic.gt = function(a, b){ return bigInt(a).gt(bigInt(b)); };
    Abacus.Arithmetic.lt = function(a, b){ return bigInt(a).lt(bigInt(b)); };
    
    Abacus.Arithmetic.add = function(a, b){ return bigInt(a).plus(bigInt(b)); };
    Abacus.Arithmetic.sub = function(a, b){ return bigInt(a).minus(bigInt(b)); };
    Abacus.Arithmetic.mul = function(a, b){ return bigInt(a).times(bigInt(b)); };
    Abacus.Arithmetic.div = function(a, b){ return bigInt(a).over(bigInt(b)); };
    Abacus.Arithmetic.mod = function(a, b){ return bigInt(a).mod(bigInt(b)); };
    Abacus.Arithmetic.pow = function(a, b){ return bigInt(a).pow(bigInt(b)); };
    
    Abacus.Arithmetic.shl = function(a, b){ return bigInt(a).shiftLeft(bigInt(b)); };
    Abacus.Arithmetic.shr = function(a, b){ return bigInt(a).shiftRight(bigInt(b)); };
    Abacus.Arithmetic.bor = function(a, b){ return bigInt(a).or(bigInt(b)); };
    Abacus.Arithmetic.band = function(a, b){ return bigInt(a).and(bigInt(b)); };
    
    Abacus.Arithmetic.rnd = bigInt.randBetween;
    Abacus.Arithmetic.min = bigInt.min;
    Abacus.Arithmetic.max = bigInt.max;
    
    Abacus.Arithmetic.BigInt = bigInt
}
//use_biginteger_arithmetic( './BigInteger.js' );

module.exports = use_biginteger_arithmetic;