// Base Iterator Interface & Abstract Class
Iterator = Abacus.Iterator = Class({

    constructor: function Iterator(name, $) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (!is_instance(self, Iterator)) return new Iterator(name, $);
        if ((is_array(name) || is_args(name)) && (is_instance(name[0], Iterator) || is_instance(name[name.length-1],  Iterator)))
        {
            // sequence of iterators
            self.name = "Sequence";
            self.$ = $ || {};
            self.$.seq = slice.call(name);
            self.$.count = operate(function(count, iter){
                return Arithmetic.add(count, iter.total());
            }, Arithmetic.O, self.$.seq);
            self.rewind();
        }
        else if ((is_array(name) || is_args(name)))
        {
            // list of items
            self.name = "List";
            self.$ = $ || {};
            self.$.seq = slice.call(name);
            self.$.count = self.$.seq.length;
            self.rewind();
        }
        else if (is_callable(name))
        {
            // generator function iterator
            self.name = "Generator";
            self.$ = {};
            self.$.generator = name;
            self.$.state = $ || {};
            self.$.count = Arithmetic.I;
            self.rewind();
        }
        else
        {
            // iterator subclass
            self.name = name || "Iterator";
            self.$ = $ || {};
            self.$.count = self.$.count || Arithmetic.O;
        }
    }

    ,__static__: {
         Iterable: function Iterable(iter, dir) {
            var self = this;
            if (!is_instance(self, Iterable)) return new Iterable(iter, dir);
            dir = -1 === dir ? -1 : 1;
            self.next = function() {
                var next = iter.hasNext(dir) ? iter.next(dir) : null;
                return null == next ? {done: true} : {value: next};
            };
        }
    }

    ,name: "Iterator"
    ,$: null
    ,__index: null
    ,__item: null
    ,_index: null
    ,_item: null
    ,__subindex: null
    ,_subindex: null
    ,__subitem: null
    ,_subitem: null

    ,dispose: function() {
        var self = this;
        if (self.$.seq && self.$.seq.length)
        {
            operate(function(_,iter){if (iter instanceof Iterator) iter.dispose();}, null, self.$.seq);
            self.$.seq = null;
        }
        self.$ = null;
        self.__index = null;
        self.__item = null;
        self._index = null;
        self._item = null;
        self.__subindex = null;
        self._subindex = null;
        self.__subitem = null;
        self._subitem = null;
        return self;
    }
    ,filterBy: function(filter) {
        var self = this, $ = self.$;
        if (false === filter)
        {
            // un-filter
            if ($.filter)
            {
                $.filter = null;
                //self.rewind();
            }
        }
        else if (is_instance(filter, Filter) || is_callable(filter))
        {
            $.filter = is_instance(filter, Filter) ? filter : Filter(filter);
            //self.rewind();
        }
        return self;
    }
    ,mapTo: function(output, chained) {
        var self = this, $ = self.$;
        if (false === output)
        {
            // clear output
            if ($.output)
            {
                $.output = null;
            }
        }
        else if (is_callable(output))
        {
            var prev_output = $.output;
            if (chained && is_callable(prev_output))
            {
                // chain them
                $.output = (function(o1, o2) {
                    return function(item, n) { return null == item ? null : o2(o1(item, n), n); };
                })(prev_output, output);
            }
            else
            {
                $.output = output;
            }
        }
        // re-process current item
        self._item = self.output(self.__item);
        return self;
    }
    ,fuse: function(method, iter, dir) {
        var self = this, $ = self.$;
        if ((1 === arguments.length) && (false === method))
        {
            // un-fuse
            if ($.sub)
            {
                $.sub = null;
                $.submethod = null;
                $.subcascade = null;
                $.subcount = null;
                self.rewind();
            }
        }
        else if (is_instance(iter, Iterator) && is_callable(method))
        {
            $.sub = iter;
            $.submethod = method;
            $.subcascade = -1===dir?-1:1;
            $.subcount = Abacus.Arithmetic.mul($.count, iter.total());
            self.rewind();
        }
        return self;
    }
    ,unfuse: function() {
        return this.fuse(false);
    }
    ,juxtaposeWith: function(iter, dir) {
        return this.fuse(function(item, subitem){
            return [].concat(item).concat(subitem);
        }, iter, dir);
    }
    ,state: function(state){
        // custom state control for custom generator functions typecasted as iterators
        var self = this;
        if (!arguments.length) return self.$.state;
        self.$.state = state;
        return self;
    }
    // override methods
    ,output: function(item) {
        var output = this.$.output;
        return null == item ? null : (is_callable(output) ? output(item): item);
    }
    ,fusion: function(item, subitem) {
        var self = this, $ = self.$, t;
        if (!$.sub) return item;
        if (-1 === $.subcascade){ t = item; item = subitem; subitem = t; }
        if (null == item || null == subitem) return item || subitem || null;
        return $.submethod.call(self, item, subitem);
    }
    ,order: function() {
        return this;
    }
    ,rewind: function(dir, non_recursive) {
        var self = this, $ = self.$, i, l, item;
        dir = -1===dir ? -1 : 1;
        if (is_array($.seq))
        {
            for (i=0,l=$.seq.length; i<l; i++) if ($.seq[i] instanceof Iterator) $.seq[i].rewind(dir);
            $.seqindex = 0 > dir ? l-1 : 0;
            do {
                item = 0<=$.seqindex && $.seqindex<l ? ("List" === self.name ? $.seq[$.seqindex] : $.seq[$.seqindex].next(dir)) : null;
                if ((0<=$.seqindex && $.seqindex<l) && ("List" === self.name || null == item)) $.seqindex += dir;
            } while ((null==item) && (0<=$.seqindex) && ($.seqindex<$.seq.length));
            self.__item = item;
            self._item = self.output(self.__item);
            if ($.sub && (true !== non_recursive))
            {
                $.sub.rewind(dir);
                self.__subitem = $.sub.next(dir);
                self._subitem = (null != self._item) && (null != self.__subitem) ? self.fusion(self._item, self.__subitem) : null;
            }
        }
        else if (is_callable($.generator))
        {
            self.__item = $.generator.call(self, null, dir, $.state, true/*initial item*/);
            self._item = self.output(self.__item);
            if ($.sub && (true !== non_recursive))
            {
                $.sub.rewind(dir);
                self.__subitem = $.sub.next(dir);
                self._subitem = (null != self._item) && (null != self.__subitem) ? self.fusion(self._item, self.__subitem) : null;
            }
        }
        return self;
    }
    ,total: function(non_recursive) {
        var $ = this.$;
        return ($.sub && !non_recursive ? $.subcount : $.count) || Abacus.Arithmetic.O;
    }
    ,index: function(index) {
        var self = this;
        if (!arguments.length) return self._index;
        self._index = index;
        return self;
    }
    ,item: function(item) {
        var self = this;
        if (!arguments.length) return self._item;
        self._item = item;
        return self;
    }
    ,hasNext: function(dir) {
        var self = this, $ = self.$;
        return $.sub ? (null != self._subitem) : (null != self.__item);
    }
    ,next: function(dir) {
        var self = this, $ = self.$, curr, next, item;
        dir = -1===dir ? -1 : 1;
        if (is_array($.seq))
        {
            do {
                curr = self.__item;
                next = $.sub ? self._subitem : self._item;
                item = null;
                //if ("List" === self.name) $.seqindex += dir;
                while ((null==item) && (0<=$.seqindex) && ($.seqindex<$.seq.length))
                {
                    item = "List" === self.name ? $.seq[$.seqindex] : ($.seq[$.seqindex].hasNext(dir) ? $.seq[$.seqindex].next(dir) : null);
                    if ("List" === self.name || null == item) $.seqindex += dir;
                }
                if ((null == item) && (0>$.seqindex || $.seqindex>=$.seq.length) && $.sub && $.sub.hasNext(dir))
                {
                    self.rewind(dir, true); item = self.__item;
                    self.__subitem = $.sub.next(dir);
                }
                self.__item = item;
                self._item = self.output(self.__item);
                self._subitem = $.sub && (null != self._item) && (null != self.__subitem) ? self.fusion(self._item, self.__subitem) : null;
            } while ($.filter && (null!=next) && !$.filter.apply(next, self));
            return next;
        }
        else if (is_callable($.generator))
        {
            do {
                curr = self.__item;
                next = $.sub ? self._subitem : self._item;
                // generator should return null as result if finished
                self.__item = $.generator.call(self, curr, dir, $.state, false/*next item*/);
                if ((null == self.__item) && $.sub && $.sub.hasNext(dir))
                {
                    self.rewind(dir, true);
                    self.__subitem = $.sub.next(dir);
                }
                self._item = self.output(self.__item);
                self._subitem = $.sub && (null != self._item) && (null != self.__subitem) ? self.fusion(self._item, self.__subitem) : null;
            } while ($.filter && (null!=next) && !$.filter.apply(next, self));
            return next;
        }
        else
        {
            return null;
        }
    }
    ,get: function(up_to) {
        var self = this, list = [], next, all;
        // start from current index and ordering and get up to items matching criteria or up to end,
        // taking into account any filtering applied
        // incrementing current index as well
        if (is_callable(up_to))
        {
            while (self.hasNext())
            {
                next = self.next();
                if (null == next || !up_to(next)) break;
                list.push(next);
            }
        }
        else
        {
            all = !arguments.length || null==up_to;
            if (null != up_to) up_to = +up_to;
            while ((all || list.length<up_to) && self.hasNext())
            {
                next = self.next();
                if (null == next) break;
                list.push(next);
            }
        }
        return list;
    }
    ,storeState: function(raw) {
        return null;
    }
    ,resumeState: function(state) {
        return this;
    }
    // javascript @@iterator/@@iterable interface, if supported
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
    ,__iter__: function() {
        return new Iterator.Iterable(this);
    }
});
if (('undefined' !== typeof Symbol) && ('undefined' !== typeof Symbol.iterator))
{
    // add javascript-specific iterator interface, if supported
    Iterator[PROTO][Symbol.iterator] = Iterator[PROTO].__iter__;
}
