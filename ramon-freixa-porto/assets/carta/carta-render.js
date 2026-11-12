/* Carta de vinhos Ramón Freixa Porto — desenha as 51 páginas A4 a partir de carta-dados.js.
   Usado pela versão para impressão (carta-vinhos/carta.html) e pela carta digital (carta-vinhos.html).

   Formato de carta-dados.js (uma linha por elemento):
     = N            página de conteúdo N (número impresso no rodapé)
     # texto        título de secção        ## texto  região        ### texto  sub-região
     nome | preço | região · castas         vinho (a 3.ª coluna é opcional) */
(function(){
  // Separadores de secção: página -> [número, título PT, título EN]
  var DIVIDERS = {
    5:['01','Vinho a Copo','Glass of Wine'], 8:['02','Espumantes','Sparkling Wine'], 11:['03','Champanhe','Champagne'],
    14:['04','Vinho Branco','White Wine'], 26:['05','Vinho Rosé','Rosé Wine'], 28:['06','Vinho Tinto','Red Wine'],
    40:['07','Colheita Tardia','Late Harvest'], 43:['08','Vinho do Porto','Port Wine'], 46:['09','Moscatel',''],
    48:['10','Outros Fortificados','Other Fortified Wines'], 50:['11','Vinho da Madeira','Madeira Wine']
  };
  var INDEX = [
    ['01 — Vinho a Copo | Glass of Wine','05'], ['02 — Espumantes | Sparkling Wine','08'], ['03 — Champanhe | Champagne','11'],
    ['04 — Vinho Branco | White Wine','14'], ['05 — Vinho Rosé | Rosé Wine','26'], ['06 — Vinho Tinto | Red Wine','28'],
    ['07 — Colheita Tardia | Late Harvest','40'], ['08 — Vinho do Porto | Port Wine','43'], ['09 — Moscatel','46'],
    ['10 — Outros Fortificados | Other Fortified Wines','48'], ['11 — Vinho da Madeira | Madeira Wine','50']
  ];
  var INTRO_PT = [
    'Em Portugal, o vinho é uma forma de literatura líquida.',
    'Cada região escreve a sua própria voz, cada produtor lapida o seu estilo, e cada garrafa guarda uma história que só se revela a quem a escuta com atenção.',
    'Tal como na literatura portuguesa, onde a paisagem se torna personagem e o tempo ganha textura, também o vinho português nasce dessa relação íntima entre terra, clima e memória. Dos socalcos do Douro que parecem versos talhados à mão, às brisas atlânticas que moldam vinhos de frescura luminosa; das serras do Dão onde a elegância se esconde em cada detalhe, às planícies do Alentejo onde a amplitude se transforma em generosidade, esta carta é o convite a percorrer o país através dos seus vinhos.',
    'E porque a grande mesa portuguesa sempre dialogou com o mundo, esta seleção inclui rótulos que trazem novas geografias, novas vozes e novas leituras ao diálogo entre cozinha e vinho, acrescentando-lhe outras narrativas.'
  ];
  var INTRO_EN = [
    'In Portugal, wine is a form of liquid literature.',
    'Each region writes its own voice, each producer shapes their style, and every bottle holds a story that only reveals itself to those who listen closely.',
    'Just as in Portuguese literature, where the landscape becomes a character and time gains texture, Portuguese wine is born from that intimate relationship between land, climate, and memory. From the Douro’s terraced slopes that resemble verses carved by hand, to the Atlantic breezes that shape wines of luminous freshness; from the mountain ranges of Dão where elegance hides in every detail, to the plains of Alentejo where amplitude becomes generosity, this wine list is an invitation to travel our country through its wines.',
    'And because the great Portuguese gastronomy has always engaged in dialogue with the world, this selection includes labels that bring new geographies, new voices, and new interpretations to the conversation between cuisine and wine, enriching it with other narratives.'
  ];

  // Espaçamentos verticais (mm, entre linhas de base), medidos no PDF original
  var FIRST = { t:25.2, h:24.3, s:23.3, w:23.6 };
  var GAP = { t_h:14.6, t_w:14.2, h_w:8.6, h_s:8.9, s_w:8.6, w_detail:3.75, entry:7.85, single:8.03, w_h:12.0, w_s:12.0, single_h:12.7 };
  var BOTTOM = 274;   // última linha de base permitida (o número da página está a 285 mm)

  function parse(text){
    var pages = {}, cur = null;
    text.split('\n').map(function(l){ return l.trim(); }).filter(Boolean).forEach(function(l){
      if (l.charAt(0) === '='){ cur = parseInt(l.slice(1), 10); pages[cur] = []; return; }
      var m = /^(#{1,3}) (.*)$/.exec(l);
      if (m){ pages[cur].push({ k: ['t','h','s'][m[1].length - 1], text: m[2] }); return; }
      var parts = l.split('|').map(function(s){ return s.trim(); });
      pages[cur].push({ k:'w', name: parts[0], price: parts[1], detail: parts[2] || '' });
    });
    return pages;
  }

  /* opts: img (pasta das imagens, com / no fim), cover ('print' = capa branca do PDF; 'none' = sem capa) */
  function build(book, text, opts){
    opts = opts || {};
    var IMG = opts.img || '../assets/img/';
    var pagesData = parse(text), out = [], report = [];

    function el(parent, cls, txt, baseline, extra){
      var d = document.createElement('div');
      d.className = 'abs ' + cls; d.textContent = txt; d.dataset.baseline = baseline;
      if (extra) for (var k in extra) d.style[k] = extra[k];
      parent.appendChild(d); return d;
    }
    function newPage(num, cls){
      var p = document.createElement('div'); p.className = 'page' + (cls ? ' ' + cls : ''); p.dataset.num = num;
      book.appendChild(p); out.push(p); return p;
    }
    function pageNum(p, n){ el(p, 'rast pnum', String(n), 285.0); }
    function image(p, cls, src, alt, css){ var i = document.createElement('img'); if (cls) i.className = cls; i.src = src; i.alt = alt; if (css) i.style.cssText = css; p.appendChild(i); return i; }

    // 1 · Capa (só no PDF; a carta digital tem a sua capa em linho)
    if (opts.cover !== 'none'){
      var c = newPage(1);
      image(c, 'cover-logo', IMG + 'rfp-marca-black.png', 'Ramón Freixa Porto');
      el(c, 'rast cover-sub', 'CARTA DE VINHOS | WINE LIST', 248.3);
    }

    // 2 · Introdução
    var p = newPage(2);
    el(p, 'rast t intro-t', 'INTRODUÇÃO | INTRODUCTION', 69.3, { left:'40mm' });
    var pt = document.createElement('div'); pt.className = 'intro pt'; pt.innerHTML = INTRO_PT.map(function(t){ return '<p>' + t + '</p>'; }).join(''); p.appendChild(pt);
    var en = document.createElement('div'); en.className = 'intro en'; en.innerHTML = INTRO_EN.map(function(t){ return '<p>' + t + '</p>'; }).join(''); p.appendChild(en);
    pageNum(p, 2);

    // 3 · Mapa
    p = newPage(3);
    el(p, 'rast t map-t', 'PORTUGAL', 37.4, { left:'0', right:'0', textAlign:'center', paddingLeft:'21.4mm' });
    image(p, '', IMG + 'mapa-portugal.png', 'Mapa das regiões vitivinícolas de Portugal', 'position:absolute;left:34.09mm;top:62.44mm;width:134.09mm;height:203.22mm;');
    pageNum(p, 3);

    // 4 · Índice (cada linha leva o número da página, para a carta digital poder saltar para lá)
    p = newPage(4);
    el(p, 'rast t', 'ÍNDICE | INDEX', 36.2, { left:'40mm' });
    INDEX.forEach(function(r, i){
      el(p, 'rast idx', r[0], 59.4 + i * 10.45, { left:'40mm' }).dataset.goto = +r[1];
      el(p, 'rast idx', r[1], 59.4 + i * 10.45, { right:'18mm' }).dataset.goto = +r[1];
    });
    pageNum(p, 4);

    function renderContent(pg, n, items, squeeze){
      pg.innerHTML = '';
      var y = null, prev = null;
      items.forEach(function(it){
        var g;
        if (y === null){ y = FIRST[it.k]; }
        else {
          if (it.k === 'h' || it.k === 't') g = prev === 't' ? GAP.t_h : (prev === 'single' ? GAP.single_h : GAP.w_h);
          else if (it.k === 's') g = prev === 'h' ? GAP.h_s : (prev === 'single' ? GAP.single_h - 1 : GAP.w_s);
          else g = prev === 't' ? GAP.t_w : prev === 'h' ? GAP.h_w : prev === 's' ? GAP.s_w : prev === 'single' ? GAP.single : GAP.entry;
          y += g * squeeze;
        }
        if (it.k === 't'){ el(pg, 'rast t', it.text, y, { left:'40mm' }); prev = 't'; }
        else if (it.k === 'h'){ el(pg, 'rast h', it.text, y, { left:'40mm' }); prev = 'h'; }
        else if (it.k === 's'){ el(pg, 'rast s', it.text, y, { left:'40mm' }); prev = 's'; }
        else {
          // Listas de uma linha (Porto e Madeira) usam o peso normal, como no original
          var row = document.createElement('div'); row.className = (n === 44 || n === 45 || n === 51) ? 'single' : ''; pg.appendChild(row);
          el(row, 'bev name', it.name, y, { left:'40mm' });
          el(row, 'bev price', it.price + ' €', y);
          if (it.detail){ y += GAP.w_detail; el(row, 'bev detail', it.detail, y, { left:'40mm' }); }
          prev = it.detail ? 'w' : 'single';
        }
      });
      pageNum(pg, n);
      return y;
    }

    for (var n = 5; n <= 51; n++){
      if (DIVIDERS[n]){
        var d = DIVIDERS[n], dp = newPage(n, 'dark');
        el(dp, 'rast div-num', d[0], 121.5);
        el(dp, 'rast div-title', d[1], 138.6);
        if (d[2]) el(dp, 'rast div-sub', d[2], 155.0);
        // símbolo em vetor (SVG), não PNG: a transparência do PNG imprime-se como um retângulo de grafite diferente
        // (mesma posição do PNG antigo, sem a margem transparente de 0,63 mm)
        image(dp, 'div-symbol', IMG + 'rfp-simbolo-white.svg', '', 'left:95.28mm;top:236.48mm;width:19.41mm');
        continue;
      }
      if (!pagesData[n]){ console.warn('falta a página', n); continue; }
      // Ajusta o espaçamento só se a página não couber (mínimo 88 %)
      var pg = newPage(n), sq = 1, bottom = renderContent(pg, n, pagesData[n], sq);
      while (bottom > BOTTOM && sq > 0.88){ sq -= 0.01; bottom = renderContent(pg, n, pagesData[n], sq); }
      report.push({ n:n, squeeze:+sq.toFixed(2), bottom:+bottom.toFixed(1), overflow: bottom > BOTTOM });
    }
    return { pages: out, report: report };
  }

  // Coloca cada texto pela linha de base (como no Pages), depois de as fontes carregarem
  function placeBaselines(root){
    return document.fonts.ready.then(function(){
      var probe = {};
      function ascent(cls){
        if (probe[cls] != null) return probe[cls];
        var wrap = document.createElement('div'); wrap.style.cssText = 'position:absolute;visibility:hidden;line-height:1;white-space:nowrap';
        wrap.className = 'carta';
        var inner = document.createElement('div'); inner.className = cls; inner.style.position = 'static';
        var span = document.createElement('span'); span.textContent = 'Hg';
        var mark = document.createElement('span'); mark.style.cssText = 'display:inline-block;width:1px;height:0;vertical-align:baseline';
        inner.appendChild(span); inner.appendChild(mark); wrap.appendChild(inner); document.body.appendChild(wrap);
        var fs = parseFloat(getComputedStyle(inner).fontSize);
        probe[cls] = (mark.getBoundingClientRect().top - inner.getBoundingClientRect().top) / fs;
        wrap.remove(); return probe[cls];
      }
      var pxPerMm = 96 / 25.4;
      root.querySelectorAll('[data-baseline]').forEach(function(e){
        var key = e.className.split(' ').filter(function(c){ return c !== 'abs'; }).join(' ');
        var fs = parseFloat(getComputedStyle(e).fontSize);
        // correção medida no PDF impresso (a sonda de baseline desvia-se um pouco em cada fonte)
        var fix = /rast/.test(key) ? -0.85 : 0.1;
        var top = (parseFloat(e.dataset.baseline) + fix) * pxPerMm - ascent(key) * fs;
        e.style.top = (top / pxPerMm).toFixed(3) + 'mm';
      });
    });
  }

  window.CartaRender = { build: build, placeBaselines: placeBaselines };
})();
