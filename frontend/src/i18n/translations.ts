export type Lang = 'zh' | 'ko';

export interface Translations {
  // ========== NavBar ==========
  'nav.logo': string;
  'nav.messages': string;
  'nav.profile': string;
  'nav.logout': string;
  'nav.login': string;
  'nav.register': string;
  'nav.openMenu': string;
  'nav.user': string;
  'nav.qtAdmin': string;

  // ========== Layout ==========
  'layout.banner': string;
  'layout.title': string;
  'layout.description': string;

  // ========== Login ==========
  'login.title': string;
  'login.email': string;
  'login.password': string;
  'login.submit': string;
  'login.submitting': string;
  'login.fail': string;
  'login.noAccount': string;
  'login.registerNow': string;

  // ========== Register ==========
  'register.title': string;
  'register.username': string;
  'register.email': string;
  'register.getCode': string;
  'register.codeSent': string;
  'register.verificationCode': string;
  'register.password': string;
  'register.confirmPassword': string;
  'register.submit': string;
  'register.submitting': string;
  'register.codeSentMsg': string;
  'register.codeAutoFilled': string;
  'register.sendCodeFail': string;
  'register.registerFail': string;
  'register.hasAccount': string;
  'register.loginNow': string;

  // ========== Homepage ==========
  'home.heroTitle': string;
  'home.heroSubtitle': string;
  'home.cardDailyThought': string;
  'home.cardDailyThoughtDesc': string;
  'home.cardBibleMaps': string;
  'home.cardBibleMapsDesc': string;
  'home.cardQtShare': string;
  'home.cardQtShareDesc': string;
  'home.cardContact': string;
  'home.cardContactDesc': string;
  'home.checkingAuth': string;
  'home.generateFail': string;
  'home.generatingScripture': string;
  'home.verse1': string;
  'home.verse7': string;
  'home.verse12': string;
  'home.verse27': string;
  'home.verse39': string;
  'home.chapterFull': string;
  'home.exegesisFail': string;
  'home.startExegesis': string;
  'home.exegesisTitle': string;
  'home.exegesisSection.summary': string;
  'home.exegesisSection.originalText': string;
  'home.exegesisSection.verseByVerse': string;
  'home.exegesisSection.historicalBg': string;
  'home.exegesisSection.writingBg': string;
  'home.exegesisSection.context': string;
  'home.exegesisSection.keywords': string;
  'home.exegesisSection.canonical': string;
  'home.exegesisSection.theological': string;
  'home.exegesisSection.truth': string;
  'home.exegesisSection.application': string;
  'home.regenerate': string;
  'home.chapterLabel': string;
  'home.verseLabel': string;
  'home.generationTypes': Record<string, string>;
  'home.getExegesis': string;
  'home.exegesisLoading': string;
  'home.exegesisError': string;
  'home.exegesisPanel.title': string;
  'home.exegesisPanel.historicalBackground': string;
  'home.exegesisPanel.exegesis': string;
  'home.exegesisPanel.application': string;
  'home.exegesisPanel.languageInsights': string;
  'home.exegesisPanel.imageRevelation': string;
  'home.exegesisPanel.studyQuestions': string;
  'home.exegesisPanel.prayerGuide': string;
  'home.exegesisPanel.verseByVerse': string;
  'home.exegesisPanel.keywords': string;
  'home.reflection.title': string;
  'home.reflection.sectionTitle': string;
  'home.reflection.titlePlaceholder': string;
  'home.reflection.contentPlaceholder': string;
  'home.reflection.saveBtn': string;
  'home.reflection.saving': string;
  'home.reflection.saved': string;
  'home.reflection.savedHint': string;
  'home.reflection.gotoProfile': string;
  'home.reflection.edit': string;
  'home.reflection.delete': string;
  'home.reflection.visibility': string;
  'home.reflection.visibilityPublic': string;
  'home.reflection.visibilityPrivate': string;
  'home.reflection.deleting': string;
  'home.reflection.deleteConfirm': string;
  'home.reflection.saveFail': string;
  'home.reflection.deleteFail': string;
  'home.praise.title': string;
  'home.praise.loading': string;
  'home.praise.randomPlay': string;
  'home.praise.switchSong': string;
  'home.praise.fetchFail': string;
  'home.praise.previous': string;
  'home.praise.next': string;
  'home.praise.play': string;
  'home.praise.pause': string;
  'home.praise.noAudio': string;
  'home.praise.external': string;
  'home.praise.audioError': string;
  'home.praise.viewLyrics': string;
  'home.praise.hideLyrics': string;
  'home.contact.title': string;
  'home.contact.ok': string;
  'home.contact.open': string;
  'home.contact.name': string;
  'home.contact.namePlaceholder': string;
  'home.contact.gender': string;
  'home.contact.genderMale': string;
  'home.contact.genderFemale': string;
  'home.contact.wechat': string;
  'home.contact.wechatPlaceholder': string;
  'home.contact.phone': string;
  'home.contact.phonePlaceholder': string;
  'home.contact.email': string;
  'home.contact.emailPlaceholder': string;
  'home.contact.location': string;
  'home.contact.locationPlaceholder': string;
  'home.contact.question': string;
  'home.contact.questionPlaceholder': string;
  'home.contact.submit': string;
  'home.contact.submitting': string;
  'home.contact.success': string;
  'home.contact.submitFail': string;
  'home.contact.close': string;
  'home.qtLink': string;
  'home.dailyThoughtLink': string;
  'home.bibleMapsLink': string;
  'home.scriptureReader.title': string;
  'home.scriptureReader.loading': string;
  'home.scriptureReader.searchPlaceholder': string;
  'home.scriptureReader.book': string;
  'home.scriptureReader.chapter': string;
  'home.scriptureReader.noResult': string;
  'home.annotation.highlight': string;
  'home.annotation.note': string;
  'home.annotation.save': string;

  // ========== Profile ==========
  'profile.title': string;
  'profile.subtitle': string;
  'profile.auth.checking': string;
  'profile.tabs.reflections': string;
  'profile.tabs.annotations': string;
  'profile.tabs.bookmarks': string;
  'profile.reflections.loading': string;
  'profile.reflections.fetchError': string;
  'profile.reflections.empty': string;
  'profile.reflections.count': string;
  'profile.annotations.loading': string;
  'profile.annotations.fetchError': string;
  'profile.annotations.empty': string;
  'profile.visibility.public': string;
  'profile.visibility.private': string;
  'profile.bookmarks.loading': string;
  'profile.bookmarks.fetchError': string;
  'profile.bookmarks.empty': string;
  'profile.bookmarks.chapterVerse': string;
  'profile.back': string;
  'profile.prevPage': string;
  'profile.nextPage': string;
  'profile.pageLabel': string;
  'profile.bookmarks.loadingVerses': string;
  'profile.bookmarks.loadVersesFail': string;
  'profile.bookmarks.clickToView': string;

  // ========== Messages ==========
  'messages.title': string;
  'messages.subtitle': string;
  'messages.back': string;
  'messages.checkingAuth': string;
  'messages.loading': string;
  'messages.loadFail': string;
  'messages.noSessions': string;
  'messages.noSessionsHint': string;
  'messages.goGenerate': string;
  'messages.canStartChat': string;
  'messages.close': string;
  'messages.inputPlaceholder': string;
  'messages.send': string;
  'messages.sending': string;
  'messages.sendFail': string;
  'messages.you': string;

  // ========== Chat Modal ==========
  'chat.initFail': string;
  'chat.sendFail': string;
  'chat.commonScripture': string;
  'chat.close': string;
  'chat.checkingPermission': string;
  'chat.cannotChat': string;
  'chat.needMoreCommon': string;
  'chat.canStart': string;
  'chat.inputPlaceholder': string;
  'chat.send': string;

  // ========== Scripture Reader ==========
  'reader.loadAnnotationFail': string;
  'reader.bookmarkFail': string;
  'reader.saveAnnotationFail': string;
  'reader.loadingAnnotations': string;
  'reader.meditationOf': string;
  'reader.publicMeditation': string;
  'reader.annotate': string;
  'reader.bookmark': string;
  'reader.addMeditation': string;
  'reader.meditationPlaceholder': string;
  'reader.visibilityPrivate': string;
  'reader.visibilityPublic': string;
  'reader.cancel': string;
  'reader.saving': string;
  'reader.save': string;

  // ========== Hebrew Text ==========
  'hebrew.playFail': string;
  'hebrew.voiceUnavailable': string;
  'hebrew.voiceTimeout': string;
  'hebrew.hebrew': string;
  'hebrew.greek': string;
  'hebrew.pronunciation': string;
  'hebrew.playPronunciation': string;

  // ========== Maps (extra) ==========
  'maps.scripture': string;
  'maps.meaning': string;

  // ========== QT Admin (extra) ==========
  'qtAdmin.recognizeFail': string;
  'qtAdmin.importSuccess': string;
  'qtAdmin.importFail': string;
  'qtAdmin.savedToDb': string;
  'qtAdmin.saveFail': string;
  'qtAdmin.previewAlt': string;
  'qtAdmin.clickToSelect': string;
  'qtAdmin.supportedFormats': string;
  'qtAdmin.recognizingHint': string;

  // ========== QT Share (extra) ==========
  'qt.yearUnit': string;
  'qt.monthUnit': string;
  'qt.dayUnit': string;
  'qt.sunday': string;
  'qt.monday': string;
  'qt.tuesday': string;
  'qt.wednesday': string;
  'qt.thursday': string;
  'qt.friday': string;
  'qt.saturday': string;

