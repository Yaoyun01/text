<template>
  <section class="summary-shell">
    <!-- Hero 区 -->
    <div class="summary-hero">
      <h1>古建可视化引擎</h1>
      <p class="hero-sub">中国古代建筑文明可视化总览</p>
      <div class="hero-stats">
        <div class="hero-stat">
          <span class="stat-num">{{ buildings.length }}</span>
          <span class="stat-label">收录案例</span>
        </div>
        <div class="hero-stat">
          <span class="stat-num">4</span>
          <span class="stat-label">建筑类型</span>
        </div>
        <div class="hero-stat">
          <span class="stat-num">{{ dynastyCount }}</span>
          <span class="stat-label">历史时期</span>
        </div>
        <div class="hero-stat">
          <span class="stat-num">{{ regionCount }}</span>
          <span class="stat-label">地理区域</span>
        </div>
      </div>
    </div>

    <!-- 核心结论卡片 -->
    <div class="section-block">
      <h2 class="block-title">核心结论</h2>
      <div class="conclusion-grid">
        <article class="conclusion-card" v-for="(item, idx) in conclusions" :key="idx" @click="toggleDetail(idx)">
          <div class="card-visual">
            <img :src="`/images/summary/${item.image}.jpg`" :alt="item.title" class="card-img" @error="handleImgError($event, item)" />
            <div class="card-fallback" v-if="imgErrors[item.image]" :style="{ background: item.gradient }">
              <span class="card-symbol" :class="'symbol-' + item.symbolType"></span>
            </div>
          </div>
          <div class="card-content">
            <h3>{{ item.title }}</h3>
            <p class="card-desc">{{ item.desc }}</p>
            <div class="card-detail" v-if="expandedIdx === idx">
              <div class="detail-divider"></div>
              <p class="detail-text">{{ item.detail }}</p>
              <div class="detail-tags">
                <span class="detail-tag" v-for="t in item.tags" :key="t">{{ t }}</span>
              </div>
            </div>
            <span class="toggle-btn">{{ expandedIdx === idx ? '收起 ▲' : '展开更多 ▼' }}</span>
          </div>
        </article>
      </div>
    </div>

    <!-- 类型分布可视化 -->
    <div class="section-block">
      <h2 class="block-title">类型分布</h2>
      <div class="type-grid">
        <div class="type-card" v-for="cat in categoryStats" :key="cat.name" :class="{ active: selectedType === cat.name }" @click="selectedType = cat.name === selectedType ? '' : cat.name">
          <div class="type-bar-wrap">
            <div class="type-bar" :style="{ width: (cat.count / maxTypeCount * 100) + '%', background: cat.color }"></div>
          </div>
          <div class="type-info">
            <div class="type-dot" :style="{ background: cat.color }"></div>
            <div class="type-text">
              <span class="type-name">{{ cat.name }}</span>
              <span class="type-count">{{ cat.count }} 个案例</span>
            </div>
          </div>
          <div class="type-examples" v-if="selectedType === cat.name">
            <span class="example-tag" v-for="b in cat.examples" :key="b.id" @click.stop="$router.push(`/detail/${b.id}`)">{{ b.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 朝代分布 -->
    <div class="section-block">
      <h2 class="block-title">历史跨度</h2>
      <div class="timeline-visual">
        <div class="timeline-bar">
          <div class="time-segment" v-for="d in dynastyStats" :key="d.name" :style="{ flex: d.count, background: d.color }" @click="selectedDynasty = d.name === selectedDynasty ? '' : d.name">
            <span class="time-label">{{ d.name }}</span>
            <span class="time-count">{{ d.count }}</span>
          </div>
        </div>
      </div>
      <div class="dynasty-detail" v-if="selectedDynasty">
        <h3>{{ selectedDynasty }}时期建筑</h3>
        <div class="dynasty-buildings">
          <div class="dynasty-building-card" v-for="b in getDynastyBuildings(selectedDynasty)" :key="b.id" @click="$router.push(`/detail/${b.id}`)">
            <div class="building-dot" :style="{ background: getCategoryColor(b.category) }"></div>
            <div class="building-info">
              <span class="building-name">{{ b.name }}</span>
              <span class="building-cat">{{ b.category }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 地理分布 -->
    <div class="section-block">
      <h2 class="block-title">地域覆盖</h2>
      <div class="region-grid">
        <div class="region-card" v-for="r in regionStats" :key="r.name" :style="{ borderColor: r.color }">
          <div class="region-header" :style="{ background: r.color + '15' }">
            <span class="region-name">{{ r.name }}</span>
            <span class="region-count">{{ r.count }} 个</span>
          </div>
          <div class="region-buildings">
            <span class="region-tag" v-for="b in r.examples" :key="b.id" @click="$router.push(`/detail/${b.id}`)">{{ b.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 材料与工艺 -->
    <div class="section-block">
      <h2 class="block-title">材料与工艺</h2>
      <div class="material-grid">
        <div class="material-card" v-for="m in materialStats" :key="m.name">
          <div class="material-visual" :style="{ background: m.color }">
            <svg class="material-svg" viewBox="0 0 48 48" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2.5" stroke-linecap="round">
              <template v-if="m.name === '木'">
                <line x1="24" y1="6" x2="24" y2="42"/>
                <line x1="12" y1="18" x2="36" y2="18"/>
                <line x1="14" y1="30" x2="34" y2="30"/>
              </template>
              <template v-else-if="m.name === '砖'">
                <rect x="10" y="10" width="28" height="12" rx="2"/>
                <rect x="10" y="26" width="28" height="12" rx="2"/>
              </template>
              <template v-else-if="m.name === '瓦'">
                <path d="M8 20C8 14 16 10 24 10C32 10 40 14 40 20"/>
                <path d="M8 28C8 22 16 18 24 18C32 18 40 22 40 28"/>
                <path d="M8 36C8 30 16 26 24 26C32 26 40 30 40 36"/>
              </template>
              <template v-else-if="m.name === '石'">
                <rect x="10" y="10" width="28" height="28" rx="4"/>
                <circle cx="24" cy="24" r="6"/>
              </template>
              <template v-else-if="m.name === '夯土'">
                <line x1="10" y1="14" x2="38" y2="14"/>
                <line x1="10" y1="20" x2="38" y2="20"/>
                <line x1="10" y1="26" x2="38" y2="26"/>
                <line x1="10" y1="32" x2="38" y2="32"/>
                <line x1="10" y1="38" x2="38" y2="38"/>
              </template>
              <template v-else>
                <rect x="10" y="10" width="28" height="28" rx="4"/>
                <circle cx="18" cy="18" r="3"/>
                <circle cx="30" cy="18" r="3"/>
                <circle cx="18" cy="30" r="3"/>
                <circle cx="30" cy="30" r="3"/>
              </template>
            </svg>
          </div>
          <h4>{{ m.name }}</h4>
          <p class="material-count">{{ m.count }} 次使用</p>
          <p class="material-desc">{{ m.desc }}</p>
        </div>
      </div>
    </div>

    <!-- 保护级别 -->
    <div class="section-block">
      <h2 class="block-title">保护级别</h2>
      <div class="heritage-grid">
      <div class="heritage-card" :style="{ borderColor: '#b38728' }">
        <div class="heritage-badge">
          <div class="heritage-circle" :style="{ background: '#b38728' }">
            <span class="heritage-text">世</span>
          </div>
        </div>
        <h3>世界文化遗产</h3>
        <span class="heritage-num">{{ worldHeritageCount }}</span>
        <p class="heritage-list">{{ worldHeritageList }}</p>
      </div>
      <div class="heritage-card" :style="{ borderColor: '#8f3d2e' }">
        <div class="heritage-badge">
          <div class="heritage-circle" :style="{ background: '#8f3d2e' }">
            <span class="heritage-text">文</span>
          </div>
        </div>
        <h3>全国重点文物保护单位</h3>
        <span class="heritage-num">{{ nationalHeritageCount }}</span>
        <p class="heritage-list">{{ nationalHeritageList }}</p>
      </div>
      <div class="heritage-card" :style="{ borderColor: '#2d5a4a' }">
        <div class="heritage-badge">
          <div class="heritage-circle" :style="{ background: '#2d5a4a' }">
            <span class="heritage-text">历</span>
          </div>
        </div>
        <h3>历史建筑</h3>
        <span class="heritage-num">{{ historicalCount }}</span>
        <p class="heritage-list">{{ historicalList }}</p>
      </div>
    </div>
    </div>

    <!-- 建筑规模 -->
    <div class="section-block">
      <h2 class="block-title">规模分布</h2>
      <div class="scale-bars">
        <div class="scale-item" v-for="s in scaleStats" :key="s.name">
          <span class="scale-name">{{ s.name }}</span>
          <div class="scale-bar-wrap">
            <div class="scale-bar" :style="{ width: (s.count / maxScaleCount * 100) + '%' }"></div>
          </div>
          <span class="scale-count">{{ s.count }}</span>
        </div>
      </div>
    </div>

    <!-- 结语 -->
    <div class="section-block">
      <div class="conclusion-banner">
        <div class="banner-content">
          <h2>穿越千年的营造智慧</h2>
          <p class="banner-text">
            从先秦的夯土高台到明清的榫卯殿宇，从南方的穿斗吊脚到北方的抬梁四合院，
            中国古代建筑以"因地制宜、就地取材、木构为主、礼制有序"为核心特征，
            形成了世界上最完整的传统建筑体系之一。这些建筑不仅是遮风避雨的居所，
            更是中华文明礼制秩序、哲学思想与工程智慧的物质载体。
          </p>
          <div class="banner-tags">
            <span class="banner-tag">因地制宜</span>
            <span class="banner-tag">木构智慧</span>
            <span class="banner-tag">礼制有序</span>
            <span class="banner-tag">工程创新</span>
            <span class="banner-tag">天人合一</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import buildings from '../data/buildings.json'

const router = useRouter()
const expandedIdx = ref(-1)
const selectedType = ref('')
const selectedDynasty = ref('')
const imgErrors = ref({})

function toggleDetail(idx) {
  expandedIdx.value = expandedIdx.value === idx ? -1 : idx
}

function handleImgError(event, item) {
  imgErrors.value[item.image] = true
}

function cardVisualStyle(item) {
  return {
    backgroundImage: `url(/images/summary/${item.image}.jpg)`,
    backgroundColor: item.gradient.includes('#') ? item.gradient.split(',')[0].replace('linear-gradient(135deg, ', '').trim() : '',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
}

const conclusions = [
  {
    symbolType: 'yinshidiyi',
    title: '因地制宜',
    image: '因地制宜',
    desc: '建筑形态高度适应气候、地形与材料条件，形成丰富的地域特色。',
    detail: '从黄土高原的窑洞到江南水乡的天井民居，从岭南骑楼到藏式碉房，古代工匠根据当地气候、地形、材料灵活调整建筑形式。窑洞利用黄土的保温性能，吊脚楼适应山地地形，骑楼应对南方多雨炎热气候，体现了极高的环境适应性。',
    tags: ['窑洞', '吊脚楼', '骑楼', '土楼', '天井'],
    gradient: 'linear-gradient(135deg, #f0e6d3, #d4a574)'
  },
  {
    symbolType: 'lizhiyouxu',
    title: '礼制有序',
    image: '礼制有序',
    desc: '官府与皇宫通过中轴对称、院落层级表达制度秩序与权力结构。',
    detail: '从北京故宫的严格中轴到平遥县衙的空间序列，从曲阜孔庙的等级规制到沈阳故宫的满汉融合，建筑群通过轴线组织、空间递进、形制差异精确传达社会等级。黄色琉璃瓦、九开间、十一踩斗拱等均为等级标识，构成了一套完整的建筑礼制语言。',
    tags: ['故宫', '县衙', '孔庙', '中轴对称', '等级规制'],
    gradient: 'linear-gradient(135deg, #e8d5c4, #8f3d2e)'
  },
  {
    symbolType: 'mougouzhihui',
    title: '木构智慧',
    image: '木构智慧',
    desc: '榫卯连接体系使建筑具有柔性抗震能力，形成"墙倒屋不塌"的独特优势。',
    detail: '抬梁式与穿斗式两大木构体系各具特色：抬梁式适用于大型宫殿庙宇，空间开阔；穿斗式多见于南方民居，结构紧凑。榫卯节点无需铁钉即可实现牢固连接，在地震中通过节点转动吸收能量，展现了古代工匠对力学原理的深刻理解。',
    tags: ['榫卯', '抬梁式', '穿斗式', '斗拱', '抗震'],
    gradient: 'linear-gradient(135deg, #d4a574, #5c1a1a)'
  },
  {
    symbolType: 'gongchengchuangxin',
    title: '工程创新',
    image: '工程创新',
    desc: '桥梁、水利等工程建筑在结构形式和受力技术上展现卓越创造力。',
    detail: '赵州桥的敞肩拱技术比欧洲早1200年，洛阳桥的养蛎固基利用生物工程技术加固桥基，都江堰鱼嘴的无坝引水实现科学分水排沙，泸定桥的铁索悬跨展现了大跨度结构的建造能力。这些工程成就体现了古代中国在土木工程领域的领先地位。',
    tags: ['赵州桥', '洛阳桥', '都江堰', '泸定桥', '养蛎固基'],
    gradient: 'linear-gradient(135deg, #c8d8cc, #2d5a4a)'
  }
]

const categoryStats = computed(() => {
  const cats = {}
  const colors = { '民居': '#b38728', '官府': '#8f3d2e', '皇宫': '#5c1a1a', '桥梁': '#2d5a4a' }
  buildings.forEach(b => {
    if (!cats[b.category]) cats[b.category] = { name: b.category, count: 0, examples: [], color: colors[b.category] }
    cats[b.category].count++
    cats[b.category].examples.push({ id: b.id, name: b.name })
  })
  return Object.values(cats).sort((a, b) => b.count - a.count)
})

const maxTypeCount = computed(() => Math.max(...categoryStats.value.map(c => c.count), 1))

const dynastyStats = computed(() => {
  const dynasties = {}
  const colors = { '先秦': '#d4a574', '秦汉': '#c9956b', '隋唐': '#b8865a', '宋元': '#a8764a', '明清': '#8f3d2e', '近现代': '#5c1a1a' }
  const nameMap = {
    '战国': '先秦', '秦': '先秦', '先秦': '先秦',
    '秦': '秦汉', '汉': '秦汉', '秦汉': '秦汉', '三国': '秦汉',
    '隋': '隋唐', '唐': '隋唐', '隋唐': '隋唐',
    '宋': '宋元', '辽': '宋元', '金': '宋元', '元': '宋元', '宋元': '宋元',
    '明': '明清', '清': '明清', '明清': '明清', '清初': '明清', '清末民国': '明清',
    '近现代': '近现代', '民国': '近现代'
  }
  buildings.forEach(b => {
    const name = nameMap[b.dynasty] || b.dynasty
    if (!dynasties[name]) dynasties[name] = { name, count: 0, color: colors[name] || '#8f3d2e' }
    dynasties[name].count++
  })
  return Object.values(dynasties).sort((a, b) => b.count - a.count)
})

const dynastyCount = computed(() => dynastyStats.value.length)

const regionStats = computed(() => {
  const regions = {}
  const colors = { '华北': '#8f3d2e', '华东': '#b38728', '华中': '#c9956b', '西南': '#2d5a4a', '华南': '#a8764a', '西北': '#d4a574', '东北': '#5c1a1a' }
  buildings.forEach(b => {
    if (!regions[b.region]) regions[b.region] = { name: b.region, count: 0, examples: [], color: colors[b.region] || '#8f3d2e' }
    regions[b.region].count++
    if (regions[b.region].examples.length < 6) {
      regions[b.region].examples.push({ id: b.id, name: b.name })
    }
  })
  return Object.values(regions).sort((a, b) => b.count - a.count)
})

const regionCount = computed(() => regionStats.value.length)

function getDynastyBuildings(name) {
  const nameMap = {
    '先秦': ['战国', '秦', '先秦'], '秦汉': ['秦', '汉', '秦汉', '三国'],
    '隋唐': ['隋', '唐', '隋唐'], '宋元': ['宋', '辽', '金', '元', '宋元'],
    '明清': ['明', '清', '明清', '清初', '清末民国'], '近现代': ['近现代', '民国']
  }
  const dynList = nameMap[name] || [name]
  return buildings.filter(b => dynList.includes(b.dynasty)).slice(0, 8)
}

const materialStats = computed(() => {
  const mats = {}
  const matInfo = {
    '木': { desc: '中国古代建筑最主要的结构材料', color: '#b38728' },
    '砖': { desc: '墙体围护的主要材料', color: '#8f3d2e' },
    '瓦': { desc: '屋面防水的传统材料', color: '#5c1a1a' },
    '石': { desc: '桥梁、台基、栏杆的重要材料', color: '#2d5a4a' },
    '夯土': { desc: '早期城墙与宫殿的基础材料', color: '#d4a574' },
    '混凝土': { desc: '近现代引入的新型建筑材料', color: '#a8764a' },
    '铁': { desc: '铁索桥等工程的关键材料', color: '#5a4a3a' },
    '生土': { desc: '窑洞等生土建筑的核心材料', color: '#c9956b' },
    '竹': { desc: '南方地区常见的辅助材料', color: '#6b8f7a' },
    '铜': { desc: '装饰与连接的金属材料', color: '#b8865a' }
  }
  buildings.forEach(b => {
    b.material.forEach(m => {
      if (!mats[m]) mats[m] = { name: m, count: 0, desc: matInfo[m]?.desc || '', color: matInfo[m]?.color || '#8f3d2e' }
      mats[m].count++
    })
  })
  return Object.values(mats).sort((a, b) => b.count - a.count).slice(0, 6)
})

const worldHeritageCount = computed(() => buildings.filter(b => b.heritage.includes('世界')).length)
const worldHeritageList = computed(() => buildings.filter(b => b.heritage.includes('世界')).map(b => b.name).join('、'))

const nationalHeritageCount = computed(() => buildings.filter(b => b.heritage.includes('全国重点')).length)
const nationalHeritageList = computed(() => buildings.filter(b => b.heritage.includes('全国重点')).map(b => b.name).join('、'))

const historicalCount = computed(() => buildings.filter(b => b.heritage === '历史建筑').length)
const historicalList = computed(() => buildings.filter(b => b.heritage === '历史建筑').map(b => b.name).join('、'))

const scaleStats = computed(() => {
  const scales = {}
  buildings.forEach(b => {
    if (!scales[b.scale]) scales[b.scale] = { name: b.scale, count: 0 }
    scales[b.scale].count++
  })
  const order = ['超大型', '大型', '中型', '中小型', '小型']
  return order.filter(s => scales[s]).map(s => scales[s])
})

const maxScaleCount = computed(() => Math.max(...scaleStats.value.map(s => s.count), 1))

function getCategoryGradient(cat) {
  const gradients = {
    '民居': 'linear-gradient(135deg, #f0e6d3, #d4a574)',
    '官府': 'linear-gradient(135deg, #e8d5c4, #8f3d2e)',
    '皇宫': 'linear-gradient(135deg, #d4a574, #5c1a1a)',
    '桥梁': 'linear-gradient(135deg, #c8d8cc, #2d5a4a)'
  }
  return gradients[cat] || 'linear-gradient(135deg, #f5efe5, #e8d5c4)'
}

function getCategoryColor(cat) {
  const colors = { '民居': '#b38728', '官府': '#8f3d2e', '皇宫': '#5c1a1a', '桥梁': '#2d5a4a' }
  return colors[cat] || '#8f3d2e'
}
</script>

<style scoped>
.summary-shell {
  min-height: 100vh;
  background: var(--bg);
  padding-bottom: 60px;
}

/* Hero 区 */
.summary-hero {
  text-align: center;
  padding: 80px 24px 60px;
  background: linear-gradient(180deg, #faf6ee 0%, #f0e8d8 100%);
}

.summary-hero h1 {
  font-size: 56px;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 8px;
  margin-bottom: 12px;
}

.hero-sub {
  font-size: 18px;
  color: var(--accent);
  margin-bottom: 40px;
  letter-spacing: 2px;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-num {
  font-size: 48px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--text-sub);
  letter-spacing: 1px;
}

/* 区块 */
.section-block {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 24px;
}

.block-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: 3px;
  margin-bottom: 32px;
  padding-left: 16px;
  border-left: 4px solid var(--primary);
}

/* 核心结论卡片 */
.conclusion-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.conclusion-card {
  background: var(--surface);
  border-radius: 16px;
  border: 1px solid var(--border);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.conclusion-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.card-visual {
  height: 120px;
  position: relative;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.card-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0e6d3, #d4a574);
}

.card-symbol {
  width: 56px;
  height: 56px;
  position: relative;
}

.symbol-yinshidiyi::before {
  content: '';
  position: absolute;
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.85);
  border-radius: 50% 50% 4px 4px;
  top: 8px;
  left: 8px;
}
.symbol-yinshidiyi::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 12px;
  background: rgba(255,255,255,0.85);
  border-radius: 6px 6px 0 0;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
}

.symbol-lizhiyouxu::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 40px;
  background: rgba(255,255,255,0.85);
  border-radius: 2px;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
}
.symbol-lizhiyouxu::after {
  content: '';
  position: absolute;
  width: 48px;
  height: 16px;
  border: 3px solid rgba(255,255,255,0.85);
  border-radius: 2px;
  top: 24px;
  left: 4px;
}

.symbol-mougouzhihui::before {
  content: '';
  position: absolute;
  width: 36px;
  height: 8px;
  background: rgba(255,255,255,0.85);
  border-radius: 2px;
  top: 12px;
  left: 10px;
}
.symbol-mougouzhihui::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 36px;
  background: rgba(255,255,255,0.85);
  border-radius: 2px;
  top: 10px;
  left: 24px;
  box-shadow: 16px 0 0 rgba(255,255,255,0.85), -16px 0 0 rgba(255,255,255,0.85);
}

.symbol-gongchengchuangxin::before {
  content: '';
  position: absolute;
  width: 48px;
  height: 8px;
  background: rgba(255,255,255,0.85);
  border-radius: 4px;
  top: 20px;
  left: 4px;
}
.symbol-gongchengchuangxin::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 20px;
  background: rgba(255,255,255,0.85);
  border-radius: 2px;
  bottom: 8px;
  left: 12px;
  box-shadow: 32px 0 0 rgba(255,255,255,0.85);
}

.card-content {
  padding: 20px 24px;
}

.card-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.card-desc {
  font-size: 14px;
  color: var(--text-sub);
  line-height: 1.7;
  margin-bottom: 12px;
}

.card-detail {
  margin-top: 12px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-divider {
  height: 1px;
  background: linear-gradient(90deg, var(--border), transparent);
  margin-bottom: 12px;
}

.detail-text {
  font-size: 14px;
  color: var(--text-sub);
  line-height: 1.9;
  margin-bottom: 12px;
  text-align: justify;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-tag {
  padding: 4px 12px;
  background: rgba(143,61,46,0.08);
  color: var(--primary);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.toggle-btn {
  font-size: 13px;
  color: var(--accent);
  font-weight: 500;
}

/* 类型分布 */
.type-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.type-card {
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 20px 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.type-card:hover, .type-card.active {
  border-color: var(--primary);
  box-shadow: 0 2px 12px rgba(143,61,46,0.08);
}

.type-bar-wrap {
  height: 8px;
  background: rgba(89,62,46,0.08);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.type-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.type-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-dot {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  flex-shrink: 0;
}

.type-name {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
}

.type-count {
  font-size: 14px;
  color: var(--text-sub);
}

.type-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  animation: fadeIn 0.3s ease;
}

.example-tag {
  padding: 6px 14px;
  background: rgba(143,61,46,0.06);
  color: var(--text-main);
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.example-tag:hover {
  background: var(--primary);
  color: #fff;
}

/* 历史跨度 */
.timeline-visual {
  margin-bottom: 24px;
}

.timeline-bar {
  display: flex;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  gap: 2px;
}

.time-segment {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter 0.3s;
  min-width: 60px;
}

.time-segment:hover {
  filter: brightness(1.1);
}

.time-label {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.time-count {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.dynasty-detail {
  margin-top: 24px;
  animation: fadeIn 0.3s ease;
}

.dynasty-detail h3 {
  font-size: 18px;
  color: var(--text-main);
  margin-bottom: 16px;
}

.dynasty-buildings {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.dynasty-building-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.3s;
}

.dynasty-building-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.building-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.dynasty-building-card:hover .building-dot {
  transform: scale(1.15);
}

.building-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.building-cat {
  font-size: 12px;
  color: var(--text-sub);
}

/* 地域分布 */
.region-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.region-card {
  background: var(--surface);
  border-radius: 12px;
  border: 2px solid;
  overflow: hidden;
}

.region-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.region-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
}

.region-count {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
}

.region-buildings {
  padding: 12px 20px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.region-tag {
  padding: 4px 12px;
  background: rgba(89,62,46,0.06);
  color: var(--text-main);
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.region-tag:hover {
  background: var(--primary);
  color: #fff;
}

/* 材料与工艺 */
.material-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.material-card {
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 24px 16px;
  text-align: center;
  transition: all 0.3s;
}

.material-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.material-visual {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  position: relative;
}

.material-symbol {
  display: block;
  width: 28px;
  height: 28px;
  position: relative;
}

.symbol-木::before {
  content: '';
  position: absolute;
  width: 3px;
  height: 24px;
  background: rgba(255,255,255,0.9);
  left: 50%;
  top: 2px;
  transform: translateX(-50%);
  border-radius: 1px;
}
.symbol-木::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 3px;
  background: rgba(255,255,255,0.9);
  left: 50%;
  top: 10px;
  transform: translateX(-50%);
  border-radius: 1px;
  box-shadow: 0 6px 0 rgba(255,255,255,0.9);
}

.symbol-砖::before {
  content: '';
  position: absolute;
  width: 24px;
  height: 8px;
  border: 2px solid rgba(255,255,255,0.9);
  border-radius: 2px;
  top: 4px;
  left: 2px;
}
.symbol-砖::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 8px;
  border: 2px solid rgba(255,255,255,0.9);
  border-radius: 2px;
  bottom: 4px;
  left: 2px;
}

.symbol-瓦::before {
  content: '';
  position: absolute;
  width: 26px;
  height: 4px;
  background: rgba(255,255,255,0.9);
  border-radius: 2px;
  top: 8px;
  left: 1px;
}
.symbol-瓦::after {
  content: '';
  position: absolute;
  width: 26px;
  height: 4px;
  background: rgba(255,255,255,0.9);
  border-radius: 2px;
  top: 16px;
  left: 1px;
  box-shadow: 0 8px 0 rgba(255,255,255,0.9);
}

.symbol-石::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255,255,255,0.9);
  border-radius: 4px;
  top: 3px;
  left: 3px;
}
.symbol-石::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border: 2px solid rgba(255,255,255,0.9);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.symbol-夯土::before {
  content: '';
  position: absolute;
  width: 24px;
  height: 20px;
  background: repeating-linear-gradient(
    0deg,
    rgba(255,255,255,0.9) 0px,
    rgba(255,255,255,0.9) 2px,
    transparent 2px,
    transparent 6px
  );
  border-radius: 3px;
  top: 4px;
  left: 2px;
}
.symbol-夯土::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
}

.symbol-混凝土::before {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  background: rgba(255,255,255,0.9);
  border-radius: 4px;
  top: 2px;
  left: 2px;
  opacity: 0.9;
}
.symbol-混凝土::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(0,0,0,0.2);
  border-radius: 50%;
  top: 8px;
  left: 8px;
  box-shadow: 8px 0 0 rgba(0,0,0,0.2), 0 8px 0 rgba(0,0,0,0.2), 8px 8px 0 rgba(0,0,0,0.2);
}

.symbol-铁::before {
  content: '';
  position: absolute;
  width: 24px;
  height: 3px;
  background: rgba(255,255,255,0.9);
  top: 8px;
  left: 2px;
  border-radius: 1px;
}
.symbol-铁::after {
  content: '';
  position: absolute;
  width: 3px;
  height: 16px;
  background: rgba(255,255,255,0.9);
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 1px;
}

.symbol-生土::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 24px;
  background: rgba(255,255,255,0.9);
  border-radius: 10px 10px 2px 2px;
  top: 2px;
  left: 50%;
  transform: translateX(-50%);
}
.symbol-生土::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 10px;
  background: rgba(0,0,0,0.15);
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 4px 4px 0 0;
}

.material-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 4px;
}

.material-count {
  font-size: 14px;
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 8px;
}

.material-desc {
  font-size: 12px;
  color: var(--text-sub);
  line-height: 1.6;
}

/* 保护级别 */
.heritage-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.heritage-card {
  background: var(--surface);
  border-radius: 16px;
  border: 2px solid;
  padding: 32px 24px;
  text-align: center;
}

.heritage-badge {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.heritage-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.heritage-text {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
}

.badge-svg {
  width: 64px;
  height: 64px;
}

.heritage-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 12px;
}

.heritage-num {
  display: block;
  font-size: 36px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 12px;
}

.heritage-list {
  font-size: 13px;
  color: var(--text-sub);
  line-height: 1.8;
}

/* 规模分布 */
.scale-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scale-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.scale-name {
  min-width: 60px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-main);
  text-align: right;
}

