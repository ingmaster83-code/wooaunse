/**
 * gunghap-data.js — 오행 상생상극 + 띠(지지) 관계 기반 궁합 분석
 */
(function (global) {
  'use strict';

  var GENERATES = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
  var CONTROLS = { 목: "토", 토: "수", 수: "화", 화: "금", 금: "목" };

  var SAMHAP_GROUPS = [
    ["쥐", "용", "원숭이"], ["소", "뱀", "닭"], ["호랑이", "말", "개"], ["토끼", "양", "돼지"]
  ];
  var YUKHAP_PAIRS = [
    ["쥐", "소"], ["호랑이", "돼지"], ["토끼", "개"], ["용", "닭"], ["뱀", "원숭이"], ["말", "양"]
  ];
  var CHUNG_PAIRS = [
    ["쥐", "말"], ["소", "양"], ["호랑이", "원숭이"], ["토끼", "닭"], ["용", "개"], ["뱀", "돼지"]
  ];

  function pairIncludes(list, a, b) {
    return list.some(function (arr) { return arr.indexOf(a) > -1 && arr.indexOf(b) > -1; });
  }
  function inSameSamhap(a, b) {
    return SAMHAP_GROUPS.some(function (g) { return g.indexOf(a) > -1 && g.indexOf(b) > -1; });
  }

  function ohaengRelation(a1, a2) {
    if (a1 === a2) return "same";
    if (GENERATES[a1] === a2) return "i_generate";
    if (GENERATES[a2] === a1) return "generates_me";
    if (CONTROLS[a1] === a2) return "i_control";
    if (CONTROLS[a2] === a1) return "controls_me";
    return "neutral";
  }

  var OHAENG_TEXT = {
    same: { score: 78, text: "두 사람은 일간의 오행이 같은 <strong>비화(比和)</strong> 관계입니다. 서로 비슷한 기질과 생활 리듬을 가지고 있어 친구처럼 편안하지만, 취향이나 고집이 부딪히면 팽팽한 자존심 싸움이 될 수도 있어요. 서로의 다름을 인정하는 여유가 관계를 더 좋게 만듭니다." },
    i_generate: { score: 88, text: "내가 상대의 오행을 <strong>생(生)해주는</strong> 관계입니다. 내가 먼저 챙기고 베푸는 역할을 자연스럽게 맡게 되는데, 그만큼 상대에게 든든한 사람이 되어줄 수 있어요. 다만 너무 한쪽으로만 기울지 않도록 서로 주고받는 균형을 신경 쓰면 더 좋습니다." },
    generates_me: { score: 90, text: "상대가 나의 오행을 <strong>생(生)해주는</strong> 관계입니다. 상대에게 자연스럽게 도움과 힘을 받는 편안한 궁합으로, 함께 있을 때 안정감을 느끼기 쉬운 조합이에요. 받는 것에만 익숙해지지 않도록 나도 마음을 표현하는 노력이 필요해요." },
    i_control: { score: 58, text: "내가 상대의 오행을 <strong>극(剋)하는</strong> 관계입니다. 내가 주도권을 쥐기 쉬운 조합이라 리드하는 재미는 있지만, 상대 입장에서는 답답하거나 눌리는 기분을 느낄 수 있어요. 상대의 의견을 먼저 물어보는 습관이 관계를 훨씬 부드럽게 만들어줍니다." },
    controls_me: { score: 55, text: "상대가 나의 오행을 <strong>극(剋)하는</strong> 관계입니다. 상대에게 끌려가는 기분이 들 수 있는 조합이지만, 그만큼 상대에게서 자극과 긴장감을 얻으며 성장하는 관계이기도 해요. 내 의견도 분명히 표현하는 게 균형을 잡는 열쇠입니다." },
    neutral: { score: 70, text: "오행 관계가 뚜렷하게 생(生)하거나 극(剋)하지 않는 무난한 조합입니다. 서로에게 큰 자극도, 큰 부담도 없는 편안한 관계로 흘러가기 쉬워요." }
  };

  var ANIMAL_TEXT = {
    samhap: { score: 95, text: "두 사람의 띠는 <strong>삼합(三合)</strong> 관계로, 궁합에서 가장 조화로운 조합 중 하나입니다. 서로 다른 매력을 가졌지만 만나면 시너지를 내는 관계로, 함께 있을 때 자연스럽게 힘이 나고 합이 잘 맞는다는 느낌을 받기 쉬워요." },
    yukhap: { score: 85, text: "두 사람의 띠는 <strong>육합(六合)</strong> 관계로, 안정적이고 다정한 결합을 의미합니다. 서로를 편안하게 감싸주는 조합이라 오래 볼수록 정이 쌓이는 스타일의 궁합이에요." },
    chung: { score: 48, text: "두 사람의 띠는 <strong>충(沖)</strong> 관계로, 정반대의 기질을 가진 조합입니다. 초반에는 서로 안 맞는다고 느낄 수 있지만, 다른 성향이 오히려 서로의 빈틈을 채워주는 경우도 많아요. 다름을 틀림으로 여기지 않는 대화가 특히 중요합니다." },
    neutral: { score: 68, text: "두 사람의 띠는 특별히 강한 합이나 충 관계는 아닌 무난한 조합입니다. 서로 노력한 만큼 관계가 자연스럽게 쌓여가는 스타일이에요." }
  };

  function animalRelation(a1, a2) {
    if (a1 === a2) return "same_animal";
    if (inSameSamhap(a1, a2)) return "samhap";
    if (pairIncludes(YUKHAP_PAIRS, a1, a2)) return "yukhap";
    if (pairIncludes(CHUNG_PAIRS, a1, a2)) return "chung";
    return "neutral";
  }

  function analyze(r1, r2) {
    var oRel = ohaengRelation(r1.dayPillar.stemOhaeng, r2.dayPillar.stemOhaeng);
    var oInfo = OHAENG_TEXT[oRel];

    var aRel = animalRelation(r1.animal, r2.animal);
    var aInfo = aRel === "same_animal"
      ? { score: 80, text: "두 사람은 <strong>같은 띠</strong>입니다! 비슷한 시기의 기운을 타고나 서로를 이해하는 폭이 넓은 편이에요. 마치 동갑내기 친구 같은 편안함을 느낄 수 있는 조합입니다." }
      : ANIMAL_TEXT[aRel];

    var score = Math.round((oInfo.score + aInfo.score) / 2);
    score = Math.max(35, Math.min(98, score));

    return {
      score: score,
      ohaengHtml: '<p>' + oInfo.text + '</p>',
      animalHtml: '<p>' + aInfo.text + '</p>'
    };
  }

  global.GunghapData = { analyze: analyze, ohaengRelation: ohaengRelation, animalRelation: animalRelation };
})(window);