  // ========== Maps ==========
  'maps.loading': string;
  'maps.tip': string;
  'maps.searchPlaceholder': string;
  'maps.search': string;
  'maps.searchLabel': string;
  'maps.routes': string;
  'maps.allRoutes': string;
  'maps.routeLabel': string;
  'maps.route.abraham': string;
  'maps.route.abrahamDesc': string;
  'maps.route.jacob': string;
  'maps.route.jacobDesc': string;
  'maps.route.joseph': string;
  'maps.route.josephDesc': string;
  'maps.route.exodus': string;
  'maps.route.exodusDesc': string;
  'maps.route.joshua': string;
  'maps.route.joshuaDesc': string;
  'maps.route.spies': string;
  'maps.route.spiesDesc': string;
  'maps.route.david': string;
  'maps.route.davidDesc': string;
  'maps.route.elijah': string;
  'maps.route.elijahDesc': string;
  'maps.route.jesus_galilee': string;
  'maps.route.jesus_galileeDesc': string;
  'maps.route.jesus_jerusalem': string;
  'maps.route.jesus_jerusalemDesc': string;
  'maps.route.jesus_birth': string;
  'maps.route.jesus_birthDesc': string;
  'maps.route.paul_1st': string;
  'maps.route.paul_1stDesc': string;
  'maps.route.paul_2nd': string;
  'maps.route.paul_2ndDesc': string;
  'maps.route.paul_3rd': string;
  'maps.route.paul_3rdDesc': string;
  'maps.route.paul_rome': string;
  'maps.route.paul_romeDesc': string;
  'maps.route.paul_conversion': string;
  'maps.route.paul_conversionDesc': string;
  'maps.route.peter': string;
  'maps.route.peterDesc': string;
  'maps.route.philip': string;
  'maps.route.philipDesc': string;
  'maps.route.revelation_churches': string;
  'maps.route.revelation_churchesDesc': string;
  'maps.route.ruth': string;
  'maps.route.ruthDesc': string;
  'maps.route.ark': string;
  'maps.route.arkDesc': string;
  'maps.route.solomon': string;
  'maps.route.solomonDesc': string;
  'maps.route.ezra_return': string;
  'maps.route.ezra_returnDesc': string;
  'maps.route.nehemiah': string;
  'maps.route.nehemiahDesc': string;
  'maps.route.jonah': string;
  'maps.route.jonahDesc': string;
  'maps.route.isaac': string;
  'maps.route.isaacDesc': string;
  'maps.route.gideon': string;
  'maps.route.gideonDesc': string;
  'maps.route.samson': string;
  'maps.route.samsonDesc': string;
  'maps.route.samuel': string;
  'maps.route.samuelDesc': string;

  // ========== Daily Thought ==========
  'thought.title': string;
  'thought.subtitle': string;
  'thought.history': string;
  'thought.back': string;
  'thought.checkingAuth': string;
  'thought.label': string;
  'thought.placeholder': string;
  'thought.generate': string;
  'thought.generating': string;
  'thought.generateFail': string;
  'thought.pastoralResponse': string;
  'thought.divineWord': string;
  'thought.hymn': string;
  'thought.scriptures': string;
  'thought.relevance': string;
  'thought.save': string;
  'thought.saving': string;
  'thought.saved': string;
  'thought.saveFail': string;

  // ========== Daily Thought History ==========
  'thoughtHistory.title': string;
  'thoughtHistory.subtitle': string;
  'thoughtHistory.back': string;
  'thoughtHistory.home': string;
  'thoughtHistory.checkingAuth': string;
  'thoughtHistory.loading': string;
  'thoughtHistory.loadFail': string;
  'thoughtHistory.empty': string;
  'thoughtHistory.pastoralResponse': string;
  'thoughtHistory.divineWord': string;
  'thoughtHistory.hymn': string;
  'thoughtHistory.scriptures': string;
  'thoughtHistory.relevance': string;

  // ========== QT Share ==========
  'qt.qtTitle': string;
  'qt.history': string;
  'qt.back': string;
  'qt.meditationEssay': string;
  'qt.scriptureExplain': string;
  'qt.todayHymn': string;
  'qt.scripture': string;
  'qt.meditation': string;
  'qt.myResponse': string;
  'qt.meditationLabel': string;
  'qt.meditationPlaceholder': string;
  'qt.applyLabel': string;
  'qt.applyPlaceholder': string;
  'qt.prayerLabel': string;
  'qt.prayerPlaceholder': string;
  'qt.photoLabel': string;
  'qt.uploading': string;
  'qt.image': string;
  'qt.saveBtn': string;
  'qt.saving': string;
  'qt.saved': string;
  'qt.edit': string;
  'qt.delete': string;
  'qt.deleting': string;
  'qt.saveSuccess': string;
  'qt.community': string;
  'qt.viewShares': string;
  'qt.loading': string;
  'qt.loadHint': string;
  'qt.myBookmarks': string;
  'qt.removeBookmark': string;
  'qt.highlight': string;
  'qt.bookmark': string;
  'qt.copy': string;
  'qt.copied': string;
  'qt.loadingContent': string;
  'qt.noContent': string;
  'qt.contactAdmin': string;
  'qt.checkingAuth': string;
  'qt.deleteConfirm': string;
  'qt.saveFail': string;
  'qt.deleteFail': string;
  'qt.brotherSister': string;
  'qt.selectDate': string;
  'qt.confirm': string;
  'qt.goToday': string;

  // ========== QT History ==========
  'qtHistory.title': string;
  'qtHistory.subtitle': string;
  'qtHistory.back': string;
  'qtHistory.checkingAuth': string;
  'qtHistory.loading': string;
  'qtHistory.noRecords': string;
  'qtHistory.responded': string;
  'qtHistory.notResponded': string;
  'qtHistory.meditation': string;
  'qtHistory.application': string;
  'qtHistory.prayer': string;
  'qtHistory.byUser': string;
  'qtHistory.byTime': string;
  'qtHistory.responsesCount': string;
  'qtHistory.peopleCount': string;
  'qtHistory.me': string;
  'qtHistory.today': string;
  'qtHistory.photo': string;
  'qtHistory.edit': string;
  'qtHistory.delete': string;
  'qtHistory.deleting': string;
  'qtHistory.save': string;
  'qtHistory.saving': string;
  'qtHistory.cancel': string;
  'qtHistory.prevPage': string;
  'qtHistory.nextPage': string;
  'qtHistory.pageInfo': string;
  'qtHistory.totalDates': string;
  'qtHistory.deleteConfirm': string;
  'qtHistory.loadFail': string;
  'qtHistory.saveFail': string;
  'qtHistory.deleteFail': string;
  'qtHistory.defaultUser': string;

  // ========== QT Admin ==========
  'qtAdmin.title': string;
  'qtAdmin.back': string;
  'qtAdmin.uploadTitle': string;
  'qtAdmin.uploadHint': string;
  'qtAdmin.previewBtn': string;
  'qtAdmin.previewing': string;
  'qtAdmin.importBtn': string;
  'qtAdmin.importing': string;
  'qtAdmin.resetBtn': string;
  'qtAdmin.previewTitle': string;
  'qtAdmin.saveBtn': string;
  'qtAdmin.saving': string;
  'qtAdmin.saved': string;
  'qtAdmin.scriptureRef': string;
  'qtAdmin.scriptureText': string;
  'qtAdmin.commentary': string;
  'qtAdmin.hymn': string;
  'qtAdmin.usageTitle': string;
  'qtAdmin.usage1': string;
  'qtAdmin.usage2': string;
  'qtAdmin.usage3': string;
  'qtAdmin.usage4': string;
  'qtAdmin.usage5': string;
  'qtAdmin.checkingAuth': string;
  'qtAdmin.noPermission': string;
  'qtAdmin.noPermissionHint': string;
  'qtAdmin.backHome': string;
}

