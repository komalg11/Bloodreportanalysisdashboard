import { normalizeParameterName } from "./normalization";

export interface ExtractedParameter {
    name: string;
    value: number;
    unit: string;
    referenceRange: string | null;
    status: "Normal" | "High" | "Low";
}

// Known parameters with predefined reference ranges for accurate status determination
const KNOWN_PARAMETERS = [
    { aliases: /\b(hemoglobin|haemoglobin|hgb|hb)\b/i, standardName: "Hemoglobin", defaultUnit: "g/dL", refLow: 13.0, refHigh: 17.5 },
    { aliases: /\b(rbc\s*count|red\s*blood\s*cell[s]?|rbc)\b/i, standardName: "Red Blood Cells", defaultUnit: "million/cmm", refLow: 4.5, refHigh: 5.5 },
    { aliases: /\b(wbc\s*count|white\s*blood\s*cell[s]?|wbc|leukocytes|total\s*wbc)\b/i, standardName: "White Blood Cells", defaultUnit: "x10^3/uL", refLow: 4.0, refHigh: 11.0 },
    { aliases: /\b(platelet\s*count|platelets|plt|thrombocytes)\b/i, standardName: "Platelets", defaultUnit: "x10^3/uL", refLow: 150, refHigh: 450 },
    { aliases: /\b(total\s*cholesterol|cholesterol)\b/i, standardName: "Total Cholesterol", defaultUnit: "mg/dL", refLow: null, refHigh: 200 },
    { aliases: /\b(hdl\s*cholesterol|hdl[\s-]?c|hdl)\b/i, standardName: "HDL Cholesterol", defaultUnit: "mg/dL", refLow: 40, refHigh: null },
    { aliases: /\b(ldl\s*cholesterol|ldl[\s-]?c|ldl)\b/i, standardName: "LDL Cholesterol", defaultUnit: "mg/dL", refLow: null, refHigh: 100 },
    { aliases: /\b(triglyceride[s]?|trig|tg)\b/i, standardName: "Triglycerides", defaultUnit: "mg/dL", refLow: null, refHigh: 150 },
    { aliases: /\b(blood\s*sugar\s*\(?fasting\)?|fasting\s*glucose|fbs|fasting\s*blood\s*sugar)\b/i, standardName: "Blood Sugar (Fasting)", defaultUnit: "mg/dL", refLow: 70, refHigh: 100 },
    { aliases: /\b(blood\s*sugar\s*\(?pp\)?|post\s*prandial|ppbs)\b/i, standardName: "Blood Sugar (PP)", defaultUnit: "mg/dL", refLow: null, refHigh: 140 },
    { aliases: /\b(random\s*blood\s*sugar|rbs)\b/i, standardName: "Random Blood Sugar", defaultUnit: "mg/dL", refLow: 70, refHigh: 140 },
    { aliases: /\b(hba1c|glycated\s*hemoglobin|glycosylated\s*hemoglobin)\b/i, standardName: "HbA1c", defaultUnit: "%", refLow: null, refHigh: 5.7 },
    { aliases: /\b(vitamin\s*d|vit[\.\s]*d|25[\s-]?hydroxy)\b/i, standardName: "Vitamin D", defaultUnit: "ng/mL", refLow: 30, refHigh: 100 },
    { aliases: /\b(vitamin\s*b12|vit[\.\s]*b12|cobalamin)\b/i, standardName: "Vitamin B12", defaultUnit: "pg/mL", refLow: 200, refHigh: 900 },
    { aliases: /\b(creatinine|serum\s*creatinine)\b/i, standardName: "Creatinine", defaultUnit: "mg/dL", refLow: 0.7, refHigh: 1.3 },
    { aliases: /\b(uric\s*acid|serum\s*uric\s*acid)\b/i, standardName: "Uric Acid", defaultUnit: "mg/dL", refLow: 3.5, refHigh: 7.2 },
    { aliases: /\b(tsh|thyroid\s*stimulating\s*hormone)\b/i, standardName: "TSH", defaultUnit: "mIU/L", refLow: 0.4, refHigh: 4.0 },
    { aliases: /\b(t3|triiodothyronine)\b/i, standardName: "T3", defaultUnit: "ng/dL", refLow: 80, refHigh: 200 },
    { aliases: /\b(t4|thyroxine|free\s*t4)\b/i, standardName: "T4", defaultUnit: "µg/dL", refLow: 4.5, refHigh: 12.0 },
    { aliases: /\b(sgot|ast|aspartate\s*aminotransferase)\b/i, standardName: "SGOT (AST)", defaultUnit: "U/L", refLow: null, refHigh: 40 },
    { aliases: /\b(sgpt|alt|alanine\s*aminotransferase)\b/i, standardName: "SGPT (ALT)", defaultUnit: "U/L", refLow: null, refHigh: 40 },
    { aliases: /\b(alkaline\s*phosphatase|alp)\b/i, standardName: "Alkaline Phosphatase", defaultUnit: "U/L", refLow: 44, refHigh: 147 },
    { aliases: /\b(total\s*bilirubin|bilirubin\s*total|serum\s*bilirubin)\b/i, standardName: "Total Bilirubin", defaultUnit: "mg/dL", refLow: null, refHigh: 1.2 },
    { aliases: /\b(direct\s*bilirubin|conjugated\s*bilirubin)\b/i, standardName: "Direct Bilirubin", defaultUnit: "mg/dL", refLow: null, refHigh: 0.3 },
    { aliases: /\b(indirect\s*bilirubin|unconjugated\s*bilirubin)\b/i, standardName: "Indirect Bilirubin", defaultUnit: "mg/dL", refLow: null, refHigh: 0.9 },
    { aliases: /\b(total\s*protein|serum\s*protein)\b/i, standardName: "Total Protein", defaultUnit: "g/dL", refLow: 6.0, refHigh: 8.3 },
    { aliases: /\b(albumin|serum\s*albumin)\b/i, standardName: "Albumin", defaultUnit: "g/dL", refLow: 3.5, refHigh: 5.5 },
    { aliases: /\b(globulin)\b/i, standardName: "Globulin", defaultUnit: "g/dL", refLow: 2.0, refHigh: 3.5 },
    { aliases: /\b(iron|serum\s*iron)\b/i, standardName: "Iron", defaultUnit: "µg/dL", refLow: 60, refHigh: 170 },
    { aliases: /\b(ferritin|serum\s*ferritin)\b/i, standardName: "Ferritin", defaultUnit: "ng/mL", refLow: 12, refHigh: 300 },
    { aliases: /\b(tibc|total\s*iron\s*binding\s*capacity)\b/i, standardName: "TIBC", defaultUnit: "µg/dL", refLow: 250, refHigh: 370 },
    { aliases: /\b(calcium|serum\s*calcium)\b/i, standardName: "Calcium", defaultUnit: "mg/dL", refLow: 8.5, refHigh: 10.5 },
    { aliases: /\b(phosphorus|phosphate|serum\s*phosphorus)\b/i, standardName: "Phosphorus", defaultUnit: "mg/dL", refLow: 2.5, refHigh: 4.5 },
    { aliases: /\b(sodium|na\+?)\b/i, standardName: "Sodium", defaultUnit: "mEq/L", refLow: 136, refHigh: 145 },
    { aliases: /\b(potassium|k\+?)\b/i, standardName: "Potassium", defaultUnit: "mEq/L", refLow: 3.5, refHigh: 5.0 },
    { aliases: /\b(chloride|cl)\b/i, standardName: "Chloride", defaultUnit: "mEq/L", refLow: 98, refHigh: 106 },
    { aliases: /\b(blood\s*urea\s*nitrogen|bun|urea)\b/i, standardName: "Blood Urea Nitrogen", defaultUnit: "mg/dL", refLow: 7, refHigh: 20 },
    { aliases: /\b(esr|erythrocyte\s*sedimentation\s*rate|sed\s*rate)\b/i, standardName: "ESR", defaultUnit: "mm/hr", refLow: null, refHigh: 20 },
    { aliases: /\b(crp|c[\s-]?reactive\s*protein)\b/i, standardName: "CRP", defaultUnit: "mg/L", refLow: null, refHigh: 10 },
    { aliases: /\b(hematocrit|hct|packed\s*cell\s*volume|pcv)\b/i, standardName: "Hematocrit", defaultUnit: "%", refLow: 38.3, refHigh: 48.6 },
    { aliases: /\b(mcv|mean\s*corpuscular\s*volume)\b/i, standardName: "MCV", defaultUnit: "fL", refLow: 80, refHigh: 100 },
    { aliases: /\b(mch|mean\s*corpuscular\s*h(ae)?moglobin)\b/i, standardName: "MCH", defaultUnit: "pg", refLow: 27, refHigh: 33 },
    { aliases: /\b(mchc|mean\s*corpuscular\s*h(ae)?moglobin\s*concentration)\b/i, standardName: "MCHC", defaultUnit: "g/dL", refLow: 32, refHigh: 36 },
    { aliases: /\b(rdw|red\s*cell\s*distribution\s*width)\b/i, standardName: "RDW", defaultUnit: "%", refLow: 11.5, refHigh: 14.5 },
    { aliases: /\b(neutrophil[s]?)\b/i, standardName: "Neutrophils", defaultUnit: "%", refLow: 40, refHigh: 70 },
    { aliases: /\b(lymphocyte[s]?)\b/i, standardName: "Lymphocytes", defaultUnit: "%", refLow: 20, refHigh: 40 },
    { aliases: /\b(monocyte[s]?)\b/i, standardName: "Monocytes", defaultUnit: "%", refLow: 2, refHigh: 8 },
    { aliases: /\b(eosinophil[s]?)\b/i, standardName: "Eosinophils", defaultUnit: "%", refLow: 1, refHigh: 4 },
    { aliases: /\b(basophil[s]?)\b/i, standardName: "Basophils", defaultUnit: "%", refLow: 0, refHigh: 1 },
    { aliases: /\b(ggt|gamma\s*glutamyl\s*transferase)\b/i, standardName: "GGT", defaultUnit: "U/L", refLow: null, refHigh: 60 },
    { aliases: /\b(ldh|lactate\s*dehydrogenase)\b/i, standardName: "LDH", defaultUnit: "U/L", refLow: 140, refHigh: 280 },
    { aliases: /\b(amylase|serum\s*amylase)\b/i, standardName: "Amylase", defaultUnit: "U/L", refLow: 28, refHigh: 100 },
    { aliases: /\b(lipase|serum\s*lipase)\b/i, standardName: "Lipase", defaultUnit: "U/L", refLow: null, refHigh: 160 },
    { aliases: /\b(vldl)\b/i, standardName: "VLDL Cholesterol", defaultUnit: "mg/dL", refLow: null, refHigh: 30 },
    { aliases: /\b(a\/g\s*ratio|albumin[\s\/]*globulin\s*ratio)\b/i, standardName: "A/G Ratio", defaultUnit: "", refLow: 1.1, refHigh: 2.5 },
    { aliases: /\b(psa|prostate\s*specific\s*antigen)\b/i, standardName: "PSA", defaultUnit: "ng/mL", refLow: null, refHigh: 4.0 },
];

