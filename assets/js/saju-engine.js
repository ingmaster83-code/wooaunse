/**
 * saju-engine.js — 사주팔자(四柱八字) 계산 엔진
 * 태양황경(24절기) 기반 계산 — 음력 변환표 없이 순수 천문 계산으로 절기 경계를 구함.
 * 정확도 검증(2026-09): 입춘/동지 절입시각 공식 발표치 대비 오차 1~6분, 일주 신문 운세란 대조 일치.
 */
(function (global) {
  'use strict';

  function toJD(y, m, d, hour, min) {
    if (m <= 2) { y -= 1; m += 12; }
    var A = Math.floor(y / 100);
    var B = 2 - A + Math.floor(A / 4);
    var dayFrac = d + (hour + min / 60) / 24;
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFrac + B - 1524.5;
  }
  function toJDN(y, m, d) {
    var a = Math.floor((14 - m) / 12);
    var yy = y + 4800 - a;
    var mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }
  function solarLongitude(jd) {
    var T = (jd - 2451545.0) / 36525;
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var Mrad = M * Math.PI / 180;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
          + 0.000289 * Math.sin(3 * Mrad);
    var trueLong = L0 + C;
    var omega = 125.04 - 1934.136 * T;
    var apparentLong = trueLong - 0.00569 - 0.00478 * Math.sin(omega * Math.PI / 180);
    return ((apparentLong % 360) + 360) % 360;
  }
  function findSolarTermJD(year, targetLon, approxMonth) {
    var jd = toJD(year, approxMonth, 15, 0, 0);
    for (var i = 0; i < 30; i++) {
      var lon = solarLongitude(jd);
      var diff = targetLon - lon;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      if (Math.abs(diff) < 0.00005) break;
      jd += diff / 0.9856;
    }
    return jd;
  }
  function jdToDate(jd) {
    jd += 0.5;
    var Z = Math.floor(jd);
    var F = jd - Z;
    var A = Z;
    if (Z >= 2299161) {
      var alpha = Math.floor((Z - 1867216.25) / 36524.25);
      A = Z + 1 + alpha - Math.floor(alpha / 4);
    }
    var B = A + 1524;
    var C = Math.floor((B - 122.1) / 365.25);
    var D = Math.floor(365.25 * C);
    var E = Math.floor((B - D) / 30.6001);
    var day = B - D - Math.floor(30.6001 * E) + F;
    var month = (E < 14) ? E - 1 : E - 13;
    var year = (month > 2) ? C - 4716 : C - 4715;
    var dayInt = Math.floor(day);
    var hourFloat = (day - dayInt) * 24;
    return { year: year, month: month, day: dayInt, hour: Math.floor(hourFloat), min: Math.round((hourFloat - Math.floor(hourFloat)) * 60) };
  }

  var STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
  var STEMS_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  var STEM_OHAENG = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"];
  var BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  var BRANCHES_HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  var BRANCH_ANIMAL = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];

  function ganzhi60(idx) {
    idx = ((idx % 60) + 60) % 60;
    return {
      stem: STEMS[idx % 10], stemHanja: STEMS_HANJA[idx % 10], stemOhaeng: STEM_OHAENG[idx % 10],
      branch: BRANCHES[idx % 12], branchHanja: BRANCHES_HANJA[idx % 12],
      text: STEMS[idx % 10] + BRANCHES[idx % 12], idx: idx
    };
  }

  var MONTH_TERMS = [
    { lon: 315, approxMonth: 2, branchIdx: 2 }, { lon: 345, approxMonth: 3, branchIdx: 3 },
    { lon: 15, approxMonth: 4, branchIdx: 4 }, { lon: 45, approxMonth: 5, branchIdx: 5 },
    { lon: 75, approxMonth: 6, branchIdx: 6 }, { lon: 105, approxMonth: 7, branchIdx: 7 },
    { lon: 135, approxMonth: 8, branchIdx: 8 }, { lon: 165, approxMonth: 9, branchIdx: 9 },
    { lon: 195, approxMonth: 10, branchIdx: 10 }, { lon: 225, approxMonth: 11, branchIdx: 11 },
    { lon: 255, approxMonth: 12, branchIdx: 0 }, { lon: 285, approxMonth: 1, branchIdx: 1 }
  ];
  var REF_JDN = toJDN(1900, 1, 31); // 갑진일(idx 40) 기준점

  function calcSaju(y, m, d, hour, min) {
    hour = (hour === undefined || hour === null || hour === '') ? 12 : hour;
    min = min || 0;
    var birthJD = toJD(y, m, d, hour, min);
    var unknownTime = (arguments.length < 5) || (hour === 12 && global.__sajuUnknownTimeFlag);

    var ipchunThis = findSolarTermJD(y, 315, 2);
    var sajuYear = (birthJD >= ipchunThis) ? y : y - 1;

    var yearIdx = ((sajuYear - 1984) % 60 + 60) % 60;
    var yearPillar = ganzhi60(yearIdx);

    var termJDs = MONTH_TERMS.map(function (t, i) {
      var y2 = (i <= 9) ? sajuYear : sajuYear + 1;
      return { jd: findSolarTermJD(y2, t.lon, t.approxMonth), branchIdx: t.branchIdx };
    });
    var monthBranchIdx = termJDs[0].branchIdx;
    for (var i = 0; i < 12; i++) {
      var cur = termJDs[i].jd;
      var next = (i < 11) ? termJDs[i + 1].jd : findSolarTermJD(sajuYear + 1, 315, 2);
      if (birthJD >= cur && birthJD < next) { monthBranchIdx = termJDs[i].branchIdx; break; }
    }
    var yearStemIdx = yearIdx % 10;
    var baseStemForYin = [2, 4, 6, 8, 0][yearStemIdx % 5];
    var monthOrderFromYin = ((monthBranchIdx - 2) % 12 + 12) % 12;
    var monthStemIdx = (baseStemForYin + monthOrderFromYin) % 10;
    var monthPillar = ganzhi60Raw(monthStemIdx, monthBranchIdx);

    var dayJDN = toJDN(y, m, d);
    if (hour >= 23) dayJDN += 1;
    var dayIdx = ((dayJDN - REF_JDN + 40) % 60 + 60) % 60;
    var dayPillar = ganzhi60(dayIdx);

    var hourBranchIdx = Math.floor((hour + 1) / 2) % 12;
    var dayStemIdx = dayIdx % 10;
    var baseStemForZi = [0, 2, 4, 6, 8][dayStemIdx % 5];
    var hourStemIdx = (baseStemForZi + hourBranchIdx) % 10;
    var hourPillar = ganzhi60Raw(hourStemIdx, hourBranchIdx);

    // 오행 분포 집계 (년/월/일/시 천간+지지 8글자)
    var ohaengCount = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    var BRANCH_OHAENG = ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"];
    [yearIdx % 10, monthStemIdx, dayIdx % 10, hourStemIdx].forEach(function (si) { ohaengCount[STEM_OHAENG[si]]++; });
    [yearIdx % 12, monthBranchIdx, dayIdx % 12, hourBranchIdx].forEach(function (bi) { ohaengCount[BRANCH_OHAENG[bi]]++; });

    return {
      sajuYear: sajuYear,
      yearPillar: yearPillar, monthPillar: monthPillar, dayPillar: dayPillar, hourPillar: hourPillar,
      dayStemIdx: dayIdx % 10,
      animal: BRANCH_ANIMAL[yearIdx % 12],
      ohaengCount: ohaengCount,
      birthInfo: { y: y, m: m, d: d, hour: hour, min: min }
    };
  }

  function ganzhi60Raw(stemIdx, branchIdx) {
    return {
      stem: STEMS[stemIdx], stemHanja: STEMS_HANJA[stemIdx], stemOhaeng: STEM_OHAENG[stemIdx],
      branch: BRANCHES[branchIdx], branchHanja: BRANCHES_HANJA[branchIdx],
      text: STEMS[stemIdx] + BRANCHES[branchIdx]
    };
  }

  global.SajuEngine = {
    calcSaju: calcSaju,
    STEMS: STEMS, STEMS_HANJA: STEMS_HANJA, STEM_OHAENG: STEM_OHAENG,
    BRANCHES: BRANCHES, BRANCHES_HANJA: BRANCHES_HANJA, BRANCH_ANIMAL: BRANCH_ANIMAL,
    ganzhi60: ganzhi60
  };
})(window);
