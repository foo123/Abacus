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
