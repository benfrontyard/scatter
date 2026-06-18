import { LOGO_TYPE_TRAITS } from "@/config/logo/type-traits";
import { migrateVariantKindToRole, normalizeLogoAssetType } from "@/config/logo/defaults";
import type { LogoAssetType, LogoVariantRole } from "@/types/brand-logo";

export type LogoClassificationInput = {
  width?: number;
  height?: number;
  fileName?: string;
  userType?: LogoAssetType;
  classificationLocked?: boolean;
};

export type LogoClassificationResult = {
  type: LogoAssetType;
  aspectRatio: number;
  suggestedVariantRole: LogoVariantRole;
  confidence: "high" | "medium" | "low";
  signals: string[];
};

const FILENAME_TYPE_HINTS: Array<{ pattern: RegExp; type: LogoAssetType }> = [
  { pattern: /wordmark|logotype|text.?only/i, type: "wordmark" },
  { pattern: /combo|combination|lockup|horizontal/i, type: "combination" },
  { pattern: /symbol|icon|mark(?!up)/i, type: "symbol" },
  { pattern: /monogram|initial/i, type: "monogram" },
  { pattern: /mascot|character/i, type: "mascot" },
  { pattern: /badge|seal|emblem/i, type: "badge" },
  { pattern: /stacked|vertical/i, type: "stacked" },
];

function inferTypeFromAspectRatio(aspectRatio: number): LogoAssetType {
  if (aspectRatio >= 2.2) return "wordmark";
  if (aspectRatio >= 1.35) return "combination";
  if (aspectRatio >= 0.9) return "symbol";
  if (aspectRatio >= 0.65) return "stacked";
  return "stacked";
}

function inferTypeFromFileName(fileName: string): LogoAssetType | undefined {
  for (const hint of FILENAME_TYPE_HINTS) {
    if (hint.pattern.test(fileName)) return hint.type;
  }
  return undefined;
}

function variantRoleForType(type: LogoAssetType, aspectRatio: number): LogoVariantRole {
  const traits = LOGO_TYPE_TRAITS[type];
  if (type === "wordmark") {
    return aspectRatio >= 2 ? "wordmarkOnly" : "primary";
  }
  if (type === "stacked" || aspectRatio < 0.85) return "stacked";
  if (type === "symbol" || type === "monogram") return "symbolOnly";
  if (aspectRatio >= 1.5) return "primary";
  return traits.tightFormatVariant;
}

export function classifyLogo(input: LogoClassificationInput): LogoClassificationResult {
  const signals: string[] = [];
  const userType = input.userType ? normalizeLogoAssetType(input.userType) : undefined;

  if (userType && input.classificationLocked) {
    const aspect =
      input.width && input.height && input.height > 0
        ? input.width / input.height
        : LOGO_TYPE_TRAITS[userType].typicalAspectRatio;
    return {
      type: userType,
      aspectRatio: aspect,
      suggestedVariantRole: variantRoleForType(userType, aspect),
      confidence: "high",
      signals: ["user-locked"],
    };
  }

  const aspect =
    input.width && input.height && input.height > 0
      ? input.width / input.height
      : undefined;

  const fileHint = input.fileName ? inferTypeFromFileName(input.fileName) : undefined;
  if (fileHint) signals.push(`filename:${fileHint}`);

  let type: LogoAssetType;
  let confidence: LogoClassificationResult["confidence"] = "low";

  if (userType) {
    type = userType;
    confidence = "high";
    signals.push("user-type");
  } else if (fileHint && aspect !== undefined) {
    const aspectType = inferTypeFromAspectRatio(aspect);
    type = fileHint === aspectType ? fileHint : fileHint;
    confidence = fileHint === aspectType ? "high" : "medium";
    signals.push("filename+aspect");
  } else if (fileHint) {
    type = fileHint;
    confidence = "medium";
  } else if (aspect !== undefined) {
    type = inferTypeFromAspectRatio(aspect);
    confidence = aspect >= 2.2 || aspect <= 0.65 ? "medium" : "low";
    signals.push("aspect-ratio");
  } else {
    type = "wordmark";
    signals.push("default");
  }

  const aspectRatio = aspect ?? LOGO_TYPE_TRAITS[type].typicalAspectRatio;

  return {
    type,
    aspectRatio,
    suggestedVariantRole: variantRoleForType(type, aspectRatio),
    confidence,
    signals,
  };
}

export function suggestVariantRoleForUpload(
  input: LogoClassificationInput,
): LogoVariantRole {
  return classifyLogo(input).suggestedVariantRole;
}

/** @deprecated */
export function suggestVariantKindForUpload(input: LogoClassificationInput): LogoVariantRole {
  const result = classifyLogo(input);
  return migrateVariantKindToRole(result.suggestedVariantRole);
}
