require 'json'

module Jekyll
  # ── 공통 유틸 ──────────────────────────────────────────
  module WooaunseUtil
    def self.load_json(site, path)
      file = File.join(site.source, path)
      return [] unless File.exist?(file)
      JSON.parse(File.read(file, encoding: 'utf-8'))
    rescue => e
      Jekyll.logger.warn "ContentGenerator:", "#{path} 로드 실패: #{e.message}"
      []
    end
  end

  # ── 띠별 운세 ──────────────────────────────────────────
  class DdiPageGenerator < Generator
    safe true
    priority :normal

    def generate(site)
      items = WooaunseUtil.load_json(site, '_data_src/ddi.json')
      Jekyll.logger.info "ContentGenerator:", "띠별 운세 #{items.size}개 생성"
      items.each { |c| site.pages << DdiPage.new(site, c) }
    end
  end

  class DdiPage < Page
    def initialize(site, c)
      @site = site
      @base = site.source
      @dir  = "ddi/#{c['animalName']}"
      @name = 'index.html'
      self.process(@name)
      self.read_yaml(File.join(@base, '_layouts'), 'ddi.html')
      self.data.merge!(c)
      self.data['layout'] = 'ddi'
      self.data['title'] = "#{c['animalName']}띠 운세 — 성격·2026년 총운·연애운·재물운"
      self.data['description'] = "#{c['animalName']}띠의 성격과 2026년 운세, 연애운·재물운·직업운·건강운, 잘 맞는 띠까지 한눈에 확인하세요."
    end
  end

  # ── 별자리 운세 ────────────────────────────────────────
  class StarPageGenerator < Generator
    safe true
    priority :normal

    def generate(site)
      items = WooaunseUtil.load_json(site, '_data_src/star.json')
      Jekyll.logger.info "ContentGenerator:", "별자리 운세 #{items.size}개 생성"
      items.each { |c| site.pages << StarPage.new(site, c) }
    end
  end

  class StarPage < Page
    def initialize(site, c)
      @site = site
      @base = site.source
      @dir  = "star/#{c['slug']}"
      @name = 'index.html'
      self.process(@name)
      self.read_yaml(File.join(@base, '_layouts'), 'star.html')
      self.data.merge!(c)
      self.data['layout'] = 'star'
      self.data['title'] = "#{c['starName']} 운세 — 성격·2026년 총운·연애운·궁합"
      self.data['description'] = "#{c['starName']}의 성격과 2026년 운세, 연애운·재물운·직업운, 잘 맞는 별자리까지 한눈에 확인하세요."
    end
  end

  # ── 타로 카드 ──────────────────────────────────────────
  class TarotPageGenerator < Generator
    safe true
    priority :normal

    def generate(site)
      items = WooaunseUtil.load_json(site, '_data_src/tarot.json')
      Jekyll.logger.info "ContentGenerator:", "타로카드 #{items.size}개 생성"
      items.each { |c| site.pages << TarotPage.new(site, c) }
    end
  end

  class TarotPage < Page
    def initialize(site, c)
      @site = site
      @base = site.source
      @dir  = "tarot/#{c['slug']}"
      @name = 'index.html'
      self.process(@name)
      self.read_yaml(File.join(@base, '_layouts'), 'tarot-card.html')
      self.data.merge!(c)
      self.data['layout'] = 'tarot-card'
      self.data['title'] = "#{c['cardName']} 타로카드 의미 — 정방향·역방향 해석"
      self.data['description'] = "타로카드 #{c['cardName']}의 정방향·역방향 의미와 연애·직업·재물 관점 해석을 확인하세요."
    end
  end

  # ── 꿈해몽 ─────────────────────────────────────────────
  class DreamPageGenerator < Generator
    safe true
    priority :normal

    def generate(site)
      items = WooaunseUtil.load_json(site, '_data_src/dream.json')
      Jekyll.logger.info "ContentGenerator:", "꿈해몽 #{items.size}개 생성"
      items.each { |c| site.pages << DreamPage.new(site, c) }
    end
  end

  class DreamPage < Page
    def initialize(site, c)
      @site = site
      @base = site.source
      @dir  = "dream/#{c['slug']}"
      @name = 'index.html'
      self.process(@name)
      self.read_yaml(File.join(@base, '_layouts'), 'dream.html')
      self.data.merge!(c)
      self.data['layout'] = 'dream'
      self.data['title'] = "#{c['dreamTitle']} 꿈해몽 — 꿈에서 #{c['dreamTitle']}(를)를 본 이유"
      self.data['description'] = "#{c['dreamTitle']} 꿈의 의미와 상황별 해몽을 확인하세요. #{(c['summary']||'')[0,80]}"
    end
  end
end
