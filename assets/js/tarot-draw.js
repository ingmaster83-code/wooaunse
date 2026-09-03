/**
 * tarot-draw.js — 타로 카드 뽑기 인터랙션 (뒤집기 애니메이션 + 정/역방향 랜덤)
 * 사용: TarotDraw.init(containerSelector, positionLabels)
 */
(function (global) {
  'use strict';

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function init(containerId, positionLabels, resultContainerId) {
    var container = document.getElementById(containerId);
    var resultEl = document.getElementById(resultContainerId);
    if (!container || !global.TAROT_CARDS) return;

    var n = positionLabels.length;
    var deck = shuffle(global.TAROT_CARDS).slice(0, n);
    var reversedFlags = deck.map(function () { return Math.random() < 0.5; });
    var drawn = [];

    container.innerHTML = '';
    for (var i = 0; i < n; i++) {
      (function (idx) {
        var slot = document.createElement('div');
        slot.className = 'tarot-slot';

        var label = document.createElement('div');
        label.style.cssText = 'text-align:center;color:var(--text-dim);font-size:.78rem;margin-bottom:8px;font-weight:600;';
        label.textContent = positionLabels[idx];
        slot.appendChild(label);

        var face = document.createElement('div');
        face.className = 'tarot-card-face';
        var inner = document.createElement('div');
        inner.className = 'tarot-card-inner';
        var back = document.createElement('div');
        back.className = 'tarot-card-back';
        back.innerHTML = '<span class="mark">✦</span>';
        var front = document.createElement('div');
        front.className = 'tarot-card-front';
        inner.appendChild(back);
        inner.appendChild(front);
        face.appendChild(inner);
        slot.appendChild(face);
        container.appendChild(slot);

        face.addEventListener('click', function onClick() {
          if (face.classList.contains('flipped')) return;
          var card = deck[idx];
          var isReversed = reversedFlags[idx];
          front.innerHTML =
            '<div class="card-emoji" style="' + (isReversed ? 'transform:rotate(180deg);' : '') + '">' + card.emoji + '</div>' +
            '<div class="card-name">' + card.name + '</div>' +
            '<div class="card-dir">' + (isReversed ? '역방향' : '정방향') + '</div>';
          face.classList.add('flipped');
          drawn[idx] = { card: card, reversed: isReversed };
          if (drawn.filter(Boolean).length === n) {
            setTimeout(function () { renderResult(drawn, positionLabels, resultEl); }, 500);
          }
        });
      })(i);
    }
  }

  function renderResult(drawn, labels, el) {
    if (!el) return;
    var html = '<div class="info-panel"><h2>🔮 카드 해석</h2>';
    drawn.forEach(function (d, i) {
      var meaning = d.reversed ? d.card.reversed : d.card.upright;
      html += '<div style="margin-bottom:' + (i < drawn.length - 1 ? '18px;padding-bottom:18px;border-bottom:1px solid var(--border-soft);' : '0;') + '">' +
        '<div style="font-weight:700;color:var(--gold-soft);margin-bottom:6px;">' + labels[i] + ' — ' + d.card.emoji + ' ' + d.card.name + ' (' + (d.reversed ? '역방향' : '정방향') + ')</div>' +
        '<p>' + meaning + '</p>' +
        '<a href="' + d.card.url + '" style="font-size:.82rem;">카드 상세 의미 보기 →</a>' +
        '</div>';
    });
    html += '</div>';
    el.innerHTML = html;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  global.TarotDraw = { init: init };
})(window);
