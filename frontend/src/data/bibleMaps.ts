// 圣经地图数据
// 说明：以下坐标为学术界与主流圣经地图常用的近似值，仅供辅助读经使用，不作为考古定论。

export interface BibleLocation {
  id: string;
  name: string;
  nameEn?: string;
  nameHe?: string;
  lat: number;
  lng: number;
  description: string;
  scripture: string;
  significance: string;
}

export interface BibleRoute {
  id: string;
  name: string;
  color: string;
  description: string;
  locations: string[]; // location ids in order
}

// 地点坐标与介绍
export const BIBLE_LOCATIONS: Record<string, BibleLocation> = {
  // ========== 亚伯拉罕路线 ==========
  ur: {
    id: 'ur', name: '吾珥', nameEn: 'Ur of the Chaldeans',
    lat: 30.9625, lng: 46.1028,
    description: '迦勒底的吾珥，位于今日伊拉克南部，是亚伯拉罕的家乡。',
    scripture: '创世记 11:31', significance: '亚伯拉罕从这里出发，回应神的呼召，踏上信心之旅。',
  },
  haran: {
    id: 'haran', name: '哈兰', nameEn: 'Haran',
    lat: 36.87, lng: 39.0333,
    description: '位于今日土耳其东南部，亚伯拉罕的父亲他拉在此停驻并去世。',
    scripture: '创世记 11:31-32', significance: '亚伯拉罕从哈兰继续前往迦南，是信心旅程的重要中转站。',
  },
  shechem: {
    id: 'shechem', name: '示剑', nameEn: 'Shechem',
    lat: 32.2137, lng: 35.2815,
    description: '位于今日纳布卢斯附近，亚伯拉罕进入迦南后首先到达之地。',
    scripture: '创世记 12:6-7', significance: '神在此向亚伯拉罕显现，应许把迦南地赐给他的后裔。',
  },
  bethel: {
    id: 'bethel', name: '伯特利', nameEn: 'Bethel',
    lat: 31.9256, lng: 35.2394,
    description: '意为"神的殿"，位于耶路撒冷以北约 19 公里。',
    scripture: '创世记 12:8', significance: '亚伯拉罕在此筑坛献祭；雅各后来在此梦见天梯。',
  },
  ai: {
    id: 'ai', name: '艾', nameEn: 'Ai',
    lat: 31.9167, lng: 35.2667,
    description: '伯特利附近的古城。',
    scripture: '创世记 12:8', significance: '亚伯拉罕曾在伯特利与艾之间支搭帐棚、筑坛。',
  },
  hebron: {
    id: 'hebron', name: '希伯仑', nameEn: 'Hebron',
    lat: 31.5326, lng: 35.0998,
    description: '位于耶路撒冷以南，亚伯拉罕曾在此寄居。',
    scripture: '创世记 13:18', significance: '亚伯拉罕在此为耶和华筑坛；麦比拉洞是族长埋葬之地。',
  },
  beersheba: {
    id: 'beersheba', name: '别是巴', nameEn: 'Beersheba',
    lat: 31.245, lng: 34.7917,
    description: '位于内盖夫沙漠北部，亚伯拉罕与非利士人立约之地。',
    scripture: '创世记 21:31-33', significance: '亚伯拉罕在此栽上一棵垂丝柳树，求告耶和华永生神的名。',
  },
  // ========== 以撒/雅各相关 ==========
  gerar: {
    id: 'gerar', name: '基拉耳', nameEn: 'Gerar',
    lat: 31.3833, lng: 34.6194,
    description: '非利士人地区城市，位于今日以色列南部。',
    scripture: '创世记 20:1', significance: '亚伯拉罕和以撒都曾在此寄居，与非利士王亚比米勒立约。',
  },
  peniel: {
    id: 'peniel', name: '毗努伊勒', nameEn: 'Peniel',
    lat: 32.1833, lng: 35.6833,
    description: '位于雅博渡口附近，雅各与神摔跤之地。',
    scripture: '创世记 32:30', significance: '雅各在此与神面对面摔跤，被改名以色列。',
  },
  mahanaim: {
    id: 'mahanaim', name: '玛哈念', nameEn: 'Mahanaim',
    lat: 32.2, lng: 35.6,
    description: '约旦河东，雅各见神使者之地。',
    scripture: '创世记 32:1-2', significance: '雅各在此看见神的军兵，为回迦南做预备。',
  },
  succoth_jacob: {
    id: 'succoth_jacob', name: '疏割（雅各）', nameEn: 'Succoth',
    lat: 32.2, lng: 35.6333,
    description: '约旦河东，雅各从巴旦亚兰返回后在此搭棚。',
    scripture: '创世记 33:17', significance: '雅各在此为自己盖造房屋，为牲畜搭棚。',
  },
  mamre: {
    id: 'mamre', name: '幔利', nameEn: 'Mamre',
    lat: 31.5326, lng: 35.0998,
    description: '希伯仑附近，麦比拉洞所在地。',
    scripture: '创世记 23:17-20', significance: '亚伯拉罕买下麦比拉洞作为家族墓地，撒拉、亚伯拉罕、以撒、利百加、雅各、利亚均葬于此。',
  },
  // ========== 约瑟路线 ==========
  dothan: {
    id: 'dothan', name: '多坍', nameEn: 'Dothan',
    lat: 32.4167, lng: 35.2333,
    description: '位于示剑以北，约瑟被哥哥们卖到埃及的地方。',
    scripture: '创世记 37:17-28', significance: '约瑟在此被哥哥们丢进坑里，后被卖给以实玛利商人。',
  },
  goshen: {
    id: 'goshen', name: '歌珊地', nameEn: 'Goshen',
    lat: 30.7, lng: 31.7,
    description: '位于尼罗河三角洲东部，以色列人在埃及寄居之地。',
    scripture: '创世记 47:6', significance: '约瑟安排父亲雅各一家在歌珊地居住牧养牲畜。',
  },
  // ========== 出埃及路线 ==========
  egypt_rameses: {
    id: 'egypt_rameses', name: '兰塞（埃及）', nameEn: 'Rameses, Egypt',
    lat: 30.7936, lng: 31.8397,
    description: '以色列人出埃及时的启程地，约位于今日埃及 Qantir 一带。',
    scripture: '出埃及记 12:37', significance: '以色列人全会众从兰塞起行，开始出埃及的旅程。',
  },
  succoth: {
    id: 'succoth', name: '疏割', nameEn: 'Succoth',
    lat: 30.5667, lng: 32.1667,
    description: '以色列人出埃及后经过的第一站，位于尼罗河三角洲以东。',
    scripture: '出埃及记 12:37', significance: '以色列人离开埃及后的首个安营之地。',
  },
  etham: {
    id: 'etham', name: '以倘', nameEn: 'Etham',
    lat: 30.0, lng: 32.5,
    description: '位于西奈半岛边缘，以色列人出埃及途中经过之地。',
    scripture: '出埃及记 13:20', significance: '以色列人在旷野边的以倘安营，随后神以云柱火柱引领。',
  },
  red_sea: {
    id: 'red_sea', name: '红海（过红海处）', nameEn: 'Red Sea Crossing',
    lat: 29.5, lng: 32.75,
    description: '传统认为位于苏伊士湾北部，具体位置有学术争议。',
    scripture: '出埃及记 14:21-22', significance: '摩西举手向海伸杖，耶和华用大东风使海水一夜退去，以色列人下海走干地。',
  },
  marah: {
    id: 'marah', name: '玛拉', nameEn: 'Marah',
    lat: 29.5, lng: 33.0,
    description: '出埃及后经过的苦水之地。',
    scripture: '出埃及记 15:23-25', significance: '水苦不能喝，耶和华指示摩西一棵树，把树丢在水里，水就变甜。',
  },
  elim: {
    id: 'elim', name: '以琳', nameEn: 'Elim',
    lat: 28.9, lng: 33.25,
    description: '有十二股水泉、七十棵棕树之地。',
    scripture: '出埃及记 15:27', significance: '以色列人在此安营，享受耶和华所预备的水源与荫凉。',
  },
  rephidim: {
    id: 'rephidim', name: '利非订', nameEn: 'Rephidim',
    lat: 28.7, lng: 33.9,
    description: '位于西奈山附近，以色列人曾与亚玛力人争战。',
    scripture: '出埃及记 17:1-8', significance: '摩西在此举手祷告，约书亚带领以色列人击败亚玛力人。',
  },
  sinai: {
    id: 'sinai', name: '西奈山', nameEn: 'Mount Sinai',
    lat: 28.5392, lng: 33.975,
    description: '传统认为即今日埃及西奈半岛南部的 Jebel Musa。',
    scripture: '出埃及记 19:1-2', significance: '耶和华在此向摩西颁布十诫，与以色列人立约。',
  },
  kadesh_barnea: {
    id: 'kadesh_barnea', name: '加低斯·巴尼亚', nameEn: 'Kadesh-barnea',
    lat: 30.6333, lng: 34.4833,
    description: '位于今日以色列内盖夫沙漠南部，以色列人窥探迦南后长期徘徊之地。',
    scripture: '民数记 13:26', significance: '探子回报后，百姓因不信而倒毙旷野，以色列人在此漂流近四十年。',
  },
  edom: {
    id: 'edom', name: '以东', nameEn: 'Edom',
    lat: 30.5, lng: 35.5,
    description: '以扫后裔居住之地，位于死海东南、亚拉巴河谷东侧。',
    scripture: '民数记 20:14-21', significance: '以色列人请求借道以东被拒，需绕行前往摩押。',
  },
  moab_plains: {
    id: 'moab_plains', name: '摩押平原', nameEn: 'Plains of Moab',
    lat: 31.8, lng: 35.6,
    description: '位于约旦河东、耶利哥对面，以色列人进入迦南前的最后安营地。',
    scripture: '民数记 22:1', significance: '摩西在此向以色列人重申律法，约书亚接续带领百姓过河。',
  },
  mount_nebo: {
    id: 'mount_nebo', name: '尼波山', nameEn: 'Mount Nebo',
    lat: 31.768, lng: 35.725,
    description: '位于今日约旦境内，俯瞰迦南地。',
    scripture: '申命记 34:1-5', significance: '摩西在此登山顶眺望应许之地后去世。',
  },
  // ========== 约书亚征服迦南 ==========
  gilgal: {
    id: 'gilgal', name: '吉甲', nameEn: 'Gilgal',
    lat: 31.8667, lng: 35.5333,
    description: '位于耶利哥附近，以色列人过约旦河后首个安营之地。',
    scripture: '约书亚记 4:19-20', significance: '以色列人立十二块石头为记念；在此行割礼、守逾越节；吗哪停止。',
  },
  jericho: {
    id: 'jericho', name: '耶利哥', nameEn: 'Jericho',
    lat: 31.8667, lng: 35.45,
    description: '位于约旦河西岸，以色列人进入迦南后攻取的第一座城。',
    scripture: '约书亚记 6:1-20', significance: '约书亚照耶和华吩咐，绕城七日，城墙塌陷。',
  },
  gibeon: {
    id: 'gibeon', name: '基遍', nameEn: 'Gibeon',
    lat: 31.85, lng: 35.1833,
    description: '位于耶路撒冷西北约 9 公里，基遍人与以色列人立约。',
    scripture: '约书亚记 9:3-15', significance: '基遍人用诡计与以色列人立约；约书亚在此祷告日月停住。',
  },
  shiloh: {
    id: 'shiloh', name: '示罗', nameEn: 'Shiloh',
    lat: 32.05, lng: 35.2833,
    description: '位于伯特利以北，约书亚时代会幕设立之地。',
    scripture: '约书亚记 18:1', significance: '会幕长期设立于此，是以色列人的敬拜中心，直到约柜被掳。',
  },
  // ========== 士师时代 ==========
  megiddo: {
    id: 'megiddo', name: '米吉多', nameEn: 'Megiddo',
    lat: 32.5833, lng: 35.1833,
    description: '位于耶斯列平原，战略要地。',
    scripture: '士师记 5:19', significance: '底波拉和巴拉在此击败迦南王耶宾；启示录预言哈米吉多顿大战。',
  },
  mount_tabor: {
    id: 'mount_tabor', name: '他泊山', nameEn: 'Mount Tabor',
    lat: 32.6867, lng: 35.3883,
    description: '位于耶斯列平原东北部，一座醒目的圆形山。',
    scripture: '士师记 4:6', significance: '底波拉吩咐巴拉在此聚集军队与西西拉争战。',
  },
  timnah: {
    id: 'timnah', name: '亭拿', nameEn: 'Timnah',
    lat: 31.7833, lng: 34.9167,
    description: '位于犹大与非利士交界处，参孙活动地区。',
    scripture: '士师记 14:1', significance: '参孙在此看见非利士女子，执意娶她为妻。',
  },
  gaza: {
    id: 'gaza', name: '迦萨', nameEn: 'Gaza',
    lat: 31.5167, lng: 34.45,
    description: '非利士五大城之一，位于地中海沿岸。',
    scripture: '士师记 16:1-3', significance: '参孙在此被非利士人囚禁，最后推倒庙柱与敌人同归于尽。',
  },
  bethlehem: {
    id: 'bethlehem', name: '伯利恒', nameEn: 'Bethlehem',
    lat: 31.7054, lng: 35.2024,
    description: '位于耶路撒冷以南约 8 公里，大卫王的故乡。',
    scripture: '路加福音 2:4-7', significance: '耶稣基督降生之地；大卫的故乡，撒母耳在此膏大卫为王。',
  },
  adullam: {
    id: 'adullam', name: '亚杜兰洞', nameEn: 'Cave of Adullam',
    lat: 31.65, lng: 35.0,
    description: '位于犹大低地，大卫躲避扫罗的藏身之处。',
    scripture: '撒母耳记上 22:1-2', significance: '大卫在此聚集四百个困苦欠债的人，成为他的勇士团。',
  },
  en_gedi: {
    id: 'en_gedi', name: '隐基底', nameEn: 'En Gedi',
    lat: 31.45, lng: 35.3833,
    description: '死海西岸的绿洲，大卫躲避扫罗之地。',
    scripture: '撒母耳记上 24:1-7', significance: '大卫在此洞中割下扫罗衣襟却不杀他，显明他对耶和华受膏者的敬畏。',
  },
  ziklag: {
    id: 'ziklag', name: '洗革拉', nameEn: 'Ziklag',
    lat: 31.35, lng: 34.6833,
    description: '位于犹大南部，非利士王亚吉赐给大卫的城。',
    scripture: '撒母耳记上 27:6', significance: '大卫在此居住一年零四个月，亚玛力人曾焚城掳掠。',
  },
  jerusalem: {
    id: 'jerusalem', name: '耶路撒冷', nameEn: 'Jerusalem',
    lat: 31.7683, lng: 35.2137,
    description: '犹太教、基督教、伊斯兰教共同关注的圣城。',
    scripture: '历代志下 6:6', significance: '大卫王定都于此，所罗门在此建造圣殿；耶稣在此受难、复活、升天。',
  },
  joppa: {
    id: 'joppa', name: '约帕', nameEn: 'Joppa',
    lat: 32.05, lng: 34.75,
    description: '地中海沿岸重要港口，今以色列雅法。',
    scripture: '历代志下 2:16', significance: '所罗门建殿用的香柏木从推罗经约帕运送；约拿在此上船逃往他施。',
  },
  // ========== 先知以利亚/以利沙 ==========
  mount_carmel: {
    id: 'mount_carmel', name: '迦密山', nameEn: 'Mount Carmel',
    lat: 32.7333, lng: 35.05,
    description: '位于以色列西北部，地中海沿岸山脉。',
    scripture: '列王纪上 18:19-40', significance: '以利亚在此与巴力四百五十先知对垒，耶和华降火显应。',
  },
  zarephath: {
    id: 'zarephath', name: '撒勒法', nameEn: 'Zarephath',
    lat: 33.45, lng: 35.2833,
    description: '位于西顿附近，黎巴嫩南部。',
    scripture: '列王纪上 17:9-24', significance: '以利亚在此使寡妇的面和油不短缺，并使她儿子复活。',
  },
  brook_kerith: {
    id: 'brook_kerith', name: '基立溪', nameEn: 'Brook Kerith',
    lat: 32.0, lng: 35.5,
    description: '约旦河东的溪流，以利亚躲避亚哈之地。',
    scripture: '列王纪上 17:2-6', significance: '乌鸦早晚给以利亚叼饼和肉来，神在溪水旁供养他。',
  },
  mount_horeb: {
    id: 'mount_horeb', name: '何烈山', nameEn: 'Mount Horeb',
    lat: 28.5392, lng: 33.975,
    description: '即西奈山，以利亚逃避耶洗别后在此遇见神。',
    scripture: '列王纪上 19:8', significance: '以利亚在此听见神微小的声音，领受新的使命。',
  },
  shunem: {
    id: 'shunem', name: '书念', nameEn: 'Shunem',
    lat: 32.6, lng: 35.3333,
    description: '位于耶斯列平原，以利沙常停留之地。',
    scripture: '列王纪下 4:8-37', significance: '以利沙在此使书念妇人的儿子复活。',
  },
  // ========== 耶稣生平 ==========
  nazareth: {
    id: 'nazareth', name: '拿撒勒', nameEn: 'Nazareth',
    lat: 32.7021, lng: 35.2978,
    description: '耶稣成长之地，位于加利利地区。',
    scripture: '路加福音 2:39-40', significance: '因此耶稣被称为"拿撒勒人耶稣"。',
  },
  cana: {
    id: 'cana', name: '迦拿', nameEn: 'Cana',
    lat: 32.75, lng: 35.3333,
    description: '位于拿撒勒以北，耶稣行第一个神迹之地。',
    scripture: '约翰福音 2:1-11', significance: '耶稣在此变水为酒，显出祂的荣耀。',
  },
  sea_of_galilee: {
    id: 'sea_of_galilee', name: '加利利海', nameEn: 'Sea of Galilee',
    lat: 32.81, lng: 35.59,
    description: '以色列最大的淡水湖，耶稣传道与行神迹的主要场景。',
    scripture: '马可福音 4:39', significance: '耶稣平静风浪、行走水面、呼召门徒的地方。',
  },
  capernaum: {
    id: 'capernaum', name: '迦百农', nameEn: 'Capernaum',
    lat: 32.8803, lng: 35.5753,
    description: '位于加利利海北岸，耶稣公开事奉的重要基地。',
    scripture: '马太福音 4:13', significance: '耶稣在此行许多神迹、讲道，被称为"自己的城"。',
  },
  bethsaida: {
    id: 'bethsaida', name: '伯赛大', nameEn: 'Bethsaida',
    lat: 32.9, lng: 35.6167,
    description: '加利利海东北岸的渔村，彼得、安得烈、腓力的家乡。',
    scripture: '约翰福音 1:44', significance: '耶稣在此医治瞎子，也是五饼二鱼神迹附近。',
  },
  chorazin: {
    id: 'chorazin', name: '哥拉汛', nameEn: 'Chorazin',
    lat: 32.9167, lng: 35.5667,
    description: '位于迦百农以北，加利利地区的古城。',
    scripture: '马太福音 11:21', significance: '耶稣在此行了许多异能，但城里的人终不悔改，因此受到责备。',
  },
  magdala: {
    id: 'magdala', name: '抹大拉', nameEn: 'Magdala',
    lat: 32.8333, lng: 35.5167,
    description: '加利利海西岸城镇，抹大拉的马利亚的家乡。',
    scripture: '路加福音 8:2', significance: '耶稣从抹大拉的马利亚身上赶出七个鬼。',
  },
  nain: {
    id: 'nain', name: '拿因', nameEn: 'Nain',
    lat: 32.6333, lng: 35.35,
    description: '位于拿撒勒以南，耶稣使寡妇儿子复活之地。',
    scripture: '路加福音 7:11-17', significance: '耶稣在此使寡妇的独生子复活，众人归荣耀与神。',
  },
  caesarea_philippi: {
    id: 'caesarea_philippi', name: '凯撒利亚·腓立比', nameEn: 'Caesarea Philippi',
    lat: 33.25, lng: 35.7,
    description: '位于黑门山南麓，以色列最北部。',
    scripture: '马太福音 16:13-20', significance: '彼得在此认耶稣为基督，是永生神的儿子。',
  },
  mount_transfiguration: {
    id: 'mount_transfiguration', name: '变像山', nameEn: 'Mount of Transfiguration',
    lat: 32.6867, lng: 35.3883,
    description: '传统认为即他泊山，耶稣在此变像。',
    scripture: '马太福音 17:1-8', significance: '耶稣在彼得、雅各、约翰面前改变形像，脸面明亮如日头。',
  },
  jericho_nt: {
    id: 'jericho_nt', name: '耶利哥（新约）', nameEn: 'Jericho',
    lat: 31.8567, lng: 35.4567,
    description: '新约时代的耶利哥城，位于旧城以南。',
    scripture: '路加福音 19:1-10', significance: '耶稣在此遇见税吏撒该，并医治瞎子巴底买。',
  },
  bethany: {
    id: 'bethany', name: '伯大尼', nameEn: 'Bethany',
    lat: 31.7717, lng: 35.2667,
    description: '位于耶路撒冷以东橄榄山脚下，马大、马利亚、拉撒路的村庄。',
    scripture: '约翰福音 11:1-44', significance: '耶稣在此使拉撒路从死里复活；耶稣升天前在此祝福门徒。',
  },
  mount_of_olives: {
    id: 'mount_of_olives', name: '橄榄山', nameEn: 'Mount of Olives',
    lat: 31.7767, lng: 35.2433,
    description: '位于耶路撒冷城东，是耶稣经常去的地方。',
    scripture: '路加福音 22:39', significance: '耶稣在此山上的客西马尼园祷告；并从橄榄山升天。',
  },
  gethsemane: {
    id: 'gethsemane', name: '客西马尼园', nameEn: 'Gethsemane',
    lat: 31.7794, lng: 35.2403,
    description: '橄榄山脚下的园子，耶稣被捕前祷告之处。',
    scripture: '马太福音 26:36-46', significance: '耶稣在此极度忧伤，汗珠如大血点滴在地上，三次祷告顺服父神旨意。',
  },
  golgotha: {
    id: 'golgotha', name: '各各他', nameEn: 'Golgotha',
    lat: 31.7783, lng: 35.2297,
    description: '意为"髑髅地"，耶稣被钉十字架之处。',
    scripture: '马太福音 27:33', significance: '耶稣在此被钉十字架，为世人的罪受死，"成了"。',
  },
  emmaus: {
    id: 'emmaus', name: '以马忤斯', nameEn: 'Emmaus',
    lat: 31.8333, lng: 35.1,
    description: '位于耶路撒冷以西约 11 公里。',
    scripture: '路加福音 24:13-35', significance: '复活后的耶稣在此向两个门徒显现，与他们同行并讲解圣经。',
  },
  samaria_sychar: {
    id: 'samaria_sychar', name: '叙加/撒玛利亚', nameEn: 'Sychar',
    lat: 32.2, lng: 35.2667,
    description: '撒玛利亚地区的城镇，雅各井所在地。',
    scripture: '约翰福音 4:5-42', significance: '耶稣在此与撒玛利亚妇人谈道，许多人信主。',
  },
  jacob_well: {
    id: 'jacob_well', name: '雅各井', nameEn: "Jacob's Well",
    lat: 32.2, lng: 35.2667,
    description: '位于叙加，雅各留给约瑟的井。',
    scripture: '约翰福音 4:6', significance: '耶稣在此向撒玛利亚妇人启示自己是弥赛亚，赐活水。',
  },
  // ========== 使徒行传/保罗宣教 ==========
  antioch_syria: {
    id: 'antioch_syria', name: '安提阿（叙利亚）', nameEn: 'Antioch in Syria',
    lat: 36.2021, lng: 36.1588,
    description: '早期基督教重要中心，保罗宣教工作的基地。',
    scripture: '使徒行传 13:1-3', significance: '门徒被称为"基督徒"是从安提阿起首；保罗从这里被差派出去。',
  },
  damascus: {
    id: 'damascus', name: '大马士革', nameEn: 'Damascus',
    lat: 33.5138, lng: 36.2765,
    description: '叙利亚古都，保罗归主之地。',
    scripture: '使徒行传 9:1-19', significance: '扫罗在此路上遇见复活主，生命被翻转，成为使徒保罗。',
  },
  tarsus: {
    id: 'tarsus', name: '大数', nameEn: 'Tarsus',
    lat: 36.9167, lng: 34.8833,
    description: '位于小亚细亚东南部，保罗的家乡。',
    scripture: '使徒行传 9:11; 22:3', significance: '保罗出生并成长于此，具有罗马公民与希伯来人的双重身份。',
  },
  seleucia: {
    id: 'seleucia', name: '西流基', nameEn: 'Seleucia',
    lat: 36.1167, lng: 35.9333,
    description: '安提阿的外港，位于地中海沿岸。',
    scripture: '使徒行传 13:4', significance: '保罗和巴拿巴从这里坐船前往塞浦路斯。',
  },
  salamis: {
    id: 'salamis', name: '萨拉米', nameEn: 'Salamis',
    lat: 35.1833, lng: 33.9,
    description: '塞浦路斯岛东岸城市。',
    scripture: '使徒行传 13:5', significance: '保罗第一次宣教旅程首站，在犹太人会堂传讲神的道。',
  },
  paphos: {
    id: 'paphos', name: '帕弗', nameEn: 'Paphos',
    lat: 34.775, lng: 32.425,
    description: '塞浦路斯岛西岸城市，罗马巡抚驻地。',
    scripture: '使徒行传 13:6-12', significance: '保罗在此使方士以吕马瞎眼，罗马巡抚信主。',
  },
  perga: {
    id: 'perga', name: '别加', nameEn: 'Perga',
    lat: 36.9614, lng: 30.8536,
    description: '位于小亚细亚南部的潘菲利亚地区。',
    scripture: '使徒行传 13:13-14', significance: '保罗一行从帕弗来到别加，约翰马可在此离开他们回耶路撒冷。',
  },
  antioch_pisidia: {
    id: 'antioch_pisidia', name: '彼西底的安提阿', nameEn: 'Antioch in Pisidia',
    lat: 38.3084, lng: 31.1892,
    description: '位于今日土耳其西南部，小亚细亚中部高地城市。',
    scripture: '使徒行传 13:14-52', significance: '保罗在此会堂长篇讲道，阐述耶稣是基督。',
  },
  iconium: {
    id: 'iconium', name: '以哥念', nameEn: 'Iconium',
    lat: 37.8667, lng: 32.4833,
    description: '位于今日土耳其科尼亚（Konya）。',
    scripture: '使徒行传 14:1-7', significance: '保罗和巴拿巴在此传道而民间分裂，后来被迫逃离。',
  },
  lystra: {
    id: 'lystra', name: '路司得', nameEn: 'Lystra',
    lat: 37.5915, lng: 32.3506,
    description: '位于今日土耳其西南部。',
    scripture: '使徒行传 14:8-20', significance: '保罗在此医治瘸腿的人，却被当地人误当作神。',
  },
  derbe: {
    id: 'derbe', name: '特庇', nameEn: 'Derbe',
    lat: 37.35, lng: 33.0,
    description: '位于今日土耳其中南部，保罗第一次宣教旅程最东端。',
    scripture: '使徒行传 14:20-21', significance: '保罗在此坚固门徒，并回程继续传道。',
  },
  attalia: {
    id: 'attalia', name: '亚大利', nameEn: 'Attalia',
    lat: 36.9, lng: 30.6833,
    description: '位于小亚细亚南岸的港口城市，今土耳其安塔利亚。',
    scripture: '使徒行传 14:25-26', significance: '保罗和巴拿巴从这里坐船返回安提阿。',
  },
  troas: {
    id: 'troas', name: '特罗亚', nameEn: 'Troas',
    lat: 39.75, lng: 26.15,
    description: '位于今日土耳其西北部，爱琴海沿岸。',
    scripture: '使徒行传 16:8-11', significance: '保罗在此看见马其顿异象，随即渡海前往欧洲传道。',
  },
  neapolis: {
    id: 'neapolis', name: '尼亚波利', nameEn: 'Neapolis',
    lat: 40.9367, lng: 24.4124,
    description: '马其顿地区的港口，今希腊卡瓦拉（Kavala）。',
    scripture: '使徒行传 16:11', significance: '保罗从特罗亚渡海来到欧洲的第一站。',
  },
  philippi: {
    id: 'philippi', name: '腓立比', nameEn: 'Philippi',
    lat: 41.0167, lng: 24.2833,
    description: '马其顿重要城市，罗马殖民地。',
    scripture: '使徒行传 16:12-40', significance: '保罗在此建立欧洲第一个教会，吕底亚、禁卒信主。',
  },
  amphipolis: {
    id: 'amphipolis', name: '暗妃坡里', nameEn: 'Amphipolis',
    lat: 40.8167, lng: 23.85,
    description: '位于马其顿与色雷斯之间的古城。',
    scripture: '使徒行传 17:1', significance: '保罗第二次宣教旅程经过之地。',
  },
  apollonia: {
    id: 'apollonia', name: '亚波罗尼亚', nameEn: 'Apollonia',
    lat: 40.5833, lng: 23.4333,
    description: '位于马其顿地区的古城。',
    scripture: '使徒行传 17:1', significance: '保罗第二次宣教旅程经过之地。',
  },
  thessalonica: {
    id: 'thessalonica', name: '帖撒罗尼迦', nameEn: 'Thessalonica',
    lat: 40.6401, lng: 22.9444,
    description: '马其顿重要港口城市，今希腊塞萨洛尼基。',
    scripture: '使徒行传 17:1-9', significance: '保罗在此会堂传道，建立帖撒罗尼迦教会。',
  },
  berea: {
    id: 'berea', name: '庇哩亚', nameEn: 'Berea',
    lat: 40.5167, lng: 22.2,
    description: '位于马其顿西南部，今希腊韦里亚（Veria）。',
    scripture: '使徒行传 17:10-15', significance: '庇哩亚人贤于接受真道，天天考查圣经。',
  },
  athens: {
    id: 'athens', name: '雅典', nameEn: 'Athens',
    lat: 37.9838, lng: 23.7275,
    description: '古希腊文化与哲学中心。',
    scripture: '使徒行传 17:16-34', significance: '保罗在亚略巴古讲道，论及"未识之神"。',
  },
  corinth: {
    id: 'corinth', name: '哥林多', nameEn: 'Corinth',
    lat: 37.906, lng: 22.8794,
    description: '希腊南部重要商业城市，位于地峡。',
    scripture: '使徒行传 18:1-18', significance: '保罗在此居住约一年半，建立哥林多教会。',
  },
  cenchreae: {
    id: 'cenchr_eae', name: '坚革哩', nameEn: 'Cenchreae',
    lat: 37.8833, lng: 22.9833,
    description: '哥林多的东港。',
    scripture: '使徒行传 18:18', significance: '保罗从这里剪发还愿，结束第二次宣教旅程的主要阶段。',
  },
  ephesus: {
    id: 'ephesus', name: '以弗所', nameEn: 'Ephesus',
    lat: 37.95, lng: 27.3667,
    description: '小亚细亚西部重要城市，今土耳其塞尔丘克附近。',
    scripture: '使徒行传 19:1-41', significance: '保罗第三次宣教旅程在此居住约三年，建立并牧养以弗所教会。',
  },
  miletus: {
    id: 'miletus', name: '米利都', nameEn: 'Miletus',
    lat: 37.5333, lng: 27.2833,
    description: '位于小亚细亚西岸，以弗所以南。',
    scripture: '使徒行传 20:15-38', significance: '保罗在此召请以弗所长老，留下著名的离别训勉。',
  },
  caesarea: {
    id: 'caesarea', name: '凯撒利亚', nameEn: 'Caesarea',
    lat: 32.5, lng: 34.8917,
    description: '位于地中海东岸，罗马巡抚所在地。',
    scripture: '使徒行传 21:8', significance: '保罗多次路过或停留于此；后来在此受审并上诉凯撒。',
  },
  tyre: {
    id: 'tyre', name: '推罗', nameEn: 'Tyre',
    lat: 33.27, lng: 35.2,
    description: '腓尼基古老海港，位于今日黎巴嫩南部。',
    scripture: '使徒行传 21:3-6', significance: '保罗第三次宣教回程时在此与门徒同住七日。',
  },
  ptolemais: {
    id: 'ptolemais', name: '多利买', nameEn: 'Ptolemais',
    lat: 32.9275, lng: 35.0817,
    description: '位于今日以色列阿卡（Akko）古城。',
    scripture: '使徒行传 21:7', significance: '保罗第三次宣教回程时在此问候弟兄。',
  },
  sidon: {
    id: 'sidon', name: '西顿', nameEn: 'Sidon',
    lat: 33.5606, lng: 35.3756,
    description: '腓尼基古老海港，位于今日黎巴嫩。',
    scripture: '使徒行传 27:3', significance: '保罗被押往罗马途中，船只在此停靠。',
  },
  myra: {
    id: 'myra', name: '每拉', nameEn: 'Myra',
    lat: 36.2583, lng: 29.985,
    description: '位于小亚细亚南岸的吕家地区。',
    scripture: '使徒行传 27:5-6', significance: '保罗在此被转乘前往意大利的船。',
  },
  fair_havens: {
    id: 'fair_havens', name: '佳澳', nameEn: 'Fair Havens',
    lat: 34.9167, lng: 24.8,
    description: '克里特岛南岸的海港。',
    scripture: '使徒行传 27:8', significance: '保罗在此劝众人不要开船，但未被采纳，随后遭遇风暴。',
  },
  malta: {
    id: 'malta', name: '马耳他', nameEn: 'Malta',
    lat: 35.8997, lng: 14.5147,
    description: '地中海岛屿，保罗船难后过冬之地。',
    scripture: '使徒行传 28:1-10', significance: '保罗在此被蛇咬却未受伤，并医治岛民。',
  },
  syracuse: {
    id: 'syracuse', name: '叙拉古', nameEn: 'Syracuse',
    lat: 37.0755, lng: 15.2866,
    description: '西西里岛东部古城。',
    scripture: '使徒行传 28:12', significance: '保罗被押往罗马途中停靠三日。',
  },
  puteoli: {
    id: 'puteoli', name: '部丢利', nameEn: 'Puteoli',
    lat: 40.8333, lng: 14.25,
    description: '位于意大利西南部，今波佐利（Pozzuoli）。',
    scripture: '使徒行传 28:13-14', significance: '保罗在此与弟兄同住七日。',
  },
  rome: {
    id: 'rome', name: '罗马', nameEn: 'Rome',
    lat: 41.9028, lng: 12.4964,
    description: '罗马帝国首都。',
    scripture: '使徒行传 28:14-31', significance: '保罗在此被软禁两年，放胆传讲神国的道。',
  },
  // ========== 更多圣经地点 ==========
  samaria_city: {
    id: 'samaria_city', name: '撒玛利亚城', nameEn: 'Samaria',
    lat: 32.275, lng: 35.1917,
    description: '北国以色列的首都，暗利王所建。',
    scripture: '列王纪上 16:24', significance: '以色列北国政治中心，腓利在此传福音，彼得和约翰随后前来。',
  },
  ashdod: {
    id: 'ashdod', name: '亚实突', nameEn: 'Ashdod',
    lat: 31.8, lng: 34.65,
    description: '非利士五大城之一，地中海沿岸。',
    scripture: '撒母耳记上 5:1-7', significance: '非利士人将约柜掳到亚实突的大衮庙，大衮像仆倒在约柜前。',
  },
  ashkelon: {
    id: 'ashkelon', name: '亚实基伦', nameEn: 'Ashkelon',
    lat: 31.6667, lng: 34.5667,
    description: '非利士五大城之一，位于地中海沿岸。',
    scripture: '士师记 14:19', significance: '参孙在此击杀三十人。',
  },
  gath: {
    id: 'gath', name: '迦特', nameEn: 'Gath',
    lat: 31.7, lng: 34.85,
    description: '非利士五大城之一，歌利亚的家乡。',
    scripture: '撒母耳记上 17:4', significance: '非利士巨人歌利亚的家乡；大卫曾逃到迦特躲避扫罗。',
  },
  ekron: {
    id: 'ekron', name: '以革伦', nameEn: 'Ekron',
    lat: 31.7833, lng: 34.85,
    description: '非利士五大城之一。',
    scripture: '撒母耳记上 5:10', significance: '非利士人将约柜送往以革伦，城中居民惊恐。',
  },
  jezreel: {
    id: 'jezreel', name: '耶斯列', nameEn: 'Jezreel',
    lat: 32.55, lng: 35.3167,
    description: '耶斯列平原上的古城，亚哈王的冬宫所在地。',
    scripture: '列王纪上 21:1', significance: '亚哈王在此强占拿伯的葡萄园，以利亚宣告审判。',
  },
  ramah: {
    id: 'ramah', name: '拉玛', nameEn: 'Ramah',
    lat: 31.8167, lng: 35.2167,
    description: '位于耶路撒冷以北，撒母耳的家乡。',
    scripture: '撒母耳记上 7:17', significance: '撒母耳在此居住并审判以色列人。',
  },
  mizpah: {
    id: 'mizpah', name: '米斯巴', nameEn: 'Mizpah',
    lat: 31.8833, lng: 35.2167,
    description: '位于耶路撒冷以北的高地，以色列人聚集之地。',
    scripture: '撒母耳记上 7:5-6', significance: '撒母耳在此聚集以色列人悔改；非利士人被击败。',
  },
  jabesh_gilead: {
    id: 'jabesh_gilead', name: '基列·雅比', nameEn: 'Jabesh-gilead',
    lat: 32.35, lng: 35.7,
    description: '约旦河东基列地的城市。',
    scripture: '撒母耳记上 11:1-11', significance: '扫罗在此首战拯救雅比人；扫罗死后雅比人冒险取回他的尸身安葬。',
  },
  susa: {
    id: 'susa', name: '书珊城', nameEn: 'Susa',
    lat: 32.1889, lng: 48.2539,
    description: '波斯帝国首都之一，位于今日伊朗西南部。',
    scripture: '以斯帖记 1:2', significance: '以斯帖和末底改在此拯救犹太人免于灭族之灾；尼希米在此任酒政。',
  },
  babylon: {
    id: 'babylon', name: '巴比伦', nameEn: 'Babylon',
    lat: 32.5425, lng: 44.4222,
    description: '古代巴比伦帝国首都，位于今日伊拉克。',
    scripture: '列王纪下 25:8-11', significance: '巴比伦王尼布甲尼撒攻陷耶路撒冷，犹太人被掳至此七十年。',
  },
  nineveh: {
    id: 'nineveh', name: '尼尼微', nameEn: 'Nineveh',
    lat: 36.3667, lng: 43.15,
    description: '亚述帝国首都，位于今日伊拉克摩苏尔附近。',
    scripture: '约拿书 3:3-4', significance: '约拿在此传道，全城从大到小披麻蒙灰悔改。',
  },
  patmos: {
    id: 'patmos', name: '拔摩海岛', nameEn: 'Patmos',
    lat: 37.3167, lng: 26.55,
    description: '爱琴海小岛，位于以弗所以西。',
    scripture: '启示录 1:9', significance: '约翰在此被流放，领受启示录的异象。',
  },
  colossae: {
    id: 'colossae', name: '歌罗西', nameEn: 'Colossae',
    lat: 37.7833, lng: 29.25,
    description: '位于小亚细亚弗吕家地区，今土耳其。',
    scripture: '歌罗西书 1:2', significance: '保罗写信给歌罗西教会，阐明基督的超越性。',
  },
  laodicea: {
    id: 'laodicea', name: '老底嘉', nameEn: 'Laodicea',
    lat: 37.8333, lng: 29.1,
    description: '位于小亚细亚，启示录七教会之一。',
    scripture: '启示录 3:14-22', significance: '主责备老底嘉教会"不冷不热"，劝勉他们买火炼的金子。',
  },
  smyrna: {
    id: 'smyrna', name: '士每拿', nameEn: 'Smyrna',
    lat: 38.4167, lng: 27.15,
    description: '小亚细亚西岸重要港口，今土耳其伊兹密尔。',
    scripture: '启示录 2:8-11', significance: '启示录七教会之一，主勉励他们"至死忠心"。',
  },
  pergamum: {
    id: 'pergamum', name: '别迦摩', nameEn: 'Pergamum',
    lat: 39.1167, lng: 27.1833,
    description: '小亚细亚西部城市，今土耳其贝尔加马。',
    scripture: '启示录 2:12-17', significance: '启示录七教会之一，被称为"有撒但座位之处"。',
  },
  thyatira: {
    id: 'thyatira', name: '推雅推喇', nameEn: 'Thyatira',
    lat: 38.9167, lng: 27.85,
    description: '小亚细亚吕底亚地区城市，今土耳其阿克希萨尔。',
    scripture: '启示录 2:18-29', significance: '启示录七教会之一；卖紫色布的吕底亚来自此城。',
  },
  sardis: {
    id: 'sardis', name: '撒狄', nameEn: 'Sardis',
    lat: 38.4833, lng: 28.0333,
    description: '小亚细亚吕底亚古都。',
    scripture: '启示录 3:1-6', significance: '启示录七教会之一，主责备他们"按名是活的，其实是死的"。',
  },
  philadelphia: {
    id: 'philadelphia', name: '非拉铁非', nameEn: 'Philadelphia',
    lat: 38.35, lng: 28.5167,
    description: '小亚细亚吕底亚地区城市，今土耳其阿拉谢希尔。',
    scripture: '启示录 3:7-13', significance: '启示录七教会之一，主称赞他们"略有一点力量，也遵守我的道"。',
  },
  galatia: {
    id: 'galatia', name: '加拉太', nameEn: 'Galatia',
    lat: 39.5, lng: 32.0,
    description: '小亚细亚中部地区，今土耳其安卡拉一带。',
    scripture: '加拉太书 1:2', significance: '保罗写信给加拉太众教会，强调因信称义的真理。',
  },
  macedonia: {
    id: 'macedonia', name: '马其顿', nameEn: 'Macedonia',
    lat: 40.5, lng: 22.5,
    description: '希腊北部地区，保罗在欧洲传福音的入口。',
    scripture: '使徒行传 16:9', significance: '保罗在异象中看见马其顿人"请你过到马其顿来帮助我们"。',
  },
  crete: {
    id: 'crete', name: '克里特岛', nameEn: 'Crete',
    lat: 35.2333, lng: 24.9167,
    description: '地中海东部大岛，希腊第一大岛。',
    scripture: '使徒行传 27:7-13', significance: '保罗被押往罗马途中在此停靠；提多在此牧养教会。',
  },
  sodom: {
    id: 'sodom', name: '所多玛', nameEn: 'Sodom',
    lat: 31.2, lng: 35.5,
    description: '死海附近平原城邑，因罪恶被神毁灭。',
    scripture: '创世记 19:24-25', significance: '耶和华降硫磺与火毁灭所多玛和蛾摩拉，罗得被天使救出。',
  },
  dead_sea: {
    id: 'dead_sea', name: '死海（盐海）', nameEn: 'Dead Sea',
    lat: 31.5, lng: 35.4667,
    description: '世界最低的湖泊，约旦河终点。',
    scripture: '创世记 14:3', significance: '所多玛和蛾摩拉所在的西订谷；历代作为天然边界。',
  },
  jordan_river: {
    id: 'jordan_river', name: '约旦河', nameEn: 'Jordan River',
    lat: 31.8333, lng: 35.55,
    description: '以色列的主要河流，从加利利海流入死海。',
    scripture: '马太福音 3:13-17', significance: '耶稣在此受施洗约翰的洗，圣灵仿佛鸽子降下，天上有声音说"这是我的爱子"。',
  },
  philistia: {
    id: 'philistia', name: '非利士地', nameEn: 'Philistia',
    lat: 31.6667, lng: 34.5833,
    description: '非利士人居住的沿海平原地区。',
    scripture: '出埃及记 13:17', significance: '神领以色列人绕道而行，不经过非利士地，免得百姓因见打仗后悔回埃及。',
  },
  babel: {
    id: 'babel', name: '巴别', nameEn: 'Babel',
    lat: 32.5425, lng: 44.4222,
    description: '示拿平原上的古城，人类建造巴别塔之处。',
    scripture: '创世记 11:1-9', significance: '人类在此建造通天塔，耶和华变乱口音，分散全地。',
  },
  garden_of_eden: {
    id: 'garden_of_eden', name: '伊甸园', nameEn: 'Garden of Eden',
    lat: 31.0, lng: 47.5,
    description: '神为亚当和夏娃所造的乐园，据圣经记载有底格里斯河与幼发拉底河流经。',
    scripture: '创世记 2:8-15', significance: '人类始祖亚当和夏娃最初居住的地方，也是人类堕落的起点。',
  },
  ararat: {
    id: 'ararat', name: '亚拉腊山', nameEn: 'Mount Ararat',
    lat: 39.7, lng: 44.3,
    description: '位于今日土耳其东部，圣经记载挪亚方舟停靠之处。',
    scripture: '创世记 8:4', significance: '挪亚方舟在洪水退去后停在此山，神以彩虹立约。',
  },
  gomorrah: {
    id: 'gomorrah', name: '蛾摩拉', nameEn: 'Gomorrah',
    lat: 31.15, lng: 35.45,
    description: '与所多玛一同被毁灭的平原城邑。',
    scripture: '创世记 19:24-25', significance: '与所多玛一同被天火毁灭，成为后世警戒。',
  },
  zoar: {
    id: 'zoar', name: '琐珥', nameEn: 'Zoar',
    lat: 30.9, lng: 35.45,
    description: '罗得逃往的小城，位于死海附近。',
    scripture: '创世记 19:20-22', significance: '罗得恳求逃往此城，神因罗得的缘故存留了琐珥。',
  },
  beersheba_well: {
    id: 'beersheba_well', name: '别是巴（井）', nameEn: 'Well of Beersheba',
    lat: 31.245, lng: 34.7917,
    description: '别是巴的井，亚伯拉罕与亚比米勒立约之处。',
    scripture: '创世记 21:25-31', significance: '亚伯拉罕以七只母羊羔为证据，立约此井属他。',
  },
  moreh: {
    id: 'moreh', name: '摩利橡树', nameEn: 'Oak of Moreh',
    lat: 32.2137, lng: 35.2815,
    description: '位于示剑附近，亚伯拉罕在迦南地的第一站。',
    scripture: '创世记 12:6', significance: '耶和华在此向亚伯拉罕显现，应许赐迦南地为业。',
  },
  egypt: {
    id: 'egypt', name: '埃及', nameEn: 'Egypt',
    lat: 30.0444, lng: 31.2357,
    description: '古代文明发源地，以色列人曾在此为奴四百年。',
    scripture: '出埃及记 1:11-14', significance: '以色列人在埃及受压迫，摩西被神兴起带领百姓出埃及。',
  },
  on: {
    id: 'on', name: '安城', nameEn: 'On (Heliopolis)',
    lat: 30.1333, lng: 31.3,
    description: '埃及古城，太阳崇拜中心，今开罗附近。',
    scripture: '创世记 41:45', significance: '约瑟娶了安城祭司波提非拉的女儿亚西纳为妻。',
  },
  midian: {
    id: 'midian', name: '米甸', nameEn: 'Midian',
    lat: 28.0, lng: 35.0,
    description: '位于阿拉伯半岛西北部，摩西逃亡之地。',
    scripture: '出埃及记 2:15', significance: '摩西逃到米甸，娶叶忒罗的女儿西坡拉为妻，牧羊四十年。',
  },
  gilead: {
    id: 'gilead', name: '基列', nameEn: 'Gilead',
    lat: 32.3, lng: 35.8,
    description: '约旦河东的山地，以出产乳香闻名。',
    scripture: '耶利米书 8:22', significance: '"在基列岂没有乳香呢？" 基列是医治与盼望的象征。',
  },
  bethany_beyond_jordan: {
    id: 'bethany_beyond_jordan', name: '约旦河外的伯大尼', nameEn: 'Bethany beyond Jordan',
    lat: 31.8333, lng: 35.55,
    description: '约旦河东，靠近耶利哥。',
    scripture: '约翰福音 1:28', significance: '施洗约翰在此为耶稣施洗。',
  },
  wilderness_of_judea: {
    id: 'wilderness_of_judea', name: '犹太旷野', nameEn: 'Wilderness of Judea',
    lat: 31.5, lng: 35.3,
    description: '耶路撒冷以东、死海以西的旷野地带。',
    scripture: '马太福音 4:1', significance: '耶稣在此禁食四十昼夜，受魔鬼试探。',
  },
  cyprus: {
    id: 'cyprus', name: '塞浦路斯', nameEn: 'Cyprus',
    lat: 35.0, lng: 33.0,
    description: '地中海东部岛国，巴拿巴的家乡。',
    scripture: '使徒行传 4:36', significance: '巴拿巴是塞浦路斯人；保罗第一次宣教的首站。',
  },
  lycaonia: {
    id: 'lycaonia', name: '吕高尼', nameEn: 'Lycaonia',
    lat: 37.5, lng: 32.5,
    description: '小亚细亚中部地区，路司得、特庇所在省份。',
    scripture: '使徒行传 14:6', significance: '保罗和巴拿巴在此地区传道，被当地人误当作神。',
  },
  pamphylia: {
    id: 'pamphylia', name: '旁非利亚', nameEn: 'Pamphylia',
    lat: 36.9, lng: 31.0,
    description: '小亚细亚南部沿海地区。',
    scripture: '使徒行传 13:13', significance: '保罗第一次宣教旅程在此登陆，约翰马可在此离开。',
  },
  sicily: {
    id: 'sicily', name: '西西里岛', nameEn: 'Sicily',
    lat: 37.5, lng: 14.0,
    description: '地中海最大岛屿，意大利南部。',
    scripture: '使徒行传 28:12', significance: '保罗被押往罗马途中在此停靠叙拉古三日。',
  },
  illyricum: {
    id: 'illyricum', name: '以利哩古', nameEn: 'Illyricum',
    lat: 42.0, lng: 19.0,
    description: '位于巴尔干半岛西部，亚得里亚海东岸。',
    scripture: '罗马书 15:19', significance: '保罗说他从耶路撒冷直转到以利哩古，到处传了基督的福音。',
  },
  cappadocia: {
    id: 'cappadocia', name: '加帕多家', nameEn: 'Cappadocia',
    lat: 38.6667, lng: 34.8333,
    description: '小亚细亚中部偏东地区，今土耳其中部。',
    scripture: '使徒行传 2:9', significance: '五旬节时，来自加帕多家的犹太人也听见门徒用他们的乡谈说话。',
  },
  pontus: {
    id: 'pontus', name: '本都', nameEn: 'Pontus',
    lat: 41.0, lng: 36.0,
    description: '小亚细亚东北部，黑海南岸地区。',
    scripture: '使徒行传 2:9', significance: '五旬节时有本都来的犹太人；亚居拉生于此地。',
  },
  asia: {
    id: 'asia', name: '亚细亚', nameEn: 'Asia',
    lat: 38.5, lng: 28.0,
    description: '罗马帝国亚细亚省，小亚细亚西部，以弗所为首府。',
    scripture: '使徒行传 19:10', significance: '保罗在以弗所两年之久，叫一切住在亚细亚的犹太人和希腊人都听见主的道。',
  },
  bithynia: {
    id: 'bithynia', name: '庇推尼', nameEn: 'Bithynia',
    lat: 40.5, lng: 30.0,
    description: '小亚细亚西北部，黑海南岸。',
    scripture: '使徒行传 16:7', significance: '保罗和西拉想往庇推尼去，耶稣的灵却不许。',
  },
  mysia: {
    id: 'mysia', name: '每西亚', nameEn: 'Mysia',
    lat: 39.5, lng: 28.0,
    description: '小亚细亚西北部，特罗亚所在地区。',
    scripture: '使徒行传 16:7-8', significance: '保罗经过每西亚下到特罗亚，在此看见马其顿异象。',
  },
  carchemish: {
    id: 'carchemish', name: '迦基米施', nameEn: 'Carchemish',
    lat: 36.8333, lng: 38.0,
    description: '位于幼发拉底河畔，赫人重要城市。',
    scripture: '历代志下 35:20', significance: '约西亚王在此与埃及王尼哥争战，受重伤而死。',
  },
  carmel_settlement: {
    id: 'carmel_settlement', name: '迦密（犹大）', nameEn: 'Carmel (Judah)',
    lat: 31.4167, lng: 35.15,
    description: '位于希伯仑以南的犹大城镇。',
    scripture: '撒母耳记上 25:2', significance: '拿八和亚比该在此住牧，大卫在此遇见亚比该。',
  },
  halhul: {
    id: 'halhul', name: '哈忽', nameEn: 'Halhul',
    lat: 31.5833, lng: 35.1,
    description: '位于希伯仑以北的犹大城镇。',
    scripture: '约书亚记 15:58', significance: '犹大支派所得产业之一。',
  },
  libnah: {
    id: 'libnah', name: '立拿', nameEn: 'Libnah',
    lat: 31.5667, lng: 34.8333,
    description: '位于犹大低地的利未城邑。',
    scripture: '约书亚记 10:29-30', significance: '约书亚攻取之城；后来背叛犹大王约兰独立。',
  },
  lachish: {
    id: 'lachish', name: '拉吉', nameEn: 'Lachish',
    lat: 31.5667, lng: 34.85,
    description: '位于犹大低地的坚固城邑。',
    scripture: '约书亚记 10:31-32', significance: '约书亚攻取的重要城邑；亚述王西拿基立曾围攻此城。',
  },
  eglon: {
    id: 'eglon', name: '伊矶伦', nameEn: 'Eglon',
    lat: 31.5, lng: 34.8667,
    description: '位于犹大低地的迦南城邑。',
    scripture: '约书亚记 10:34-35', significance: '约书亚攻取此城，将城中人口尽行杀灭。',
  },
  arad: {
    id: 'arad', name: '亚拉得', nameEn: 'Arad',
    lat: 31.2833, lng: 35.1333,
    description: '位于内盖夫沙漠北部的迦南城邑。',
    scripture: '民数记 21:1-3', significance: '亚拉得王攻击以色列人，以色列人向耶和华许愿将其毁灭。',
  },
  hormah: {
    id: 'hormah', name: '何珥玛', nameEn: 'Hormah',
    lat: 31.1, lng: 35.0,
    description: '位于内盖夫，以色列人征服之地。',
    scripture: '民数记 21:3', significance: '意为"毁灭"，以色列人将亚拉得王尽行毁灭。',
  },
  geba: {
    id: 'geba', name: '迦巴', nameEn: 'Geba',
    lat: 31.85, lng: 35.2667,
    description: '位于耶路撒冷以北的便雅悯城镇。',
    scripture: '撒母耳记上 13:3', significance: '约拿单在此攻击非利士人的防营，引发战争。',
  },
  michmash: {
    id: 'michmash', name: '密抹', nameEn: 'Michmash',
    lat: 31.8667, lng: 35.3167,
    description: '位于耶路撒冷以北约 11 公里。',
    scripture: '撒母耳记上 13:2', significance: '扫罗在此聚集军队；约拿单在此大败非利士人。',
  },
  gilboa: {
    id: 'gilboa', name: '基利波山', nameEn: 'Mount Gilboa',
    lat: 32.4833, lng: 35.4167,
    description: '位于耶斯列平原东南，扫罗战死之地。',
    scripture: '撒母耳记上 31:1-8', significance: '扫罗和约拿单在此战死，大卫作哀歌："英雄何竟仆倒"。',
  },
  hebron_machpelah: {
    id: 'hebron_machpelah', name: '麦比拉洞', nameEn: 'Cave of Machpelah',
    lat: 31.5247, lng: 35.1108,
    description: '希伯仑的洞穴，亚伯拉罕用四百舍客勒银子买作坟地。',
    scripture: '创世记 23:16-20', significance: '亚伯拉罕、撒拉、以撒、利百加、雅各、利亚的埋葬之处。',
  },
  pool_of_siloam: {
    id: 'pool_of_siloam', name: '西罗亚池', nameEn: 'Pool of Siloam',
    lat: 31.7706, lng: 35.2358,
    description: '位于耶路撒冷城南的水池。',
    scripture: '约翰福音 9:7', significance: '耶稣用唾沫和泥抹在瞎子眼睛上，叫他去西罗亚池子洗，就看见了。',
  },
  pool_of_bethesda: {
    id: 'pool_of_bethesda', name: '毕士大池', nameEn: 'Pool of Bethesda',
    lat: 31.7814, lng: 35.2361,
    description: '位于耶路撒冷城北靠近羊门的池子。',
    scripture: '约翰福音 5:2-9', significance: '耶稣在此医治瘫痪三十八年的病人，叫他起来行走。',
  },
  herodium: {
    id: 'herodium', name: '希律堡', nameEn: 'Herodium',
    lat: 31.6653, lng: 35.2417,
    description: '位于伯利恒东南，大希律建造的宫殿堡垒。',
    scripture: '马太福音 2:1', significance: '大希律的宫殿之一，耶稣降生时希律可能在此居住。',
  },
  masada: {
    id: 'masada', name: '马萨达', nameEn: 'Masada',
    lat: 31.3156, lng: 35.3536,
    description: '死海西岸的悬崖堡垒，大希律建造。',
    scripture: '撒母耳记上 24:22', significance: '大卫曾在附近旷野的山寨躲避扫罗。',
  },
  qumran: {
    id: 'qumran', name: '昆兰', nameEn: 'Qumran',
    lat: 31.7417, lng: 35.4583,
    description: '死海西北岸，死海古卷发现地。',
    scripture: '以赛亚书 40:8', significance: '1947年在此发现死海古卷，包含最古老的旧约抄本。',
  },
  valley_of_elah: {
    id: 'valley_of_elah', name: '以拉谷', nameEn: 'Valley of Elah',
    lat: 31.6833, lng: 34.95,
    description: '位于犹大与非利士交界处。',
    scripture: '撒母耳记上 17:2', significance: '大卫在此用机弦甩石击杀非利士巨人歌利亚。',
  },
  valley_of_hinnom: {
    id: 'valley_of_hinnom', name: '欣嫩子谷', nameEn: 'Valley of Hinnom',
    lat: 31.7667, lng: 35.2167,
    description: '耶路撒冷城南的谷地。',
    scripture: '耶利米书 7:31', significance: '曾被用作焚烧儿童献祭给摩洛，后成为地狱（Gehenna）的代名词。',
  },
  kidron_valley: {
    id: 'kidron_valley', name: '汲沦溪', nameEn: 'Kidron Valley',
    lat: 31.7767, lng: 35.2367,
    description: '耶路撒冷城东、橄榄山之间的谷地。',
    scripture: '约翰福音 18:1', significance: '耶稣和门徒过汲沦溪进入客西马尼园；大卫逃避押沙龙时也曾经过。',
  },
  lebanon: {
    id: 'lebanon', name: '黎巴嫩', nameEn: 'Lebanon',
    lat: 33.8333, lng: 35.8333,
    description: '以香柏木闻名的山区，所罗门建殿木材来源。',
    scripture: '列王纪上 5:6', significance: '所罗门派希兰王砍伐黎巴嫩的香柏木，建造耶和华的殿。',
  },
  mount_hermon: {
    id: 'mount_hermon', name: '黑门山', nameEn: 'Mount Hermon',
    lat: 33.4167, lng: 35.85,
    description: '以色列最高山峰，位于以色列、黎巴嫩、叙利亚边界。',
    scripture: '诗篇 133:3', significance: '"好比黑门的甘露降在锡安山"；可能为耶稣变像之地。',
  },
  mount_gerizim: {
    id: 'mount_gerizim', name: '基利心山', nameEn: 'Mount Gerizim',
    lat: 32.2, lng: 35.2667,
    description: '位于示剑对面，祝福之山。',
    scripture: '申命记 11:29', significance: '以色列人进迦南后在此宣告祝福；撒玛利亚妇人所指"这山上"敬拜之处。',
  },
  mount_ebal: {
    id: 'mount_ebal', name: '以巴路山', nameEn: 'Mount Ebal',
    lat: 32.2333, lng: 35.2833,
    description: '位于示剑对面，咒诅之山。',
    scripture: '申命记 11:29', significance: '以色列人进迦南后在此宣告咒诅；约书亚在此筑坛献祭。',
  },
  bashan: {
    id: 'bashan', name: '巴珊', nameEn: 'Bashan',
    lat: 32.8, lng: 35.95,
    description: '约旦河东北部肥沃高原，以肥牛和橡树闻名。',
    scripture: '民数记 21:33-35', significance: '以色列人击败巴珊王噩，将此地分给玛拿西半支派。',
  },
  ammon: {
    id: 'ammon', name: '亚扪', nameEn: 'Ammon',
    lat: 31.95, lng: 35.95,
    description: '罗得后裔所建国家，约旦河东。',
    scripture: '创世记 19:38', significance: '亚扪人是罗得与小女儿的后裔，常与以色列人为敌。',
  },
  moab: {
    id: 'moab', name: '摩押', nameEn: 'Moab',
    lat: 31.5, lng: 35.75,
    description: '罗得后裔所建国家，约旦河东、死海以东。',
    scripture: '路得记 1:1-4', significance: '路得是摩押女子，嫁入以色列成为大卫的曾祖母。',
  },
  golan: {
    id: 'golan', name: '哥兰', nameEn: 'Golan',
    lat: 32.8, lng: 35.75,
    description: '巴珊地区的逃城，今日戈兰高地。',
    scripture: '约书亚记 20:8', significance: '以色列人设立的六座逃城之一，给误杀人的提供庇护。',
  },
  kedesh: {
    id: 'kedesh', name: '基低斯', nameEn: 'Kedesh',
    lat: 33.1, lng: 35.5333,
    description: '位于加利利北部的逃城。',
    scripture: '约书亚记 20:7', significance: '以色列人设立的六座逃城之一，属拿弗他利支派。',
  },
  ramoth_gilead: {
    id: 'ramoth_gilead', name: '基列的拉末', nameEn: 'Ramoth-gilead',
    lat: 32.5, lng: 36.0,
    description: '约旦河东的逃城。',
    scripture: '约书亚记 20:8', significance: '以色列人设立的六座逃城之一；亚哈王在此与亚兰人争战而死。',
  },
  beersheba_south: {
    id: 'beersheba_south', name: '以色列南界', nameEn: 'Southern Border',
    lat: 30.0, lng: 35.0,
    description: '"从但到别是巴"代表以色列全地。',
    scripture: '士师记 20:1', significance: '以色列人从但到别是巴聚集，如同—人。',
  },
  dan: {
    id: 'dan', name: '但', nameEn: 'Dan',
    lat: 33.25, lng: 35.65,
    description: '以色列最北端的城市，靠近黑门山。',
    scripture: '士师记 18:29', significance: '耶罗波安在此设立金牛犊，使百姓陷于罪中。',
  },
};

