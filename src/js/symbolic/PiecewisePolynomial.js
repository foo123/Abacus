PiecewisePolynomial = Class(Poly, {
    constructor: function PiecewisePolynomial(segments, defaultValue, symbol, ring) {
        var self = this;
        if (!is_instance(self, PiecewisePolynomial)) return new PiecewisePolynomial(segments, defaultValue, symbol, ring);

        self.ring = ring || Ring.Q();
        self.symbol = symbol || 'x';
        self.segments = segments.map(function(s){
            if (is_instance(s, Polynomial))
            {
                s = {
                    poly: s,
                    cond: function(x, i, n){return x.lte(self.ring.create(i+1).div(n));},
                    trans: function(x, i, n){return x.sub(self.ring.create(i).div(n)).mul(n);}
                };
            }
            else if (is_obj(s))
            {
                if (!is_instance(s.poly, Polynomial))
                    s.poly = Polynomial([self.ring.cast(s.poly||0)], self.symbol, self.ring);
                if (is_instance(s.cond, Numeric))
                    s.cond = (function(x1){return function(x, i, n){return x.lte(x1);};})(self.ring.cast(s.cond||0));
                else if (!is_callable(s.cond))
                    s.cond = function(x, i, n){return x.lte(self.ring.create(i+1).div(n));};
                if (is_instance(s.trans, Numeric))
                    s.cond = (function(x1){return function(x, i, n){return x.sub(x1);};})(self.ring.cast(s.trans||0));
                else if (!is_callable(s.trans))
                    s.trans = function(x, i, n){return x.sub(self.ring.create(i).div(n)).mul(n);};
            }
            return s;
        });
        self.defaultValue = self.ring.cast(defaultValue || 0);
    }

    ,segments: null
    ,defaultValue: null
    ,symbol: null
    ,ring: null

    ,dispose: function() {
        var self = this;
        self.segments = null;
        self.defaultValue = null;
        self.symbol = null;
        self.ring = null;
        return self;
    }
    ,evaluate: function(x) {
        var self = this, i, n = self.segments.length, s;
        x = self.ring.cast(x);
        for (i=0; i<n; i++)
        {
            s = self.segments[i];
            if (s.cond(x, i, n)) return s.poly.evaluate(s.trans(x, i, n));
        }
        return self.defaultvalue;
    }
    ,toString: function() {
        return "{\n"+this.segments.map(function(s){return s.poly.toString();}).join("\n")+"\n}";
    }
    ,toTex: function() {
        return "\\begin{cases} "+this.segments.map(function(s, i){return s.poly.toTex()/*+" & "+String(i)*/;}).join("\\\\")+" \\end{cases}";
    }
});
