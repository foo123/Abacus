Abacus.Class = Class;

// options
Abacus.Options = {
    MAXMEM: 10000,
    RANDOM: "index"
};

DefaultArithmetic = Abacus.DefaultArithmetic = { // keep default arithmetic as distinct
     // whether using default arithmetic or using external implementation (eg big-int or other)
     isDefault: function() {
         return true;
     }
    ,isNumber: function(x) {
        var Arithmetic = this;
        if (Arithmetic.isDefault()) return is_number(x);
        return is_number(x) || is_instance(x, Arithmetic.O[CLASS]);
    }

    ,J: -1
    ,O: 0
    ,I: 1
    ,II: 2
    ,INF: {valueOf: function() {return Infinity;}, toString: function() {return "Infinity";}, toTex: function() {return "\\infty";}} // a representation of Infinity
    ,NINF: {valueOf: function() {return -Infinity;}, toString: function() {return "-Infinity";}, toTex: function() {return "-\\infty";}} // a representation of -Infinity

    ,nums: function(a) {
        var Arithmetic = this;
        if (is_array(a) || is_args(a))
        {
            for (var i=0,l=a.length; i<l; ++i) a[i] = Arithmetic.nums(a[i]); // recursive
            return a;
        }
        return Arithmetic.num(a);
    }
    ,num: function(a) {
        return is_number(a) ? stdMath.floor(a) : parseInt(a || 0, 10);
    }
    ,val: function(a) {
        return stdMath.floor(a.valueOf());
    }
    ,digits: function(a, base) {
        var s = a.toString(+(base || 10)); /* default base 10 */
        if ('-' === s.charAt(0)) s = s.slice(1); // dont include the sign in digits
        return s;
    }

    ,neg: function(a) {return -(+a);}
    ,inv: NotImplemented

    ,equ: function(a, b) {return a === b;}
    ,gte: function(a, b) {return a >= b;}
    ,lte: function(a, b) {return a <= b;}
    ,gt: function(a, b) {return a > b;}
    ,lt: function(a, b) {return a < b;}

    ,inside: function(a, m, M, closed) {return closed ? (a >= m) && (a <= M) : (a > m) && (a < M);}
    ,clamp: function(a, m, M) {return a < m ? m : (a > M ? M : a);}
    ,wrap: function(a, m, M) {return a < m ? M : (a > M ? m : a);}
    ,wrapR: function(a, M) {return a < 0 ? a + M : a;}

    ,add: addn
    ,sub: function(a, b) {return a - b;}
    ,mul: muln
    ,div: function(a, b) {return stdMath.floor(a / b);}
    ,divceil: function(a, b) {return stdMath.ceil(a / b);}
    ,mod: function(a, b) {return a % b;}
    ,pow: stdMath.pow

    ,shl: function(a, b) {return a << b;}
    ,shr: function(a, b) {return a >> b;}
    ,bor: function(a, b) {return a | b;}
    ,band: function(a, b) {return a & b;}
    ,xor: function(a, b) {return a ^ b;}

    ,abs: stdMath.abs
    ,min: stdMath.min
    ,max: stdMath.max
    ,rnd: rndInt
};

// pluggable arithmetics, eg biginteger exact Arithmetic
Abacus.Arithmetic = Merge({}, DefaultArithmetic, {
    isDefault: function() {
        return (0 === this.O) && (this.add === addn);
    }
    ,neg: function(a) {
        return Abacus.Arithmetic.mul(Abacus.Arithmetic.J, a);
    }
    ,abs: function(a) {
        return Abacus.Arithmetic.gt(Abacus.Arithmetic.O, a) ? Abacus.Arithmetic.neg(a) : a;
    }
    ,min: function(a, b) {
        return Abacus.Arithmetic.lt(a, b) ? a : b;
    }
    ,max: function(a, b) {
        return Abacus.Arithmetic.gt(a, b) ? a : b;
    }
    ,divceil: function(a, b) {
        if (null == b) return a;
        // https://stackoverflow.com/questions/921180/how-can-i-ensure-that-a-division-of-integers-is-always-rounded-up
        var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
            roundedTowardsZeroQuotient, dividedEvenly, wasRoundedDown;

            roundedTowardsZeroQuotient = Arithmetic.div(a, b);
            dividedEvenly = Arithmetic.equ(O, Arithmetic.mod(a, b));
            if (dividedEvenly) return roundedTowardsZeroQuotient;
            wasRoundedDown = (Arithmetic.gt(a, O) === Arithmetic.gt(b, O));
            return wasRoundedDown ? Arithmetic.add(roundedTowardsZeroQuotient, I) : roundedTowardsZeroQuotient;
    }
});

