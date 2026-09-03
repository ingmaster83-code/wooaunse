---
layout: null
---
window.TAROT_CARDS = [
{% assign sorted = site.pages | where_exp: "p", "p.layout == 'tarot-card'" | sort: "order" %}
{% for p in sorted %}
  { slug: {{ p.slug | jsonify }}, name: {{ p.cardName | jsonify }}, emoji: {{ p.emoji | jsonify }}, keyword: {{ p.keyword | jsonify }}, upright: {{ p.uprightMeaning | jsonify }}, reversed: {{ p.reversedMeaning | jsonify }}, url: {{ p.url | relative_url | jsonify }} }{% unless forloop.last %},{% endunless %}
{% endfor %}
];
