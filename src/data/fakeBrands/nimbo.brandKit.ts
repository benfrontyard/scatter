import type { BrandMotionKit } from './types';

export const nimboBrandKit: BrandMotionKit = {
  "name": "Nimbo",
  "category": "Project management SaaS",
  "description": "A calm operating system for small product teams to plan, ship, and stay aligned.",
  "audience": "Founders, product managers, designers, engineers, and lean product teams.",
  "positioning": "The clearest way for small teams to turn product decisions into shipped work.",
  "personality": [
    "precise",
    "quiet",
    "focused",
    "technical",
    "minimal",
    "confident"
  ],
  "voiceTone": {
    "principles": [
      "Short, direct sentences",
      "No hype",
      "Plain product language",
      "Calm confidence"
    ],
    "sample": [
      "Plan the work. Ship the product.",
      "Less noise between idea and release.",
      "Everything your team needs to stay aligned."
    ]
  },
  "identity": {
    "logoConcept": "A soft cloud-like N symbol made from stacked rounded rectangles, suggesting flow, lightweight planning, and calm momentum.",
    "logoVariants": [
      "Primary horizontal lockup",
      "Symbol only",
      "Dark mode lockup",
      "Light mode lockup",
      "One-color mark",
      "Small-size favicon/app icon"
    ],
    "logoUsageRules": [
      "Keep clearspace equal to the symbol height around all sides.",
      "Use the symbol-only mark for avatars, favicons, and small UI placements.",
      "Avoid placing the logo over busy product UI unless a scrim or surface is used.",
      "Do not stretch, rotate, outline, or apply heavy glow to the mark."
    ],
    "colors": {
      "primary": {
        "name": "Nimbo Ink",
        "hex": "#101418",
        "role": "Primary text and dark surfaces"
      },
      "secondary": {
        "name": "Cloud Gray",
        "hex": "#E8ECF0",
        "role": "Light surfaces and dividers"
      },
      "accent": {
        "name": "Signal Blue",
        "hex": "#4B7DFF",
        "role": "Primary action and motion emphasis"
      },
      "background": {
        "name": "Mist",
        "hex": "#F7F8FA",
        "role": "Default light background"
      },
      "surface": {
        "name": "Panel White",
        "hex": "#FFFFFF",
        "role": "Cards and UI panels"
      },
      "muted": {
        "name": "Slate",
        "hex": "#6B7280",
        "role": "Secondary labels and captions"
      },
      "positive": {
        "name": "Ship Green",
        "hex": "#19B56B",
        "role": "Done, shipped, success"
      }
    },
    "typography": {
      "display": {
        "family": "Geist",
        "fallback": "Inter, system-ui, sans-serif",
        "weight": 650
      },
      "heading": {
        "family": "Inter",
        "fallback": "system-ui, sans-serif",
        "weight": 650
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
          "size": 72,
          "lineHeight": 0.95,
          "tracking": -2.8
        },
        "h1": {
          "size": 48,
          "lineHeight": 1.0,
          "tracking": -1.6
        },
        "h2": {
          "size": 32,
          "lineHeight": 1.08,
          "tracking": -0.8
        },
        "body": {
          "size": 18,
          "lineHeight": 1.45,
          "tracking": -0.1
        },
        "caption": {
          "size": 13,
          "lineHeight": 1.3,
          "tracking": 0.2
        },
        "stat": {
          "size": 64,
          "lineHeight": 0.95,
          "tracking": -2.0
        }
      }
    },
    "iconStyle": {
      "style": "Thin-line geometric",
      "strokeWidth": 1.75,
      "cornerRadius": "Soft but not bubbly",
      "rules": [
        "Use outline icons for UI labels",
        "Use filled icon only for the app symbol or selected state",
        "Keep icons optically aligned to a 24px grid"
      ]
    },
    "layoutGrid": {
      "system": "Swiss-inspired 12-column grid with generous negative space",
      "rules": [
        "Align product UI to columns",
        "Use asymmetric hero compositions",
        "Keep one dominant message per frame",
        "Prefer calm spacing over dense feature packing"
      ]
    },
    "imageryStyle": "Mostly product UI, subtle abstract gradients, no lifestyle photography unless heavily cropped and quiet.",
    "uiStyle": "Crisp rounded panels, small shadows, dark/light themes, clear hierarchy, fine dividers, compact toolbars.",
    "doDontRules": {
      "do": [
        "Show real product flows",
        "Use one accent color per frame",
        "Keep UI readable",
        "Let motion guide attention"
      ],
      "dont": [
        "Overuse glow",
        "Use cartoon illustrations",
        "Animate everything at once",
        "Use chaotic social-style cuts"
      ]
    }
  },
  "motionKit": {
    "motionPersonality": "Calm Precision",
    "easing": {
      "default": "cubic-bezier(0.22, 1, 0.36, 1)",
      "exit": "cubic-bezier(0.76, 0, 0.24, 1)",
      "emphasis": "cubic-bezier(0.16, 1, 0.3, 1)",
      "notes": "Smooth ease-out, no bounce, no elastic overshoot."
    },
    "timingScale": {
      "micro": 160,
      "standard": 320,
      "emphasis": 520,
      "hero": 900
    },
    "textReveal": {
      "default": "line-mask-reveal",
      "secondary": [
        "word-fade-up",
        "tracking-tighten",
        "soft-blur-in"
      ],
      "rules": [
        "Reveal the message before the UI",
        "Use one reveal direction per block",
        "Avoid character chaos"
      ]
    },
    "transitions": {
      "primary": "soft-slide-mask",
      "secondary": [
        "fade-through",
        "crop-wipe",
        "panel-slide"
      ],
      "rules": [
        "Transitions should feel functional, like navigating the product"
      ]
    },
    "camera": {
      "style": "subtle-product-push",
      "zoomAmount": 1.06,
      "perspective": 0.12,
      "parallaxDepth": 0.18,
      "rotation": 0.4,
      "focusBlur": 0.0
    },
    "effects": {
      "grain": {
        "enabled": true,
        "intensity": 0.06
      },
      "glow": {
        "enabled": true,
        "intensity": 0.08
      },
      "vignette": {
        "enabled": false,
        "intensity": 0.0
      },
      "motionBlur": {
        "enabled": true,
        "intensity": 0.18
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
      }
    },
    "logoAnimation": "Symbol builds from three sliding rounded bars, then wordmark fades in with a slight mask reveal.",
    "blockDefaults": {
      "intro": "Logo + one-line promise, slow push",
      "featureCallout": "Text left, UI right, callout line draws on",
      "statCard": "Number count with minimal supporting text",
      "ctaEndCard": "Logo, short CTA, single accent button"
    },
    "exportDefaults": {
      "aspectRatios": [
        "16:9",
        "1:1",
        "4:5"
      ],
      "defaultDurationSeconds": 18,
      "previewQuality": "medium",
      "exportQuality": "high"
    }
  },
  "templates": [
    {
      "id": "nimbo-logoReveal",
      "name": "Logo Reveal",
      "category": "brand-motion",
      "previewAnimation": "/previews/nimbo/logoReveal.mp4",
      "aspectRatios": [
        "16:9",
        "1:1",
        "4:5"
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
      "id": "nimbo-websiteHero",
      "name": "Website Hero",
      "category": "brand-motion",
      "previewAnimation": "/previews/nimbo/websiteHero.mp4",
      "aspectRatios": [
        "16:9",
        "1:1",
        "4:5"
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
      "id": "nimbo-productUiReveal",
      "name": "Product Ui Reveal",
      "category": "brand-motion",
      "previewAnimation": "/previews/nimbo/productUiReveal.mp4",
      "aspectRatios": [
        "16:9",
        "1:1",
        "4:5"
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
      "id": "nimbo-featureCallout",
      "name": "Feature Callout",
      "category": "brand-motion",
      "previewAnimation": "/previews/nimbo/featureCallout.mp4",
      "aspectRatios": [
        "16:9",
        "1:1",
        "4:5"
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
      "id": "nimbo-statCard",
      "name": "Stat Card",
      "category": "brand-motion",
      "previewAnimation": "/previews/nimbo/statCard.mp4",
      "aspectRatios": [
        "16:9",
        "1:1",
        "4:5"
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
      "id": "nimbo-quoteCard",
      "name": "Quote Card",
      "category": "brand-motion",
      "previewAnimation": "/previews/nimbo/quoteCard.mp4",
      "aspectRatios": [
        "16:9",
        "1:1",
        "4:5"
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
      "id": "nimbo-socialAd",
      "name": "Social Ad",
      "category": "brand-motion",
      "previewAnimation": "/previews/nimbo/socialAd.mp4",
      "aspectRatios": [
        "16:9",
        "1:1",
        "4:5"
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
      "id": "nimbo-ctaEndCard",
      "name": "Cta End Card",
      "category": "brand-motion",
      "previewAnimation": "/previews/nimbo/ctaEndCard.mp4",
      "aspectRatios": [
        "16:9",
        "1:1",
        "4:5"
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
