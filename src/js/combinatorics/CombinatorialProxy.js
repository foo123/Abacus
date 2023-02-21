// a proxy for dynamically instantiating other combinatorial iterators
CombinatorialProxy = Abacus.CombinatorialProxy = Class(CombinatorialIterator, {

    constructor: function CombinatorialProxy(combIterFactory, $) {
        var self = this, iter;
        if (!is_instance(self, CombinatorialProxy)) return new CombinatorialProxy(combIterFactory, $);
        $ = $ || {};
        $.factory = is_callable(combIterFactory) ? combIterFactory : null;
        $.iter = null;
        if ($.factory && (true===$.factory.SINGLETON))
        {
            iter = $.factory();
            if (is_instance(iter, CombinatorialIterator))
            {
                $.iter = iter;
                $.count = iter.total();
                $.base = iter.base();
                $.dimension = iter.dimension();
            }
        }
        else
        {
            $.base = 0;
            $.dimension = 1;
        }
        CombinatorialIterator.call(self, "Proxy", 0, $);
    }

    ,__static__: {
        count: function(n, $) {
            return $ && $.iter ? $.iter.total() : Abacus.Arithmetic.I;
        }
        ,initial: NotImplemented
        ,valid: NotImplemented
        ,succ: NotImplemented
        ,rank: NotImplemented
        ,unrank: NotImplemented
        ,singleton: function(factory) {
            var iter = null;
            var f = function(item) {
                if (!iter) iter = factory(item);
                return iter;
            };
            f.SINGLETON = true;
            return f;
        }
    }

    ,dispose: function() {
        var self = this;
        self.$.factory = null;
        if (self.$.iter && is_instance(self.$.iter, CombinatorialIterator)) self.$.iter.dispose();
        self.$.iter = null;
        return CombinatorialIterator[PROTO].dispose.call(self);
    }
    ,seed: function(item, dir) {
        var self = this, $ = self.$, prev = $.iter;
        $.iter = $.factory && (null!=item) ? $.factory(item) : null;
        if (prev && (prev !== $.iter))
        {
            prev.dispose();
            prev = null;
        }
        if (!is_instance($.iter, CombinatorialIterator)) $.iter = null;
        if ($.iter && (prev !== $.iter) && (-1 === dir)) $.iter.rewind(dir);
        return self;
    }
    ,order: function(order, dir) {
        var self = this, $ = self.$;
        if ($.iter) $.iter.order(order, dir);
        return self;
    }
    ,hasNext: function(dir) {
        var $ = this.$;
        return $.iter ? $.iter.hasNext(dir) : false;
    }
    ,next: function(dir) {
        var $ = this.$;
        return $.iter ? $.iter.next(dir) : null;
    }
    ,index: function() {
        var $ = this.$;
        return $.iter ? $.iter.index.apply($.iter, arguments) : null;
    }
    ,item: function() {
        var $ = this.$;
        return $.iter ? $.iter.item.apply($.iter, arguments) : null;
    }
    ,random: function() {
        var $ = this.$;
        return $.iter ? $.iter.random() : null;
    }
});
