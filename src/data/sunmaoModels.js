export const sunmaoModels = [
  {
    id: 'building-01',
    name: '内乡县衙',
    category: '官府',
    desc: '内乡县衙是中国古代官府建筑的典型代表，其建筑结构体现了严格的等级制度和礼制要求。',
    difficulty: '高级',
    parts: [
      {
        id: 'main-hall-structure',
        name: '大堂木结构',
        color: '#b38728',
        geometry: { type: 'box', size: [2, 0.8, 1.5], position: [0, 0.4, 0] },
        description: '大堂的抬梁式木构架，体现官式建筑的等级制度'
      },
      {
        id: 'dougong',
        name: '斗拱',
        color: '#8f3d2e',
        geometry: { type: 'box', size: [0.3, 0.3, 0.3], position: [0.8, 0.8, 0.3] },
        description: '大堂前檐的斗拱，用于支撑屋檐和传递荷载'
      },
      {
        id: 'dougong-2',
        name: '斗拱',
        color: '#8f3d2e',
        geometry: { type: 'box', size: [0.3, 0.3, 0.3], position: [-0.8, 0.8, 0.3] },
        description: '大堂前檐的斗拱，用于支撑屋檐和传递荷载'
      },
      {
        id: 'columns',
        name: '檐柱',
        color: '#2d5a4a',
        geometry: { type: 'cylinder', size: [0.2, 0.2, 1.2], position: [1, 0.6, 0.3] },
        description: '大堂的檐柱，支撑整个建筑结构'
      },
      {
        id: 'columns-2',
        name: '檐柱',
        color: '#2d5a4a',
        geometry: { type: 'cylinder', size: [0.2, 0.2, 1.2], position: [-1, 0.6, 0.3] },
        description: '大堂的檐柱，支撑整个建筑结构'
      },
      {
        id: 'beam',
        name: '大梁',
        color: '#b38728',
        geometry: { type: 'box', size: [2.2, 0.15, 0.3], position: [0, 1, 0] },
        description: '大堂的大梁，连接柱网，支撑屋面'
      },
      {
        id: 'platform',
        name: '月台',
        color: '#5c4a3a',
        geometry: { type: 'box', size: [2.5, 0.2, 1.8], position: [0, 0.1, 0] },
        description: '大堂的月台，体现官府建筑的等级'
      },
      {
        id: 'steps',
        name: '台阶',
        color: '#5c4a3a',
        geometry: { type: 'box', size: [2, 0.1, 0.5], position: [0, 0.05, -0.8] },
        description: '大堂前的台阶，象征官阶等级'
      }
    ],
    assembly: {
      direction: 'multi',
      offset: 0,
      description: '抬梁式木构架结构，体现官式建筑特点'
    }
  },
  {
    id: 'building-02',
    name: '北京故宫',
    category: '皇宫',
    desc: '北京故宫太和殿是中国古代宫殿建筑的巅峰之作，其结构体现了皇家建筑的最高等级和技术成就。',
    difficulty: '高级',
    parts: [
      {
        id: 'taihedian-structure',
        name: '太和殿木构架',
        color: '#b38728',
        geometry: { type: 'box', size: [3, 1, 2], position: [0, 0.5, 0] },
        description: '太和殿的抬梁式木构架，采用最高等级的建筑规制'
      },
      {
        id: 'dougong-complex',
        name: '复杂斗拱',
        color: '#8f3d2e',
        geometry: { type: 'box', size: [0.4, 0.4, 0.4], position: [1.2, 1, 0.5] },
        description: '太和殿的复杂斗拱，体现皇家建筑的最高等级'
      },
      {
        id: 'dougong-complex-2',
        name: '复杂斗拱',
        color: '#8f3d2e',
        geometry: { type: 'box', size: [0.4, 0.4, 0.4], position: [-1.2, 1, 0.5] },
        description: '太和殿的复杂斗拱，体现皇家建筑的最高等级'
      },
      {
        id: 'golden-column',
        name: '金柱',
        color: '#e6c229',
        geometry: { type: 'cylinder', size: [0.3, 0.3, 1.5], position: [0.8, 0.75, 0] },
        description: '太和殿的金柱，支撑上层梁架'
      },
      {
        id: 'golden-column-2',
        name: '金柱',
        color: '#e6c229',
        geometry: { type: 'cylinder', size: [0.3, 0.3, 1.5], position: [-0.8, 0.75, 0] },
        description: '太和殿的金柱，支撑上层梁架'
      },
      {
        id: 'main-beam',
        name: '正梁',
        color: '#b38728',
        geometry: { type: 'box', size: [3.2, 0.2, 0.4], position: [0, 1.2, 0] },
        description: '太和殿的正梁，建筑的核心承重构件'
      },
      {
        id: 'platform',
        name: '汉白玉月台',
        color: '#5c4a3a',
        geometry: { type: 'box', size: [4, 0.3, 3], position: [0, 0.15, 0] },
        description: '太和殿的汉白玉月台，象征皇家威严'
      },
      {
        id: 'steps',
        name: '御路',
        color: '#5c4a3a',
        geometry: { type: 'box', size: [3, 0.1, 1], position: [0, 0.05, -1.5] },
        description: '太和殿的御路，皇帝专用通道'
      }
    ],
    assembly: {
      direction: 'multi',
      offset: 0,
      description: '皇家建筑最高等级的木构架结构'
    }
  },
  {
    id: 'building-03',
    name: '卢沟桥',
    category: '桥梁',
    desc: '卢沟桥是中国古代石拱桥的杰出代表，其结构体现了古代桥梁建筑的精湛技术。',
    difficulty: '高级',
    parts: [
      {
        id: 'arch-structure',
        name: '拱券结构',
        color: '#8f3d2e',
        geometry: { type: 'box', size: [6, 0.2, 1.5], position: [0, 0.1, 0] },
        description: '卢沟桥的石拱券结构，采用并列砌筑法'
      },
      {
        id: 'pier',
        name: '桥墩',
        color: '#5c4a3a',
        geometry: { type: 'box', size: [1, 0.8, 1.8], position: [-2, -0.3, 0] },
        description: '卢沟桥的桥墩，设计成船形以减少水流阻力'
      },
      {
        id: 'pier-2',
        name: '桥墩',
        color: '#5c4a3a',
        geometry: { type: 'box', size: [1, 0.8, 1.8], position: [2, -0.3, 0] },
        description: '卢沟桥的桥墩，设计成船形以减少水流阻力'
      },
      {
        id: 'stone-lion',
        name: '石狮',
        color: '#b38728',
        geometry: { type: 'box', size: [0.3, 0.3, 0.2], position: [-2.5, 0.2, 0.6] },
        description: '卢沟桥的石狮雕刻，体现古代雕刻艺术'
      },
      {
        id: 'stone-lion-2',
        name: '石狮',
        color: '#b38728',
        geometry: { type: 'box', size: [0.3, 0.3, 0.2], position: [2.5, 0.2, 0.6] },
        description: '卢沟桥的石狮雕刻，体现古代雕刻艺术'
      },
      {
        id: 'railing',
        name: '石栏杆',
        color: '#5c4a3a',
        geometry: { type: 'box', size: [6.2, 0.1, 0.1], position: [0, 0.2, 0.7] },
        description: '卢沟桥的石栏杆，保护行人安全'
      },
      {
        id: 'railing-2',
        name: '石栏杆',
        color: '#5c4a3a',
        geometry: { type: 'box', size: [6.2, 0.1, 0.1], position: [0, 0.2, -0.7] },
        description: '卢沟桥的石栏杆，保护行人安全'
      },
      {
        id: 'foundation',
        name: '基础',
        color: '#5c4a3a',
        geometry: { type: 'box', size: [8, 0.1, 2], position: [0, -0.8, 0] },
        description: '卢沟桥的基础，采用糯米石灰浆砌筑'
      }
    ],
    assembly: {
      direction: 'x',
      offset: 1,
      description: '石拱桥结构，体现古代桥梁建筑技术'
    }
  },
  {
    id: 'building-04',
    name: '赵州桥',
    category: '桥梁',
    desc: '赵州桥是隋代李春建造的世界上现存最早、跨度最大的敞肩石拱桥。',
    difficulty: '高级',
    parts: [
      {
        id: 'main-arch',
        name: '主拱券',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [2.7, 0.36, 1.6], position: [0, 0.43, 0] },
        description: '敞肩圆弧拱，首创敞肩拱技术'
      },
      {
        id: 'deck',
        name: '桥面石板',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [5.2, 0.15, 1.6], position: [0, 0.72, 0] },
        description: '石板桥面，行人通行'
      },
      {
        id: 'small-arch-1',
        name: '小拱券',
        color: '#aa8a5a',
        geometry: { type: 'cylinder', size: [0.55, 0.55, 0.1, 16], position: [-1.6, 0.35, 0.85] },
        description: '两端小拱券，减轻自重'
      },
      {
        id: 'small-arch-2',
        name: '小拱券',
        color: '#aa8a5a',
        geometry: { type: 'cylinder', size: [0.55, 0.55, 0.1, 16], position: [-2.8, 0.35, 0.85] },
        description: '两端小拱券，减轻自重'
      },
      {
        id: 'pillar',
        name: '望柱',
        color: '#aa8a5a',
        geometry: { type: 'box', size: [0.18, 0.6, 0.18], position: [2.4, 1.25, 0.9] },
        description: '栏杆望柱，雕刻龙兽'
      }
    ],
    assembly: {
      direction: 'x',
      offset: 0.8,
      description: '敞肩石拱桥结构，体现古代桥梁建筑技术'
    }
  },
  {
    id: 'building-05',
    name: '福建土楼',
    category: '民居',
    desc: '福建土楼是客家聚居建筑，巨型生土楼，防御与聚族而居。',
    difficulty: '高级',
    parts: [
      {
        id: 'outer-wall',
        name: '夯土外墙',
        color: '#c6a87a',
        geometry: { type: 'cylinder', size: [2.2, 2.3, 2.2, 64], position: [0, 1.1, 0] },
        description: '夯土墙厚达1.8米，底层无窗'
      },
      {
        id: 'roof',
        name: '环形锥面屋顶',
        color: '#8b5a2b',
        geometry: { type: 'cone', size: [2.35, 0.7, 64], position: [0, 2.55, 0] },
        description: '悬山屋顶，出檐深远'
      },
      {
        id: 'inner-ring',
        name: '内环祖堂',
        color: '#bc9a6a',
        geometry: { type: 'cylinder', size: [1.0, 1.0, 0.8, 32], position: [0, 0.9, 0] },
        description: '中心祖堂，木构廊道连通'
      },
      {
        id: 'pillar',
        name: '廊道立柱',
        color: '#bc8a5a',
        geometry: { type: 'box', size: [0.12, 1.0, 0.12], position: [1.6, 0.6, 0] },
        description: '内部廊道立柱'
      },
      {
        id: 'gate',
        name: '门楼',
        color: '#c6a87a',
        geometry: { type: 'box', size: [0.7, 1.1, 0.4], position: [2.1, 0.6, 0] },
        description: '大门楼，防御与聚居'
      }
    ],
    assembly: {
      direction: 'radial',
      offset: 0,
      description: '圆形土楼结构，体现客家聚居建筑'
    }
  },
  {
    id: 'building-06',
    name: '承德避暑山庄',
    category: '皇宫',
    desc: '承德避暑山庄是清代皇帝夏宫，世界最大皇家园林。',
    difficulty: '高级',
    parts: [
      {
        id: 'main-hall',
        name: '澹泊敬诚殿',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [2.2, 1.0, 1.8], position: [0, 0.5, 0] },
        description: '楠木殿，朴素淡雅'
      },
      {
        id: 'main-roof',
        name: '主屋顶',
        color: '#8a6a3a',
        geometry: { type: 'cylinder', size: [1.8, 1.9, 0.5, 4], position: [0, 1.25, 0] },
        description: '四边形攒尖屋顶'
      },
      {
        id: 'yanyu-building',
        name: '烟雨楼',
        color: '#ba7a4a',
        geometry: { type: 'box', size: [1.4, 1.0, 1.4], position: [2.2, 0.7, 1.6] },
        description: '多层建筑，模拟江南风格'
      },
      {
        id: 'jinshan-pavilion',
        name: '金山亭',
        color: '#dbaa33',
        geometry: { type: 'cone', size: [0.8, 0.7, 8], position: [-1.8, 1.3, 1.2] },
        description: '金亭，山水园林'
      },
      {
        id: 'lake',
        name: '湖区水面',
        color: '#2a7a9f',
        geometry: { type: 'box', size: [4, 0.05, 3], position: [-1, 0.05, -1] },
        description: '湖区水面，模拟西湖'
      }
    ],
    assembly: {
      direction: 'multi',
      offset: 0,
      description: '皇家园林建筑群，体现南北风格融合'
    }
  },
  {
    id: 'building-07',
    name: '徽州民居',
    category: '民居',
    desc: '徽州民居是皖南古村落代表，粉墙黛瓦马头墙，天井采光排水。',
    difficulty: '中级',
    parts: [
      {
        id: 'main-body',
        name: '主屋墙体',
        color: '#f5f0e0',
        geometry: { type: 'box', size: [2.0, 1.2, 1.8], position: [0, 0.6, 0] },
        description: '高墙深院，防火防盗'
      },
      {
        id: 'main-roof',
        name: '硬山屋顶',
        color: '#6a5a4a',
        geometry: { type: 'cylinder', size: [1.6, 1.7, 0.5, 4], position: [0, 1.45, 0] },
        description: '粉墙黛瓦，马头墙'
      },
      {
        id: 'horse-wall-l',
        name: '马头墙',
        color: '#f5f0e0',
        geometry: { type: 'box', size: [0.3, 0.8, 0.2], position: [-1.1, 1.2, 0] },
        description: '防火山墙'
      },
      {
        id: 'patio',
        name: '天井',
        color: '#bcac8a',
        geometry: { type: 'box', size: [1.0, 0.1, 1.0], position: [0, 0.05, 0] },
        description: '四水归堂的天井'
      },
      {
        id: 'gate-house',
        name: '门楼',
        color: '#bc8a5a',
        geometry: { type: 'box', size: [0.8, 0.6, 0.1], position: [0, 0.5, 0.95] },
        description: '木雕门楼，寓意商字纹'
      }
    ],
    assembly: {
      direction: 'multi',
      offset: 0,
      description: '徽派建筑结构，体现天井采光特色'
    }
  },
  {
    id: 'building-08',
    name: '开封府',
    category: '官府',
    desc: '开封府是北宋京都官署建筑，代表宋代衙署规制。',
    difficulty: '高级',
    parts: [
      {
        id: 'main-hall',
        name: '大堂',
        color: '#ba7a4a',
        geometry: { type: 'box', size: [2.2, 1.1, 2.0], position: [0, 0.55, 0] },
        description: '正堂，前朝后寝'
      },
      {
        id: 'hall-roof',
        name: '硬山屋顶',
        color: '#7a5a3a',
        geometry: { type: 'cylinder', size: [1.8, 1.9, 0.6, 4], position: [0, 1.4, 0] },
        description: '宋代风格屋顶'
      },
      {
        id: 'yi-men',
        name: '仪门',
        color: '#ba7a4a',
        geometry: { type: 'box', size: [1.4, 0.8, 1.0], position: [0, 0.4, -1.8] },
        description: '仪门，中轴对称'
      },
      {
        id: 'jie-stone',
        name: '戒石亭',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [0.6, 0.4, 0.6], position: [0, 0.2, -0.8] },
        description: '戒石铭，警示官员'
      },
      {
        id: 'tower',
        name: '清心楼',
        color: '#ba7a4a',
        geometry: { type: 'box', size: [1.2, 2.0, 1.2], position: [2.5, 1.0, 1.2] },
        description: '高塔建筑，宋代风格'
      }
    ],
    assembly: {
      direction: 'multi',
      offset: 0,
      description: '宋代衙署建筑，中轴对称布局'
    }
  },
  {
    id: 'building-09',
    name: '洛阳桥',
    category: '桥梁',
    desc: '洛阳桥是北宋蔡襄主持建造的中国首座跨海石桥。',
    difficulty: '高级',
    parts: [
      {
        id: 'bridge-deck',
        name: '石桥面',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [6.0, 0.2, 1.4], position: [0, 0.5, 0] },
        description: '石梁重达数吨'
      },
      {
        id: 'pier',
        name: '船形桥墩',
        color: '#bc9a6a',
        geometry: { type: 'cylinder', size: [0.45, 0.55, 0.7, 8], position: [0, 0.35, 0] },
        description: '船形桥墩，减少水流冲击'
      },
      {
        id: 'stone-tower',
        name: '石塔',
        color: '#ccaa77',
        geometry: { type: 'cone', size: [0.4, 0.5, 4], position: [-3.2, 1.65, 0.8] },
        description: '石塔护桥'
      },
      {
        id: 'stone-general',
        name: '石将军',
        color: '#aa8a5a',
        geometry: { type: 'box', size: [0.5, 0.8, 0.4], position: [3.0, 0.6, 0.8] },
        description: '石将军护桥'
      }
    ],
    assembly: {
      direction: 'x',
      offset: 1.2,
      description: '跨海石桥结构，首创筏形基础'
    }
  },
  {
    id: 'building-10',
    name: '西安钟鼓楼',
    category: '官府',
    desc: '西安钟鼓楼是明代建筑，钟楼置大钟报时，鼓楼置巨鼓。',
    difficulty: '高级',
    parts: [
      {
        id: 'bell-tower-base',
        name: '钟楼基座',
        color: '#bcac8a',
        geometry: { type: 'box', size: [2.2, 0.4, 2.2], position: [-1.5, 0.2, 0] },
        description: '青砖基座'
      },
      {
        id: 'bell-tower-body',
        name: '钟楼楼体',
        color: '#ba7a4a',
        geometry: { type: 'box', size: [1.6, 1.2, 1.6], position: [-1.5, 1.0, 0] },
        description: '阁楼式木构'
      },
      {
        id: 'bell-tower-roof',
        name: '重檐歇山顶',
        color: '#dbaa33',
        geometry: { type: 'cone', size: [1.0, 0.5, 4], position: [-1.5, 2.2, 0] },
        description: '琉璃瓦顶，翼角飞翘'
      },
      {
        id: 'drum-tower-base',
        name: '鼓楼基座',
        color: '#bcac8a',
        geometry: { type: 'box', size: [2.2, 0.4, 2.2], position: [1.5, 0.2, 0] },
        description: '青砖基座'
      },
      {
        id: 'drum-tower-body',
        name: '鼓楼楼体',
        color: '#ba7a4a',
        geometry: { type: 'box', size: [1.6, 1.2, 1.6], position: [1.5, 1.0, 0] },
        description: '阁楼式木构'
      }
    ],
    assembly: {
      direction: 'multi',
      offset: 0,
      description: '明代钟鼓楼，重檐三滴水歇山顶'
    }
  },
  {
    id: 'building-11',
    name: '颐和园',
    category: '皇宫',
    desc: '颐和园是清代皇家园林，万寿山与昆明湖构成。',
    difficulty: '高级',
    parts: [
      {
        id: 'foxiang-pavilion',
        name: '佛香阁',
        color: '#ba7a4a',
        geometry: { type: 'cylinder', size: [1.0, 1.1, 2.5, 8], position: [0, 1.25, 0] },
        description: '八角三层，标志性建筑'
      },
      {
        id: 'foxiang-roof',
        name: '攒尖屋顶',
        color: '#dbaa33',
        geometry: { type: 'cone', size: [0.7, 0.5, 8], position: [0, 2.65, 0] },
        description: '金色琉璃瓦顶'
      },
      {
        id: 'long-corridor',
        name: '长廊',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [3.0, 0.2, 0.8], position: [2.2, 0.3, 1.5] },
        description: '彩画长廊，苏州街风格'
      },
      {
        id: 'kunming-lake',
        name: '昆明湖水面',
        color: '#2a7a9f',
        geometry: { type: 'box', size: [5, 0.05, 4], position: [-1.5, 0.05, -1] },
        description: '昆明湖，借景玉泉山'
      },
      {
        id: 'marble-boat',
        name: '石舫',
        color: '#bcac8a',
        geometry: { type: 'box', size: [1.5, 0.3, 0.8], position: [-2.5, 0.15, 1.5] },
        description: '石舫，停泊昆明湖边'
      }
    ],
    assembly: {
      direction: 'multi',
      offset: 0,
      description: '皇家园林建筑，借景手法高超'
    }
  },
  {
    id: 'building-12',
    name: '程阳风雨桥',
    category: '桥梁',
    desc: '广西三江侗族木构廊桥，集桥、廊、亭于一体，不用一钉一铆，榫卯连接。五座桥亭，穿斗式木构架。',
    difficulty: '高级',
    parts: [
      {
        id: 'bridge-deck',
        name: '桥面',
        color: '#bc8a5a',
        geometry: { type: 'box', size: [6.0, 0.15, 1.8], position: [0, 0.55, 0] },
        description: '木构桥面，穿斗式结构'
      },
      {
        id: 'pier',
        name: '桥墩',
        color: '#9a8a6a',
        geometry: { type: 'cylinder', size: [0.6, 0.7, 0.8, 6], position: [0, 0.1, 0] },
        description: '青石桥墩，稳固支撑'
      },
      {
        id: 'tower',
        name: '桥亭',
        color: '#8a6a3a',
        geometry: { type: 'cylinder', size: [0.65, 0.7, 0.5, 6], position: [0, 1.85, 0] },
        description: '五座桥亭，歇山与攒尖组合'
      },
      {
        id: 'corridor',
        name: '长廊',
        color: '#bc8a5a',
        geometry: { type: 'box', size: [6.5, 0.1, 1.2], position: [0, 1.6, 0] },
        description: '长廊避雨，两侧美人靠'
      }
    ],
    assembly: {
      direction: 'x',
      offset: 1.2,
      description: '木构廊桥结构，展现侗族建筑智慧'
    }
  },
  {
    id: 'building-13',
    name: '开平碉楼',
    category: '民居',
    desc: '广东侨乡防卫性多层塔楼，中西合璧。用于防匪防洪，钢筋混凝土结构，柱廊式、城堡式。',
    difficulty: '高级',
    parts: [
      {
        id: 'tower-body',
        name: '碉楼主体',
        color: '#bc9a7a',
        geometry: { type: 'box', size: [1.4, 3.0, 1.4], position: [0, 1.5, 0] },
        description: '多层防御性塔楼'
      },
      {
        id: 'balcony',
        name: '燕子窝',
        color: '#ac9a7a',
        geometry: { type: 'box', size: [1.6, 0.1, 1.6], position: [0, 3.35, 0] },
        description: '顶层挑台，防御射击'
      },
      {
        id: 'dome',
        name: '穹顶',
        color: '#ccaa77',
        geometry: { type: 'cylinder', size: [0.7, 0.8, 0.4, 8], position: [0, 3.7, 0] },
        description: '西式穹顶装饰'
      },
      {
        id: 'spire',
        name: '塔尖',
        color: '#dbaa33',
        geometry: { type: 'cone', size: [0.3, 0.5, 8], position: [0, 4.0, 0] },
        description: '塔顶装饰'
      }
    ],
    assembly: {
      direction: 'y',
      offset: 0.6,
      description: '中西合璧防御建筑，多层塔楼结构'
    }
  },
  {
    id: 'building-14',
    name: '沈阳故宫',
    category: '皇宫',
    desc: '清初皇宫，融合满、汉、藏风格。东路大政殿十王亭，中路崇政殿，西路文溯阁。',
    difficulty: '高级',
    parts: [
      {
        id: 'main-hall',
        name: '大政殿',
        color: '#ba4a3a',
        geometry: { type: 'cylinder', size: [1.1, 1.2, 1.0, 8], position: [-1.8, 0.9, 0] },
        description: '八角重檐，满族帐殿风格'
      },
      {
        id: 'hall-roof',
        name: '重檐屋顶',
        color: '#dbaa33',
        geometry: { type: 'cylinder', size: [1.2, 1.3, 0.5, 8], position: [-1.8, 1.5, 0] },
        description: '重檐八角攒尖顶'
      },
      {
        id: 'chongzheng-hall',
        name: '崇政殿',
        color: '#ba7a4a',
        geometry: { type: 'box', size: [1.8, 1.0, 1.6], position: [1.2, 0.5, 0] },
        description: '中路正殿'
      },
      {
        id: 'ten-pavilions',
        name: '十王亭',
        color: '#bc8a5a',
        geometry: { type: 'box', size: [0.8, 0.6, 0.8], position: [-2.5, 0.3, 1.8] },
        description: '东路十王亭，八旗议政'
      }
    ],
    assembly: {
      direction: 'multi',
      offset: 0,
      description: '清初皇宫建筑，融合多民族风格'
    }
  },
  {
    id: 'building-15',
    name: '宏村古民居',
    category: '民居',
    desc: '皖南牛形水系村落，月沼、南湖，承志堂为徽商巨宅，精美木雕。白墙黛瓦，马头墙错落。',
    difficulty: '中级',
    parts: [
      {
        id: 'houses',
        name: '徽派民居',
        color: '#f5f0e0',
        geometry: { type: 'box', size: [1.4, 0.9, 1.2], position: [0, 0.45, 0] },
        description: '白墙黛瓦，马头墙错落'
      },
      {
        id: 'roof',
        name: '马头墙屋顶',
        color: '#6a5a4a',
        geometry: { type: 'cylinder', size: [1.2, 1.3, 0.4, 4], position: [0, 0.95, 0] },
        description: '硬山屋顶，马头墙'
      },
      {
        id: 'moon-pond',
        name: '月沼',
        color: '#4a8aaf',
        geometry: { type: 'cylinder', size: [1.0, 1.0, 0.05, 32], position: [-1.5, 0.02, 1.5] },
        description: '半月形水池，牛胃水系'
      },
      {
        id: 'bridge',
        name: '画桥',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [0.8, 0.1, 0.3], position: [-1.5, 0.2, 1.5] },
        description: '石拱桥，倒影如画'
      }
    ],
    assembly: {
      direction: 'multi',
      offset: 0,
      description: '徽派古村落，牛形水系布局'
    }
  },
  {
    id: 'building-16',
    name: '平遥古城县衙',
    category: '官府',
    desc: '保存完好的明清县级官署，前朝后寝，大堂二堂三堂，体现吏治文化。仪门、赋役房、大堂(亲民堂)。',
    difficulty: '高级',
    parts: [
      {
        id: 'main-hall',
        name: '大堂',
        color: '#ba7a4a',
        geometry: { type: 'box', size: [2.2, 1.0, 1.8], position: [0, 0.5, 0] },
        description: '亲民堂，审理案件'
      },
      {
        id: 'second-hall',
        name: '二堂',
        color: '#ba7a4a',
        geometry: { type: 'box', size: [1.8, 0.9, 1.6], position: [0, 0.45, 1.8] },
        description: '日常办公，接待议事'
      },
      {
        id: 'yi-men',
        name: '仪门',
        color: '#ba7a4a',
        geometry: { type: 'box', size: [1.4, 0.8, 1.0], position: [0, 0.4, -1.6] },
        description: '礼仪之门'
      },
      {
        id: 'stone-pillar',
        name: '戒石坊',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [0.5, 0.5, 0.2], position: [0, 0.25, -0.8] },
        description: '戒石铭，警示官员'
      }
    ],
    assembly: {
      direction: 'z',
      offset: 1.8,
      description: '明清县级官署，中轴对称布局'
    }
  },
  {
    id: 'building-17',
    name: '五亭桥',
    category: '桥梁',
    desc: '扬州瘦西湖标志，清乾隆年间建，桥上建五座风亭，形如莲花。青石桥身，15个桥洞。',
    difficulty: '高级',
    parts: [
      {
        id: 'bridge-deck',
        name: '桥身',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [5.0, 0.2, 1.6], position: [0, 0.4, 0] },
        description: '青石桥身，15个桥洞'
      },
      {
        id: 'pier',
        name: '桥墩',
        color: '#bc9a6a',
        geometry: { type: 'cylinder', size: [0.4, 0.5, 0.6, 8], position: [0, 0.1, 0] },
        description: '青石桥墩'
      },
      {
        id: 'pavilion',
        name: '莲花亭',
        color: '#dbaa33',
        geometry: { type: 'cylinder', size: [0.55, 0.6, 0.45, 6], position: [0, 1.35, 0] },
        description: '五座风亭，形如莲花'
      },
      {
        id: 'pavilion-top',
        name: '亭顶',
        color: '#ccaa77',
        geometry: { type: 'cone', size: [0.35, 0.35, 6], position: [0, 1.65, 0] },
        description: '黄瓦朱柱，飞檐翘角'
      }
    ],
    assembly: {
      direction: 'x',
      offset: 1.2,
      description: '桥上建亭，形如莲花的石拱桥'
    }
  },
  {
    id: 'building-18',
    name: '土家族吊脚楼',
    category: '民居',
    desc: '武陵山区传统民居，依山就势，半悬半立，干栏式建筑防潮防兽。榫卯木构，青瓦坡顶，美人靠栏杆。',
    difficulty: '中级',
    parts: [
      {
        id: 'pillars',
        name: '吊脚柱',
        color: '#9a7a4a',
        geometry: { type: 'cylinder', size: [0.12, 0.15, 0.9, 6], position: [0, 0.45, 0.3] },
        description: '底层架空，防潮防兽'
      },
      {
        id: 'floor',
        name: '楼层',
        color: '#bc8a5a',
        geometry: { type: 'box', size: [2.4, 0.1, 1.8], position: [0, 0.95, 0] },
        description: '上层住人，下层储物'
      },
      {
        id: 'walls',
        name: '墙体',
        color: '#bc8a5a',
        geometry: { type: 'box', size: [2.2, 0.8, 1.6], position: [0, 1.35, 0.1] },
        description: '半围合式墙体'
      },
      {
        id: 'railing',
        name: '美人靠',
        color: '#bc8a5a',
        geometry: { type: 'box', size: [2.2, 0.2, 0.08], position: [0, 1.0, 0.95] },
        description: '观景栏杆，雕花装饰'
      }
    ],
    assembly: {
      direction: 'y',
      offset: 0.9,
      description: '干栏式建筑，依山就势'
    }
  },
  {
    id: 'building-19',
    name: '布达拉宫',
    category: '皇宫',
    desc: '世界海拔最高的宫堡群，红宫白宫，集宫殿、灵塔、佛堂于一体，藏式建筑巅峰。依山垒砌，群楼重叠。',
    difficulty: '高级',
    parts: [
      {
        id: 'red-palace',
        name: '红宫',
        color: '#aa4a3a',
        geometry: { type: 'box', size: [2.2, 2.0, 1.8], position: [0, 1.1, 0] },
        description: '佛殿、灵塔所在'
      },
      {
        id: 'white-palace',
        name: '白宫',
        color: '#f0ece0',
        geometry: { type: 'box', size: [2.0, 1.8, 1.6], position: [-1.5, 0.9, 0] },
        description: '行政、居住区域'
      },
      {
        id: 'gold-roof',
        name: '金顶',
        color: '#dbaa33',
        geometry: { type: 'cylinder', size: [1.0, 1.1, 0.4, 8], position: [0, 2.2, 0] },
        description: '鎏金屋顶，宝瓶装饰'
      },
      {
        id: 'spire',
        name: '塔尖',
        color: '#dbaa33',
        geometry: { type: 'cone', size: [0.5, 0.7, 8], position: [0, 2.55, 0] },
        description: '金顶塔尖'
      }
    ],
    assembly: {
      direction: 'multi',
      offset: 0,
      description: '藏式宫堡建筑，红宫白宫组合'
    }
  },
  {
    id: 'building-20',
    name: '广东骑楼',
    category: '民居',
    desc: '岭南商业街市建筑，下铺上居，骑楼走廊连通，防晒避雨。中西合璧，骑楼柱廊，阳台护栏。',
    difficulty: '中级',
    parts: [
      {
        id: 'ground-floor',
        name: '骑楼底层',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [3.0, 1.0, 1.2], position: [0, 0.5, 0] },
        description: '商铺，骑楼走廊'
      },
      {
        id: 'upper-floor',
        name: '居住层',
        color: '#ba7a4a',
        geometry: { type: 'box', size: [3.0, 1.5, 1.2], position: [0, 1.75, 0] },
        description: '住宅，阳台护栏'
      },
      {
        id: 'corridor',
        name: '骑楼走廊',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [3.0, 0.1, 2.0], position: [0, 0.5, -0.4] },
        description: '连通走廊，防晒避雨'
      },
      {
        id: 'columns',
        name: '廊柱',
        color: '#ac8a5a',
        geometry: { type: 'cylinder', size: [0.2, 0.2, 1.0, 8], position: [1.2, 0.5, -0.4] },
        description: '支撑骑楼的柱子'
      }
    ],
    assembly: {
      direction: 'x',
      offset: 1.5,
      description: '岭南商业街市建筑，下铺上居'
    }
  },
  {
    id: 'building-21',
    name: '大理古城',
    category: '民居',
    desc: '明代棋盘式布局，白族建筑风格，南北城门楼、五华楼，苍山洱海之间。青石板路，流水穿街。',
    difficulty: '高级',
    parts: [
      {
        id: 'south-gate',
        name: '南城门',
        color: '#bc8a5a',
        geometry: { type: 'box', size: [2.0, 1.2, 1.2], position: [-1.8, 0.6, 0] },
        description: '古城南门城楼'  
      },
      {
        id: 'wuhua-tower',
        name: '五华楼',
        color: '#bc8a5a',
        geometry: { type: 'box', size: [1.6, 1.0, 1.4], position: [0, 0.5, 0] },
        description: '古城中心楼阁'  
      },
      {
        id: 'bai-house',
        name: '白族民居',
        color: '#e0d8c0',
        geometry: { type: 'box', size: [1.4, 0.8, 1.2], position: [1.8, 0.4, 1.2] },
        description: '三坊一照壁格局'  
      }
    ],
    assembly: {
      direction: 'x',
      offset: 1.5,
      description: '白族建筑风格，体现古城风貌'  
    }
  },
  {
    id: 'building-22',
    name: '南京明故宫',
    category: '皇宫',
    desc: '明代皇城，北京故宫之蓝本。中轴对称，前朝后寝，现仅存遗迹。午门、奉天殿、华盖殿基址。',
    difficulty: '高级',
    parts: [
      {
        id: 'wumen-base',
        name: '午门台基',
        color: '#bcac8a',
        geometry: { type: 'box', size: [2.8, 0.5, 1.8], position: [0, 0.25, -1.8] },
        description: '午门遗址台基'  
      },
      {
        id: 'fengtian-base',
        name: '奉天殿台基',
        color: '#bcac8a',
        geometry: { type: 'box', size: [2.4, 0.3, 2.0], position: [0, 0.15, 0] },
        description: '奉天殿遗址台基'  
      },
      {
        id: 'moat',
        name: '护城河',
        color: '#2a6a8a',
        geometry: { type: 'plane', size: [5, 3], position: [0, -0.3, -2.5] },
        description: '宫城护城河'  
      }
    ],
    assembly: {
      direction: 'z',
      offset: 1.5,
      description: '明代宫殿遗址，体现皇家建筑格局'  
    }
  },
  {
    id: 'building-23',
    name: '岳麓书院',
    category: '官府',
    desc: '中国古代四大书院之一，宋代始建，赫曦台、文庙、讲堂，儒家文化圣地。中轴对称，纵深多进。',
    difficulty: '高级',
    parts: [
      {
        id: 'lecture-hall',
        name: '讲堂',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [1.8, 0.9, 1.6], position: [0, 0.45, 0] },
        description: '书院核心建筑'  
      },
      {
        id: 'hexi-platform',
        name: '赫曦台',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [1.2, 0.7, 1.2], position: [1.8, 0.35, 1.2] },
        description: '书院戏台'  
      },
      {
        id: 'library',
        name: '御书楼',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [1.2, 1.1, 1.2], position: [-1.5, 0.55, 0.8] },
        description: '藏书楼'  
      }
    ],
    assembly: {
      direction: 'x',
      offset: 1.5,
      description: '儒家文化圣地，体现书院建筑特色'  
    }
  },
  {
    id: 'building-24',
    name: '都江堰鱼嘴',
    category: '官府',
    desc: '战国李冰修建，无坝引水工程。鱼嘴分水堤将岷江分为内江外江，四六分水。飞沙堰溢洪，宝瓶口限流。',
    difficulty: '高级',
    parts: [
      {
        id: 'fish-mouth',
        name: '鱼嘴',
        color: '#bc9a6a',
        geometry: { type: 'cone', size: [0.9, 0.6, 3], position: [0, 0.2, 1.5] },
        description: '分水堤前端'  
      },
      {
        id: 'dike',
        name: '分水堤',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [3.0, 0.2, 0.8], position: [0, 0.1, 0] },
        description: '分水堤主体'  
      },
      {
        id: 'river',
        name: '江水',
        color: '#2a7a9f',
        geometry: { type: 'plane', size: [2, 2.5], position: [0, 0, 0.5] },
        description: '岷江水'  
      }
    ],
    assembly: {
      direction: 'z',
      offset: 1.0,
      description: '古代水利工程杰作'  
    }
  },
  {
    id: 'building-25',
    name: '陕北窑洞',
    category: '民居',
    desc: '黄土高原民居，靠崖式、独立式、下沉式，冬暖夏凉，生土建筑典型。拱形券洞，土炕连通，花格窗。',
    difficulty: '高级',
    parts: [
      {
        id: 'cave',
        name: '窑洞',
        color: '#bc9a6a',
        geometry: { type: 'sphere', size: [0.7, 0.6, 1.2], position: [0, 0.35, 0] },
        description: '靠崖窑洞'  
      },
      {
        id: 'front-wall',
        name: '窑面墙',
        color: '#ac8a6a',
        geometry: { type: 'box', size: [1.6, 0.8, 0.2], position: [0, 0.45, 0.7] },
        description: '窑洞前脸'  
      },
      {
        id: 'door',
        name: '门',
        color: '#8a6a4a',
        geometry: { type: 'box', size: [0.5, 0.6, 0.05], position: [0, 0.35, 0.81] },
        description: '窑洞门'  
      }
    ],
    assembly: {
      direction: 'z',
      offset: 0.5,
      description: '黄土高原生土建筑'  
    }
  },
  {
    id: 'building-26',
    name: '曲阜孔庙',
    category: '官府',
    desc: '祭祀孔子的本庙，九进院落，大成殿黄瓦重檐，龙柱雕琢，儒教建筑典范。棂星门、奎文阁、杏坛。',
    difficulty: '高级',
    parts: [
      {
        id: 'dacheng-hall',
        name: '大成殿',
        color: '#ba7a4a',
        geometry: { type: 'box', size: [2.2, 1.2, 2.0], position: [0, 0.6, 0] },
        description: '孔庙主殿'  
      },
      {
        id: 'dragon-pillar',
        name: '龙柱',
        color: '#ccaa77',
        geometry: { type: 'cylinder', size: [0.12, 0.8, 8], position: [0.8, 0.5, 1.1] },
        description: '大成殿龙柱'  
      },
      {
        id: 'lingxing-gate',
        name: '棂星门',
        color: '#ac8a6a',
        geometry: { type: 'box', size: [1.2, 1.4, 0.2], position: [0, 0.7, -1.6] },
        description: '孔庙正门'  
      }
    ],
    assembly: {
      direction: 'z',
      offset: 1.5,
      description: '儒教建筑典范'  
    }
  },
  {
    id: 'building-27',
    name: '阿房宫遗址',
    category: '皇宫',
    desc: '秦代巨型宫殿，杜牧《阿房宫赋》闻名。前殿夯土台基现存，宏大气魄。东西五百步，南北五十丈。',
    difficulty: '高级',
    parts: [
      {
        id: 'platform',
        name: '夯土台基',
        color: '#bc9a7a',
        geometry: { type: 'box', size: [3.2, 0.4, 2.4], position: [0, 0.2, 0] },
        description: '前殿台基'  
      },
      {
        id: 'column-base',
        name: '柱础',
        color: '#ac8a6a',
        geometry: { type: 'cylinder', size: [0.15, 0.3, 8], position: [1.2, 0.45, 0.8] },
        description: '宫殿柱础'  
      },
      {
        id: 'wall',
        name: '残墙',
        color: '#bc9a7a',
        geometry: { type: 'box', size: [2.8, 0.3, 0.2], position: [0, 0.35, 1.3] },
        description: '廊道残墙'  
      }
    ],
    assembly: {
      direction: 'z',
      offset: 1.0,
      description: '秦代宫殿遗址'  
    }
  },
  {
    id: 'building-28',
    name: '汉长安城',
    category: '官府',
    desc: '西汉都城，城垣周长25公里，未央宫、长乐宫、建章宫，里坊初现。“斗城”形态，水利漕渠。',
    difficulty: '高级',
    parts: [
      {
        id: 'city-wall',
        name: '城墙',
        color: '#bc9a7a',
        geometry: { type: 'box', size: [4.5, 0.4, 0.6], position: [0, 0.2, -2.2] },
        description: '城墙片段'  
      },
      {
        id: 'palace-base',
        name: '宫城',
        color: '#bc9a7a',
        geometry: { type: 'box', size: [2.0, 0.3, 1.6], position: [0, 0.15, 0.8] },
        description: '未央宫前殿台基'  
      },
      {
        id: 'block',
        name: '里坊',
        color: '#ac8a6a',
        geometry: { type: 'box', size: [0.6, 0.1, 0.6], position: [1.5, 0.05, -1] },
        description: '城市里坊'  
      }
    ],
    assembly: {
      direction: 'z',
      offset: 1.5,
      description: '西汉都城遗址'  
    }
  },
  {
    id: 'building-29',
    name: '未央宫',
    category: '皇宫',
    desc: '汉代朝政中心，前殿遗址高耸，椒房殿、石渠阁，气势恢宏。“非壮丽无以重威”。前殿台基、廊道。',
    difficulty: '高级',
    parts: [
      {
        id: 'terrace-1',
        name: '前殿台基',
        color: '#bc9a7a',
        geometry: { type: 'box', size: [2.6, 0.3, 2.0], position: [0, 0.15, 0] },
        description: '前殿第一层台基'  
      },
      {
        id: 'terrace-2',
        name: '前殿台基',
        color: '#bc9a7a',
        geometry: { type: 'box', size: [2.2, 0.25, 1.7], position: [0, 0.45, 0] },
        description: '前殿第二层台基'  
      },
      {
        id: 'terrace-3',
        name: '前殿台基',
        color: '#bc9a7a',
        geometry: { type: 'box', size: [1.8, 0.2, 1.4], position: [0, 0.7, 0] },
        description: '前殿第三层台基'  
      }
    ],
    assembly: {
      direction: 'y',
      offset: 0.3,
      description: '汉代宫殿遗址'  
    }
  },
  {
    id: 'building-30',
    name: '泸定桥',
    category: '桥梁',
    desc: '清代铁索桥，跨大渡河，由13根铁链构成，木板铺桥面，红军飞夺泸定桥而闻名。铁索锚固，桥台地龙桩。',
    difficulty: '高级',
    parts: [
      {
        id: 'chain',
        name: '铁链',
        color: '#8a7a6a',
        geometry: { type: 'cylinder', size: [0.05, 5.5, 8], position: [0, 0.45, 0] },
        description: '13根铁链'
      },
      {
        id: 'plank',
        name: '桥板',
        color: '#bc9a6a',
        geometry: { type: 'box', size: [5.8, 0.08, 1.2], position: [0, 0.5, 0] },
        description: '木板桥面'
      },
      {
        id: 'pavilion',
        name: '桥亭',
        color: '#bc8a5a',
        geometry: { type: 'box', size: [1.2, 1.0, 1.2], position: [-3.2, 0.6, 0] },
        description: '东岸桥亭'
      }
    ],
    assembly: {
      direction: 'x',
      offset: 1.0,
      description: '铁索桥结构，展现古代桥梁工程'
    }
  }
]