// Common unit patterns for detection
const UNIT_PATTERNS = /(mg\/dL|g\/dL|ng\/mL|pg\/mL|mIU\/L|µIU\/mL|IU\/L|U\/L|%|x10[\^³]?[\/\s]*[uµ]L|million\/cmm|mm\/hr|mEq\/L|µg\/dL|fL|pg|g\/L|mmol\/L|cells\/cmm|lakhs?\/cmm|thou\/cmm)/i;

function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function determineStatus(value: number, refLow: number | null, refHigh: number | null): "Normal" | "High" | "Low" {
    if (refLow !== null && value < refLow) return "Low";
    if (refHigh !== null && value > refHigh) return "High";
    return "Normal";
}

function parseReferenceRange(rangeStr: string): { low: number | null; high: number | null } {
    const ltMatch = rangeStr.match(/[<≤]\s*(\d+\.?\d*)/);
    if (ltMatch) return { low: null, high: parseFloat(ltMatch[1]) };

    const gtMatch = rangeStr.match(/[>≥]\s*(\d+\.?\d*)/);
    if (gtMatch) return { low: parseFloat(gtMatch[1]), high: null };

    const rangeMatch = rangeStr.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
    if (rangeMatch) return { low: parseFloat(rangeMatch[1]), high: parseFloat(rangeMatch[2]) };

    return { low: null, high: null };
}

