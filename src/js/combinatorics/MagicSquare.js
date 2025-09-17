MagicSquare = Abacus.MagicSquare = Class({

    constructor: function MagicSquare(n, s) {
        var self = this;
        if (!is_instance(self, MagicSquare)) return new MagicSquare(n, s);
        self.n = +(n || 0);
        self.s = is_array(s) ? s : MagicSquare.make(self.n);
    }

    ,__static__: {
        isMagic: function(s) {
            return is_magic(is_instance(s, MagicSquare) ? s.s : s);
        }
        ,make: function magic_square(n) {
            // non-existent
            if ((0 >= n) || (2 === n)) return null;
            // trivial
            if (1 === n) return [[1]];

            var i, j, k,
                odd = n&1, even = 1-odd,
                doubly_even = 0 === (/*n%4*/n&3),
                nn = n*n, n2 = (n-odd)>>>1,
                O, o, n22, a, b, c, lc, rc, t,
                n12, n21, magic;

            magic = new Array(n);
            for (i=0; i<n; ++i) magic[i] = new Array(n);

            if (odd) // odd order
            {
                // O(n^2)
                n12 = n+n2; n21 = n2+odd;
                for (k=0,i=0,j=0; k<nn; ++k,++j)
                {
                    if (j >= n) {++i; j = 0;}
                    magic[i][j] = ((n12+j-i) % n) * n + ((n21+i+j) % n) + 1;
                }
            }

            else if (doubly_even) // doubly-even order
            {
                // O(n^2)
                for (k=0,i=0,j=0; k<nn; ++k,++j)
                {
                    if (j >= n) {++i; j = 0;}
                    magic[i][j] = (((i+1)/*%4*/ & 3) >>> 1 === ((j+1)/*%4*/ & 3) >>> 1) ? (nn - k) : (k + 1);
                }
            }

            else //if (even) // singly-even order
            {
                // O((n/2)^2)
                O = magic_square(n2); n22 = n2*n2;
                a = n22; b = a<<1; c = b+n22;
                for (k=0,i=0,j=0; k<n22; ++k,++j)
                {
                    if (j >= n2) {++i; j = 0;}
                    o = O[i][j];
                    magic[i][j] = o;
                    magic[i+n2][j+n2] = o + a;
                    magic[i+n2][j] = o + b;
                    magic[i][j+n2] = o + c;
                }
                lc = n2 >>> 1; rc = lc;
                for (j=0; j<n2; ++j)
                {
                    for (i=0; i<n; ++i)
                    {
                        if (((i < lc) || (i > n - rc) || (i === lc && j === lc)) &&
                        !(i === 0 && j === lc))
                        {
                            t = magic[i][j];
                            magic[i][j] = magic[i][j + n2];
                            magic[i][j + n2] = t;
                        }
                    }
                }
            }
            return magic;
        }
        ,product: function(/* args */) {
            if (1 >= arguments.length) return arguments[0];
            var m = arguments, nm = m.length, m1, m2, mm = m[0], mult, n1, n2, n22, n12, k = 1, i, j, i1, i2, j1, j2;
            while (k < nm)
            {
                m1 = mm; m2 = m[k++];
                n1 = m1.length; n2 = m2.length; n22 = n2*n2; n12 = n1*n2;
                mm = new Array(n12);
                for (i=0; i<n12; ++i) mm[i] = new Array(n12);
                i1 = 0; i = 0; j1 = 0; j = 0; i2 = 0; j2 = 0;
                mult = (m1[i1][j1] - 1) * n22;
                while (i1 < n1)
                {
                    mm[i+i2][j+j2] = mult + m2[i2][j2];
                    if (++j2 >= n2)
                    {
                        ++i2; j2 = 0;
                        if (i2 >= n2)
                        {
                            ++j1; j += n2; i2 =0 ; j2 = 0;
                            if (j1 >= n1) {++i1; i += n2; j1 =0 ; j = 0; i2 = 0; j2 = 0;}
                            if (i1 < n1 && j1 < n1) mult = (m1[i1][j1] - 1) * n22;
                        }
                    }
                }
            }
            return mm;
        }
        ,pythagorean: NotImplemented
        ,toString: function(s) {
            var n, len, out = '', i;
            if (null == s) return out;
            n = s.length; len = String(n*n).length;
            for (i=0; i<n; ++i)
                out += s[i].map(function(x) {return pad(String(x), len, ' ');}).join(' ') + "\n";
            return out;
        }
    }

    ,n: null
    ,s: null
    ,_str: null

    ,dispose: function() {
        var self = this;
        self.n = null;
        self.s = null;
        self._str = null;
        return self;
    }
    ,mul: function(other) {
        var self = this;
        return MagicSquare(self.n*other.n, self.s && other.s ? MagicSquare.product(self.s, other.s) : null);
    }
    ,toString: function() {
        var self = this;
        if (null == self._str)
            self._str = self.s ? MagicSquare.toString(self.s) : '';
        return  self._str;
    }
});

