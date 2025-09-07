// TODO 7: Enhanced Language Support System
// Comprehensive multilingual support for global mental health accessibility

interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
  culturalContext: CulturalContext;
  emergencyResources: EmergencyResource[];
  therapeuticPhrases: TherapeuticPhrases;
  crisisKeywords: string[];
}

interface CulturalContext {
  familyOriented: boolean;
  religiousConsiderations: string[];
  communicationStyle: 'direct' | 'indirect' | 'high-context' | 'low-context';
  mentalHealthStigma: 'high' | 'moderate' | 'low';
  preferredTherapeuticApproaches: string[];
  culturalValues: string[];
}

interface EmergencyResource {
  name: string;
  phone: string;
  website?: string;
  description: string;
  availability: string;
  languages: string[];
  type: 'crisis' | 'suicide' | 'domestic_violence' | 'substance_abuse' | 'mental_health';
}

interface TherapeuticPhrases {
  validation: string[];
  empathy: string[];
  grounding: string[];
  breathing: string[];
  safety: string[];
  encouragement: string[];
  boundaries: string[];
}

class LanguageSupport {
  private languages: Map<string, LanguageConfig> = new Map();
  private currentLanguage: string = 'en';
  private translationCache: Map<string, string> = new Map();

  constructor() {
    this.initializeLanguages();
  }