function extractStatusFromText(text: string): "Normal" | "High" | "Low" | null {
    const lower = text.toLowerCase();
    if (/\blow\b/.test(lower)) return "Low";
    if (/\bhigh\b/.test(lower) || /\bborderline\b/.test(lower)) return "High";
    if (/\bnormal\b/.test(lower)) return "Normal";
    return null;
}

// Words that should never be treated as a parameter name
const NOISE_WORDS = /^(date|name|age|sex|gender|patient|doctor|dr|lab|report|test|specimen|sample|collected|received|page|ref|reference|method|unit|result|value|range|flag|interpretation|remark|note|phone|email|address|id|reg|no|number)$/i;

/**
 * Try to extract parameter name from the text portion before the numeric value.
 * Cleans up noise, punctuation, and returns a title-cased name.
 */
function cleanParameterName(raw: string): string | null {
    // Remove leading/trailing punctuation, colons, dots, hyphens
    let cleaned = raw.replace(/^[\s:.\-–•*#,;]+|[\s:.\-–•*#,;]+$/g, '').trim();

    // Skip very short (1 char) or very long names (>60 chars)
    if (cleaned.length < 2 || cleaned.length > 60) return null;

    // Skip if it's purely a number
    if (/^\d+\.?\d*$/.test(cleaned)) return null;

    // Skip noise words
    if (NOISE_WORDS.test(cleaned)) return null;

    // Title case
    cleaned = cleaned.replace(/\b\w/g, c => c.toUpperCase());

    return cleaned;
}

function extractKnownParametersFromBlock(
    text: string,
    results: ExtractedParameter[],
    seenNames: Set<string>
) {
    const collapsed = text.replace(/\s+/g, " ").trim();
    if (!collapsed) return;

    type Occurrence = { start: number; alias: string; paramDef: any };
    const occurrences: Occurrence[] = [];

    for (const paramDef of KNOWN_PARAMETERS) {
        const flags = paramDef.aliases.flags.includes("i") ? "ig" : "g";
        const globalRegex = new RegExp(paramDef.aliases.source, flags);
        let match: RegExpExecArray | null;

        while ((match = globalRegex.exec(collapsed)) !== null) {
            occurrences.push({
                start: match.index,
                alias: match[0],
                paramDef,
            });

            if (globalRegex.lastIndex === match.index) {
                globalRegex.lastIndex += 1;
            }
        }
    }

    if (occurrences.length === 0) return;
    occurrences.sort((a, b) => a.start - b.start);

    for (let i = 0; i < occurrences.length; i++) {
        const current = occurrences[i];
        const next = occurrences[i + 1];
        const segment = collapsed.slice(current.start, next ? next.start : undefined);

        const normalizedName = normalizeParameterName(current.paramDef.standardName);
        if (seenNames.has(normalizedName.toLowerCase())) continue;

        const valueAfterAliasRegex = new RegExp(
            `${escapeRegExp(current.alias)}\\s*[:=\\-]?\\s*(\\d+\\.?\\d*)`,
            "i"
        );
        const valueMatch = segment.match(valueAfterAliasRegex) || segment.match(/(\d+\.?\d*)/);
        if (!valueMatch) continue;

        const value = parseFloat(valueMatch[1]);
        if (isNaN(value)) continue;

        const unitMatch = segment.match(UNIT_PATTERNS);
        const unit = unitMatch ? unitMatch[0] : current.paramDef.defaultUnit;

        let referenceRange: string | null = null;
        let refLow = current.paramDef.refLow;
        let refHigh = current.paramDef.refHigh;

        const rangeMatch = segment.match(/(\d+\.?\d*)\s*[-â€“]\s*(\d+\.?\d*)/);
        if (rangeMatch) {
            referenceRange = `${rangeMatch[1]} - ${rangeMatch[2]}`;
            const parsed = parseReferenceRange(referenceRange);
            if (parsed.low !== null) refLow = parsed.low;
            if (parsed.high !== null) refHigh = parsed.high;
        }

        const explicitStatus = extractStatusFromText(segment);
        const computedStatus = determineStatus(value, refLow, refHigh);
        const status = explicitStatus || computedStatus;

        seenNames.add(normalizedName.toLowerCase());
        results.push({ name: normalizedName, value, unit, referenceRange, status });
    }
}

export function extractParametersFromText(ocrText: string): ExtractedParameter[] {
    const results: ExtractedParameter[] = [];
    const seenNames = new Set<string>();

    // Handle OCR outputs that collapse full tables into one line.
    extractKnownParametersFromBlock(ocrText, results, seenNames);

    const lines = ocrText.split(/\n/);

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.length < 3) continue;

        let matched = false;

        // --- Pass 1: Match known parameters ---
        for (const paramDef of KNOWN_PARAMETERS) {
            if (!paramDef.aliases.test(trimmedLine)) continue;

            // Find numeric value — skip numbers that are part of reference range at end
            const valueMatch = trimmedLine.match(/(?<!\d[-–]\s*)(\d+\.?\d*)(?!\s*[-–]\s*\d)/);
            if (!valueMatch) continue;

            const value = parseFloat(valueMatch[1]);
            if (isNaN(value)) continue;

            const unitMatch = trimmedLine.match(UNIT_PATTERNS);
            const unit = unitMatch ? unitMatch[0] : paramDef.defaultUnit;

            let referenceRange: string | null = null;
            let refLow = paramDef.refLow;
            let refHigh = paramDef.refHigh;

            // Look for inline reference range
            const rangeMatch = trimmedLine.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
            if (rangeMatch) {
                referenceRange = `${rangeMatch[1]} - ${rangeMatch[2]}`;
                const parsed = parseReferenceRange(referenceRange);
                if (parsed.low !== null) refLow = parsed.low;
                if (parsed.high !== null) refHigh = parsed.high;
            }

            const explicitStatus = extractStatusFromText(trimmedLine);
            const computedStatus = determineStatus(value, refLow, refHigh);
            const status = explicitStatus || computedStatus;
            const normalizedName = normalizeParameterName(paramDef.standardName);

            if (!seenNames.has(normalizedName.toLowerCase())) {
                seenNames.add(normalizedName.toLowerCase());
                results.push({ name: normalizedName, value, unit, referenceRange, status });
            }
            matched = true;
            break;
        }

        if (matched) continue;

        // --- Pass 2: Generic extraction for any parameter-like line ---
        // Pattern: <text/name> <number> [unit] [range] [status]
        // Match lines that have: some text followed by a number
        const genericMatch = trimmedLine.match(/^(.+?)\s+([\d]+\.?\d*)\s*(.*)/);
        if (!genericMatch) continue;

        const rawName = genericMatch[1];
        const value = parseFloat(genericMatch[2]);
        const remainder = genericMatch[3] || '';

        if (isNaN(value)) continue;

        const paramName = cleanParameterName(rawName);
        if (!paramName) continue;

        // Normalize via alias map
        const normalizedName = normalizeParameterName(paramName);
        if (seenNames.has(normalizedName.toLowerCase())) continue;

        // Try to extract unit
        const unitMatch = remainder.match(UNIT_PATTERNS);
        const unit = unitMatch ? unitMatch[0] : '';

        // Try to extract reference range
        let referenceRange: string | null = null;
        let refLow: number | null = null;
        let refHigh: number | null = null;

        const rangeMatch = remainder.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
        if (rangeMatch) {
            referenceRange = `${rangeMatch[1]} - ${rangeMatch[2]}`;
            const parsed = parseReferenceRange(referenceRange);
            refLow = parsed.low;
            refHigh = parsed.high;
        }

        const ltMatch = remainder.match(/[<≤]\s*(\d+\.?\d*)/);
        if (!referenceRange && ltMatch) {
            referenceRange = `< ${ltMatch[1]}`;
            refHigh = parseFloat(ltMatch[1]);
        }

        // Determine status
        const explicitStatus = extractStatusFromText(remainder);
        const computedStatus = (refLow !== null || refHigh !== null)
            ? determineStatus(value, refLow, refHigh)
            : "Normal";
        const status = explicitStatus || computedStatus;

        seenNames.add(normalizedName.toLowerCase());
        results.push({ name: normalizedName, value, unit, referenceRange, status });
    }

    return results;
}
