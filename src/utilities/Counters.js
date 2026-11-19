// auxiliary data structure to count certain things in log(n) time
// https://cs.stackexchange.com/questions/142186/faster-algorithm-for-specific-inversion-count-part-2
function Counters(n)
{
    var self = this, k, C;
    if (!is_instance(self, Counters)) return new Counters(n);

    k = stdMath.ceil(log2(n));
    C = array((1 << (k+1)), function(i) {
        //var kk = 0;
        //while (kk <= k && !(i & 1)) {kk++; i >>>= 1;}
        return array(k+1, 0, 0);
    });
    self.offset = function(i, delta) {
        if (0 > i) return self;
        ++i;
        var x = 0, y, j, il, ih, yl, yh;
        //il = (i >>> 0) & 0xFFFF;
        //ih = (i >>> 16) & 0xFFFF;
        for (j=k; (0<=j) && (0<i /*|| 0<ih*/); --j)
        {
            y = (1 << j);
            //yl = (y >>> 0) & 0xFFFF;
            //yh = (y >>> 16) & 0xFFFF;
            if ((i & y) /*|| (ih & yh)*/)
            {
                C[x][j] += delta;
                x += y;
                i &= ~y;
                //ih &= ~yh;
            }
        }
        return self;
    };
    self.eval = function(i) {
        var r = 0, j, y, il, ih, yl, yh;
        //ih = (i >>> 16) & 0xFFFF;
        //il = (i >>> 0) & 0xFFFF;
        for (j=0; j<=k; ++j)
        {
            y = (1 << j);
            //yh = (y >>> 16) & 0xFFFF;
            //yl = (y >>> 0) & 0xFFFF;
            if ((i & y) /*|| (ih & yh)*/)
            {
                i &= ~y;
                //ih &= ~yh;
            }
            else
            {
                r += C[i/*((ih << 16) | (il)) & 0xFFFFFFFF*/][j];
            }
        }
        return r;
    };
    self.dispose = function() {
        C = null;
        return self;
    };
}