  private initializeLanguages(): void {
    // English (United States)
    this.languages.set('en', {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      rtl: false,
      culturalContext: {
        familyOriented: false,
        religiousConsiderations: ['Christian counseling available', 'Secular options preferred'],
        communicationStyle: 'direct',
        mentalHealthStigma: 'moderate',
        preferredTherapeuticApproaches: ['CBT', 'DBT', 'Mindfulness', 'ACT'],
        culturalValues: ['individualism', 'self-reliance', 'achievement']
      },
      emergencyResources: [
        {
          name: 'National Suicide Prevention Lifeline',
          phone: '988',
          website: 'https://suicidepreventionlifeline.org',
          description: '24/7 crisis support and suicide prevention',
          availability: '24/7',
          languages: ['English', 'Spanish'],
          type: 'suicide'
        },
        {
          name: 'Crisis Text Line',
          phone: 'Text HOME to 741741',
          website: 'https://crisistextline.org',
          description: 'Free, 24/7 crisis counseling via text',
          availability: '24/7',
          languages: ['English'],
          type: 'crisis'
        }
      ],
      therapeuticPhrases: {
        validation: [
          "Your feelings are completely valid and understandable.",
          "It makes sense that you would feel this way given what you're experiencing.",
          "Thank you for sharing something so personal with me."
        ],
        empathy: [
          "I can hear how difficult this is for you.",
          "That sounds really challenging to go through.",
          "I'm here to support you through this."
        ],
        grounding: [
          "Let's focus on the present moment.",
          "Can you tell me 5 things you can see around you?",
          "Take a deep breath and feel your feet on the ground."
        ],
        breathing: [
          "Let's try some slow, deep breathing together.",
          "Breathe in for 4 counts, hold for 4, out for 6.",
          "Focus on the sensation of air entering and leaving your lungs."
        ],
        safety: [
          "Your safety is the most important thing right now.",
          "Let's make sure you have the support you need.",
          "I'm concerned about you and want to help."
        ],
        encouragement: [
          "You've shown incredible strength by reaching out.",
          "Taking this step shows real courage.",
          "You don't have to go through this alone."
        ],
        boundaries: [
          "I'm here to support you, though I'm not a replacement for professional therapy.",
          "If you're in immediate danger, please contact emergency services.",
          "Let's explore what professional resources might be helpful."
        ]
      },
      crisisKeywords: [
        'suicide', 'kill myself', 'end it all', 'better off dead', 'want to die',
        'cutting', 'self-harm', 'hurt myself', 'burning myself',
        'overdose', 'pills', 'hanging', 'jumping',
        'worthless', 'hopeless', 'pointless', 'no way out',
        'voices', 'hearing things', 'seeing things', 'paranoid',
        'drinking too much', 'using drugs', 'addiction', 'relapse',
        'hits me', 'abuses me', 'violent', 'afraid for my safety'
      ]
    });

    // Spanish (Spain/Latin America)
    this.languages.set('es', {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      rtl: false,
      culturalContext: {
        familyOriented: true,
        religiousConsiderations: ['Catholic counseling available', 'Family spiritual support'],
        communicationStyle: 'high-context',
        mentalHealthStigma: 'high',
        preferredTherapeuticApproaches: ['Family therapy', 'Religious counseling', 'Community support'],
        culturalValues: ['family', 'respect', 'community', 'religious faith']
      },
      emergencyResources: [
        {
          name: 'Línea Nacional de Prevención del Suicidio',
          phone: '988',
          website: 'https://suicidepreventionlifeline.org/help-yourself/en-espanol/',
          description: 'Apoyo de crisis 24/7 y prevención del suicidio',
          availability: '24/7',
          languages: ['Spanish', 'English'],
          type: 'suicide'
        },
        {
          name: 'Línea de Ayuda SAMHSA',
          phone: '1-800-662-4357',
          description: 'Tratamiento de salud mental y abuso de sustancias',
          availability: '24/7',
          languages: ['Spanish', 'English'],
          type: 'mental_health'
        }
      ],
      therapeuticPhrases: {
        validation: [
          "Tus sentimientos son completamente válidos y comprensibles.",
          "Es natural que te sientas así dado lo que estás experimentando.",
          "Gracias por compartir algo tan personal conmigo."
        ],
        empathy: [
          "Puedo escuchar lo difícil que esto es para ti.",
          "Eso suena realmente desafiante de pasar.",
          "Estoy aquí para apoyarte en esto."
        ],
        grounding: [
          "Concentrémonos en el momento presente.",
          "¿Puedes decirme 5 cosas que puedes ver a tu alrededor?",
          "Respira profundo y siente tus pies en el suelo."
        ],
        breathing: [
          "Probemos respirar lenta y profundamente juntos.",
          "Inhala por 4 tiempos, mantén por 4, exhala por 6.",
          "Concéntrate en la sensación del aire entrando y saliendo de tus pulmones."
        ],
        safety: [
          "Tu seguridad es lo más importante ahora mismo.",
          "Asegurémonos de que tengas el apoyo que necesitas.",
          "Me preocupo por ti y quiero ayudar."
        ],
        encouragement: [
          "Has mostrado una fuerza increíble al buscar ayuda.",
          "Dar este paso muestra verdadero coraje.",
          "No tienes que pasar por esto solo/a."
        ],
        boundaries: [
          "Estoy aquí para apoyarte, aunque no soy un reemplazo de la terapia profesional.",
          "Si estás en peligro inmediato, por favor contacta servicios de emergencia.",
          "Exploremos qué recursos profesionales podrían ser útiles."
        ]
      },
      crisisKeywords: [
        'suicidio', 'matarme', 'terminar todo', 'mejor muerto', 'quiero morir',
        'cortarme', 'autolesión', 'lastimarme', 'quemarme',
        'sobredosis', 'pastillas', 'ahorcarme', 'saltar',
        'inútil', 'sin esperanza', 'sin sentido', 'sin salida',
        'voces', 'escuchar cosas', 'ver cosas', 'paranoico',
        'bebiendo mucho', 'usando drogas', 'adicción', 'recaída',
        'me pega', 'me maltrata', 'violento', 'miedo por mi seguridad'
      ]
    });

    // French (France)
    this.languages.set('fr', {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      rtl: false,
      culturalContext: {
        familyOriented: false,
        religiousConsiderations: ['Secular approach preferred', 'Laicité considerations'],
        communicationStyle: 'direct',
        mentalHealthStigma: 'moderate',
        preferredTherapeuticApproaches: ['Psychoanalysis', 'CBT', 'Group therapy'],
        culturalValues: ['intellectual discourse', 'personal autonomy', 'social solidarity']
      },
      emergencyResources: [
        {
          name: 'SOS Amitié',
          phone: '09 72 39 40 50',
          website: 'https://www.sos-amitie.com',
          description: 'Soutien émotionnel et prévention du suicide',
          availability: '24/7',
          languages: ['French'],
          type: 'suicide'
        },
        {
          name: 'Suicide Écoute',
          phone: '01 45 39 40 00',
          description: 'Ligne d\'écoute pour la prévention du suicide',
          availability: '24/7',
          languages: ['French'],
          type: 'suicide'
        }
      ],
      therapeuticPhrases: {
        validation: [
          "Vos sentiments sont complètement valides et compréhensibles.",
          "Il est naturel que vous vous sentiez ainsi vu ce que vous traversez.",
          "Merci de partager quelque chose d'aussi personnel avec moi."
        ],
        empathy: [
          "Je peux entendre à quel point c'est difficile pour vous.",
          "Cela semble vraiment difficile à vivre.",
          "Je suis là pour vous soutenir dans cette épreuve."
        ],
        grounding: [
          "Concentrons-nous sur le moment présent.",
          "Pouvez-vous me dire 5 choses que vous voyez autour de vous?",
          "Respirez profondément et sentez vos pieds sur le sol."
        ],
        breathing: [
          "Essayons de respirer lentement et profondément ensemble.",
          "Inspirez pendant 4 temps, retenez pendant 4, expirez pendant 6.",
          "Concentrez-vous sur la sensation de l'air qui entre et sort de vos poumons."
        ],
        safety: [
          "Votre sécurité est la chose la plus importante en ce moment.",
          "Assurons-nous que vous avez le soutien dont vous avez besoin.",
          "Je m'inquiète pour vous et je veux vous aider."
        ],
        encouragement: [
          "Vous avez montré une force incroyable en demandant de l'aide.",
          "Prendre cette étape montre un vrai courage.",
          "Vous n'avez pas à traverser cela seul(e)."
        ],
        boundaries: [
          "Je suis là pour vous soutenir, mais je ne remplace pas une thérapie professionnelle.",
          "Si vous êtes en danger immédiat, veuillez contacter les services d'urgence.",
          "Explorons quelles ressources professionnelles pourraient être utiles."
        ]
      },
      crisisKeywords: [
        'suicide', 'me tuer', 'en finir', 'mieux mort', 'veux mourir',
        'me couper', 'automutilation', 'me blesser', 'me brûler',
        'overdose', 'médicaments', 'pendre', 'sauter',
        'inutile', 'sans espoir', 'sans but', 'aucun moyen',
        'voix', 'entendre des choses', 'voir des choses', 'paranoïaque',
        'trop boire', 'prendre des drogues', 'addiction', 'rechute',
        'me frappe', 'maltraite', 'violent', 'peur pour ma sécurité'
      ]
    });

    // German (Germany)
    this.languages.set('de', {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      rtl: false,
      culturalContext: {
        familyOriented: false,
        religiousConsiderations: ['Protestant counseling', 'Catholic services', 'Secular preferred'],
        communicationStyle: 'direct',
        mentalHealthStigma: 'low',
        preferredTherapeuticApproaches: ['CBT', 'Psychodynamic', 'Behavioral therapy'],
        culturalValues: ['efficiency', 'thoroughness', 'privacy', 'professional boundaries']
      },
      emergencyResources: [
        {
          name: 'Telefonseelsorge',
          phone: '0800 111 0 111 / 0800 111 0 222',
          website: 'https://www.telefonseelsorge.de',
          description: 'Kostenlose Beratung und Krisenintervention',
          availability: '24/7',
          languages: ['German'],
          type: 'crisis'
        },
        {
          name: 'Nummer gegen Kummer',
          phone: '116 111',
          description: 'Beratung für Kinder und Jugendliche',
          availability: 'Mo-Sa 14-20, Mo+Mi+Do 10-12',
          languages: ['German'],
          type: 'crisis'
        }
      ],
      therapeuticPhrases: {
        validation: [
          "Ihre Gefühle sind völlig berechtigt und verständlich.",
          "Es ist natürlich, dass Sie sich so fühlen bei dem, was Sie durchmachen.",
          "Danke, dass Sie etwas so Persönliches mit mir teilen."
        ],
        empathy: [
          "Ich kann hören, wie schwierig das für Sie ist.",
          "Das klingt wirklich herausfordernd zu durchleben.",
          "Ich bin hier, um Sie dabei zu unterstützen."
        ],
        grounding: [
          "Lassen Sie uns auf den gegenwärtigen Moment fokussieren.",
          "Können Sie mir 5 Dinge sagen, die Sie um sich herum sehen?",
          "Atmen Sie tief durch und spüren Sie Ihre Füße auf dem Boden."
        ],
        breathing: [
          "Lassen Sie uns zusammen langsam und tief atmen.",
          "Einatmen für 4 Zählungen, halten für 4, ausatmen für 6.",
          "Konzentrieren Sie sich auf das Gefühl der Luft, die in Ihre Lungen ein- und ausströmt."
        ],
        safety: [
          "Ihre Sicherheit ist jetzt das Wichtigste.",
          "Lassen Sie uns sicherstellen, dass Sie die Unterstützung haben, die Sie brauchen.",
          "Ich mache mir Sorgen um Sie und möchte helfen."
        ],
        encouragement: [
          "Sie haben unglaubliche Stärke gezeigt, indem Sie sich Hilfe geholt haben.",
          "Diesen Schritt zu machen zeigt echten Mut.",
          "Sie müssen das nicht allein durchstehen."
        ],
        boundaries: [
          "Ich bin hier, um Sie zu unterstützen, aber ich bin kein Ersatz für professionelle Therapie.",
          "Wenn Sie in unmittelbarer Gefahr sind, wenden Sie sich bitte an den Notdienst.",
          "Lassen Sie uns erkunden, welche professionellen Ressourcen hilfreich sein könnten."
        ]
      },
      crisisKeywords: [
        'selbstmord', 'mich umbringen', 'alles beenden', 'besser tot', 'sterben wollen',
        'schneiden', 'selbstverletzung', 'mich verletzen', 'verbrennen',
        'überdosis', 'tabletten', 'erhängen', 'springen',
        'wertlos', 'hoffnungslos', 'sinnlos', 'kein ausweg',
        'stimmen', 'dinge hören', 'dinge sehen', 'paranoid',
        'zu viel trinken', 'drogen nehmen', 'sucht', 'rückfall',
        'schlägt mich', 'misshandelt', 'gewalttätig', 'angst um sicherheit'
      ]
    });

    // Chinese Simplified (China)
    this.languages.set('zh-CN', {
      code: 'zh-CN',
      name: 'Chinese (Simplified)',
      nativeName: '简体中文',
      rtl: false,
      culturalContext: {
        familyOriented: true,
        religiousConsiderations: ['Buddhist counseling', 'Traditional Chinese medicine', 'Confucian values'],
        communicationStyle: 'high-context',
        mentalHealthStigma: 'high',
        preferredTherapeuticApproaches: ['Family therapy', 'Traditional healing', 'Group support'],
        culturalValues: ['family harmony', 'saving face', 'collective well-being', 'respect for elders']
      },
      emergencyResources: [
        {
          name: '北京危机干预热线',
          phone: '400-161-9995',
          description: '24小时心理危机干预和自杀预防',
          availability: '24/7',
          languages: ['Chinese'],
          type: 'suicide'
        },
        {
          name: '上海精神卫生中心',
          phone: '021-3428-9888',
          description: '心理健康咨询和危机干预',
          availability: '24/7',
          languages: ['Chinese'],
          type: 'mental_health'
        }
      ],
      therapeuticPhrases: {
        validation: [
          "您的感受完全可以理解，是正常的。",
          "考虑到您正在经历的事情，有这样的感受是很自然的。",
          "谢谢您与我分享如此私人的事情。"
        ],
        empathy: [
          "我能听出这对您来说是多么困难。",
          "这听起来真的很有挑战性。",
          "我在这里支持您度过难关。"
        ],
        grounding: [
          "让我们专注于当下这个moment。",
          "您能告诉我周围能看到的5样东西吗？",
          "深呼吸，感受您的双脚踏在地面上。"
        ],
        breathing: [
          "让我们一起尝试缓慢深呼吸。",
          "吸气4拍，屏息4拍，呼气6拍。",
          "专注于空气进出肺部的感觉。"
        ],
        safety: [
          "您的安全是现在最重要的事情。",
          "让我们确保您得到需要的支持。",
          "我很关心您，想要帮助您。"
        ],
        encouragement: [
          "您寻求帮助显示了巨大的勇气。",
          "迈出这一步需要真正的勇气。",
          "您不必独自承受这些。"
        ],
        boundaries: [
          "我在这里支持您，但我不能替代专业心理治疗。",
          "如果您面临紧急危险，请联系急救服务。",
          "让我们一起看看什么专业资源可能有帮助。"
        ]
      },
      crisisKeywords: [
        '自杀', '杀死自己', '结束一切', '死了更好', '想死',
        '割腕', '自残', '伤害自己', '烧伤自己',
        '过量', '药片', '上吊', '跳楼',
        '没价值', '绝望', '没意义', '没出路',
        '听声音', '听到东西', '看到东西', '偏执',
        '喝太多', '吸毒', '成瘾', '复发',
        '打我', '虐待我', '暴力', '担心安全'
      ]
    });

    // Japanese (Japan)
    this.languages.set('ja', {
      code: 'ja',
      name: 'Japanese',
      nativeName: '日本語',
      rtl: false,
      culturalContext: {
        familyOriented: true,
        religiousConsiderations: ['Buddhist counseling', 'Shinto practices', 'Secular approaches'],
        communicationStyle: 'high-context',
        mentalHealthStigma: 'high',
        preferredTherapeuticApproaches: ['Group therapy', 'Family support', 'Traditional healing'],
        culturalValues: ['harmony', 'respect', 'group consensus', 'saving face']
      },
      emergencyResources: [
        {
          name: 'いのちの電話',
          phone: '0570-783-556',
          website: 'https://www.inochinodenwa.org',
          description: '24時間電話相談とクライシス支援',
          availability: '24/7',
          languages: ['Japanese'],
          type: 'suicide'
        },
        {
          name: 'こころの健康相談統一ダイヤル',
          phone: '0570-064-556',
          description: 'メンタルヘルス相談',
          availability: '平日9:30-17:00',
          languages: ['Japanese'],
          type: 'mental_health'
        }
      ],
      therapeuticPhrases: {
        validation: [
          "あなたのお気持ちは完全に理解できますし、当然のことです。",
          "今経験されていることを考えると、そのように感じるのは自然なことです。",
          "個人的なことを私と共有してくださって、ありがとうございます。"
        ],
        empathy: [
          "あなたにとってこれがどれほど困難なことかがわかります。",
          "それは本当に大変な経験ですね。",
          "私はあなたをサポートするためにここにいます。"
        ],
        grounding: [
          "今この瞬間に集中しましょう。",
          "周りに見える5つのものを教えていただけますか？",
          "深く呼吸をして、足が地面についている感覚を感じてください。"
        ],
        breathing: [
          "一緒にゆっくりと深呼吸をしてみましょう。",
          "4つ数えながら息を吸って、4つ止めて、6つで息を吐いてください。",
          "肺に空気が入って出ていく感覚に集中してください。"
        ],
        safety: [
          "今、あなたの安全が最も大切です。",
          "必要なサポートを確実に受けられるようにしましょう。",
          "あなたのことを心配していて、助けたいと思っています。"
        ],
        encouragement: [
          "助けを求めることで、あなたは素晴らしい強さを示しました。",
          "この一歩を踏み出すことは本当の勇気です。",
          "あなたは一人でこれを乗り越える必要はありません。"
        ],
        boundaries: [
          "私はあなたをサポートするためにここにいますが、専門的な治療の代替ではありません。",
          "もし immediate danger にある場合は、緊急サービスに連絡してください。",
          "どのような専門的なリソースが役立つかを一緒に探りましょう。"
        ]
      },
      crisisKeywords: [
        '自殺', '自分を殺す', 'すべてを終わらせる', '死んだ方がまし', '死にたい',
        '切る', '自傷', '自分を傷つける', '自分を燃やす',
        '過剰摂取', '薬', '首吊り', '飛び降り',
        '価値がない', '絶望的', '無意味', '出口がない',
        '声', '何かが聞こえる', '何かが見える', '偏執的',
        '飲みすぎ', '薬物使用', '依存', '再発',
        '殴られる', '虐待される', '暴力的', '安全への恐れ'
      ]
    });

    // Arabic (Modern Standard)
    this.languages.set('ar', {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      rtl: true,
      culturalContext: {
        familyOriented: true,
        religiousConsiderations: ['Islamic counseling', 'Religious guidance', 'Family involvement'],
        communicationStyle: 'high-context',
        mentalHealthStigma: 'high',
        preferredTherapeuticApproaches: ['Family therapy', 'Religious counseling', 'Community support'],
        culturalValues: ['family honor', 'religious faith', 'community solidarity', 'respect for elders']
      },
      emergencyResources: [
        {
          name: 'خط المساعدة النفسية',
          phone: '+971-800-4673',
          description: 'دعم الأزمات النفسية على مدار الساعة',
          availability: '24/7',
          languages: ['Arabic', 'English'],
          type: 'mental_health'
        }
      ],
      therapeuticPhrases: {
        validation: [
          "مشاعرك مفهومة تماماً ومبررة.",
          "من الطبيعي أن تشعر بهذا الشكل نظراً لما تمر به.",
          "شكراً لك لمشاركة شيء شخصي جداً معي."
        ],
        empathy: [
          "أستطيع أن أسمع مدى صعوبة هذا عليك.",
          "هذا يبدو تحدياً حقيقياً للمرور به.",
          "أنا هنا لدعمك خلال هذا."
        ],
        grounding: [
          "دعنا نركز على اللحظة الحالية.",
          "هل يمكنك أن تخبرني بـ 5 أشياء تراها حولك؟",
          "خذ نفساً عميقاً واشعر بقدميك على الأرض."
        ],
        breathing: [
          "دعنا نجرب التنفس البطيء والعميق معاً.",
          "تنفس لمدة 4 عدات، احبس لـ 4، أخرج الهواء لـ 6.",
          "ركز على شعور الهواء وهو يدخل ويخرج من رئتيك."
        ],
        safety: [
          "سلامتك هي أهم شيء الآن.",
          "دعنا نتأكد من أن لديك الدعم الذي تحتاجه.",
          "أنا قلق عليك وأريد المساعدة."
        ],
        encouragement: [
          "لقد أظهرت قوة لا تصدق بطلب المساعدة.",
          "اتخاذ هذه الخطوة يظهر شجاعة حقيقية.",
          "لا يجب أن تمر بهذا وحدك."
        ],
        boundaries: [
          "أنا هنا لدعمك، لكنني لست بديلاً عن العلاج المهني.",
          "إذا كنت في خطر فوري، يرجى الاتصال بخدمات الطوارئ.",
          "دعنا نستكشف ما هي الموارد المهنية التي قد تكون مفيدة."
        ]
      },
      crisisKeywords: [
        'انتحار', 'قتل نفسي', 'إنهاء كل شيء', 'أفضل ميتاً', 'أريد أن أموت',
        'قطع', 'إيذاء النفس', 'أؤذي نفسي', 'حرق نفسي',
        'جرعة زائدة', 'حبوب', 'شنق', 'قفز',
        'بلا قيمة', 'يائس', 'بلا معنى', 'لا مخرج',
        'أصوات', 'أسمع أشياء', 'أرى أشياء', 'بارانويا',
        'شرب كثير', 'تعاطي مخدرات', 'إدمان', 'انتكاس',
        'يضربني', 'يسيء معاملتي', 'عنيف', 'خوف على سلامتي'
      ]
    });
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setLanguage(languageCode: string): boolean {
    if (this.languages.has(languageCode)) {
      this.currentLanguage = languageCode;
      return true;
    }
    return false;
  }

  getSupportedLanguages(): { code: string; name: string; nativeName: string }[] {
    return Array.from(this.languages.values()).map(lang => ({
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName
    }));
  }

  getLanguageConfig(languageCode?: string): LanguageConfig | null {
    const code = languageCode || this.currentLanguage;
    return this.languages.get(code) || null;
  }

  getCulturalContext(languageCode?: string): CulturalContext | null {
    const config = this.getLanguageConfig(languageCode);
    return config ? config.culturalContext : null;
  }

  getEmergencyResources(languageCode?: string): EmergencyResource[] {
    const config = this.getLanguageConfig(languageCode);
    return config ? config.emergencyResources : [];
  }

  getTherapeuticPhrase(category: keyof TherapeuticPhrases, languageCode?: string): string {
    const config = this.getLanguageConfig(languageCode);
    if (!config) return '';
    
    const phrases = config.therapeuticPhrases[category];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  getCrisisKeywords(languageCode?: string): string[] {
    const config = this.getLanguageConfig(languageCode);
    return config ? config.crisisKeywords : [];
  }

  isRTL(languageCode?: string): boolean {
    const config = this.getLanguageConfig(languageCode);
    return config ? config.rtl : false;
  }

  // Enhanced crisis detection with multilingual support
  detectCrisis(text: string, languageCode?: string): {
    isDetected: boolean;
    matchedKeywords: string[];
    confidence: number;
    culturalConsiderations: string[];
  } {
    const config = this.getLanguageConfig(languageCode);
    if (!config) {
      return { isDetected: false, matchedKeywords: [], confidence: 0, culturalConsiderations: [] };
    }

    const keywords = config.crisisKeywords;
    const lowerText = text.toLowerCase();
    const matchedKeywords: string[] = [];
    
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    });

    const confidence = Math.min(matchedKeywords.length * 0.3, 1.0);
    const isDetected = matchedKeywords.length > 0;

    const culturalConsiderations = isDetected 
      ? this.getCulturalConsiderations(config.culturalContext)
      : [];

    return {
      isDetected,
      matchedKeywords,
      confidence,
      culturalConsiderations
    };
  }