// 圣经路线定义
export const BIBLE_ROUTES: BibleRoute[] = [
  {
    id: 'abraham',
    name: '亚伯拉罕迁往迦南',
    color: '#B8860B',
    description: '亚伯拉罕回应神呼召，从吾珥经哈兰进入迦南地，并在示剑、伯特利、希伯仑、别是巴等地筑坛。',
    locations: ['ur', 'haran', 'shechem', 'moreh', 'bethel', 'ai', 'hebron', 'mamre', 'beersheba'],
  },
  {
    id: 'jacob',
    name: '雅各往返巴旦亚兰',
    color: '#8B6914',
    description: '雅各为逃避以扫，从别是巴前往哈兰；二十年后携家眷返回，在毗努伊勒与神摔跤，被改名以色列。',
    locations: ['beersheba', 'bethel', 'haran', 'mahanaim', 'peniel', 'succoth_jacob', 'shechem', 'bethel', 'hebron', 'mamre'],
  },
  {
    id: 'joseph',
    name: '约瑟被卖到埃及',
    color: '#CD853F',
    description: '约瑟从希伯仑被哥哥们卖到埃及，后成为埃及宰相，父亲雅各全家下埃及定居歌珊地。',
    locations: ['hebron', 'dothan', 'egypt', 'goshen', 'on'],
  },
  {
    id: 'exodus',
    name: '摩西出埃及路线',
    color: '#8B4513',
    description: '以色列人出埃及、过红海、经旷野、至西奈山、漂流四十年，最终来到摩押平原预备进入迦南。',
    locations: [
      'egypt_rameses', 'succoth', 'etham', 'red_sea', 'marah', 'elim',
      'rephidim', 'sinai', 'kadesh_barnea', 'edom', 'moab', 'moab_plains', 'mount_nebo', 'jericho',
    ],
  },
  {
    id: 'joshua',
    name: '约书亚征服迦南',
    color: '#D2691E',
    description: '约书亚带领以色列人过约旦河、攻取耶利哥、艾城，在基遍大战五王，将迦南地分给各支派。',
    locations: ['moab_plains', 'gilgal', 'jericho', 'ai', 'bethel', 'gibeon', 'shechem', 'mount_ebal', 'mount_gerizim', 'shiloh'],
  },
  {
    id: 'spies',
    name: '十二探子窥探迦南',
    color: '#A0522D',
    description: '摩西从加低斯·巴尼亚差遣十二探子窥探迦南地，从南地直到哈马口，四十天后回报。',
    locations: ['kadesh_barnea', 'beersheba', 'hebron', 'eshcol_valley', 'jericho', 'dan', 'kadesh_barnea'],
  },
  {
    id: 'david',
    name: '大卫逃避扫罗',
    color: '#800020',
    description: '大卫从基比亚逃离扫罗的追杀，经挪伯、迦特、亚杜兰洞、隐基底等地，直躲避到非利士地。',
    locations: ['jerusalem', 'gath', 'adullam', 'en_gedi', 'ziklag', 'hebron', 'jerusalem'],
  },
  {
    id: 'elijah',
    name: '以利亚先知旅程',
    color: '#B22222',
    description: '以利亚从基立溪到撒勒法，再到迦密山与巴力先知对垒，后逃避耶洗别至何烈山遇见神。',
    locations: ['brook_kerith', 'zarephath', 'mount_carmel', 'jezreel', 'beersheba', 'mount_horeb'],
  },
  {
    id: 'jesus_galilee',
    name: '耶稣加利利事工',
    color: '#2E8B57',
    description: '耶稣在加利利地区的传道旅程：从拿撒勒到迦百农，走遍加利利各城各乡，医治、教导、传天国福音。',
    locations: ['nazareth', 'cana', 'capernaum', 'bethsaida', 'chorazin', 'magdala', 'sea_of_galilee', 'nain'],
  },
  {
    id: 'jesus_jerusalem',
    name: '耶稣最后上耶路撒冷',
    color: '#DC143C',
    description: '耶稣最后一次从加利利经过撒玛利亚、耶利哥上耶路撒冷，受难、复活、升天。',
    locations: ['capernaum', 'samaria_sychar', 'jericho_nt', 'bethany', 'mount_of_olives', 'gethsemane', 'jerusalem', 'golgotha', 'emmaus'],
  },
  {
    id: 'jesus_birth',
    name: '耶稣降生与逃亡',
    color: '#FFD700',
    description: '天使向马利亚报喜，耶稣在伯利恒降生，约瑟带全家逃往埃及躲避希律，后返回拿撒勒。',
    locations: ['nazareth', 'bethlehem', 'egypt', 'nazareth'],
  },
  {
    id: 'paul_1st',
    name: '保罗第一次宣教旅程',
    color: '#228B22',
    description: '保罗与巴拿巴从安提阿被差派，经塞浦路斯、旁非利亚、彼西底、以哥念、路司得、特庇，再返回安提阿。',
    locations: [
      'antioch_syria', 'seleucia', 'salamis', 'paphos', 'perga',
      'antioch_pisidia', 'iconium', 'lystra', 'derbe',
      'lystra', 'iconium', 'antioch_pisidia', 'perga', 'attalia', 'antioch_syria',
    ],
  },
  {
    id: 'paul_2nd',
    name: '保罗第二次宣教旅程',
    color: '#4169E1',
    description: '保罗与西拉经小亚细亚内陆到特罗亚，渡海进入马其顿、希腊，在腓立比、帖撒罗尼迦、庇哩亚、雅典、哥林多等地建立教会。',
    locations: [
      'antioch_syria', 'tarsus', 'derbe', 'lystra', 'iconium',
      'troas', 'neapolis', 'philippi', 'amphipolis', 'apollonia',
      'thessalonica', 'berea', 'athens', 'corinth', 'cenchr_eae',
      'ephesus', 'caesarea', 'antioch_syria',
    ],
  },
  {
    id: 'paul_3rd',
    name: '保罗第三次宣教旅程',
    color: '#DC143C',
    description: '保罗经加拉太、弗吕家到达以弗所，再经马其顿、希腊，最后从米利都经推罗、凯撒利亚上耶路撒冷。',
    locations: [
      'antioch_syria', 'iconium', 'ephesus', 'philippi', 'corinth',
      'miletus', 'tyre', 'ptolemais', 'caesarea', 'jerusalem',
    ],
  },
  {
    id: 'paul_rome',
    name: '保罗被押往罗马',
    color: '#800080',
    description: '保罗从凯撒利亚被押解，乘船经西顿、每拉、克里特佳澳，遭遇船难后抵达马耳他，再经叙拉古、部丢利，最终到达罗马。',
    locations: [
      'caesarea', 'sidon', 'myra', 'fair_havens', 'malta',
      'syracuse', 'puteoli', 'rome',
    ],
  },
  {
    id: 'paul_conversion',
    name: '保罗归主与早期事奉',
    color: '#FF6347',
    description: '扫罗在大马士革路上遇见复活主，归主后在大马士革和阿拉伯传道，后上耶路撒冷见使徒，再回大数。',
    locations: ['jerusalem', 'damascus', 'arabia', 'damascus', 'jerusalem', 'tarsus', 'antioch_syria'],
  },
  {
    id: 'peter',
    name: '彼得宣教旅程',
    color: '#4682B4',
    description: '彼得从约帕到凯撒利亚，在哥尼流家中开启外邦人归主的大门；后往安提阿、巴比伦等地。',
    locations: ['jerusalem', 'samaria_city', 'joppa', 'caesarea', 'antioch_syria'],
  },
  {
    id: 'philip',
    name: '腓利传福音',
    color: '#20B2AA',
    description: '腓利在撒玛利亚城传道，后被圣灵引领到旷野路上向埃提阿伯太监讲解以赛亚书，领他受洗。',
    locations: ['jerusalem', 'samaria_city', 'gaza', 'caesarea'],
  },
  {
    id: 'revelation_churches',
    name: '启示录七教会',
    color: '#FF4500',
    description: '使徒约翰在拔摩海岛领受启示，写信给亚细亚的七个教会：以弗所、士每拿、别迦摩、推雅推喇、撒狄、非拉铁非、老底嘉。',
    locations: ['patmos', 'ephesus', 'smyrna', 'pergamum', 'thyatira', 'sardis', 'philadelphia', 'laodicea'],
  },
  {
    id: 'ruth',
    name: '路得与拿俄米',
    color: '#9370DB',
    description: '路得随拿俄米从摩押地回到伯利恒，在波阿斯的田间拾麦穗，后嫁给波阿斯，成为大卫的曾祖母。',
    locations: ['moab', 'bethlehem'],
  },
  {
    id: 'ark',
    name: '约柜被掳与归还',
    color: '#6B8E23',
    description: '非利士人掳走约柜，从以便以谢运到亚实突、迦特、以革伦，因遭遇灾祸而归还，运到伯示麦后安置在基列耶琳。',
    locations: ['shiloh', 'ebenezer', 'ashdod', 'gath', 'ekron', 'beth_shemesh', 'kiriath_jearim', 'jerusalem'],
  },
  {
    id: 'solomon',
    name: '所罗门建殿',
    color: '#DAA520',
    description: '所罗门王在耶路撒冷建造圣殿，从推罗运来香柏木、从约帕运上岸，历经七年建成。',
    locations: ['jerusalem', 'joppa', 'tyre', 'lebanon', 'jerusalem'],
  },
  {
    id: 'ezra_return',
    name: '以斯拉归回',
    color: '#C71585',
    description: '以斯拉带领第二批被掳犹太人从巴比伦经四个月长途跋涉归回耶路撒冷，重建圣殿。',
    locations: ['babylon', 'jerusalem'],
  },
  {
    id: 'nehemiah',
    name: '尼希米重建城墙',
    color: '#8B008B',
    description: '尼希米从书珊城得亚达薛西王准许，返回耶路撒冷修建城墙，带领百姓五十二天完工。',
    locations: ['susa', 'jerusalem'],
  },
  {
    id: 'jonah',
    name: '约拿逃避与顺服',
    color: '#00CED1',
    description: '约拿从约帕上船逃往他施，被大鱼吞下三天三夜；后顺服去尼尼微传道，全城悔改。',
    locations: ['joppa', 'nineveh'],
  },
  {
    id: 'isaac',
    name: '以撒在应许之地',
    color: '#DEB887',
    description: '以撒在别是巴、基拉耳等地寄居，在非利士人中挖井，神赐福他百倍收成。',
    locations: ['beersheba', 'gerar', 'beersheba', 'hebron', 'mamre'],
  },
  {
    id: 'gideon',
    name: '基甸击败米甸人',
    color: '#556B2F',
    description: '基甸在俄弗拉蒙召，带领三百勇士在哈律泉旁击败米甸大军，追赶至约旦河东。',
    locations: ['ophrah', 'jezreel', 'mount_gilboa', 'succoth_jacob', 'peniel'],
  },
  {
    id: 'samson',
    name: '参孙与非利士人',
    color: '#BDB76B',
    description: '参孙在亭拿、迦萨等地与非利士人争战，用驴腮骨击杀千人，最后在迦萨推倒庙柱。',
    locations: ['timnah', 'ashkelon', 'gaza', 'valley_of_sorek'],
  },
  {
    id: 'samuel',
    name: '撒母耳巡行审判',
    color: '#8FBC8F',
    description: '撒母耳每年巡行到伯特利、吉甲、米斯巴审判以色列人，最后回到拉玛居住。',
    locations: ['ramah', 'bethel', 'gilgal', 'mizpah', 'ramah'],
  },
];

