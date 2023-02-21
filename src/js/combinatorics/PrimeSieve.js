HashSieve = function HashSieve() {
    var self = this, _hash = null;

    if (!is_instance(self, HashSieve)) return new HashSieve();

    _hash = Obj(); //{};

    self.dispose = function() {
        self.empty();
        _hash = null;
        return self;
    };

    self.empty = function() {
        var i, iter, j, l;
        if (!_hash) return self;
        for (i in _hash)
        {
            if (!HAS.call(_hash, i) || null == _hash[i]) continue;
            for (iter=_hash[i],j=0,l=iter.length; j<l; j++)
                if (iter[j]) iter[j].dispose();
        }
        return self;
    };

    self.reset = function() {
        self.empty();
        _hash = Obj();
        return self;
    };

    self.add = function(iter, number) {
        var first = iter.next(), key;
        if (null == first)
        {
            iter.dispose();
            return self;
        }

        key = String(first);

        if (_hash[key])
            _hash[key].push(iter);
        else
            _hash[key] = [iter];

        return self;
    };

    self.has = function(number) {
        var key = String(number);
        if (_hash[key])
        {
            _remove(number, key);
            return true;
        }
        return false;
    };

    function _remove(number, key) {
        var iter = _hash[key], i, l;

        if (null == iter) return false;

        delete _hash[key];

        for (i=0,l=iter.length; i<l; i++) self.add(iter[i], number);

        return number;
    };
};

// https://en.wikipedia.org/wiki/Generation_of_primes#Prime_sieves
// https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes
// https://en.wikipedia.org/wiki/Sieve_of_Sundaram
// https://en.wikipedia.org/wiki/Sieve_of_Atkin
// An efficient, lazy, "infinite" prime sieve as iterator (supports Eratosthenes' and maybe in future also Atkin's Sieve)
PrimeSieve = Abacus.PrimeSieve = Class(Iterator, {

    // extends and implements Iterator
    constructor: function PrimeSieve($) {
        var self = this, Arithmetic = Abacus.Arithmetic;

        if (!is_instance(self, PrimeSieve)) return new PrimeSieve($);

        $ = $ || {};
        $.type = String($.type || "eratosthenes").toLowerCase();
        $.NumberClass = is_class($.NumberClass, Integer) ? $.NumberClass : null;
        $.count = Arithmetic.I; // infinite

        // (Eratosthenes) Sieve with pre-computed small primes list
        self._multiples = new HashSieve();
        self._small_primes = small_primes();
        if (!self._small_primes || !self._small_primes.length) self._small_primes = [Arithmetic.II]; // first prime
        self._p = 0;

        Iterator.call(self, "PrimeSieve", $);
    }

    ,_multiples: null
    ,_small_primes: null
    ,_p: 0

    ,dispose: function() {
        var self = this;
        if (self._multiples) self._multiples.dispose();
        self._multiples = null;
        self._small_primes = null;
        self._p = null;
        return Iterator[PROTO].dispose.call(self);
    }
    ,rewind: function(dir) {
        var self = this;
        self._multiples.reset();
        self._p = 0;
        return self;
    }
    ,hasNext: function(dir){
        dir = -1 === dir ? -1 : 1;
        return 0 < dir; /* infinite primes (only forward) */
    }
    ,next: function(dir) {
        dir = -1 === dir ? -1 : 1;
        if (0 > dir) return null;

        var self = this, $ = self.$, pp, p2, pl, ps,
            multiples = self._multiples, small_primes = self._small_primes,
            Arithmetic = Abacus.Arithmetic, two = Arithmetic.II,
            prime = self.__item, output;

        do {
            // Eratosthenes sieve with pre-computed small primes list
            // O(n log(log(n))) for getting all primes up to n
            if (self._p < small_primes.length)
            {
                // get primes from the pre-computed list
                //self.__index = Arithmetic.num(self._p);
                prime = small_primes[self._p++];

                // add odd multiples of this prime to the list for crossing out later on,
                // start from p^2 since lesser multiples are already crossed out by previous primes
                if (Arithmetic.gt(prime, two))
                {
                    pp = Arithmetic.mul(prime, prime); p2 = Arithmetic.add(prime, prime);
                    pl = small_primes[small_primes.length-1]; // last prime in list
                    if (Arithmetic.lt(pp, pl))
                    {
                        // take multiples of this prime AFTER the last prime in list
                        // lesser multiples have already been taken care of
                        ps = Arithmetic.div(Arithmetic.sub(pl, pp), p2);
                        pp = Arithmetic.add(pp, Arithmetic.mul(ps, p2));
                        if (Arithmetic.lte(pp, pl)) pp = Arithmetic.add(pp, p2);
                    }
                    multiples.add(new Progression(pp, p2, Arithmetic.INF));
                }
            }
            else
            {
                if (Arithmetic.equ(prime, two))
                {
                    // first odd prime
                    prime = Arithmetic.num(3);
                }
                else
                {
                    // check candidate primes, using odd increments, ie avoid multiples of two faster
                    do {

                        prime = Arithmetic.add(prime, two);

                    } while (multiples.has(prime));
                }

                // add odd multiples of this prime to the list for crossing out later on,
                // start from p^2 since lesser multiples are already crossed out by previous primes
                pp = Arithmetic.mul(prime, prime); p2 = Arithmetic.add(prime, prime);
                multiples.add(new Progression(pp, p2, Arithmetic.INF));

                //self.__index = Arithmetic.add(self.__index, Arithmetic.I);
            }

            output = self.output($.NumBerClass ? new $.NumBerClass(prime) : prime);
        } while ($.filter && (null!=output) && !$.filter.apply(output, self));

        self.__item = prime;
        self._item = output;
        return prime;
    }
});