  private getCulturalConsiderations(context: CulturalContext): string[] {
    const considerations: string[] = [];

    if (context.familyOriented) {
      considerations.push('Consider involving family support systems');
    }

    if (context.mentalHealthStigma === 'high') {
      considerations.push('Be sensitive to mental health stigma');
      considerations.push('Emphasize confidentiality and privacy');
    }

    if (context.religiousConsiderations.length > 0) {
      considerations.push('Consider religious and spiritual resources');
    }

    if (context.communicationStyle === 'high-context') {
      considerations.push('Use indirect communication approach');
      considerations.push('Allow for silence and reflection time');
    }

    return considerations;
  }

  // Adaptive therapeutic response based on cultural context
  getAdaptiveResponse(
    emotionalState: string,
    intensity: number,
    languageCode?: string
  ): {
    approach: string;
    techniques: string[];
    culturalAdaptations: string[];
  } {
    const config = this.getLanguageConfig(languageCode);
    if (!config) {
      return { approach: 'standard', techniques: [], culturalAdaptations: [] };
    }

    const context = config.culturalContext;
    const techniques: string[] = [];
    const culturalAdaptations: string[] = [];

    // Adapt based on preferred therapeutic approaches
    if (context.preferredTherapeuticApproaches.includes('Family therapy')) {
      techniques.push('Family-centered intervention');
      culturalAdaptations.push('Include family dynamics in assessment');
    }

    if (context.preferredTherapeuticApproaches.includes('Religious counseling')) {
      techniques.push('Spiritual and religious coping');
      culturalAdaptations.push('Incorporate faith-based resources');
    }

    // Communication style adaptations
    if (context.communicationStyle === 'high-context') {
      culturalAdaptations.push('Use metaphors and storytelling');
      culturalAdaptations.push('Allow for non-verbal communication');
    }

    // Stigma-sensitive approaches
    if (context.mentalHealthStigma === 'high') {
      culturalAdaptations.push('Normalize mental health concerns');
      culturalAdaptations.push('Emphasize strength-based perspective');
    }

    return {
      approach: context.preferredTherapeuticApproaches[0] || 'CBT',
      techniques,
      culturalAdaptations
    };
  }
}

export default LanguageSupport;
export type { CulturalContext, EmergencyResource, LanguageConfig, TherapeuticPhrases };

