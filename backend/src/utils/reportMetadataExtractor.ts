export interface ExtractedReportMetadata {
    patientName: string | null;
    patientId: string | null;
    patientAge: number | null;
    gender: string | null;
    bloodGroup: string | null;
    doctorName: string | null;
    reportDate: Date | null;
}

const BLOOD_GROUP_WITH_SIGN_REGEX = /\b(AB|A|B|O)\s*([+-])\b/i;
const BLOOD_GROUP_TEXT_REGEX = /\b(AB|A|B|O)\s*(positive|negative)\b/i;

function normalizeWhitespace(value: string): string {
    return value.replace(/\s+/g, " ").trim();
}

function normalizeGender(raw: string | null): string | null {
    if (!raw) return null;
    const value = raw.toLowerCase();
    if (value === "m" || value === "male") return "Male";
    if (value === "f" || value === "female") return "Female";
    if (value === "other") return "Other";
    return null;
}

function normalizeBloodGroup(group: string | null, polarity: string | null): string | null {
    if (!group) return null;
    const normalizedGroup = group.toUpperCase();
    if (!polarity) return normalizedGroup;

    const p = polarity.toLowerCase();
    if (p === "+" || p === "positive") return `${normalizedGroup}+`;
    if (p === "-" || p === "negative") return `${normalizedGroup}-`;
    return normalizedGroup;
}

function extractLabeledValue(text: string, labels: string[]): string | null {
    for (const label of labels) {
        const regex = new RegExp(
            `${label}\\s*[:\\-]\\s*([^\\n]{1,120}?)(?=\\s{2,}|\\n|\\b(?:age|sex|gender|blood\\s*group|blood\\s*type|patient\\s*id|uhid|doctor|consultant|report\\s*date|date)\\b|$)`,
            "i"
        );
        const match = text.match(regex);
        if (match?.[1]) return normalizeWhitespace(match[1]);
    }
    return null;
}

function parseDateCandidate(value: string): Date | null {
    const raw = normalizeWhitespace(value).replace(/,/g, " ");

    const dmy = raw.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/);
    if (dmy) {
        const day = Number(dmy[1]);
        const month = Number(dmy[2]);
        const year = Number(dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3]);
        const date = new Date(year, month - 1, day);
        if (!Number.isNaN(date.getTime())) return date;
    }

    const ymd = raw.match(/\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/);
    if (ymd) {
        const year = Number(ymd[1]);
        const month = Number(ymd[2]);
        const day = Number(ymd[3]);
        const date = new Date(year, month - 1, day);
        if (!Number.isNaN(date.getTime())) return date;
    }

    const monthDate = new Date(raw);
    if (!Number.isNaN(monthDate.getTime())) return monthDate;
    return null;
}

export function extractReportMetadata(text: string): ExtractedReportMetadata {
    const compactText = normalizeWhitespace(text.replace(/\r/g, "\n").replace(/\n+/g, "\n"));

    let patientName = extractLabeledValue(compactText, ["patient\\s*name", "name"]);
    let patientId = extractLabeledValue(compactText, ["patient\\s*id", "patient\\s*no", "uhid", "uid", "id"]);

    let gender: string | null = null;
    const explicitGender = compactText.match(/(?:sex|gender)\s*[:\-]?\s*(male|female|m|f|other)\b/i);
    if (explicitGender) {
        gender = normalizeGender(explicitGender[1]);
    }

    let patientAge: number | null = null;
    const explicitAge = compactText.match(/(?:age)\s*[:\-]?\s*(\d{1,3})\b/i);
    if (explicitAge) {
        patientAge = Number(explicitAge[1]);
    }

    // Common compact form: "M/34", "Female/27"
    if (!gender || !patientAge) {
        const combined = compactText.match(/\b(male|female|m|f)\s*\/\s*(\d{1,3})\b/i)
            || compactText.match(/\b(\d{1,3})\s*\/\s*(male|female|m|f)\b/i);
        if (combined) {
            const a = combined[1];
            const b = combined[2];
            if (!gender) {
                gender = normalizeGender(/[A-Za-z]/.test(a) ? a : b);
            }
            if (!patientAge) {
                const agePart = /\d/.test(a) ? a : b;
                patientAge = Number(agePart);
            }
        }
    }

    let bloodGroup: string | null = null;
    const labeledBlood = compactText.match(
        /(?:blood\s*group|blood\s*type|group)\s*[:\-]?\s*(AB|A|B|O)\s*([+-]|positive|negative)?\b/i
    );
    if (labeledBlood) {
        bloodGroup = normalizeBloodGroup(labeledBlood[1], labeledBlood[2] || null);
    } else {
        const signed = compactText.match(BLOOD_GROUP_WITH_SIGN_REGEX);
        if (signed) {
            bloodGroup = normalizeBloodGroup(signed[1], signed[2]);
        } else {
            const worded = compactText.match(BLOOD_GROUP_TEXT_REGEX);
            if (worded) {
                bloodGroup = normalizeBloodGroup(worded[1], worded[2]);
            }
        }
    }

    let doctorName: string | null = extractLabeledValue(compactText, [
        "ref(?:erred)?\\.?\\s*doctor",
        "referred\\s*by",
        "consultant",
        "doctor",
        "dr\\.?"
    ]);
    if (doctorName) {
        doctorName = doctorName.replace(/^(dr\.?\s*)/i, "Dr. ");
    }

    let reportDate: Date | null = null;
    const labeledDate = extractLabeledValue(compactText, [
        "report\\s*date",
        "sample\\s*collected",
        "collected\\s*on",
        "date"
    ]);
    if (labeledDate) {
        reportDate = parseDateCandidate(labeledDate);
    }
    if (!reportDate) {
        const fallbackDate = compactText.match(
            /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/
        );
        if (fallbackDate) {
            reportDate = parseDateCandidate(fallbackDate[0]);
        }
    }

    // Cleanup guards for noisy OCR captures
    if (patientName && patientName.length > 80) patientName = null;
    if (patientName && /(?:test|report|laboratory|pathology|hospital)/i.test(patientName)) patientName = null;
    if (patientAge !== null && (patientAge <= 0 || patientAge > 120)) patientAge = null;

    return {
        patientName,
        patientId,
        patientAge,
        gender,
        bloodGroup,
        doctorName,
        reportDate,
    };
}