export const zh: Translations = {
  // NavBar
  'nav.logo': '圣经灵修',
  'nav.messages': '私信',
  'nav.profile': '个人中心',
  'nav.logout': '退出登录',
  'nav.login': '登录',
  'nav.register': '注册',
  'nav.openMenu': '打开菜单',
  'nav.user': '用户',
  'nav.qtAdmin': 'QT 管理',

  // Layout
  'layout.banner': '亲爱的小羊们，这里的所有话语只提供参考，我们跟神的关系还是取决于各自的祷告和圣灵的感动。',
  'layout.title': '圣经灵修 - 每日领受神的话语',
  'layout.description': '以经文随机领受、深度解经、灵修记录、信徒互动为核心的线上灵修平台',

  // Login
  'login.title': '登录',
  'login.email': '邮箱',
  'login.password': '密码',
  'login.submit': '登录',
  'login.submitting': '登录中...',
  'login.fail': '登录失败',
  'login.noAccount': '还没有账号？',
  'login.registerNow': '立即注册',

  // Register
  'register.title': '注册',
  'register.username': '用户名',
  'register.email': '邮箱',
  'register.getCode': '获取验证码',
  'register.codeSent': '已发送',
  'register.verificationCode': '验证码',
  'register.password': '密码',
  'register.confirmPassword': '确认密码',
  'register.submit': '注册',
  'register.submitting': '注册中...',
  'register.codeSentMsg': '验证码已发送至您的邮箱，请注意查收',
  'register.codeAutoFilled': '验证码已自动填入，请查看上方输入框',
  'register.sendCodeFail': '发送验证码失败',
  'register.registerFail': '注册失败',
  'register.hasAccount': '已有账号？',
  'register.loginNow': '立即登录',

  // Homepage
  'home.heroTitle': '每日领受神的话语',
  'home.heroSubtitle': '随机生成经文，安静默想，深度解经',
  'home.cardDailyThought': '今日随想',
  'home.cardDailyThoughtDesc': '记录灵修感动',
  'home.cardBibleMaps': '圣经地图',
  'home.cardBibleMapsDesc': '探索圣经历史路线',
  'home.cardQtShare': 'QT分享',
  'home.cardQtShareDesc': '每日灵修经文默想',
  'home.cardContact': '联系牧者',
  'home.cardContactDesc': '寻求牧养帮助',
  'home.checkingAuth': '正在确认登录状态...',
  'home.generateFail': '生成失败，请先登录',
  'home.generatingScripture': '正在生成经文...',
  'home.verse1': '1节',
  'home.verse7': '7节',
  'home.verse12': '12节',
  'home.verse27': '27节',
  'home.verse39': '39节',
  'home.chapterFull': '整一章',
  'home.exegesisFail': '获取解经失败',
  'home.startExegesis': '开始解经',
  'home.exegesisTitle': '精读解经',
  'home.exegesisSection.summary': '经文摘要',
  'home.exegesisSection.originalText': '原文翻译与注释',
  'home.exegesisSection.verseByVerse': '逐节解析',
  'home.exegesisSection.historicalBg': '历史背景',
  'home.exegesisSection.writingBg': '写作背景',
  'home.exegesisSection.context': '上下文关系',
  'home.exegesisSection.keywords': '关键词解析',
  'home.exegesisSection.canonical': '在整本圣经中的位置',
  'home.exegesisSection.theological': '神学主题',
  'home.exegesisSection.truth': '神对世人的启示',
  'home.exegesisSection.application': '对当代信徒的提醒',
  'home.regenerate': '重新生成',
  'home.chapterLabel': '章',
  'home.verseLabel': '节',
  'home.generationTypes': {
    'verse_1': '1节',
    'verse_7': '7节',
    'verse_12': '12节',
    'verse_27': '27节',
    'verse_39': '39节',
    'chapter_full': '整一章',
  },
  'home.getExegesis': '获取深度解经',
  'home.exegesisLoading': '解经正在生成中，请稍候...',
  'home.exegesisError': '解经生成失败，请稍后再试',
  'home.exegesisPanel.title': 'AI 深度解经',
  'home.exegesisPanel.historicalBackground': '历史背景',
  'home.exegesisPanel.exegesis': '经文解读',
  'home.exegesisPanel.application': '生活应用',
  'home.exegesisPanel.languageInsights': '原文亮光',
  'home.exegesisPanel.imageRevelation': '图像启示',
  'home.exegesisPanel.studyQuestions': '思考问题',
  'home.exegesisPanel.prayerGuide': '祷告引导',
  'home.exegesisPanel.verseByVerse': '逐节注释',
  'home.exegesisPanel.keywords': '关键词解析',
  'home.reflection.title': '灵修记录',
  'home.reflection.sectionTitle': '写下你的感悟',
  'home.reflection.titlePlaceholder': '标题（选填）',
  'home.reflection.contentPlaceholder': '分享你对这段经文的感动、理解和应用...',
  'home.reflection.saveBtn': '保存感悟',
  'home.reflection.saving': '保存中...',
  'home.reflection.saved': '感悟已保存',
  'home.reflection.savedHint': '你可以在个人中心查看你的灵修记录',
  'home.reflection.gotoProfile': '前往个人中心',
  'home.reflection.edit': '修改这篇感悟',
  'home.reflection.delete': '删除这篇感悟',
  'home.reflection.visibility': '可见范围',
  'home.reflection.visibilityPublic': '公开',
  'home.reflection.visibilityPrivate': '仅自己',
  'home.reflection.deleting': '删除中...',
  'home.reflection.deleteConfirm': '确定要删除这条灵修记录吗？',
  'home.reflection.saveFail': '保存失败，请稍后再试',
  'home.reflection.deleteFail': '删除失败，请稍后再试',
  'home.praise.title': '赞美诗歌',
  'home.praise.loading': '加载中...',
  'home.praise.randomPlay': '随机播放',
  'home.praise.switchSong': '换一首',
  'home.praise.fetchFail': '获取赞美歌曲失败',
  'home.praise.audioError': '音频加载失败，请尝试其他歌曲',
  'home.praise.previous': '上一首',
  'home.praise.next': '下一首',
  'home.praise.play': '播放',
  'home.praise.pause': '暂停',
  'home.praise.noAudio': '暂无音频资源',
  'home.praise.external': '去官方平台收听',
  'home.praise.viewLyrics': '查看歌词',
  'home.praise.hideLyrics': '收起歌词',
  'home.contact.title': '联系牧者',
  'home.contact.ok': '好的',
  'home.contact.open': '联系牧者',
  'home.contact.name': '姓名（可化名）',
  'home.contact.namePlaceholder': '请输入姓名或化名',
  'home.contact.gender': '性别',
  'home.contact.genderMale': '男',
  'home.contact.genderFemale': '女',
  'home.contact.wechat': '微信名',
  'home.contact.wechatPlaceholder': '请输入微信名',
  'home.contact.phone': '手机号',
  'home.contact.phonePlaceholder': '请输入手机号',
  'home.contact.email': '邮箱',
  'home.contact.emailPlaceholder': '请输入邮箱',
  'home.contact.location': '当前居住地',
  'home.contact.locationPlaceholder': '请输入当前居住地',
  'home.contact.question': '你想询问牧者的问题',
  'home.contact.questionPlaceholder': '请写下你的问题或代祷事项...',
  'home.contact.submit': '提交',
  'home.contact.submitting': '提交中...',
  'home.contact.success': '你的信息已成功发送给牧者，我们会尽快与你联系！',
  'home.contact.submitFail': '提交失败，请稍后再试',
  'home.contact.close': '关闭',
  'home.qtLink': 'QT 每日灵修',
  'home.dailyThoughtLink': '今日随想',
  'home.bibleMapsLink': '圣经地图',
  'home.scriptureReader.title': '经文阅读',
  'home.scriptureReader.loading': '加载中...',
  'home.scriptureReader.searchPlaceholder': '搜索经文关键词...',
  'home.scriptureReader.book': '书卷',
  'home.scriptureReader.chapter': '章节',
  'home.scriptureReader.noResult': '未找到相关经文',
  'home.annotation.highlight': '标注',
  'home.annotation.note': '笔记',
  'home.annotation.save': '保存',

  // Profile
  'profile.title': '个人中心',
  'profile.subtitle': '查看你的灵修记录、划线默想与收藏',
  'profile.auth.checking': '正在确认登录状态...',
  'profile.tabs.reflections': '灵修感悟',
  'profile.tabs.annotations': '划线/默想',
  'profile.tabs.bookmarks': '收藏经文',
  'profile.reflections.loading': '正在加载灵修记录...',
  'profile.reflections.fetchError': '获取灵修记录失败',
  'profile.reflections.empty': '暂无灵修记录，先去首页生成经文并写下感悟吧',
  'profile.reflections.count': '条感悟',
  'profile.annotations.loading': '正在加载划线默想...',
  'profile.annotations.fetchError': '获取标注失败',
  'profile.annotations.empty': '暂无划线默想，去首页生成经文后划选经文写下你的默想吧',
  'profile.visibility.public': '公开',
  'profile.visibility.private': '仅自己可见',
  'profile.bookmarks.loading': '正在加载收藏...',
  'profile.bookmarks.fetchError': '获取收藏失败',
  'profile.bookmarks.empty': '暂无收藏经文，去首页生成经文后点击收藏吧',
  'profile.bookmarks.chapterVerse': '第{chapter}章 第{verse}节',
  'profile.back': '返回首页',
  'profile.prevPage': '上一页',
  'profile.nextPage': '下一页',
  'profile.pageLabel': '第{page}页',
  'profile.bookmarks.loadingVerses': '正在加载经文...',
  'profile.bookmarks.loadVersesFail': '加载经文失败',
  'profile.bookmarks.clickToView': '点击查看整章经文',

  // Messages
  'messages.title': '私信',
  'messages.subtitle': '与主内肢体彼此劝勉、互相鼓励',
  'messages.back': '返回首页',
  'messages.checkingAuth': '正在确认登录状态...',
  'messages.loading': '加载中...',
  'messages.loadFail': '加载私信列表失败',
  'messages.noSessions': '暂无私信会话',
  'messages.noSessionsHint': '在首页生成经文后，划选经文写下公开默想，即可与有相同感动的肢体建立私信连接。',
  'messages.goGenerate': '去生成经文',
  'messages.canStartChat': '可以开始说话了，愿你们在主里彼此鼓励。',
  'messages.close': '关闭',
  'messages.inputPlaceholder': '输入消息...',
  'messages.send': '发送',
  'messages.sending': '发送中...',
  'messages.sendFail': '发送失败',
  'messages.you': '你',

  // Chat Modal
  'chat.initFail': '初始化私信失败',
  'chat.sendFail': '发送失败',
  'chat.commonScripture': '共同感动经文',
  'chat.close': '关闭',
  'chat.checkingPermission': '正在检查私信权限...',
  'chat.cannotChat': '暂不能发送私信',
  'chat.needMoreCommon': '你们共同划线有感动的经文还需 {need} 条，达到 {required} 条后即可交流。',
  'chat.canStart': '可以开始说话了，愿你们在主里彼此鼓励。',
  'chat.inputPlaceholder': '输入消息...',
  'chat.send': '发送',

  // Scripture Reader
  'reader.loadAnnotationFail': '加载标注失败',
  'reader.bookmarkFail': '收藏失败',
  'reader.saveAnnotationFail': '保存标注失败',
  'reader.loadingAnnotations': '正在加载标注...',
  'reader.meditationOf': '{name} 的默想：',
  'reader.publicMeditation': '公开默想',
  'reader.annotate': '划线/默想',
  'reader.bookmark': '收藏',
  'reader.addMeditation': '添加默想',
  'reader.meditationPlaceholder': '写下你对这段经文的默想...',
  'reader.visibilityPrivate': '仅自己可见',
  'reader.visibilityPublic': '公开给他人',
  'reader.cancel': '取消',
  'reader.saving': '保存中...',
  'reader.save': '保存',

  // Hebrew Text
  'hebrew.playFail': '播放失败，请重试',
  'hebrew.voiceUnavailable': '语音服务暂不可用',
  'hebrew.voiceTimeout': '语音加载超时',
  'hebrew.hebrew': '希伯来语',
  'hebrew.greek': '希腊语',
  'hebrew.pronunciation': '发音：',
  'hebrew.playPronunciation': '播放{label}发音',

  // Maps (extra)
  'maps.scripture': '经文',
  'maps.meaning': '意义',

  // QT Admin (extra)
  'qtAdmin.recognizeFail': '识别失败，请重试',
  'qtAdmin.importSuccess': '导入成功',
  'qtAdmin.importFail': '导入失败，请重试',
  'qtAdmin.savedToDb': '已保存到数据库',
  'qtAdmin.saveFail': '保存失败',
  'qtAdmin.previewAlt': '预览',
  'qtAdmin.clickToSelect': '点击选择图片',
  'qtAdmin.supportedFormats': '支持 JPG / PNG / WebP',
  'qtAdmin.recognizingHint': '正在识别图片内容，OCR + AI 解析可能需要 10-30 秒，请耐心等待...',

  // QT Share (extra)
  'qt.yearUnit': '年',
  'qt.monthUnit': '月',
  'qt.dayUnit': '日',
  'qt.sunday': '主日',
  'qt.monday': '礼拜一',
  'qt.tuesday': '礼拜二',
  'qt.wednesday': '礼拜三',
  'qt.thursday': '礼拜四',
  'qt.friday': '礼拜五',
  'qt.saturday': '礼拜六',

  // Maps
  'maps.loading': '地图加载中...',
  'maps.route.abraham': '亚伯拉罕迁往迦南',
  'maps.route.abrahamDesc': '亚伯拉罕回应神呼召，从吾珥经哈兰进入迦南地，并在示剑、伯特利、希伯仑、别是巴等地筑坛。',
  'maps.route.jacob': '雅各往返巴旦亚兰',
  'maps.route.jacobDesc': '雅各为逃避以扫，从别是巴前往哈兰；二十年后携家眷返回，在毗努伊勒与神摔跤，被改名以色列。',
  'maps.route.joseph': '约瑟被卖到埃及',
  'maps.route.josephDesc': '约瑟从希伯仑被哥哥们卖到埃及，后成为埃及宰相，父亲雅各全家下埃及定居歌珊地。',
  'maps.route.exodus': '摩西出埃及路线',
  'maps.route.exodusDesc': '以色列人出埃及、过红海、经旷野、至西奈山、漂流四十年，最终来到摩押平原预备进入迦南。',
  'maps.route.joshua': '约书亚征服迦南',
  'maps.route.joshuaDesc': '约书亚带领以色列人过约旦河、攻取耶利哥、艾城，在基遍大战五王，将迦南地分给各支派。',
  'maps.route.spies': '十二探子窥探迦南',
  'maps.route.spiesDesc': '摩西从加低斯·巴尼亚差遣十二探子窥探迦南地，从南地直到哈马口，四十天后回报。',
  'maps.route.david': '大卫逃避扫罗',
  'maps.route.davidDesc': '大卫从基比亚逃离扫罗的追杀，经挪伯、迦特、亚杜兰洞、隐基底等地，直躲避到非利士地。',
  'maps.route.elijah': '以利亚先知旅程',
  'maps.route.elijahDesc': '以利亚从基立溪到撒勒法，再到迦密山与巴力先知对垒，后逃避耶洗别至何烈山遇见神。',
  'maps.route.jesus_galilee': '耶稣加利利事工',
  'maps.route.jesus_galileeDesc': '耶稣在加利利地区的传道旅程：从拿撒勒到迦百农，走遍加利利各城各乡，医治、教导、传天国福音。',
  'maps.route.jesus_jerusalem': '耶稣最后上耶路撒冷',
  'maps.route.jesus_jerusalemDesc': '耶稣最后一次从加利利经过撒玛利亚、耶利哥上耶路撒冷，受难、复活、升天。',
  'maps.route.jesus_birth': '耶稣降生与逃亡',
  'maps.route.jesus_birthDesc': '天使向马利亚报喜，耶稣在伯利恒降生，约瑟带全家逃往埃及躲避希律，后返回拿撒勒。',
  'maps.route.paul_1st': '保罗第一次宣教旅程',
  'maps.route.paul_1stDesc': '保罗与巴拿巴从安提阿被差派，经塞浦路斯、旁非利亚、彼西底、以哥念、路司得、特庇，再返回安提阿。',
  'maps.route.paul_2nd': '保罗第二次宣教旅程',
  'maps.route.paul_2ndDesc': '保罗与西拉经小亚细亚内陆到特罗亚，渡海进入马其顿、希腊，在腓立比、帖撒罗尼迦、庇哩亚、雅典、哥林多等地建立教会。',
  'maps.route.paul_3rd': '保罗第三次宣教旅程',
  'maps.route.paul_3rdDesc': '保罗经加拉太、弗吕家到达以弗所，再经马其顿、希腊，最后从米利都经推罗、凯撒利亚上耶路撒冷。',
  'maps.route.paul_rome': '保罗被押往罗马',
  'maps.route.paul_romeDesc': '保罗从凯撒利亚被押解，乘船经西顿、每拉、克里特佳澳，遭遇船难后抵达马耳他，再经叙拉古、部丢利，最终到达罗马。',
  'maps.route.paul_conversion': '保罗归主与早期事奉',
  'maps.route.paul_conversionDesc': '扫罗在大马士革路上遇见复活主，归主后在大马士革和阿拉伯传道，后上耶路撒冷见使徒，再回大数。',
  'maps.route.peter': '彼得宣教旅程',
  'maps.route.peterDesc': '彼得从约帕到凯撒利亚，在哥尼流家中开启外邦人归主的大门；后往安提阿、巴比伦等地。',
  'maps.route.philip': '腓利传福音',
  'maps.route.philipDesc': '腓利在撒玛利亚城传道，后被圣灵引领到旷野路上向埃提阿伯太监讲解以赛亚书，领他受洗。',
  'maps.route.revelation_churches': '启示录七教会',
  'maps.route.revelation_churchesDesc': '使徒约翰在拔摩海岛领受启示，写信给亚细亚的七个教会：以弗所、士每拿、别迦摩、推雅推喇、撒狄、非拉铁非、老底嘉。',
  'maps.route.ruth': '路得与拿俄米',
  'maps.route.ruthDesc': '路得随拿俄米从摩押地回到伯利恒，在波阿斯的田间拾麦穗，后嫁给波阿斯，成为大卫的曾祖母。',
  'maps.route.ark': '约柜被掳与归还',
  'maps.route.arkDesc': '非利士人掳走约柜，从以便以谢运到亚实突、迦特、以革伦，因遭遇灾祸而归还，运到伯示麦后安置在基列耶琳。',
  'maps.route.solomon': '所罗门建殿',
  'maps.route.solomonDesc': '所罗门王在耶路撒冷建造圣殿，从推罗运来香柏木、从约帕运上岸，历经七年建成。',
  'maps.route.ezra_return': '以斯拉归回',
  'maps.route.ezra_returnDesc': '以斯拉带领第二批被掳犹太人从巴比伦经四个月长途跋涉归回耶路撒冷，重建圣殿。',
  'maps.route.nehemiah': '尼希米重建城墙',
  'maps.route.nehemiahDesc': '尼希米从书珊城得亚达薛西王准许，返回耶路撒冷修建城墙，带领百姓五十二天完工。',
  'maps.route.jonah': '约拿逃避与顺服',
  'maps.route.jonahDesc': '约拿从约帕上船逃往他施，被大鱼吞下三天三夜；后顺服去尼尼微传道，全城悔改。',
  'maps.route.isaac': '以撒在应许之地',
  'maps.route.isaacDesc': '以撒在别是巴、基拉耳等地寄居，在非利士人中挖井，神赐福他百倍收成。',
  'maps.route.gideon': '基甸击败米甸人',
  'maps.route.gideonDesc': '基甸在俄弗拉蒙召，带领三百勇士在哈律泉旁击败米甸大军，追赶至约旦河东。',
  'maps.route.samson': '参孙与非利士人',
  'maps.route.samsonDesc': '参孙在亭拿、迦萨等地与非利士人争战，用驴腮骨击杀千人，最后在迦萨推倒庙柱。',
  'maps.route.samuel': '撒母耳巡行审判',
  'maps.route.samuelDesc': '撒母耳每年巡行到伯特利、吉甲、米斯巴审判以色列人，最后回到拉玛居住。',
  'maps.tip': '提示：坐标为近似值，仅用于辅助读经，不代表考古定论。',
  'maps.searchPlaceholder': '搜索圣经地点...',
  'maps.search': '搜索',
  'maps.searchLabel': '搜索地名',
  'maps.routes': '路线',
  'maps.allRoutes': '全部路线',
  'maps.routeLabel': '选择路线',

  // Daily Thought
  'thought.title': '今日随想',
  'thought.subtitle': '写下今天的感悟、挣扎或感恩，让神的话语回应你的心',
  'thought.history': '历史记录',
  'thought.back': '返回主页面',
  'thought.checkingAuth': '正在确认登录状态...',
  'thought.label': '今日随想',
  'thought.placeholder': '今天发生了什么？你有什么感受、困惑、感恩或祷告...',
  'thought.generate': '神可能想对你说：',
  'thought.generating': '神的话语正在预备中...',
  'thought.generateFail': '生成失败，请稍后再试',
  'thought.pastoralResponse': '牧养回应',
  'thought.divineWord': '神赐下的话语',
  'thought.hymn': '诗歌',
  'thought.scriptures': '相关经文',
  'thought.relevance': '关联度',
  'thought.save': '保存记录',
  'thought.saving': '保存中...',
  'thought.saved': '已保存',
  'thought.saveFail': '保存失败，请稍后再试',

  // Daily Thought History
  'thoughtHistory.title': '历史记录',
  'thoughtHistory.subtitle': '回顾神曾经借着随想对你说的话',
  'thoughtHistory.back': '返回今日随想',
  'thoughtHistory.home': '回首页',
  'thoughtHistory.checkingAuth': '正在确认登录状态...',
  'thoughtHistory.loading': '正在加载历史记录...',
  'thoughtHistory.loadFail': '获取历史记录失败',
  'thoughtHistory.empty': '暂无历史记录，先去写一篇今日随想吧',
  'thoughtHistory.pastoralResponse': '牧养回应',
  'thoughtHistory.divineWord': '神赐下的话语',
  'thoughtHistory.hymn': '诗歌',
  'thoughtHistory.scriptures': '相关经文',
  'thoughtHistory.relevance': '关联度',

  // QT Share
  'qt.qtTitle': 'QT 灵修',
  'qt.history': '历史',
  'qt.back': '返回',
  'qt.meditationEssay': '默想散文',
  'qt.scriptureExplain': '经文解释',
  'qt.todayHymn': '今日诗歌 · 真神之爱',
  'qt.scripture': '今日经文',
  'qt.meditation': '默想',
  'qt.myResponse': '我的灵修回应',
  'qt.meditationLabel': '默想',
  'qt.meditationPlaceholder': '这段经文让我想到...',
  'qt.applyLabel': '应用',
  'qt.applyPlaceholder': '我今天要如何活出这段经文...',
  'qt.prayerLabel': '祷告',
  'qt.prayerPlaceholder': '主啊，求你帮助我...',
  'qt.photoLabel': '照片（可选）',
  'qt.uploading': '上传中',
  'qt.image': '图片',
  'qt.saveBtn': '保存回应',
  'qt.saving': '保存中...',
  'qt.saved': '已保存',
  'qt.edit': '修改',
  'qt.delete': '删除',
  'qt.deleting': '删除中...',
  'qt.saveSuccess': '保存成功',
  'qt.community': '社区灵修分享',
  'qt.viewShares': '查看分享',
  'qt.loading': '加载中...',
  'qt.loadHint': '点击「查看分享」加载今日其他信徒的灵修回应',
  'qt.myBookmarks': '我的收藏',
  'qt.removeBookmark': '删除',
  'qt.highlight': '划线默想',
  'qt.bookmark': '收藏',
  'qt.copy': '复制',
  'qt.copied': '已复制到剪贴板',
  'qt.loadingContent': '正在加载今日灵修...',
  'qt.noContent': '暂无今日灵修内容',
  'qt.contactAdmin': '请联系管理员上传今日灵修内容',
  'qt.checkingAuth': '正在确认登录状态...',
  'qt.deleteConfirm': '确定要删除您的灵修回应吗？此操作不可撤销。',
  'qt.saveFail': '保存失败，请稍后再试',
  'qt.deleteFail': '删除失败，请稍后再试',
  'qt.brotherSister': '弟兄/姊妹',
  'qt.selectDate': '选择日期',
  'qt.confirm': '确定',
  'qt.goToday': '今天',

  // QT History
  'qtHistory.title': 'QT 历史记录',
  'qtHistory.subtitle': '过往灵修足迹',
  'qtHistory.back': '返回 QT 分享',
  'qtHistory.checkingAuth': '正在确认登录状态...',
  'qtHistory.loading': '加载中...',
  'qtHistory.noRecords': '暂无灵修记录',
  'qtHistory.responded': '已回应',
  'qtHistory.notResponded': '未回应',
  'qtHistory.meditation': '默想',
  'qtHistory.application': '应用',
  'qtHistory.prayer': '祷告',
  'qtHistory.byUser': '按用户名',
  'qtHistory.byTime': '按时间',
  'qtHistory.responsesCount': '条回应',
  'qtHistory.peopleCount': '人回应',
  'qtHistory.me': '我',
  'qtHistory.today': '今日',
  'qtHistory.photo': '照片',
  'qtHistory.edit': '修改',
  'qtHistory.delete': '删除',
  'qtHistory.deleting': '删除中...',
  'qtHistory.save': '保存',
  'qtHistory.saving': '保存中...',
  'qtHistory.cancel': '取消',
  'qtHistory.prevPage': '上一页',
  'qtHistory.nextPage': '下一页',
  'qtHistory.pageInfo': '第 {cur} / {total} 页（共 {count} 个日期）',
  'qtHistory.totalDates': '共 {count} 个日期',
  'qtHistory.deleteConfirm': '确定删除 {date} 的回应吗？此操作不可撤销。',
  'qtHistory.loadFail': '加载失败',
  'qtHistory.saveFail': '保存失败',
  'qtHistory.deleteFail': '删除失败',
  'qtHistory.defaultUser': '用户',

  // QT Admin
  'qtAdmin.title': 'QT 灵修内容管理',
  'qtAdmin.back': '返回',
  'qtAdmin.uploadTitle': '上传灵修图片',
  'qtAdmin.uploadHint': '上传每日灵修图片，系统将自动识别内容并导入到对应日期',
  'qtAdmin.previewBtn': '先预览识别结果',
  'qtAdmin.previewing': '识别中...',
  'qtAdmin.importBtn': '直接识别并导入',
  'qtAdmin.importing': '识别并导入中...',
  'qtAdmin.resetBtn': '重置',
  'qtAdmin.previewTitle': '识别结果预览',
  'qtAdmin.saveBtn': '确认并保存',
  'qtAdmin.saving': '保存中...',
  'qtAdmin.saved': '已保存',
  'qtAdmin.scriptureRef': '经文出处',
  'qtAdmin.scriptureText': '经文正文',
  'qtAdmin.commentary': '注释/默想',
  'qtAdmin.hymn': '诗歌',
  'qtAdmin.usageTitle': '使用说明',
  'qtAdmin.usage1': '1. 上传灵修图片（支持 JPG/PNG，建议小于 10MB）',
  'qtAdmin.usage2': '2. 可先预览识别结果，确认无误后再保存',
  'qtAdmin.usage3': '3. 也可直接识别并导入到对应日期',
  'qtAdmin.usage4': '4. 系统会自动识别图片中的经文、注释、诗歌等内容',
  'qtAdmin.usage5': '5. 识别结果可手动编辑修正后再保存',
  'qtAdmin.checkingAuth': '正在验证权限...',
  'qtAdmin.noPermission': '无权限访问',
  'qtAdmin.noPermissionHint': '此页面仅限管理员使用',
  'qtAdmin.backHome': '返回首页',
};

