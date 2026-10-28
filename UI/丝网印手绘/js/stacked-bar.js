/* ============================================================
   stacked-bar.js · 堆叠条的手绘标注层
   ------------------------------------------------------------
   纯 CSS 做不到「标签避让 + 引线精确落到分段中线」，这一层必须测量，
   所以单开一个小文件（约 100 行，零依赖、无构建）。
   它只做四件事：
     1) 百分比：分段放得下就压在色块里，放不下就不画，拼到标签后面
        （「搭建运行环境, 3%」），绝不缩字号硬塞、绝不撑破柱子；
     2) 车道：标签分上下两条，奇数下标在下；同车道从左往右排，
        优先贴近自己分段的中线，相撞就右移，右越界整组左推、左越界再顶回；
     3) 降档：两端都顶不住就降一档字号（×0.92）重排，最小 17px，绝不丢标签；
     4) 引线：每个标签一条三次贝塞尔，落点 = 所属分段的中线。
   窄屏（<560px）放弃标注层，只留块内百分比。

   用法：.stage 加 data-stacked-bar，分段 .seg-i 上写
        data-name="工作" data-pct="28" data-dark="1"
   ============================================================ */
(function(){
  var MIN_FS = 17;     // 标签最小字号，再小就不如不画
  var GAP    = 18;     // 同车道标签间距
  var PAD    = 6;      // 车道左右留白
  var MIN_W  = 560;    // 窄于此宽度直接放弃标注层

  function layout(stage){
    var bar = stage.querySelector('.bar');
    if(!bar) return;
    var svg   = stage.querySelector('.leads');
    var layer = stage.querySelector('.pcts');
    var segs  = [].slice.call(bar.querySelectorAll('.seg-i'));
    var W     = bar.clientWidth;
    if(!segs.length || !W) return;              // 还在 display:none 里，等下一次

    var stR = stage.getBoundingClientRect();
    var bR  = bar.getBoundingClientRect();
    var barTop = bR.top - stR.top;
    var barBot = barTop + bR.height;

    /* ---- 1) 标签节点：按分段顺序各一个，奇数下标走下方车道 ---- */
    var wraps = [].slice.call(stage.querySelectorAll('.hand-wrap'));
    if(wraps.length !== segs.length){
      wraps.forEach(function(w){ w.remove(); });
      wraps = segs.map(function(){
        var w = document.createElement('div');
        w.className = 'hand-wrap';
        w.appendChild(document.createElement('div')).className = 'hand-label';
        stage.appendChild(w);
        return w;
      });
    }

    /* ---- 2) 分段中线：用实测宽度，不靠 data 里的百分比自己算 ---- */
    var centers = segs.map(function(seg){
      var r = seg.getBoundingClientRect();
      return r.left - stR.left + r.width / 2;
    });

    /* ---- 3) 百分比层 + 放不下时的降级 ---- */
    if(layer){
      layer.innerHTML = '';
      segs.forEach(function(seg, i){
        var pct = seg.dataset.pct;
        if(pct === undefined || pct === '') return;
        var r  = seg.getBoundingClientRect();
        var el = document.createElement('span');
        el.className = 'pct';
        el.innerHTML = pct + '<i>%</i>';
        el.style.color = seg.dataset.dark === '1' ? '#fbf8f5' : '#132b69';
        layer.appendChild(el);
        var fits = (el.offsetWidth + 16) <= r.width;
        if(fits){
          el.style.left = (r.left - stR.left + 10) + 'px';
          el.style.top  = (barBot - 10 - el.offsetHeight) + 'px';
        }else{
          el.remove();
        }
        var lab = wraps[i] && wraps[i].querySelector('.hand-label');
        if(lab){
          var nm = seg.dataset.name || '';
          lab.textContent = fits ? nm : nm + ', ' + pct + '%';
        }
      });
    }

    /* ---- 4) 车道排布 + 引线 ---- */
    if(!svg) return;
    if(W < MIN_W){
      svg.innerHTML = '';
      wraps.forEach(function(w){ w.style.display = 'none'; });
      return;
    }
    var stageH = stage.clientHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + stageH);
    svg.setAttribute('width', W);
    svg.setAttribute('height', stageH);

    // 两条车道：上=条顶上方 94px，下=条底下方 12px（够 40px 的行高）
    var laneY = [Math.max(PAD, barTop - 94), barBot + 12];

    var items = wraps.map(function(w, i){
      w.style.display = '';
      var lab = w.querySelector('.hand-label');
      var nm  = (segs[i].dataset.name || '');
      var fs  = parseFloat(lab.dataset.fs) || (nm.length > 8 ? 31 : 36);
      return {el:w, lab:lab, center:centers[i], lane:i%2, fs:fs};
    });

    [0,1].forEach(function(ln){
      var g = items.filter(function(it){ return it.lane === ln; })
                   .sort(function(a,b){ return a.center - b.center; });
      if(!g.length) return;

      /* 4.1 排布：贴中线 + 整体平移（原站骨架，保住"长弧引线"的味道）
            ─ 先各自贴住分段中线，相撞就右移；
            ─ 右越界整组左推，左越界再整组顶回。
         4.2 一旦两端都顶不住（说明这一档字号真的排不开），
            降一档字号重来，直到 17px。宁可字小，不可溢出/叠字。 */
      function setSizes(scale){
        g.forEach(function(it){
          it.lab.style.fontSize = Math.max(MIN_FS, Math.round(it.fs * scale)) + 'px';
          it.w = it.lab.offsetWidth || 60;
        });
      }
      function pack(){
        var cursor = PAD;
        g.forEach(function(it){
          it.x = Math.max(it.center, cursor + it.w / 2);
          cursor = it.x + it.w / 2 + GAP;
        });
        var over = (g[g.length-1].x + g[g.length-1].w / 2) - (W - PAD);
        if(over > 0) g.forEach(function(it){ it.x -= over; });
        var left = g[0].x - g[0].w / 2;
        if(left < PAD) g.forEach(function(it){ it.x += PAD - left; });
        return { l:(g[0].x - g[0].w / 2), r:(g[g.length-1].x + g[g.length-1].w / 2) };
      }

      var scale = 1, box, prevFs = 0;
      for(var k = 0; k < 10; k++){
        setSizes(scale);
        var fsNow = parseFloat(g[0].lab.style.fontSize);
        box = pack();
        if(box.l >= PAD - 0.5 && box.r <= W - PAD + 0.5) break;
        if(fsNow <= MIN_FS && fsNow === prevFs) break;   // 已经退化到最小字号，别死循环
        prevFs = fsNow;
        scale *= 0.92;
      }

      /* 4.3 真到 17px 还溢出（极窄容器 + 超长分类名）：逐项夹进边界，
             牺牲一点间距，绝不让字跑出画布或叠在一起。 */
      if(box.r > W - PAD + 0.5 || box.l < PAD - 0.5){
        g.forEach(function(it){
          it.x = Math.min(Math.max(it.x, PAD + it.w / 2), W - PAD - it.w / 2);
        });
      }
    });

    var d = '';
    items.forEach(function(it){
      it.el.style.transform = 'translate(' + (it.x - it.w/2).toFixed(1) + 'px,' + laneY[it.lane].toFixed(1) + 'px)';
      var lh = it.lab.offsetHeight || 40;
      var y0 = it.lane === 0 ? laneY[0] + lh + 1 : laneY[1] - 2;
      var y1 = it.lane === 0 ? barTop : barBot;
      var dy = (y1 - y0) * 0.55;
      d += 'M ' + it.x.toFixed(1) + ' ' + y0.toFixed(1) +
           ' C ' + it.x.toFixed(1) + ' ' + (y0 + dy).toFixed(1) + ', ' +
           (it.x + (it.center - it.x) * 0.55).toFixed(1) + ' ' + (y1 - dy).toFixed(1) + ', ' +
           it.center.toFixed(1) + ' ' + y1.toFixed(1) + ' ';
    });
    svg.innerHTML = '<path d="' + d.replace(/\s+$/, '') + '"/>';
  }

  function all(){ return [].slice.call(document.querySelectorAll('[data-stacked-bar]')); }

  function relayout(){
    all().forEach(layout);
  }

  var tid;
  function onResize(){
    clearTimeout(tid);
    tid = setTimeout(relayout, 150);   // 拖窗口时别每帧重排
  }

  function boot(){
    relayout();
    window.addEventListener('resize', onResize);
    if(document.fonts && document.fonts.ready){
      // 手写体是外链，字体到位后宽度会变，必须再排一次
      document.fonts.ready.then(relayout);
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.StackedBar = { layout: layout, relayout: relayout };
})();