.scale-bar-wrap {
  flex: 1;
  height: 32px;
  background: rgba(89,62,46,0.08);
  border-radius: 8px;
  overflow: hidden;
}

.scale-bar {
  height: 100%;
  background: linear-gradient(90deg, #8f3d2e 0%, #b38728 60%, #d4a574 100%);
  border-radius: 8px;
  transition: width 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.scale-count {
  min-width: 40px;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
}

/* 结语横幅 */
.conclusion-banner {
  background: linear-gradient(135deg, #a8764a 0%, #c9956b 50%, #a8764a 100%);
  border-radius: 20px;
  padding: 60px 48px;
  color: #fff;
  box-shadow: 0 8px 32px rgba(168,118,74,0.25);
}

.banner-content {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}

.banner-content h2 {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 4px;
  margin-bottom: 24px;
}

.banner-text {
  font-size: 16px;
  line-height: 2;
  opacity: 0.9;
  margin-bottom: 32px;
  text-align: justify;
}

.banner-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.banner-tag {
  padding: 8px 20px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .conclusion-grid {
    grid-template-columns: 1fr;
  }
  .heritage-grid {
    grid-template-columns: 1fr;
  }
  .hero-stats {
    gap: 24px;
  }
  .stat-num {
    font-size: 36px;
  }
}

@media (max-width: 700px) {
  .summary-hero h1 {
    font-size: 36px;
    letter-spacing: 4px;
  }
  .hero-stats {
    flex-wrap: wrap;
    gap: 16px;
  }
  .hero-stat {
    min-width: 100px;
  }
  .conclusion-banner {
    padding: 40px 24px;
  }
  .banner-content h2 {
    font-size: 24px;
  }
  .block-title {
    font-size: 22px;
  }
  .region-grid {
    grid-template-columns: 1fr;
  }
  .dynasty-buildings {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
