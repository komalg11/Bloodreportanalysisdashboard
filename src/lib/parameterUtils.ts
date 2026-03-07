import type { Parameter, Status } from "@/app/components/ParameterCard";

type NullableNumber = number | null;

export interface ParsedRange {
  low: NullableNumber;
  high: NullableNumber;
}

export function parseReferenceRange(range?: string | null): ParsedRange {
  if (!range) return { low: null, high: null };

  const normalized = range.replace(/[\u2212\u2013\u2014]/g, "-");

  const betweenMatch = normalized.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
  if (betweenMatch) {
    return { low: parseFloat(betweenMatch[1]), high: parseFloat(betweenMatch[2]) };
  }

  const ltMatch = normalized.match(/(?:<|\u2264)\s*(\d+\.?\d*)/);
  if (ltMatch) {
    return { low: null, high: parseFloat(ltMatch[1]) };
  }

  const gtMatch = normalized.match(/(?:>|\u2265)\s*(\d+\.?\d*)/);
  if (gtMatch) {
    return { low: parseFloat(gtMatch[1]), high: null };
  }

  return { low: null, high: null };
}

export function normalizeStatus(
  status: string | undefined,
  value: number,
  range?: string | null
): Status {
  const parsed = parseReferenceRange(range);
  const hasLow = parsed.low !== null;
  const hasHigh = parsed.high !== null;
  const hasRange = hasLow || hasHigh;

  // Always prioritize value-vs-range evaluation when a range exists.
  if (hasRange && Number.isFinite(value)) {
    if (hasLow && value < (parsed.low as number)) return "low";
    if (hasHigh && value > (parsed.high as number)) return "high";

    // Borderline when value sits close to either boundary inside the normal range.
    if (hasLow && hasHigh) {
      const low = parsed.low as number;
      const high = parsed.high as number;
      const span = high - low;
      if (span > 0) {
        const margin = span * 0.1; // within 10% of either edge
        if (value <= low + margin || value >= high - margin) {
          return "borderline";
        }
      }
      return "normal";
    }

    if (hasHigh) {
      const high = parsed.high as number;
      if (value >= high * 0.9) return "borderline";
      return "normal";
    }

    if (hasLow) {
      const low = parsed.low as number;
      if (value <= low * 1.1) return "borderline";
      return "normal";
    }
  }

  // Fallback to provided status only when range is unavailable.
  if (status) {
    const lowered = status.toLowerCase();
    if (lowered === "normal" || lowered === "high" || lowered === "low" || lowered === "borderline") {
      return lowered;
    }
  }

  return "normal";
}

export function toNumericValue(value: unknown): number {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getPreviousAndLatestValues(trendPoints: any[] | undefined): [number | null, number | null] {
  if (!Array.isArray(trendPoints) || trendPoints.length === 0) return [null, null];

  const sorted = [...trendPoints].sort(
    (a, b) => new Date(a?.date ?? 0).getTime() - new Date(b?.date ?? 0).getTime()
  );
  const numericValues = sorted
    .map((point) => toNumericValue(point?.value))
    .filter((num) => Number.isFinite(num));

  if (numericValues.length === 0) return [null, null];
  if (numericValues.length === 1) return [null, numericValues[0]];
  return [numericValues[numericValues.length - 2], numericValues[numericValues.length - 1]];
}

export function computeTrendDirection(
  parameterName: string,
  trends: Record<string, any> | undefined
): Parameter["trend"] {
  const trendPoints = trends?.[parameterName];
  const [previous, latest] = getPreviousAndLatestValues(trendPoints);

  if (previous === null || latest === null) return "stable";

  const diff = latest - previous;
  if (Math.abs(diff) < 0.0001) return "stable";
  return diff > 0 ? "up" : "down";
}

export function findTrendByParameterName(
  trends: Record<string, any> | undefined,
  parameterName: string
): any[] {
  if (!trends) return [];
  if (Array.isArray(trends[parameterName])) return trends[parameterName];

  const match = Object.keys(trends).find(
    (key) => key.toLowerCase().trim() === parameterName.toLowerCase().trim()
  );

  return match && Array.isArray(trends[match]) ? trends[match] : [];
}
