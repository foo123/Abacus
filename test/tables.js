var 
     echo = console.log, stringify = JSON.stringify
    ,random = Math.random, round = Math.round, ceil = Math.ceil
    ,floor = Math.floor, exp = Math.exp, log = Math.log, pow = Math.pow
    ,min = Math.min, max = Math.max, EULER = Math.E
    ,log2 = Math.log2 || function(x) { return Math.log(x) / Math.LN2; }
    
    ,factorial = function factorial( n ) {
        if ( 0 > n ) return 0;
        else if ( 2 > n ) return 1;
        // 2=>2 or 3=>6
        else if ( 4 > n ) return n<<(n-2);
        // compute it directly
        else
        {
            // use logarithmic sums to avoid overflows etc..
            var logFn = log(6);
            while ( n >= 4 ) logFn += log(n--);
            return floor(0.5+exp(logFn));
        }
    }
    ,subfactorial = function subfactorial( n ) {
        return floor(0.5 + factorial( n )/EULER);
    }
    ,binomial = function binomial( n, k ) {
        k = min(k, n - k); // take advantage of symmetry
        if ( 0 > k || 1 > n ) return 0;
        else if ( 0 === k || 1 === n ) return 1;
        else if ( 1 === k ) return n;
        // compute it directly
        else
        {
            var n_k = n-k, Cnk = 1 + n_k, i;
            for (i=2; i<=k; i++) Cnk *= 1 + n_k/i;
            return floor(0.5+Cnk);
        }
    }
    // recursively compute the partition count using the recursive relation:
    // http://en.wikipedia.org/wiki/Partition_(number_theory)#Partition_function
    // http://www.programminglogic.com/integer-partition-algorithm/
    ,partitions = function partitions( n, k, m ) {
        // compute number of integer partitions of n
        // into exactly k parts
        // having m as max value
        // m + k-1 <= n <= k*m
        if ( (m === n && 1 === k) || (k === n && 1 === m) ) return 1;
        if ( m+k>n+1 || k*m<n ) return 0;
        // compute it directly
        var j, jmax=min(m,n-m-k+2), jmin=max(1,ceil((n-m)/(k-1))), p = 0;
        for (j=jmin; j<=jmax; j++) p += partitions( n-m, k-1, j );
        return p;
    }
    ,partitions_dynamic = function partitions_dynamic( n, k, m ) {
        if ( m === n && 1 === k ) return 1;
        if ( m+k>n+1 || k*m<n ) return 0;
        // dynamic programming
        var T = new Array(n), i1, i2, i3, j, jmin, jmax;
        for (i1=0; i1<n; i1++)
        {
            T[i1] = new Array(k);
            for (i2=0; i2<k; i2++)
            {
                T[i1][i2] = new Array(m);
                for (i3=0; i3<m; i3++)
                {
                    T[i1][i2][i3] = ((i3===i1 && 1===i2+1)||(i2===i1 && 1===i3+1)) ? 1 : 0;
                }
            }
        }
        for (i1=1; i1<=n; i1++)
        {
            for (i2=1; i2<=k; i2++)
            {
                for (i3=1; i3<=i1; i3++)
                {
                    if ( i3+i2>i1+1 || i2*i3<i1 ) continue;
                    jmin = max(1,ceil((i1-i3)/(i2-1)));
                    jmax = min(i3,i1-i3-i2+2); 
                    for (j=jmin; j<=jmax; j++)
                    {
                        T[i1-1][i2-1][i3-1] += T[i1-i3-1][i2-2][j-1];
                    }
                }
            }
        }
        return T[n-1][k-1][m-1];
    }
    ,factorial_table = function( B ) {
        var b = B-4, factorials = new Array(b), n;
        for (n=0; n<b; n++) factorials[n] = factorial(n+4);
        return factorials;
    }
    ,binomial_table = function( B ) {
        var binomials = [], n, k;

        for (n=3; n<B; n++) 
            for(k=2; k<n; k++) binomials.push( binomial(n, k) );
        return binomials;
    }
    ,partition_table = function partition_table( B ) {
        // dynamic programming
        var n = 1<<B, B2 = B<<1, B3 = B+B2, k = n, m = n, L = 1<<B3;
        var T = new Array(L), i, i1, i2, i3, j, jmin, jmax;
        i1 = 0; i2 = 0; i3 = 0;
        for (i=0; i<L; i++) 
        {
            T[i] = ((i3===i1 && 1===i2+1)||(i2===i1 && 1===i3+1)) ? 1 : 0;
            i3++;
            if ( i3>=m ) { i3=0; i2++; if ( i2>=k ) { i2=0; i1++; } }
        }
        for (i1=1; i1<=n; i1++)
        {
            for (i2=1; i2<=k; i2++)
            {
                for (i3=1; i3<=i1; i3++)
                {
                    if ( i3+i2>i1+1 || i2*i3<i1 ) continue;
                    jmin = max(1,ceil((i1-i3)/(i2-1)));
                    jmax = min(i3,i1-i3-i2+2); 
                    for (j=jmin; j<=jmax; j++)
                    {
                        T[((i1-1)<<B2)+((i2-1)<<B)+i3-1] += T[((i1-i3-1)<<B2)+((i2-2)<<B)+j-1];
                    }
                }
            }
        }
        return T;
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
    ,partition_dynamic = function( n ) {
         var p = n > 1 ? 2 : 1, k, m;
         for (k=2; k<n; k++) 
         {
             for (m=n-k+1; m>=1; m--)
                p += partitions_dynamic(n, k, m);
         }
         return p;
     }
;


echo( 'FACT_N_4_20 = ' + stringify( factorial_table(20) ) );
echo( 'BINOM_N_K_3_23 = ' + stringify( binomial_table(23) ) );
echo( 'PART_N_K_M_32 = ' + stringify( partition_table(5) ) );


/*
// http://www.numericana.com/data/partition.htm
var numericana_partitions = [
 1
,1
,2
,3
,5
,7
,11
,15
,22
,30
,42
,56
,77
,101
,135
,176
,231
,297
,385
,490
,627
,792
,1002
,1255
,1575
,1958
,2436
,3010
,3718
,4565
,5604
,6842
,8349
,10143
,12310
,14883
,17977
,21637
,26015
,31185
,37338
,44583
,53174
,63261
,75175
,89134
,105558
,124754
,147273
,173525
,204226
];
for (var n=0; n<numericana_partitions.length; n++)
    echo([n, numericana_partitions[n], partition(n)]);

*/