export const ko: Translations = {
  // NavBar
  'nav.logo': '성경 묵상',
  'nav.messages': '메시지',
  'nav.profile': '프로필',
  'nav.logout': '로그아웃',
  'nav.login': '로그인',
  'nav.register': '가입하기',
  'nav.openMenu': '메뉴 열기',
  'nav.user': '사용자',
  'nav.qtAdmin': 'QT 관리',

  // Layout
  'layout.banner': '사랑하는 어린 양들아, 여기 모든 말씀은 참고용일 뿐이란다. 하나님과의 관계는 각자의 기도와 성령의 감동에 달려 있음을 기억하렴.',
  'layout.title': '성경 묵상 - 매일 하나님의 말씀을 받는 묵상 플랫폼',
  'layout.description': '성경 말씀 묵상, 깊이 있는 해설, 묵상 기록, 성도 간 교제를 위한 온라인 묵상 플랫폼',

  // Login
  'login.title': '로그인',
  'login.email': '이메일',
  'login.password': '비밀번호',
  'login.submit': '로그인',
  'login.submitting': '로그인 중...',
  'login.fail': '로그인 실패',
  'login.noAccount': '계정이 없으신가요?',
  'login.registerNow': '회원가입',

  // Register
  'register.title': '회원가입',
  'register.username': '사용자 이름',
  'register.email': '이메일',
  'register.getCode': '인증번호 받기',
  'register.codeSent': '발송됨',
  'register.verificationCode': '인증번호',
  'register.password': '비밀번호',
  'register.confirmPassword': '비밀번호 확인',
  'register.submit': '가입하기',
  'register.submitting': '가입 중...',
  'register.codeSentMsg': '인증번호가 이메일로 발송되었습니다. 확인해 주세요',
  'register.codeAutoFilled': '인증번호가 자동 입력되었습니다. 위 입력창을 확인하세요',
  'register.sendCodeFail': '인증번호 발송 실패',
  'register.registerFail': '회원가입 실패',
  'register.hasAccount': '이미 계정이 있으신가요?',
  'register.loginNow': '로그인',

  // Homepage
  'home.heroTitle': '매일 하나님의 말씀을 받다',
  'home.heroSubtitle': '무작위 말씀 생성, 조용한 묵상, 깊은 해설',
  'home.cardDailyThought': '오늘의 묵상',
  'home.cardDailyThoughtDesc': '묵상 기록하기',
  'home.cardBibleMaps': '성경 지도',
  'home.cardBibleMapsDesc': '성경 역사 탐험',
  'home.cardQtShare': 'QT 나눔',
  'home.cardQtShareDesc': '매일 말씀 묵상',
  'home.cardContact': '목회자에게 문의',
  'home.cardContactDesc': '도움 요청하기',
  'home.checkingAuth': '로그인 상태 확인 중...',
  'home.generateFail': '생성 실패. 먼저 로그인해 주세요',
  'home.generatingScripture': '말씀을 생성하는 중...',
  'home.verse1': '1절',
  'home.verse7': '7절',
  'home.verse12': '12절',
  'home.verse27': '27절',
  'home.verse39': '39절',
  'home.chapterFull': '한 장 전체',
  'home.exegesisFail': '해설을 불러오지 못했습니다',
  'home.startExegesis': '해설 시작',
  'home.exegesisTitle': '정밀 해설',
  'home.exegesisSection.summary': '말씀 요약',
  'home.exegesisSection.originalText': '원어 번역과 주석',
  'home.exegesisSection.verseByVerse': '구절별 해석',
  'home.exegesisSection.historicalBg': '역사적 배경',
  'home.exegesisSection.writingBg': '저작 배경',
  'home.exegesisSection.context': '문맥 관계',
  'home.exegesisSection.keywords': '핵심 단어',
  'home.exegesisSection.canonical': '성경 전체에서의 위치',
  'home.exegesisSection.theological': '신학적 주제',
  'home.exegesisSection.truth': '하나님이 세상에 주시는 계시',
  'home.exegesisSection.application': '현대 성도들을 위한 교훈',
  'home.regenerate': '다시 생성',
  'home.chapterLabel': '장',
  'home.verseLabel': '절',
  'home.generationTypes': {
    'verse_1': '1절',
    'verse_7': '7절',
    'verse_12': '12절',
    'verse_27': '27절',
    'verse_39': '39절',
    'chapter_full': '한 장 전체',
  },
  'home.getExegesis': '깊이 있는 해설 보기',
  'home.exegesisLoading': '해설을 생성하는 중입니다. 잠시만 기다려 주세요...',
  'home.exegesisError': '해설 생성에 실패했습니다. 다시 시도해 주세요',
  'home.exegesisPanel.title': 'AI 성경 해설',
  'home.exegesisPanel.historicalBackground': '역사적 배경',
  'home.exegesisPanel.exegesis': '본문 해석',
  'home.exegesisPanel.application': '삶의 적용',
  'home.exegesisPanel.languageInsights': '원어 묵상',
  'home.exegesisPanel.imageRevelation': '이미지 묵상',
  'home.exegesisPanel.studyQuestions': '묵상 질문',
  'home.exegesisPanel.prayerGuide': '기도 인도',
  'home.exegesisPanel.verseByVerse': '구절별 주석',
  'home.exegesisPanel.keywords': '핵심 단어',
  'home.reflection.title': '묵상 기록',
  'home.reflection.sectionTitle': '묵상 적기',
  'home.reflection.titlePlaceholder': '제목 (선택)',
  'home.reflection.contentPlaceholder': '이 말씀에 대한 감동과 적용을 나누어 보세요...',
  'home.reflection.saveBtn': '묵상 저장',
  'home.reflection.saving': '저장 중...',
  'home.reflection.saved': '저장되었습니다',
  'home.reflection.savedHint': '프로필에서 묵상 기록을 확인할 수 있습니다',
  'home.reflection.gotoProfile': '프로필로 가기',
  'home.reflection.edit': '수정',
  'home.reflection.delete': '삭제',
  'home.reflection.visibility': '공개 범위',
  'home.reflection.visibilityPublic': '전체 공개',
  'home.reflection.visibilityPrivate': '나만 보기',
  'home.reflection.deleting': '삭제 중...',
  'home.reflection.deleteConfirm': '이 묵상 기록을 삭제하시겠습니까?',
  'home.reflection.saveFail': '저장에 실패했습니다. 다시 시도해 주세요',
  'home.reflection.deleteFail': '삭제에 실패했습니다. 다시 시도해 주세요',
  'home.praise.title': '찬양',
  'home.praise.loading': '로딩 중...',
  'home.praise.randomPlay': '무작위 재생',
  'home.praise.switchSong': '다른 곡',
  'home.praise.fetchFail': '찬양을 불러오지 못했습니다',
  'home.praise.audioError': '오디오 로딩 실패, 다른 곡을 시도해 보세요',
  'home.praise.previous': '이전 곡',
  'home.praise.next': '다음 곡',
  'home.praise.play': '재생',
  'home.praise.pause': '일시정지',
  'home.praise.noAudio': '오디오가 없습니다',
  'home.praise.external': '공식 플랫폼에서 듣기',
  'home.praise.viewLyrics': '가사 보기',
  'home.praise.hideLyrics': '가사 닫기',
  'home.contact.title': '목회자에게 문의',
  'home.contact.ok': '확인',
  'home.contact.open': '목회자에게 문의',
  'home.contact.name': '이름 (익명 가능)',
  'home.contact.namePlaceholder': '이름 또는 별명을 입력하세요',
  'home.contact.gender': '성별',
  'home.contact.genderMale': '남',
  'home.contact.genderFemale': '여',
  'home.contact.wechat': '위챗 ID',
  'home.contact.wechatPlaceholder': '위챗 ID를 입력하세요',
  'home.contact.phone': '전화번호',
  'home.contact.phonePlaceholder': '전화번호를 입력하세요',
  'home.contact.email': '이메일',
  'home.contact.emailPlaceholder': '이메일을 입력하세요',
  'home.contact.location': '거주 도시',
  'home.contact.locationPlaceholder': '거주 도시를 입력하세요',
  'home.contact.question': '목회자에게 묻고 싶은 내용',
  'home.contact.questionPlaceholder': '질문이나 기도 제목을 적어주세요...',
  'home.contact.submit': '제출',
  'home.contact.submitting': '제출 중...',
  'home.contact.success': '문의가 목회자에게 전달되었습니다. 곧 연락드리겠습니다!',
  'home.contact.submitFail': '제출에 실패했습니다. 다시 시도해 주세요',
  'home.contact.close': '닫기',
  'home.qtLink': 'QT 매일 묵상',
  'home.dailyThoughtLink': '오늘의 묵상',
  'home.bibleMapsLink': '성경 지도',
  'home.scriptureReader.title': '성경 읽기',
  'home.scriptureReader.loading': '로딩 중...',
  'home.scriptureReader.searchPlaceholder': '성경 구절 검색...',
  'home.scriptureReader.book': '책',
  'home.scriptureReader.chapter': '장',
  'home.scriptureReader.noResult': '검색 결과가 없습니다',
  'home.annotation.highlight': '밑줄',
  'home.annotation.note': '메모',
  'home.annotation.save': '저장',

  // Profile
  'profile.title': '프로필',
  'profile.subtitle': '묵상 기록, 밑줄 메모, 북마크를 확인하세요',
  'profile.auth.checking': '로그인 상태 확인 중...',
  'profile.tabs.reflections': '묵상 기록',
  'profile.tabs.annotations': '밑줄/묵상',
  'profile.tabs.bookmarks': '즐겨찾기 말씀',
  'profile.reflections.loading': '묵상 기록을 불러오는 중...',
  'profile.reflections.fetchError': '묵상 기록을 불러오지 못했습니다',
  'profile.reflections.empty': '묵상 기록이 없습니다. 먼저 말씀을 생성하고 묵상을 적어보세요',
  'profile.reflections.count': '개 묵상',
  'profile.annotations.loading': '밑줄/묵상을 불러오는 중...',
  'profile.annotations.fetchError': '주석을 불러오지 못했습니다',
  'profile.annotations.empty': '밑줄/묵상이 없습니다. 말씀을 생성한 후 밑줄을 긋고 묵상을 적어보세요',
  'profile.visibility.public': '공개',
  'profile.visibility.private': '나만 보기',
  'profile.bookmarks.loading': '북마크를 불러오는 중...',
  'profile.bookmarks.fetchError': '북마크를 불러오지 못했습니다',
  'profile.bookmarks.empty': '즐겨찾기 말씀이 없습니다. 말씀을 생성한 후 북마크해 보세요',
  'profile.bookmarks.chapterVerse': '제{chapter}장 제{verse}절',
  'profile.back': '홈으로',
  'profile.prevPage': '이전',
  'profile.nextPage': '다음',
  'profile.pageLabel': '{page}페이지',
  'profile.bookmarks.loadingVerses': '말씀을 불러오는 중...',
  'profile.bookmarks.loadVersesFail': '말씀을 불러오지 못했습니다',
  'profile.bookmarks.clickToView': '클릭하여 전체 장 말씀 보기',

  // Messages
  'messages.title': '메시지',
  'messages.subtitle': '믿음의 공동체 안에서 서로 권면하고 격려하세요',
  'messages.back': '홈으로',
  'messages.checkingAuth': '로그인 상태 확인 중...',
  'messages.loading': '로딩 중...',
  'messages.loadFail': '메시지 목록을 불러오지 못했습니다',
  'messages.noSessions': '메시지가 없습니다',
  'messages.noSessionsHint': '홈에서 말씀을 생성한 후, 말씀을 드래그하여 공개 묵상을 남기면 같은 감동을 받은 성도와 메시지를 주고받을 수 있습니다.',
  'messages.goGenerate': '말씀 생성하러 가기',
  'messages.canStartChat': '이제 대화를 시작할 수 있습니다. 주 안에서 서로 격려하세요.',
  'messages.close': '닫기',
  'messages.inputPlaceholder': '메시지를 입력하세요...',
  'messages.send': '보내기',
  'messages.sending': '보내는 중...',
  'messages.sendFail': '전송 실패',
  'messages.you': '나',

  // Chat Modal
  'chat.initFail': '메시지 초기화 실패',
  'chat.sendFail': '전송 실패',
  'chat.commonScripture': '공통 감동 말씀',
  'chat.close': '닫기',
  'chat.checkingPermission': '메시지 권한 확인 중...',
  'chat.cannotChat': '아직 메시지를 보낼 수 없습니다',
  'chat.needMoreCommon': '두 분이 함께 밑줄 그은 감동 말씀이 {need}개 더 필요합니다. {required}개에 도달하면 대화할 수 있습니다.',
  'chat.canStart': '이제 대화를 시작할 수 있습니다. 주 안에서 서로 격려하세요.',
  'chat.inputPlaceholder': '메시지를 입력하세요...',
  'chat.send': '보내기',

  // Scripture Reader
  'reader.loadAnnotationFail': '주석을 불러오지 못했습니다',
  'reader.bookmarkFail': '북마크 실패',
  'reader.saveAnnotationFail': '주석 저장 실패',
  'reader.loadingAnnotations': '주석을 불러오는 중...',
  'reader.meditationOf': '{name}님의 묵상:',
  'reader.publicMeditation': '공개 묵상',
  'reader.annotate': '밑줄/묵상',
  'reader.bookmark': '북마크',
  'reader.addMeditation': '묵상 추가',
  'reader.meditationPlaceholder': '이 말씀에 대한 묵상을 적어주세요...',
  'reader.visibilityPrivate': '나만 보기',
  'reader.visibilityPublic': '공개',
  'reader.cancel': '취소',
  'reader.saving': '저장 중...',
  'reader.save': '저장',

  // Hebrew Text
  'hebrew.playFail': '재생 실패, 다시 시도해 주세요',
  'hebrew.voiceUnavailable': '음성 서비스를 사용할 수 없습니다',
  'hebrew.voiceTimeout': '음성 로딩 시간 초과',
  'hebrew.hebrew': '히브리어',
  'hebrew.greek': '헬라어',
  'hebrew.pronunciation': '발음:',
  'hebrew.playPronunciation': '{label} 발음 재생',

  // Maps (extra)
  'maps.scripture': '성경',
  'maps.meaning': '의미',

  // QT Admin (extra)
  'qtAdmin.recognizeFail': '인식 실패, 다시 시도해 주세요',
  'qtAdmin.importSuccess': '가져오기 성공',
  'qtAdmin.importFail': '가져오기 실패, 다시 시도해 주세요',
  'qtAdmin.savedToDb': '데이터베이스에 저장되었습니다',
  'qtAdmin.saveFail': '저장 실패',
  'qtAdmin.previewAlt': '미리보기',
  'qtAdmin.clickToSelect': '이미지를 선택하려면 클릭하세요',
  'qtAdmin.supportedFormats': 'JPG / PNG / WebP 지원',
  'qtAdmin.recognizingHint': '이미지 내용을 인식하는 중입니다. OCR + AI 분석에 10-30초가 소요될 수 있으니 잠시만 기다려 주세요...',

  // QT Share (extra)
  'qt.yearUnit': '년',
  'qt.monthUnit': '월',
  'qt.dayUnit': '일',
  'qt.sunday': '주일',
  'qt.monday': '월요일',
  'qt.tuesday': '화요일',
  'qt.wednesday': '수요일',
  'qt.thursday': '목요일',
  'qt.friday': '금요일',
  'qt.saturday': '토요일',

  // Maps
  'maps.loading': '지도 로딩 중...',
  'maps.route.abraham': '아브라함의 가나안 이주',
  'maps.route.abrahamDesc': '아브라함이 하나님의 부르심에 응답하여 갈대아 우르에서 하란을 거쳐 가나안 땅으로 들어가 세겜, 벧엘, 헤브론, 브엘세바 등지에서 제단을 쌓았습니다.',
  'maps.route.jacob': '야곱의 밧단아람 왕복',
  'maps.route.jacobDesc': '야곱이 에서를 피해 브엘세바에서 하란으로 도망갔다가 20년 후 가족과 함께 돌아오며 브니엘에서 하나님과 씨름하고 이스라엘이라는 이름을 얻었습니다.',
  'maps.route.joseph': '요셉의 애굽 행적',
  'maps.route.josephDesc': '요셉이 형들에 의해 애굽으로 팔려갔다가 후에 애굽의 총리가 되었고, 아버지 야곱의 온 가족이 애굽 고센 땅에 정착했습니다.',
  'maps.route.exodus': '모세의 출애굽 경로',
  'maps.route.exodusDesc': '이스라엘 백성이 애굽을 떠나 홍해를 건너 광야를 지나 시내산에 이르고, 40년간 광야 생활 끝에 모압 평지에서 가나안 입성을 준비했습니다.',
  'maps.route.joshua': '여호수아의 가나안 정복',
  'maps.route.joshuaDesc': '여호수아가 이스라엘 백성을 이끌고 요단강을 건너 여리고와 아이성을 함락하고, 기브온에서 다섯 왕과 싸워 가나안 땅을 각 지파에게 분배했습니다.',
  'maps.route.spies': '열두 정탐꾼의 가나안 정탐',
  'maps.route.spiesDesc': '모세가 가데스바네아에서 열두 정탐꾼을 가나안 땅으로 보내어 남쪽 네게브에서 하맛 어귀까지 정탐하고 40일 만에 돌아왔습니다.',
  'maps.route.david': '다윗의 사울 피신',
  'maps.route.davidDesc': '다윗이 기브아에서 사울의 추격을 피해 놉, 가드, 아둘람 굴, 엔게디 등으로 도망치다가 결국 블레셋 땅까지 피신했습니다.',
  'maps.route.elijah': '엘리야의 예언자 여정',
  'maps.route.elijahDesc': '엘리야가 그릿 시냇가에서 사르밧 과부의 집으로, 갈멜산에서 바알 선지자들과 대결한 후 이세벨을 피해 호렙산에서 하나님을 만났습니다.',
  'maps.route.jesus_galilee': '예수님의 갈릴리 사역',
  'maps.route.jesus_galileeDesc': '예수님의 갈릴리 사역: 나사렛에서 가버나움으로 옮겨 갈릴리 각 성읍과 마을을 두루 다니시며 가르치시고 병을 고치시고 천국 복음을 전파하셨습니다.',
  'maps.route.jesus_jerusalem': '예수님의 마지막 예루살렘 행',
  'maps.route.jesus_jerusalemDesc': '예수님의 마지막 여정: 갈릴리에서 사마리아와 여리고를 거쳐 예루살렘으로 올라가셔서 고난 받으시고 부활 승천하셨습니다.',
  'maps.route.jesus_birth': '예수님의 탄생과 피난',
  'maps.route.jesus_birthDesc': '예수님은 베들레헴에서 탄생하셨고, 요셉이 헤롯을 피해 애굽으로 피신했다가 후에 나사렛으로 돌아왔습니다.',
  'maps.route.paul_1st': '바울의 제1차 선교 여행',
  'maps.route.paul_1stDesc': '바울과 바나바가 수리아 안디옥에서 파송되어 구브로, 밤빌리아, 비시디아, 이고니온, 루스드라, 더베를 거쳐 다시 안디옥으로 돌아왔습니다.',
  'maps.route.paul_2nd': '바울의 제2차 선교 여행',
  'maps.route.paul_2ndDesc': '바울과 실라가 소아시아 내륙을 거쳐 드로아에서 마게도냐와 헬라로 건너가 빌립보, 데살로니가, 베뢰아, 아덴, 고린도 등지에서 교회를 세웠습니다.',
  'maps.route.paul_3rd': '바울의 제3차 선교 여행',
  'maps.route.paul_3rdDesc': '바울이 갈라디아와 브루기아를 거쳐 에베소에 도착한 후 마게도냐와 헬라를 지나, 밀레도에서 두로와 가이사랴를 거쳐 예루살렘으로 올라갔습니다.',
  'maps.route.paul_rome': '바울의 로마 압송',
  'maps.route.paul_romeDesc': '바울이 가이사랴에서 호송되어 시돈, 무라, 그레데 미항을 거쳐 파선당한 후 멜리데(몰타)에 도착, 수라구사와 보디올을 거쳐 로마에 도착했습니다.',
  'maps.route.paul_conversion': '바울의 회심과 초기 사역',
  'maps.route.paul_conversionDesc': '사울이 다메섹 도상에서 부활하신 주님을 만나 회심한 후 다메섹과 아라비아에서 복음을 전하고, 예루살렘에서 사도들을 만난 뒤 다시 다소로 돌아갔습니다.',
  'maps.route.peter': '베드로의 선교 여정',
  'maps.route.peterDesc': '베드로가 욥바에서 가이사랴로 가서 고넬료의 집에서 이방인 선교의 문을 열었고, 이후 수리아 안디옥과 바벨론 등지에서 사역했습니다.',
  'maps.route.philip': '빌립의 복음 전파',
  'maps.route.philipDesc': '빌립이 사마리아 성에서 복음을 전파하고, 성령의 인도로 광야 길로 내려가 에디오피아 내시에게 이사야서를 풀이해 주고 세례를 베풀었습니다.',
  'maps.route.revelation_churches': '요한계시록의 일곱 교회',
  'maps.route.revelation_churchesDesc': '사도 요한이 밧모 섬에서 계시를 받고, 아시아의 일곱 교회에 편지를 보냈습니다.',
  'maps.route.ruth': '룻과 나오미',
  'maps.route.ruthDesc': '룻이 시어머니 나오미를 따라 모압에서 베들레헴으로 돌아와, 보아스의 밭에서 이삭을 줍다가 결혼하여 다윗 왕의 증조모가 되었습니다.',
  'maps.route.ark': '법궤의 피탈과 반환',
  'maps.route.arkDesc': '블레셋이 에벤에셀에서 법궤를 빼앗아 아스돗, 가드, 에그론으로 옮겼으나 재앙으로 인해 돌려보내 벧세메스를 거쳐 기럇여아림에 안치되었습니다.',
  'maps.route.solomon': '솔로몬의 성전 건축',
  'maps.route.solomonDesc': '솔로몬 왕이 예루살렘에 성전을 건축하며 두로에서 백향목을 들여와 7년 만에 완공했습니다.',
  'maps.route.ezra_return': '에스라의 귀환',
  'maps.route.ezra_returnDesc': '에스라가 바벨론에서 2차 포로 귀환으로 유대인들을 이끌고 4개월간의 긴 여정 끝에 예루살렘으로 돌아와 성전을 재건했습니다.',
  'maps.route.nehemiah': '느헤미야의 성벽 재건',
  'maps.route.nehemiahDesc': '느헤미야가 수산 궁에서 아닥사스다 왕의 허락을 받아 예루살렘으로 돌아와 52일 만에 성벽을 재건했습니다.',
  'maps.route.jonah': '요나의 도피와 순종',
  'maps.route.jonahDesc': '요나가 욥바에서 배를 타고 다시스로 도망가다가 큰 물고기에게 삼켜졌고, 사흘 후 니느웨로 가서 회개의 말씀을 전하자 온 성이 회개했습니다.',
  'maps.route.isaac': '이삭의 약속의 땅 생활',
  'maps.route.isaacDesc': '이삭이 브엘세바와 그랄 등지에서 우거하며 블레셋 땅에서 우물을 팠고, 하나님께서 그에게 백 배의 소출로 복 주셨습니다.',
  'maps.route.gideon': '기드온의 미디안 격퇴',
  'maps.route.gideonDesc': '기드온이 오브라에서 소명을 받고 300명의 용사로 하롯 샘 곁에서 미디안 대군을 무찌르고 요단 동편까지 추격했습니다.',
  'maps.route.samson': '삼손과 블레셋',
  'maps.route.samsonDesc': '삼손이 딤나와 가사 등지에서 블레셋과 싸우며 나귀 턱뼈로 천 명을 죽이고, 마지막으로 가사에서 다곤 신전 기둥을 무너뜨렸습니다.',
  'maps.route.samuel': '사무엘의 순회 재판',
  'maps.route.samuelDesc': '사무엘이 해마다 벧엘과 길갈과 미스바를 순회하며 이스라엘을 재판하고, 라마의 본집으로 돌아갔습니다.',
  'maps.tip': '안내: 좌표는 근사값이며 성경 읽기를 위한 참고용입니다. 고고학적 확정 위치가 아닙니다.',
  'maps.searchPlaceholder': '성경 장소 검색...',
  'maps.search': '검색',
  'maps.searchLabel': '장소 검색',
  'maps.routes': '경로',
  'maps.allRoutes': '전체 경로',
  'maps.routeLabel': '경로 선택',

  // Daily Thought
  'thought.title': '오늘의 묵상',
  'thought.subtitle': '오늘의 느낌, 고민, 감사를 적어보세요. 하나님의 말씀이 응답하실 것입니다',
  'thought.history': '기록 보기',
  'thought.back': '메인으로',
  'thought.checkingAuth': '로그인 상태 확인 중...',
  'thought.label': '오늘의 묵상',
  'thought.placeholder': '오늘 어떤 일이 있었나요? 느낌, 고민, 감사, 기도 제목...',
  'thought.generate': '하나님이 당신에게 하실 말씀:',
  'thought.generating': '하나님의 말씀을 준비하는 중...',
  'thought.generateFail': '생성에 실패했습니다. 다시 시도해 주세요',
  'thought.pastoralResponse': '목회적 응답',
  'thought.divineWord': '하나님이 주신 말씀',
  'thought.hymn': '찬송',
  'thought.scriptures': '관련 말씀',
  'thought.relevance': '연관도',
  'thought.save': '기록 저장',
  'thought.saving': '저장 중...',
  'thought.saved': '저장됨',
  'thought.saveFail': '저장에 실패했습니다. 다시 시도해 주세요',

  // Daily Thought History
  'thoughtHistory.title': '묵상 기록',
  'thoughtHistory.subtitle': '하나님이 묵상을 통해 주셨던 말씀들을 돌아보세요',
  'thoughtHistory.back': '오늘의 묵상으로',
  'thoughtHistory.home': '홈으로',
  'thoughtHistory.checkingAuth': '로그인 상태 확인 중...',
  'thoughtHistory.loading': '기록을 불러오는 중...',
  'thoughtHistory.loadFail': '기록을 불러오지 못했습니다',
  'thoughtHistory.empty': '아직 기록이 없습니다. 오늘의 묵상을 먼저 작성해 보세요',
  'thoughtHistory.pastoralResponse': '목회적 응답',
  'thoughtHistory.divineWord': '하나님이 주신 말씀',
  'thoughtHistory.hymn': '찬송',
  'thoughtHistory.scriptures': '관련 말씀',
  'thoughtHistory.relevance': '연관도',

  // QT Share
  'qt.qtTitle': 'QT 경건의 시간',
  'qt.history': '히스토리',
  'qt.back': '뒤로',
  'qt.meditationEssay': '묵상 산문',
  'qt.scriptureExplain': '성경 해설',
  'qt.todayHymn': '오늘의 찬송 · 하나님의 사랑',
  'qt.scripture': '오늘의 말씀',
  'qt.meditation': '묵상',
  'qt.myResponse': '나의 묵상 응답',
  'qt.meditationLabel': '묵상',
  'qt.meditationPlaceholder': '이 말씀을 통해 떠오른 생각...',
  'qt.applyLabel': '적용',
  'qt.applyPlaceholder': '오늘 내가 이 말씀을 어떻게 살아낼까...',
  'qt.prayerLabel': '기도',
  'qt.prayerPlaceholder': '주님, 도와주소서...',
  'qt.photoLabel': '사진 (선택)',
  'qt.uploading': '업로드 중',
  'qt.image': '사진',
  'qt.saveBtn': '응답 저장',
  'qt.saving': '저장 중...',
  'qt.saved': '저장됨',
  'qt.edit': '수정',
  'qt.delete': '삭제',
  'qt.deleting': '삭제 중...',
  'qt.saveSuccess': '저장 성공',
  'qt.community': '공동체 묵상 나눔',
  'qt.viewShares': '나눔 보기',
  'qt.loading': '로딩 중...',
  'qt.loadHint': '「나눔 보기」를 눌러 오늘 다른 성도들의 묵상 응답을 확인하세요',
  'qt.myBookmarks': '내 북마크',
  'qt.removeBookmark': '삭제',
  'qt.highlight': '밑줄 묵상',
  'qt.bookmark': '북마크',
  'qt.copy': '복사',
  'qt.copied': '클립보드에 복사됨',
  'qt.loadingContent': '오늘의 묵상을 불러오는 중...',
  'qt.noContent': '오늘의 묵상 콘텐츠가 없습니다',
  'qt.contactAdmin': '관리자에게 콘텐츠 업로드를 요청하세요',
  'qt.checkingAuth': '로그인 상태 확인 중...',
  'qt.deleteConfirm': '묵상 응답을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.',
  'qt.saveFail': '저장에 실패했습니다. 다시 시도해 주세요',
  'qt.deleteFail': '삭제에 실패했습니다. 다시 시도해 주세요',
  'qt.brotherSister': '형제/자매',
  'qt.selectDate': '날짜 선택',
  'qt.confirm': '확인',
  'qt.goToday': '오늘',

  // QT History
  'qtHistory.title': 'QT 기록',
  'qtHistory.subtitle': '지나온 묵상의 발자취',
  'qtHistory.back': 'QT 나눔으로',
  'qtHistory.checkingAuth': '로그인 상태 확인 중...',
  'qtHistory.loading': '로딩 중...',
  'qtHistory.noRecords': '묵상 기록이 없습니다',
  'qtHistory.responded': '응답함',
  'qtHistory.notResponded': '응답 없음',
  'qtHistory.meditation': '묵상',
  'qtHistory.application': '적용',
  'qtHistory.prayer': '기도',
  'qtHistory.byUser': '사용자별',
  'qtHistory.byTime': '날짜별',
  'qtHistory.responsesCount': '건 응답',
  'qtHistory.peopleCount': '명 응답',
  'qtHistory.me': '나',
  'qtHistory.today': '오늘',
  'qtHistory.photo': '사진',
  'qtHistory.edit': '수정',
  'qtHistory.delete': '삭제',
  'qtHistory.deleting': '삭제 중...',
  'qtHistory.save': '저장',
  'qtHistory.saving': '저장 중...',
  'qtHistory.cancel': '취소',
  'qtHistory.prevPage': '이전',
  'qtHistory.nextPage': '다음',
  'qtHistory.pageInfo': '{cur} / {total} 페이지 (총 {count}개 날짜)',
  'qtHistory.totalDates': '총 {count}개 날짜',
  'qtHistory.deleteConfirm': '{date} 의 응답을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.',
  'qtHistory.loadFail': '로딩 실패',
  'qtHistory.saveFail': '저장 실패',
  'qtHistory.deleteFail': '삭제 실패',
  'qtHistory.defaultUser': '사용자',

  // QT Admin
  'qtAdmin.title': 'QT 묵상 콘텐츠 관리',
  'qtAdmin.back': '뒤로',
  'qtAdmin.uploadTitle': '묵상 이미지 업로드',
  'qtAdmin.uploadHint': '매일 묵상 이미지를 업로드하면 시스템이 자동으로 인식하여 해당 날짜에 가져옵니다',
  'qtAdmin.previewBtn': '인식 결과 미리보기',
  'qtAdmin.previewing': '인식 중...',
  'qtAdmin.importBtn': '바로 인식 및 가져오기',
  'qtAdmin.importing': '인식 및 가져오는 중...',
  'qtAdmin.resetBtn': '초기화',
  'qtAdmin.previewTitle': '인식 결과 미리보기',
  'qtAdmin.saveBtn': '확인 및 저장',
  'qtAdmin.saving': '저장 중...',
  'qtAdmin.saved': '저장됨',
  'qtAdmin.scriptureRef': '성경 구절',
  'qtAdmin.scriptureText': '성경 본문',
  'qtAdmin.commentary': '주석/묵상',
  'qtAdmin.hymn': '찬송',
  'qtAdmin.usageTitle': '사용 안내',
  'qtAdmin.usage1': '1. 묵상 이미지 업로드 (JPG/PNG 지원, 10MB 이하 권장)',
  'qtAdmin.usage2': '2. 인식 결과를 미리보고 확인 후 저장할 수 있습니다',
  'qtAdmin.usage3': '3. 바로 인식하여 해당 날짜에 가져올 수도 있습니다',
  'qtAdmin.usage4': '4. 시스템이 이미지 속 성경, 주석, 찬송 등을 자동 인식합니다',
  'qtAdmin.usage5': '5. 인식 결과를 수동으로 수정한 후 저장할 수 있습니다',
  'qtAdmin.checkingAuth': '권한 확인 중...',
  'qtAdmin.noPermission': '접근 권한 없음',
  'qtAdmin.noPermissionHint': '이 페이지는 관리자 전용입니다',
  'qtAdmin.backHome': '홈으로',
};