LatinSquare = Abacus.LatinSquare = Class({

    constructor: function LatinSquare(n) {
        var self = this;
        if (!is_instance(self, LatinSquare)) return new LatinSquare(n);
        self.n = +(n || 0);
        self.s = LatinSquare.make(self.n);
    }

    ,__static__: {
        isLatin: function(s) {
            return is_latin(is_instance(s, LatinSquare) ? s.s : s);
        }
        ,make: function(n) {
            // O(n x n)
            var i, j, k = 1, s = new Array(n), a, b, a2, b2, diag, Nn,
                val = Abacus.Arithmetic.val, N = Abacus.Arithmetic.num;
            if (0 >= n) return null;
            // try to construct a (pan-)diagonal latin square first
            diag = 0;
            if ((n & 1) /* odd */ && (n % 3) /* not divisable by 3 */)
            {
                a = 2; b = 1;
                diag = 2; // conditions met for (pan-)diagonal square
            }
            else if (n & 1 /* odd */)
            {
                // else try an exhaustive search over the possible factors
                Nn = N(n);
                for (i=1; i<n; ++i)
                {
                    if (1 === val(gcd(N(i), Nn))) a = i;
                    else continue;
                    for (j=i+1; j<n; ++j)
                    {
                        if (1 === val(gcd(N(j), Nn))) b = j;
                        else continue;
                        a2 = a; b2 = b; // backup partial solution
                        diag = 1;
                        if ((1 === val(gcd(N(a-b), Nn))) && (1 === val(gcd(N(a+b), Nn))))
                        {
                            diag = 2; // conditions met for (pan-)diagonal square
                            break;
                        }
                    }
                    if (2 === diag) break;
                }
                if (diag)
                {
                    // get latest solutions
                    a = a2; b = b2;
                }
            }
            if (diag)
            {
                for (i=0; i<n; ++i)
                {
                    s[i] = new Array(n);
                    for (j=0; j<n; ++j) s[i][j] = (((i*b)+(j*a)) % n) + 1;
                }
            }
            else
            {
                // else default to a normal latin square
                for (i=0; i<n; ++i)
                {
                    s[i] = new Array(n);
                    for (j=0; j<n; ++j) s[i][j] = ((j+i) % n) + 1;
                }
            }
            return s;
        }
        ,toString: function(s) {
            var n, len, out = '', i;
            if (null == s) return out;
            n = s.length; len = String(n).length;
            for (i=0; i<n; ++i)
                out += s[i].map(function(x) {return pad(String(x), len, ' ');}).join(' ') + "\n";
            return out;
        }
    }

    ,n: null
    ,s: null
    ,_str: null

    ,dispose: function() {
        var self = this;
        self.n = null;
        self.s = null;
        self._str = null;
        return self;
    }
    ,toString: function() {
        var self = this;
        if (null == self._str)
            self._str = self.s ? LatinSquare.toString(self.s) : '';
        return  self._str;
    }
});

function is_magic(square)
{
    if (!square) return false;
    var n = square.length, n2 = n*n, i, j, k,
        summa_row = 0, summa_col = 0, summa_d1 = 0, summa_d2 = 0,
        summa = (n*n2+n) >>> 1, seen = new Array(n2);
    for (i=0; i<n; ++i)
    {
        if (n !== square[i].length) return false;
        k = square[i][0];
        if (!seen[k-1]) seen[k-1] = [i, 0];
        if (k < 1 || k > n2 || i !== seen[k-1][0] || 0 !== seen[k-1][1]) return false;
        summa_row = k;
        k = square[0][i];
        if (!seen[k-1]) seen[k-1] = [0, i];
        if (k < 1 || k > n2 || 0 !== seen[k-1][0] || i !== seen[k-1][1]) return false;
        summa_col = k;
        summa_d1 += square[i][i];
        summa_d2 += square[i][n-1-i];
        for (j=1; j<n; ++j)
        {
            k = square[i][j];
            if (!seen[k-1]) seen[k-1] = [i, j];
            if (k < 1 || k > n2 || i !== seen[k-1][0] || j !== seen[k-1][1]) return false;
            summa_row += k;
            k = square[j][i];
            if (!seen[k-1]) seen[k-1] = [j, i];
            if (k < 1 || k > n2 || j !== seen[k-1][0] || i !== seen[k-1][1]) return false;
            summa_col += k;
        }
        if ((summa_row !== summa) || (summa_col !== summa)) return false;
    }
    if ((summa_d1 !== summa) || (summa_d2 !== summa)) return false;
    return true;
}
function is_latin(square)
{
    if (!square) return false;
    var n = square.length, i, j, k, m, seen = new Array(n);
    for (i=0; i<n; ++i)
    {
        if (n !== square[i].length) return false;
        // rows
        for (k=0; k<n; ++k)
        {
            // initialize
            seen[k] = 0;
        }
        for (j=0; j<n; ++j)
        {
            m = square[i][j];
            k = square[0].indexOf(m);
            if (0 > k || 0 < seen[k]) return false;
            seen[k] = 1;
        }
        // columns
        for (k=0; k<n; ++k)
        {
            // initialize
            seen[k] = 0;
        }
        for (j=0; j<n; ++j)
        {
            m = square[j][i];
            k = square[0].indexOf(m);
            if (0 > k || 0 < seen[k]) return false;
            seen[k] = 1;
        }
    }
    return true;
}
