// Abacus.BitArray, Packed Bit Array Implementation
Abacus.BitArray = Class({

    constructor: function BitArray(n) {
        var self = this;
        if (!is_instance(self, BitArray)) return new BitArray(n);
        self.length = n;
        self.bits = new Uint32Array(stdMath.ceil(n/32));
    }

    ,length: 0
    ,bits: null

    ,dispose: function() {
        var self = this;
        self.length = null;
        self.bits = null;
        return self;
    }

    ,clone: function() {
        var self = this, c = new Abacus.BitArray(self.length);
        c.bits = new Uint32Array(self.bits);
        return c;
    }

    ,fromArray: function(b) {
        var self = this;
        self.bits = new Uint32Array(b);
        return self;
    }

    ,toArray: function() {
        return slice.call(this.bits);
    }

    ,toString: function() {
        return this.toArray().map(to_fixed_binary_string_32).join('');
    }

    ,reset: function() {
        var self = this, bits = self.bits, len = bits.length, i;
        for (i=0; i<len; ++i) bits[i] = 0;
        return self;
    }

    ,isset: function(bit) {
        return !!(this.bits[bit>>>5] & (1<<(bit&31)));
    }

    ,set: function(bit) {
        var self = this;
        self.bits[bit>>>5] |= 1<<(bit&31);
        return self;
    }

    ,unset: function(bit) {
        var self = this;
        self.bits[bit>>>5] &= ~(1<<(bit&31));
        return self;
    }

    ,toggle: function(bit) {
        var self = this;
        self.bits[bit>>>5] ^= 1<<(bit&31);
        return self;
    }
});