// 为缺少特定坐标的地点补充
const EXTRA_LOCATIONS: Record<string, BibleLocation> = {
  eshcol_valley: {
    id: 'eshcol_valley', name: '以实各谷', nameEn: 'Valley of Eshcol',
    lat: 31.35, lng: 35.05,
    description: '位于希伯仑附近，探子砍下葡萄枝之地。',
    scripture: '民数记 13:23-24', significance: '十二探子在此砍下一挂葡萄，需两人用杠抬着。',
  },
  arabia: {
    id: 'arabia', name: '阿拉伯', nameEn: 'Arabia',
    lat: 28.0, lng: 37.0,
    description: '阿拉伯半岛，保罗归主后曾在此停留。',
    scripture: '加拉太书 1:17', significance: '保罗归主后并未立刻上耶路撒冷，而是往阿拉伯去，在那里领受启示。',
  },
  ebenezer: {
    id: 'ebenezer', name: '以便以谢', nameEn: 'Ebenezer',
    lat: 32.1, lng: 34.95,
    description: '位于示罗以西，以色列人约柜被掳之地。',
    scripture: '撒母耳记上 4:1', significance: '以色列人战败，约柜被非利士人掳去；后撒母耳立石记念："到如今耶和华都帮助我们"。',
  },
  beth_shemesh: {
    id: 'beth_shemesh', name: '伯示麦', nameEn: 'Beth-shemesh',
    lat: 31.75, lng: 34.9833,
    description: '位于犹大低地，非利士人归还约柜的第一站。',
    scripture: '撒母耳记上 6:12-15', significance: '非利士人用牛车将约柜归还到此，伯示麦人因擅自观看约柜被击杀七十人。',
  },
  kiriath_jearim: {
    id: 'kiriath_jearim', name: '基列耶琳', nameEn: 'Kiriath-jearim',
    lat: 31.8, lng: 35.1,
    description: '位于耶路撒冷以西约 15 公里，约柜在此存放二十年。',
    scripture: '撒母耳记上 7:1-2', significance: '约柜从伯示麦运到此，由亚比拿达看守，直到大卫将其运往耶路撒冷。',
  },
  ophrah: {
    id: 'ophrah', name: '俄弗拉', nameEn: 'Ophrah',
    lat: 32.55, lng: 35.2333,
    description: '位于耶斯列平原，基甸的家乡。',
    scripture: '士师记 6:11', significance: '耶和华的使者在此向基甸显现，呼召他拯救以色列人脱离米甸。',
  },
  mount_gilboa: {
    id: 'mount_gilboa', name: '基利波山', nameEn: 'Mount Gilboa',
    lat: 32.4833, lng: 35.4167,
    description: '位于耶斯列平原东南，扫罗战死之地。',
    scripture: '撒母耳记上 31:1-8', significance: '扫罗和约拿单在此战死，大卫作哀歌。',
  },
  valley_of_sorek: {
    id: 'valley_of_sorek', name: '梭烈谷', nameEn: 'Valley of Sorek',
    lat: 31.75, lng: 34.9167,
    description: '位于犹大与非利士交界处，参孙爱上大利拉之地。',
    scripture: '士师记 16:4', significance: '参孙在此爱上大利拉，被她三次哄骗说出力气的秘密，最终被非利士人捉拿。',
  },
};

// 合并额外地点
Object.assign(BIBLE_LOCATIONS, EXTRA_LOCATIONS);

// 默认路线
export const DEFAULT_ROUTE_ID = 'paul_1st';

// 所有可搜索地点（去重）
export const SEARCHABLE_LOCATIONS: BibleLocation[] = Object.values(BIBLE_LOCATIONS);

// 根据路线 ID 获取路线
export function getRouteById(id: string): BibleRoute | undefined {
  return BIBLE_ROUTES.find((r) => r.id === id);
}

// 根据路线获取地点详情数组（保留顺序）
export function getRouteLocations(route: BibleRoute): BibleLocation[] {
  const seen = new Set<string>();
  const result: BibleLocation[] = [];
  for (const id of route.locations) {
    const loc = BIBLE_LOCATIONS[id];
    if (!loc) continue;
    if (!seen.has(id)) {
      seen.add(id);
      result.push(loc);
    }
  }
  return result;
}