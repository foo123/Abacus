// a iterator for arithmetic progressions from MIN up to MAX, by step=STEP
Progression = Abacus.Progression = Class(Iterator, {

    constructor: function Progression(min, step, max, $) {
        var self = this, Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
            O = Arithmetic.O, I = Arithmetic.I;
        if (!is_instance(self, Progression)) return new Progression(min, step, max, $);
        if (is_array(min) || is_args(min))
        {
            $ = step || {};
            step = 1 < min.length ? min[1] : null;
            max = 2 < min.length ? min[2] : null;
            min = 0 < min.length ? min[0] : null;
        }
        else
        {
            $ = $ || {};
        }
        $.type = String($.type || 'arithmetic').toLowerCase();
        $.NumberClass = is_class($.NumberClass, Integer) ? $.NumberClass : null;
        self._min = is_instance(min, Integer) ? min.num : N(min || 0);
        self._step = is_instance(step, Integer) ?  step.num : N(null == step ? 1 : step);
        self._max = null == max ? Arithmetic.INF : (Arithmetic.INF === max ? max : (is_instance(max, Integer) ?  max.num : N(max)));

        if (!$.NumberClass && is_instance(min, Integer)) $.NumberClass = min[CLASS];

        if ('geometric' === $.type)
        {
            if (Arithmetic.equ(O, self._min) || Arithmetic.equ(I, self._step))
                $.count = I;
            else if (Arithmetic.equ(O, self._step) || Arithmetic.equ(Arithmetic.J, self._step))
                $.count = Arithmetic.II;
            else
                $.count = Arithmetic.INF === self._max ? I : Arithmetic.add(I, ilog(Arithmetic.div(self._max, self._min), Arithmetic.abs(self._step)));
        }
        else//if ('arithmetic' === $.type)
        {
            if (Arithmetic.equ(O, self._step))
                $.count = I;
            else
                $.count = Arithmetic.INF === self._max ? I : Arithmetic.add(I, Arithmetic.div(Arithmetic.sub(self._max, self._min), Arithmetic.abs(self._step)));
        }
        $.last = Arithmetic.sub($.count, I);
        Iterator.call(self, "Progression", $);
        self.rewind();
    }

    ,_min: null
    ,_step: null
    ,_max: null

    ,dispose: function() {
        var self = this;
        self._min = null;
        self._step = null;
        self._max = null;
        return Iterator[PROTO].dispose.call(self);
    }

    ,rewind: function(dir, non_recursive) {
        dir = -1 === dir ? -1 : 1;
        var self = this, $ = self.$, Arithmetic = Abacus.Arithmetic;
        if (0 > dir)
        {
            if (Arithmetic.INF === self._max)
            {
                self.__item = null;
                self._item = null;
            }
            else
            {
                if ('geometric' === self.$.type)
                    self.__item = Arithmetic.mul(self._min, Arithmetic.pow(self._step, self.$.last));
                else
                    self.__item = Arithmetic.add(self._min, Arithmetic.mul(self._step, self.$.last));

                self._item = self.output($.NumberClass ? new $.NumberClass(self.__item) : self.__item);
            }
        }
        else
        {
            self.__item = self._min;
            self._item = self.output($.NumberClass ? new $.NumberClass(self.__item) : self.__item);
        }
        if ($.sub && (true !== non_recursive))
        {
            $.sub.rewind(dir);
            self.__subitem = $.sub.next(dir);
            self._subitem = (null != self._item) && (null != self.__subitem) ? self.fusion(self._item, self.__subitem) : null;
        }
        return self;
    }

    ,hasNext: function(dir) {
        dir = -1 === dir ? -1 : 1;
        var self = this, $ = self.$, Arithmetic = Abacus.Arithmetic;
        return Arithmetic.INF === self._max ? ((0 < dir) && ($.sub ? (null != self.__subitem) : true)) : ($.sub ? (null != self._subitem) : (null != self.__item));
    }

    ,next: function(dir) {
        dir = -1 === dir ? -1 : 1;
        var self = this, $ = self.$, Arithmetic = Abacus.Arithmetic, current, prev;

        do {
            prev = self.__item; current = $.sub ? self._subitem : self._item;

            if (null != prev)
            {
                if ('geometric' === $.type)
                {
                    // geometric progression
                    if (0 > dir)
                    {
                        if (Arithmetic.equ(prev, self._min))
                            self.__item = null;
                        else
                            self.__item = Arithmetic.div(prev, self._step);
                    }
                    else
                    {
                        if ((Arithmetic.INF !== self._max) && Arithmetic.equ(prev, self._max))
                            self.__item = null;
                        else
                            self.__item = Arithmetic.mul(prev, self._step);
                    }
                }
                else
                {
                    // arithmetic progression
                    if (0 > dir)
                    {
                        if (Arithmetic.equ(prev, self._min))
                            self.__item = null;
                        else
                            self.__item = Arithmetic.sub(prev, self._step);
                    }
                    else
                    {
                        if ((Arithmetic.INF !== self._max) && Arithmetic.equ(prev, self._max))
                            self.__item = null;
                        else
                            self.__item = Arithmetic.add(prev, self._step);
                    }
                }
                if ((null != self.__item) && (Arithmetic.lt(self.__item, self._min) ||
                    ((Arithmetic.INF !== self._max) && Arithmetic.gt(self.__item, self._max))))
                {
                    self.__item = null;
                }
                self._item = null == self.__item ? null : self.output($.NumberClass ? new $.NumberClass(self.__item) : self.__item);
            }
            if ((null == self.__item) && $.sub && $.sub.hasNext(dir))
            {
                self.rewind(dir, true);
                self.__subitem = $.sub.next(dir);
                self._subitem = (null != self._item) && (null != self.__subitem) ? self.fusion(self._item, self.__subitem) : null;
            }
        } while ($.filter && (null != current) && !$.filter.apply(current, self));

        return current;
    }
    ,storeState: function(raw) {
        var self = this, state;
        state = [
             self._min.toString()
            ,self._step.toString()
            ,self._max.toString()
            ,null == self.__item ? null : self.__item.toString()
            ,null == self._item ? null : self._item.toString()
            ,null == self.__subitem ? null : self.__subitem.toString()
            ,null == self._subitem ? null : self._subitem.toString()
            ,self.$.sub ? self.$.sub.storeState(true) : null
        ];
        return raw ? state : JSON.stringify(state);
    }
    ,resumeState: function(state) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (null != state)
        {
            state = is_string(state) ? JSON.parse(state) : state;
            self._min = "-Infinity" === state[0] ? Arithmetic.NINF : ("Infinity" === state[0] ? Arithmetic.INF : Arithmetic.num(state[0]));
            self._step = "-Infinity" === state[1] ? Arithmetic.NINF : ("Infinity" === state[1] ? Arithmetic.INF : Arithmetic.num(state[1]));
            self._max = "-Infinity" === state[2] ? Arithmetic.NINF : ("Infinity" === state[2] ? Arithmetic.INF : Arithmetic.num(state[2]));
            self.__item = null == state[3] ? null : Arithmetic.num(state[3]);
            self._item = null == state[4] ? null : Arithmetic.num(state[4])
            self.__subitem = null == state[5] ? null : Arithmetic.num(state[5])
            self._subitem = null == state[6] ? null : Arithmetic.num(state[6])
            if (self.$.sub && state[7]) self.$.sub.resumeState(state[7]);
        }
        return self;
    }
});