// math / num theory utilities
Abacus.Math = {
     rnd: stdMath.random
    ,rndInt: rndInt

    ,factorial: factorial
    ,stirling: stirling
    ,partitions: partitions
    ,compositions: compositions
    ,bell: bell
    ,catalan: catalan
    ,fibonacci: fibonacci
    ,polygonal: polygonal
    ,sum_nk: sum_nk

    ,sum: sum
    ,product: product
    ,pow2: pow2
    ,exp: exp

    ,powsq: function(b, e) {
        var Arithmetic = Abacus.Arithmetic;
        e = is_instance(e, Integer) ? e.num : Arithmetic.num(e);
        if (is_instance(b, Integer)) return new b[CLASS](powsq(b.num, e));
        return powsq(Arithmetic.num(b), e);
    }
    ,addm: function(a, b, m) {
        var Arithmetic = Abacus.Arithmetic;
        m = is_instance(m, Integer) ? m.num : Arithmetic.num(m);
        b = is_instance(b, Integer) ? b.num : Arithmetic.num(b);
        if (is_instance(a, Integer)) return new a[CLASS](addm(a.num, b, m));
        return addm(Arithmetic.num(a), b, m);
    }
    ,negm: function(a, m) {
        var Arithmetic = Abacus.Arithmetic;
        m = is_instance(m, Integer) ? m.num : Arithmetic.num(m);
        if (is_instance(a, Integer)) return new a[CLASS](negm(a.num, m));
        return negm(Arithmetic.num(a), m);
    }
    ,mulm: function(a, b, m) {
        var Arithmetic = Abacus.Arithmetic;
        m = is_instance(m, Integer) ? m.num : Arithmetic.num(m);
        b = is_instance(b, Integer) ? b.num : Arithmetic.num(b);
        if (is_instance(a, Integer)) return new a[CLASS](mulm(a.num, b, m));
        return mulm(Arithmetic.num(a), b, m);
    }
    ,invm: function(a, m) {
        var Arithmetic = Abacus.Arithmetic;
        m = is_instance(m, Integer) ? m.num : Arithmetic.num(m);
        if (is_instance(a, Integer)) return new a[CLASS](invm(a.num, m));
        return invm(Arithmetic.num(a), m);
    }
    ,powm: function(a, b, m) {
        var Arithmetic = Abacus.Arithmetic;
        m = is_instance(m, Integer) ? m.num : Arithmetic.num(m);
        b = is_instance(b, Integer) ? b.num : Arithmetic.num(b);
        if (is_instance(a, Integer)) return new a[CLASS](powm(a.num, b, m));
        return powm(Arithmetic.num(a), b, m);
    }
    ,isqrt: function(a) {
        var Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Integer)) return new a[CLASS](isqrt(a.num));
        return isqrt(Arithmetic.num(a));
    }
    ,ikthroot: function(a, k) {
        var Arithmetic = Abacus.Arithmetic;
        k = is_instance(k, Integer) ? k.num : Arithmetic.num(k);
        if (is_instance(a, Integer)) return new a[CLASS](ikthroot(a.num, k));
        return ikthroot(Arithmetic.num(a), k);
    }
    ,isqrtp: function(a, p) {
        var Arithmetic = Abacus.Arithmetic;
        p = is_instance(p, Integer) ? p.num : Arithmetic.num(p);
        if (is_instance(a, Integer)) return new a[CLASS](isqrtp(a.num, p));
        return isqrtp(Arithmetic.num(a), p);
    }
    ,ilog: function(x, b) {
        var Arithmetic = Abacus.Arithmetic;
        b = is_instance(b, Integer) ? b.num : Arithmetic.num(b);
        if (is_instance(x, Integer)) return new x[CLASS](ilog(x.num, b));
        return ilog(Arithmetic.num(x), b);
    }
    ,divisors: function(n, as_generator) {
        var Arithmetic = Abacus.Arithmetic;
        return divisors(is_instance(n, Integer) ? n : Arithmetic.num(n), true === as_generator);
    }
    ,legendre: function(a, p) {
        var Arithmetic = Abacus.Arithmetic;
        p = is_instance(p, Integer) ? p.num : Arithmetic.num(p);
        if (is_instance(a, Integer)) return new a[CLASS](legendre_symbol(a.num, p));
        return legendre_symbol(Arithmetic.num(a), p);
    }
    ,jacobi: function(a, n) {
        var Arithmetic = Abacus.Arithmetic;
        n = is_instance(n, Integer) ? n.num : Arithmetic.num(n);
        if (is_instance(a, Integer)) return new a[CLASS](jacobi_symbol(a.num, n));
        return jacobi_symbol(Arithmetic.num(a), n);
    }
    ,moebius: function(n) {
        var Arithmetic = Abacus.Arithmetic;
        if (is_instance(n, Integer)) return new n[CLASS](moebius(n.num));
        return moebius(Arithmetic.num(n));
    }
    ,pollardRho: function(n, s, a, retries, max_steps, F) {
        var N = Abacus.Arithmetic.num, f;
        if (null != a) a = is_instance(a, Integer) ? a.num : N(a);
        if (null != s) s = is_instance(s, Integer) ? s.num : N(s);
        if (is_instance(n, Integer))
        {
            f = pollard_rho(n.num, s, a, retries, max_steps||null, F||null);
            return null == f ? f : (new n[CLASS](f));
        }
        return pollard_rho(N(n), s, a, retries, max_steps || null, F || null);
    }
    ,factorize: function(n) {
        var Arithmetic = Abacus.Arithmetic;
        return factorize(is_instance(n, Integer) ? n : Arithmetic.num(n));
    }
    ,isProbablePrime: function(n) {
        var Arithmetic = Abacus.Arithmetic;
        return is_probable_prime(is_instance(n, Integer) ? n.num : Arithmetic.num(n));
    }
    ,isPrime: function(n) {
        var Arithmetic = Abacus.Arithmetic;
        return is_prime(is_instance(n, Integer) ? n.num : Arithmetic.num(n));
    }
    ,nextPrime: function(n, dir) {
        var Arithmetic = Abacus.Arithmetic;
        return next_prime(is_instance(n, Integer) ? n.num : Arithmetic.num(n), -1 === dir ? -1 : 1);
    }

    ,gcd: function(/* args */) {
        var Arithmetic = Abacus.Arithmetic,
            args = slice.call(arguments.length && (is_array(arguments[0])||is_args(arguments[0])) ? arguments[0] : arguments),
            res, INT = null;
        res = gcd(args.map(function(a) {
            if (is_instance(a, Integer))
            {
                if (!INT) INT = a[CLASS];
                return a.num;
            }
            return Arithmetic.num(a);
        }));
        return INT ? new INT(res) : res;
    }
    ,xgcd: function(/* args */) {
        var Arithmetic = Abacus.Arithmetic,
            args = slice.call(arguments.length && (is_array(arguments[0])||is_args(arguments[0])) ? arguments[0] : arguments),
            res, INT = null;
        res = xgcd(args.map(function(a) {
            if (is_instance(a, Integer))
            {
                if (!INT) INT = a[CLASS];
                return a.num;
            }
            return Arithmetic.num(a);
        }));
        return INT && res ? res.map(function(g) {return new INT(g);}) : res;
    }
    ,lcm: function(/* args */) {
        var Arithmetic = Abacus.Arithmetic,
            args = slice.call(arguments.length && (is_array(arguments[0])||is_args(arguments[0])) ? arguments[0] : arguments),
            res, INT = null;
        res = lcm(args.map(function(a) {
            if (is_instance(a, Integer))
            {
                if (!INT) INT = a[CLASS];
                return a.num;
            }
            return Arithmetic.num(a);
        }));
        return INT ? new INT(res) : res;
    }

    ,diophantine: function(a, b, with_param, with_free_vars) {
        var Arithmetic = Abacus.Arithmetic;
        if ((!is_array(a) && !is_args(a)) || !a.length) return null;
        return solvedioph(Arithmetic.nums(a), Arithmetic.num(b||0), with_param, true === with_free_vars);
    }
    ,diophantines: function(a, b, with_param, with_free_vars) {
        var ring = Ring.Z();
        if (!is_instance(a, Matrix) && !is_array(a) && !is_args(a)) return null;
        if (is_instance(a, Matrix) && (!a.nr || !a.nc)) return null;
        if (!is_instance(a, Matrix) && !a.length) return null;
        //a = is_instance(a, Matrix) ? a : a;
        if (!is_instance(b, Matrix) && !is_array(b) && !is_args(b))
        {
            b = array(is_instance(a, Matrix) ? a.nr : a.length, function() {return b || 0;});
        }
        b = is_instance(b, Matrix) ? b : ring.cast(b);
        return solvediophs(a, b, with_param, true === with_free_vars);
    }
    ,congruence: function(a, b, m, with_param, with_free_vars) {
        var Arithmetic = Abacus.Arithmetic;
        if ((!is_array(a) && !is_args(a)) || !a.length) return null;
        return solvecongr(Arithmetic.nums(a), Arithmetic.num(b || 0), Arithmetic.num(m || 0), with_param, true === with_free_vars);
    }
    ,congruences: function(a, b, m, with_param, with_free_vars) {
        var ring = Ring.Z();
        if (!is_instance(a, Matrix) && !is_array(a) && !is_args(a)) return null;
        if (is_instance(a, Matrix) && (!a.nr || !a.nc)) return null;
        if (!is_instance(a, Matrix) && !a.length) return null;
        a = is_instance(a, Matrix) ? a : ring.cast(a);
        if (!is_instance(b, Matrix) && !is_array(b) && !is_args(b))
        {
            b = array(is_instance(a, Matrix) ? a.nr : a.length, function() {return b || 0;});
        }
        b = is_instance(b, Matrix) ? b : ring.cast(b);
        if (!is_instance(m, Matrix) && !is_array(m) && !is_args(m))
        {
            m = array(is_instance(a, Matrix) ? a.nr : a.length, function(){return m || 0;});
        }
        m = is_instance(m, Matrix) ? m : ring.cast(m);
        return solvecongrs(a, b, m, with_param, true === with_free_vars);
    }
    ,pythagorean: function(a, with_param) {
        var Arithmetic = Abacus.Arithmetic;
        if ((!is_array(a) && !is_args(a)) || !a.length) return null;
        return solvepythag(Arithmetic.nums(a), with_param)
    }
    ,linears: function(a, b, with_param) {
        var ring = Ring.Q();
        if (!is_instance(a, Matrix) && !is_array(a) && !is_args(a)) return null;
        if (is_instance(a, Matrix) && (!a.nr || !a.nc)) return null;
        if (!is_instance(a, Matrix) && !a.length) return null;
        //a = is_instance(a, Matrix) ? a : a;
        if (!is_instance(b, Matrix) && !is_array(b) && !is_args(b))
        {
            b = array(is_instance(a, Matrix) ? a.nr : a.length, function() {return b || 0;});
        }
        b = is_instance(b, Matrix) ? b : ring.cast(b);
        return solvelinears(a, b, with_param);
    }
    ,lineqs: function(a, b, param) {
        var ring = Ring.Q();
        if (!is_instance(a, Matrix) && !is_array(a) && !is_args(a)) return null;
        if (is_instance(a, Matrix) && (!a.nr || !a.nc)) return null;
        if (!is_instance(a, Matrix) && !a.length) return null;
        //a = is_instance(a, Matrix) ? a : a;
        if (!is_instance(b, Matrix) && !is_array(b) && !is_args(b))
        {
            b = array(is_instance(a, Matrix) ? a.nr : a.length, function() {return b || 0;});
        }
        b = is_instance(b, Matrix) ? b : ring.cast(b);
        return solvelineqs(a, b, param);
    }
    ,groebner: buchberger_groebner

    ,dotp: function(a, b) {
        var Arithmetic = Abacus.Arithmetic;
        return (is_array(a) || is_args(a)) && (is_array(b) || is_args(b)) ? dotp(a, b, Arithmetic) : Arithmetic.O;
    }
    ,orthogonalize: function(v) {
        return (is_array(v) || is_args(v)) && v.length ? gramschmidt(v) : [];
    }
};

// array/list utilities
Abacus.Util = {
     array: array
    ,operate: operate
    ,flatten: flatten
    ,unique: unique
    ,intersection: intersection
    ,difference: difference
    ,multi_difference: multi_difference
    ,union: merge
    ,bsearch: binarysearch
    ,bisect: bisect
    ,complementation: complementation
    ,reflection: reflection
    ,reversion: reversion
    ,lcs: lcs
    ,align: align
    ,merge: merge_sequences
    ,gray: gray
    ,igray: igray
    ,grayn: grayn
    ,igrayn: igrayn
    ,finitedifference: fdiff
    ,partialsum: psum
    ,convolution: convolution
    ,summation: summation
    ,wheel: wheel
    ,sort: mergesort
    ,shuffle: shuffle
    ,pick: pick
    ,pluck: pluck
    ,is_mirror_image: is_mirror_image
    ,cycle_detection: floyd_cycle_detection
};
