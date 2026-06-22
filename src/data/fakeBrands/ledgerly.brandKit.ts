import type { BrandMotionKit } from './types';

export const ledgerlyBrandKit: BrandMotionKit = {
  "name": "Ledgerly",
  "category": "Finance operations platform",
  "description": "Finance clarity for creative agencies managing cashflow, invoices, expenses, and forecasting.",
  "audience": "Agency founders, operators, finance leads, account directors, and creative business owners.",
  "positioning": "A composed finance command center for agencies that need sharper decisions without spreadsheet chaos.",
  "personality": [
    "trustworthy",
    "premium",
    "composed",
    "sharp",
    "executive",
    "data-backed"
  ],
  "voiceTone": {
    "principles": [
      "Confident but not cold",
      "Specific with numbers",
      "Use finance language clearly",
      "Avoid startup fluff"
    ],
    "sample": [
      "Know your margin before the month closes.",
      "Forecast cashflow with confidence.",
      "Turn agency finances into clear decisions."
    ]
  },
  "identity": {
    "logoConcept": "An L monogram built from a folded ledger page and upward chart angle, balancing bookkeeping trust with forward momentum.",
    "logoVariants": [
      "Primary horizontal lockup",
      "Monogram",
      "Dark lockup",
      "Light lockup",
      "Embossed one-color mark",
      "Investor deck mark"
    ],
    "logoUsageRules": [
      "Use the monogram when space is limited or when placed inside dashboard UI.",
      "Keep clearspace equal to one monogram width.",
      "Use high contrast for financial trust and readability.",
      "Do not use playful rotations, sticker treatments, or novelty effects."
    ],
    "colors": {
      "primary": {
        "name": "Ledger Navy",
        "hex": "#111827",
        "role": "Primary dark surface and text"
      },
      "secondary": {
        "name": "Balance Cream",
        "hex": "#F3EBDD",
        "role": "Warm background and report surfaces"
      },
      "accent": {
        "name": "Margin Gold",
        "hex": "#C79A3B",
        "role": "Premium emphasis and chart highlights"
      },
      "background": {
        "name": "Off White",
        "hex": "#FBFAF7",
        "role": "Default light background"
      },
      "surface": {
        "name": "Deep Graphite",
        "hex": "#1C232B",
        "role": "Dashboard and hero surfaces"
      },
      "muted": {
        "name": "Ledger Gray",
        "hex": "#7C8490",
        "role": "Secondary labels"
      },
      "positive": {
        "name": "Profit Green",
        "hex": "#2EAD72",
        "role": "Positive movement"
      },
      "negative": {
        "name": "Risk Red",
        "hex": "#D9554D",
        "role": "Risk and variance"
      }
    },
    "typography": {
      "display": {
        "family": "Manrope",
        "fallback": "Inter, system-ui, sans-serif",
        "weight": 700
      },
      "heading": {
        "family": "Inter",
        "fallback": "system-ui, sans-serif",
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
          "size": 68,
          "lineHeight": 0.98,
          "tracking": -2.4
        },
        "h1": {
          "size": 46,
          "lineHeight": 1.02,
          "tracking": -1.4
        },
        "h2": {
          "size": 30,
          "lineHeight": 1.08,
          "tracking": -0.6
        },
        "body": {
          "size": 17,
          "lineHeight": 1.5,
          "tracking": 0
        },
        "caption": {
          "size": 12,
          "lineHeight": 1.35,
          "tracking": 0.35
        },
        "stat": {
          "size": 78,
          "lineHeight": 0.9,
          "tracking": -2.8
        }
      }
    },
    "iconStyle": {
      "style": "Structured line icons with selective filled details",
      "strokeWidth": 2,
      "cornerRadius": "Minimal",
      "rules": [
        "Icons should feel like product navigation, not decoration",
        "Use chart, invoice, forecast, cashflow, and report metaphors",
        "Keep a stable baseline and consistent optical size"
      ]
    },
    "layoutGrid": {
      "system": "8pt spacing, 12-column editorial/product grid, large stat zones",
      "rules": [
        "Lead with one financial insight",
        "Use charts as visual anchors",
        "Keep captions close to data",
        "Use premium whitespace"
      ]
    },
    "imageryStyle": "Dashboard UI, abstract financial reports, cropped office details, no stock-photo smiles.",
    "uiStyle": "Dark executive dashboards, clear charting, large metrics, polished cards, fine borders, restrained gradients.",
    "doDontRules": {
      "do": [
        "Use high-contrast numbers",
        "Animate charts with intent",
        "Make financial states obvious",
        "Use premium restraint"
      ],
      "dont": [
        "Use playful stickers",
        "Overwhelm with too many metrics",
        "Use generic crypto/coin imagery",
        "Make charts decorative only"
      ]
    }
  },
  "motionKit": {
    "motionPersonality": "Premium Depth",
    "easing": {
      "default": "cubic-bezier(0.33, 1, 0.68, 1)",
      "exit": "cubic-bezier(0.65, 0, 0.35, 1)",
      "emphasis": "cubic-bezier(0.25, 1, 0.5, 1)",
      "notes": "Elegant ease-in-out, confident deceleration, no bounce."
    },
    "timingScale": {
      "micro": 180,
      "standard": 380,
      "emphasis": 680,
      "hero": 1100
    },
    "textReveal": {
      "default": "smooth-mask-reveal",
      "secondary": [
        "number-count-up",
        "decimal-roll",
        "caption-fade-in"
      ],
      "rules": [
        "Numbers animate first when they are the story",
        "Captions should follow metrics",
        "Avoid casual pop effects"
      ]
    },
    "transitions": {
      "primary": "depth-slide",
      "secondary": [
        "soft-blur-wipe",
        "diagonal-mask",
        "fade-through-dark"
      ],
      "rules": [
        "Transitions should feel like moving between reports or executive slides"
      ]
    },
    "camera": {
      "style": "layered-dashboard-float",
      "zoomAmount": 1.08,
      "perspective": 0.22,
      "parallaxDepth": 0.32,
      "rotation": 0.8,
      "focusBlur": 0.08
    },
    "effects": {
      "grain": {
        "enabled": true,
        "intensity": 0.04
      },
      "glow": {
        "enabled": true,
        "intensity": 0.12
      },
      "vignette": {
        "enabled": true,
        "intensity": 0.1
      },
      "motionBlur": {
        "enabled": true,
        "intensity": 0.22
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
        "enabled": true,
        "intensity": 0.08
      }
    },
    "logoAnimation": "Monogram folds in like a ledger page, then a gold chart line sweeps through before the wordmark resolves.",
    "blockDefaults": {
      "intro": "Dark premium hero, monogram reveal, one financial promise",
      "featureCallout": "Metric first, dashboard panel second, caption third",
      "statCard": "Large number count-up, chart draw-on, risk/profit color cue",
      "ctaEndCard": "Composed logo lockup, concise CTA, warm premium accent"
    },
    "exportDefaults": {
      "aspectRatios": [
        "16:9",
        "4:5",
        "5:4"
      ],
      "defaultDurationSeconds": 22,
      "previewQuality": "medium",
      "exportQuality": "high"
    }
  },
  "templates": [
    {
      "id": "ledgerly-logoReveal",
      "name": "Logo Reveal",
      "category": "brand-motion",
      "previewAnimation": "/previews/ledgerly/logoReveal.mp4",
      "aspectRatios": [
        "16:9",
        "4:5",
        "5:4"
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
      "id": "ledgerly-websiteHero",
      "name": "Website Hero",
      "category": "brand-motion",
      "previewAnimation": "/previews/ledgerly/websiteHero.mp4",
      "aspectRatios": [
        "16:9",
        "4:5",
        "5:4"
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
      "id": "ledgerly-productUiReveal",
      "name": "Product Ui Reveal",
      "category": "brand-motion",
      "previewAnimation": "/previews/ledgerly/productUiReveal.mp4",
      "aspectRatios": [
        "16:9",
        "4:5",
        "5:4"
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
      "id": "ledgerly-featureCallout",
      "name": "Feature Callout",
      "category": "brand-motion",
      "previewAnimation": "/previews/ledgerly/featureCallout.mp4",
      "aspectRatios": [
        "16:9",
        "4:5",
        "5:4"
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
      "id": "ledgerly-statCard",
      "name": "Stat Card",
      "category": "brand-motion",
      "previewAnimation": "/previews/ledgerly/statCard.mp4",
      "aspectRatios": [
        "16:9",
        "4:5",
        "5:4"
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
      "id": "ledgerly-quoteCard",
      "name": "Quote Card",
      "category": "brand-motion",
      "previewAnimation": "/previews/ledgerly/quoteCard.mp4",
      "aspectRatios": [
        "16:9",
        "4:5",
        "5:4"
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
      "id": "ledgerly-socialAd",
      "name": "Social Ad",
      "category": "brand-motion",
      "previewAnimation": "/previews/ledgerly/socialAd.mp4",
      "aspectRatios": [
        "16:9",
        "4:5",
        "5:4"
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
      "id": "ledgerly-ctaEndCard",
      "name": "Cta End Card",
      "category": "brand-motion",
      "previewAnimation": "/previews/ledgerly/ctaEndCard.mp4",
      "aspectRatios": [
        "16:9",
        "4:5",
        "5:4"
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
