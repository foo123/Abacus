var 
factorial = function( n ) {
    var Fn;
    if ( 0 > n ) 
    {
        Fn = 0;
    }
    else if ( 2 > n ) 
    {
        Fn = 1;
    }
    else if ( 4 > n ) 
    {
        Fn = n*(n-1);
    }
    else
    {
        // compute it directly
        // use logarithmic sums to avoid overflows etc..
        var logFn = 0;
        while ( n > 1 ) logFn += Math.log(n--);
        Fn = Math.floor(0.5+Math.exp(logFn));
    }
    return Fn;
}
// http://en.wikipedia.org/wiki/Binomial_coefficient
,binomial = function( n, k ) {
    var Cnk;
    k = Math.min(k, n - k); // take advantage of symmetry
    if ( 0 > k || 1 > n ) 
    {
        Cnk = 0;
    }
    else if ( 0 === k || 1 === n ) 
    {
        Cnk = 1;
    }
    else if ( 1 === k ) 
    {
        Cnk = n;
    }
    else
    {
        // compute it directly
        // use logarithmic sums to avoid overflows etc..
        var logCnk = 0, i;
        for (i=0; i<k; i++) logCnk += Math.log(n - i) - Math.log(k - i);
        Cnk = Math.floor(0.5+Math.exp(logCnk));
    }
    return Cnk;
}
,partitions = function partitions( n, k, m ) {
    // compute number of integer partitions of n
    // into exactly k parts
    // having m as max value
    // m + k-1 <= n <= k*m
    if ( m === n && 1 === k ) return 1;
    if ( m+k>n+1 || k*m<n ) return 0;
    var j, jmax=Math.min(m,n-m-k+2), jmin=Math.max(1,Math.ceil((n-m)/(k-1))), p = 0;
    for (j=jmin; j<=jmax; j++) p += partitions( n-m, k-1, j );
    return p;
}
,partition = function( n ) {
     var p = n > 1 ? 2 : 1, k, m;
     for (k=2; k<n; k++) 
     {
         for (m=n-k+1; m>=1; m--)
            p += partitions(n, k, m);
     }
     return p;
 }
;

/*var factorials = [], choices = [], n, k;

for (n=4; n<68; n++) factorials.push(factorial(n));

for (n=3; n<67; n++) 
    for(k=2; k<n; k++) choices.push(binomial(n,k));

console.log('FACT_N_4_68 = '+JSON.stringify(factorials));
console.log('BINOM_N_K_3_67 = '+JSON.stringify(choices));*/

for (var n=0; n<=50; n++)
    console.log([n, partition(n)]);
