import type { BrandMotionKit } from './types';

export const draftlyBrandKit: BrandMotionKit = {
  "name": "Draftly",
  "category": "Creator productivity platform",
  "description": "A collaborative content planning tool for creators and marketing teams turning ideas into scheduled content.",
  "audience": "Creators, social teams, brand marketers, content strategists, and small agencies.",
  "positioning": "The playful workspace where content ideas become planned, approved, and published.",
  "personality": [
    "friendly",
    "modular",
    "expressive",
    "useful",
    "social",
    "collaborative"
  ],
  "voiceTone": {
    "principles": [
      "Casual but useful",
      "Action-oriented",
      "Encouraging",
      "Clear labels over cleverness"
    ],
    "sample": [
      "Turn rough ideas into ready-to-post content.",
      "Plan the week without losing the spark.",
      "From first draft to final post."
    ]
  },
  "identity": {
    "logoConcept": "A D-shaped card stack with a folded corner, suggesting drafts, templates, and modular content blocks.",
    "logoVariants": [
      "Primary horizontal lockup",
      "Card-stack symbol",
      "Sticker mark",
      "Dark lockup",
      "Light lockup",
      "Social avatar"
    ],
    "logoUsageRules": [
      "Use the symbol as a content sticker, watermark, or app avatar.",
      "Keep clearspace equal to the card-stack symbol width.",
      "Logo can sit inside playful surfaces, but must remain flat and legible.",
      "Do not add random drop shadows, emoji overlays, or uncontrolled rotations to the lockup."
    ],
    "colors": {
      "primary": {
        "name": "Draft Ink",
        "hex": "#17151F",
        "role": "Primary text and dark UI"
      },
      "secondary": {
        "name": "Paper",
        "hex": "#FFF8EC",
        "role": "Warm background"
      },
      "accent": {
        "name": "Post Purple",
        "hex": "#7C5CFF",
        "role": "Primary action and selected states"
      },
      "background": {
        "name": "Studio Cream",
        "hex": "#FEF6E8",
        "role": "Default canvas background"
      },
      "surface": {
        "name": "Card White",
        "hex": "#FFFFFF",
        "role": "Cards and templates"
      },
      "muted": {
        "name": "Pencil Gray",
        "hex": "#8C8798",
        "role": "Secondary labels"
      },
      "pop": {
        "name": "Highlight Lime",
        "hex": "#C7F464",
        "role": "Playful emphasis"
      },
      "warm": {
        "name": "Coral Note",
        "hex": "#FF6B5F",
        "role": "Comments, alerts, social emphasis"
      }
    },
    "typography": {
      "display": {
        "family": "Archivo",
        "fallback": "Inter, system-ui, sans-serif",
        "weight": 750
      },
      "heading": {
        "family": "Archivo",
        "fallback": "Inter, system-ui, sans-serif",
        "weight": 700
      },
      "body": {
        "family": "Inter",
        "fallback": "system-ui, sans-serif",
        "weight": 450
      },
      "mono": {
        "family": "IBM Plex Mono",
        "fallback": "ui-monospace, monospace",
        "weight": 500
      },
      "scale": {
        "hero": {
          "size": 76,
          "lineHeight": 0.92,
          "tracking": -2.2
        },
        "h1": {
          "size": 50,
          "lineHeight": 0.98,
          "tracking": -1.3
        },
        "h2": {
          "size": 34,
          "lineHeight": 1.04,
          "tracking": -0.6
        },
        "body": {
          "size": 18,
          "lineHeight": 1.45,
          "tracking": -0.1
        },
        "caption": {
          "size": 13,
          "lineHeight": 1.35,
          "tracking": 0.15
        },
        "stat": {
          "size": 62,
          "lineHeight": 0.95,
          "tracking": -1.6
        }
      }
    },
    "iconStyle": {
      "style": "Rounded expressive icons with simple filled accents",
      "strokeWidth": 2.25,
      "cornerRadius": "Round",
      "rules": [
        "Icons can have personality but must remain simple",
        "Use content metaphors: calendar, post, comment, cursor, tag, template",
        "Allow small animated states for comments and cursors"
      ]
    },
    "layoutGrid": {
      "system": "Modular card grid with editorial breaks",
      "rules": [
        "Cards can stack, overlap, and snap",
        "Use social-safe margins",
        "Allow stickers and comments as secondary motion",
        "Keep main copy readable in mobile crops"
      ]
    },
    "imageryStyle": "Template cards, calendars, cursors, comments, cropped creator workspace details, simple paper textures.",
    "uiStyle": "Rounded cards, tags, comment bubbles, content calendars, colorful statuses, template library previews.",
    "doDontRules": {
      "do": [
        "Use modular cards",
        "Animate collaboration moments",
        "Show social formats",
        "Let the system feel lively"
      ],
      "dont": [
        "Make it childish",
        "Use too many colors in one frame",
        "Hide the main message under stickers",
        "Use chaotic meme pacing for product explainers"
      ]
    }
  },
  "motionKit": {
    "motionPersonality": "Editorial Flow / Playful System",
    "easing": {
      "default": "cubic-bezier(0.2, 0.8, 0.2, 1)",
      "exit": "cubic-bezier(0.7, 0, 0.2, 1)",
      "emphasis": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      "notes": "Quick, friendly movement with controlled overshoot for cards, comments, and cursor moments."
    },
    "timingScale": {
      "micro": 120,
      "standard": 260,
      "emphasis": 460,
      "hero": 780
    },
    "textReveal": {
      "default": "word-pop-reveal",
      "secondary": [
        "card-stack-reveal",
        "type-on",
        "highlight-swipe"
      ],
      "rules": [
        "Use expressive type for hooks",
        "Use card motion for workflows",
        "Keep overshoot subtle"
      ]
    },
    "transitions": {
      "primary": "card-swipe-stack",
      "secondary": [
        "snap-grid",
        "comment-pop",
        "template-carousel"
      ],
      "rules": [
        "Transitions should feel like rearranging a creative workspace"
      ]
    },
    "camera": {
      "style": "flat-layout-pan",
      "zoomAmount": 1.03,
      "perspective": 0.04,
      "parallaxDepth": 0.1,
      "rotation": 0.2,
      "focusBlur": 0.0
    },
    "effects": {
      "grain": {
        "enabled": true,
        "intensity": 0.08
      },
      "glow": {
        "enabled": false,
        "intensity": 0.0
      },
      "vignette": {
        "enabled": false,
        "intensity": 0.0
      },
      "motionBlur": {
        "enabled": true,
        "intensity": 0.16
      },
      "chromaticAberration": {
        "enabled": false,
        "intensity": 0.0
      },
      "gradientMap": {
        "enabled": false,
        "intensity": 0.0
      },
      "depthBlur": {
        "enabled": false,
        "intensity": 0.0
      },
      "paperTexture": {
        "enabled": true,
        "intensity": 0.1
      }
    },
    "logoAnimation": "Card-stack symbol snaps together from three content cards, then the wordmark slides in with a small overshoot.",
    "blockDefaults": {
      "intro": "Big hook, cards stack in, cursor selects first template",
      "featureCallout": "Cards shuffle, comment bubble pops, feature label locks in",
      "statCard": "Friendly number pop with social tags",
      "ctaEndCard": "Logo, template cards, clear CTA with playful snap"
    },
    "exportDefaults": {
      "aspectRatios": [
        "9:16",
        "4:5",
        "1:1",
        "16:9"
      ],
      "defaultDurationSeconds": 15,
      "previewQuality": "medium",
      "exportQuality": "high"
    }
  },
  "templates": [
    {
      "id": "draftly-logoReveal",
      "name": "Logo Reveal",
      "category": "brand-motion",
      "previewAnimation": "/previews/draftly/logoReveal.mp4",
      "aspectRatios": [
        "9:16",
        "4:5",
        "1:1",
        "16:9"
      ],
      "inherits": [
        "colors",
        "typography",
        "motionKit.easing",
        "motionKit.effects",
        "motionKit.camera"
      ],
      "settings": {
        "brandDefault": true
      }
    },
    {
      "id": "draftly-websiteHero",
      "name": "Website Hero",
      "category": "brand-motion",
      "previewAnimation": "/previews/draftly/websiteHero.mp4",
      "aspectRatios": [
        "9:16",
        "4:5",
        "1:1",
        "16:9"
      ],
      "inherits": [
        "colors",
        "typography",
        "motionKit.easing",
        "motionKit.effects",
        "motionKit.camera"
      ],
      "settings": {
        "brandDefault": true
      }
    },
    {
      "id": "draftly-productUiReveal",
      "name": "Product Ui Reveal",
      "category": "brand-motion",
      "previewAnimation": "/previews/draftly/productUiReveal.mp4",
      "aspectRatios": [
        "9:16",
        "4:5",
        "1:1",
        "16:9"
      ],
      "inherits": [
        "colors",
        "typography",
        "motionKit.easing",
        "motionKit.effects",
        "motionKit.camera"
      ],
      "settings": {
        "brandDefault": true
      }
    },
    {
      "id": "draftly-featureCallout",
      "name": "Feature Callout",
      "category": "brand-motion",
      "previewAnimation": "/previews/draftly/featureCallout.mp4",
      "aspectRatios": [
        "9:16",
        "4:5",
        "1:1",
        "16:9"
      ],
      "inherits": [
        "colors",
        "typography",
        "motionKit.easing",
        "motionKit.effects",
        "motionKit.camera"
      ],
      "settings": {
        "brandDefault": true
      }
    },
    {
      "id": "draftly-statCard",
      "name": "Stat Card",
      "category": "brand-motion",
      "previewAnimation": "/previews/draftly/statCard.mp4",
      "aspectRatios": [
        "9:16",
        "4:5",
        "1:1",
        "16:9"
      ],
      "inherits": [
        "colors",
        "typography",
        "motionKit.easing",
        "motionKit.effects",
        "motionKit.camera"
      ],
      "settings": {
        "brandDefault": true
      }
    },
    {
      "id": "draftly-quoteCard",
      "name": "Quote Card",
      "category": "brand-motion",
      "previewAnimation": "/previews/draftly/quoteCard.mp4",
      "aspectRatios": [
        "9:16",
        "4:5",
        "1:1",
        "16:9"
      ],
      "inherits": [
        "colors",
        "typography",
        "motionKit.easing",
        "motionKit.effects",
        "motionKit.camera"
      ],
      "settings": {
        "brandDefault": true
      }
    },
    {
      "id": "draftly-socialAd",
      "name": "Social Ad",
      "category": "brand-motion",
      "previewAnimation": "/previews/draftly/socialAd.mp4",
      "aspectRatios": [
        "9:16",
        "4:5",
        "1:1",
        "16:9"
      ],
      "inherits": [
        "colors",
        "typography",
        "motionKit.easing",
        "motionKit.effects",
        "motionKit.camera"
      ],
      "settings": {
        "brandDefault": true
      }
    },
    {
      "id": "draftly-ctaEndCard",
      "name": "Cta End Card",
      "category": "brand-motion",
      "previewAnimation": "/previews/draftly/ctaEndCard.mp4",
      "aspectRatios": [
        "9:16",
        "4:5",
        "1:1",
        "16:9"
      ],
      "inherits": [
        "colors",
        "typography",
        "motionKit.easing",
        "motionKit.effects",
        "motionKit.camera"
      ],
      "settings": {
        "brandDefault": true
      }
    }
  ]
};
