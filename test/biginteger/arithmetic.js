"use strict";

function use_biginteger_arithmetic( Abacus )
{
    // plug-in bigInteger arithmetic routines
    var Arithmetic = Abacus.Arithmetic, bigInt = require( './BigInteger.js' );
    
    Arithmetic.O = bigInt.zero;
    Arithmetic.I = bigInt.one;
    
    Arithmetic.equ = function( a, b ){ return a.eq( b ); };
    Arithmetic.gte = function( a, b ){ return a.geq( b ); };
    Arithmetic.lte = function( a, b ){ return a.leq( b ); };
    Arithmetic.gt = function( a, b ){ return a.gt( b ); };
    Arithmetic.lt = function( a, b ){ return a.lt( b ); };
    
    Arithmetic.inside = function( a, m, M, closed ){ return closed ? (a.geq( m )) && (a.leq( M )) : (a.gt( m )) && (a.lt( M ));
    };
    Arithmetic.clamp = function( a, m, M ){ return a.lt( m ) ? m : (a.gt( M ) ? M : a); };
    Arithmetic.wrap = function( a, m, M ){ return a.lt( m ) ? M : (a.gt( M ) ? m : a); };
    Arithmetic.wrapR = function( a, M ){ return a.lt( 0 ) ? a.plus( M ) : a; };
    
    Arithmetic.add = function( a, b ){ return a.plus( b ); };
    Arithmetic.sub = function( a, b ){ return a.minus( b ); };
    Arithmetic.mul = function( a, b ){ return a.times( b ); };
    Arithmetic.div = function( a, b ){ return a.over( b ); };
    Arithmetic.mod = function( a, b ){ return a.mod( b ); };
    Arithmetic.pow = function( a, b ){ return a.pow( b ); };
    
    Arithmetic.shl = function( a, b ){ return a.shiftLeft( b ); };
    Arithmetic.shr = function( a, b ){ return a.shiftRight( b ); };
    Arithmetic.bor = function( a, b ){ return a.or( b ); };
    Arithmetic.band = function( a, b ){ return a.and( b ); };
    Arithmetic.xor = function( a, b ){ return a.xor( b ); };
    
    Arithmetic.rnd = bigInt.randBetween;
    Arithmetic.min = bigInt.min;
    Arithmetic.max = bigInt.max;
    
    Arithmetic.num = function( a ){ return bigInt( a ); };
}

module.exports = use_biginteger_arithmetic;