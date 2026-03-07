/**
 * A mapping of common blood test variations to a single standardized name.
 */
const parameterAliasMap: Record<string, string> = {
    // Hemoglobin variations
    hb: "Hemoglobin",
    hgb: "Hemoglobin",
    haemoglobin: "Hemoglobin",

    // Red Blood Cells
    rbc: "Red Blood Cells",
    "red blood cell count": "Red Blood Cells",

    // White Blood Cells
    wbc: "White Blood Cells",
    "white blood cell count": "White Blood Cells",
    leukocytes: "White Blood Cells",

    // Platelets
    plt: "Platelets",
    "platelet count": "Platelets",
    thrombocytes: "Platelets",

    // Mean Corpuscular Volume
    mcv: "MCV",
    "mean corpuscular volume": "MCV",

    // Mean Corpuscular Hemoglobin
    mch: "MCH",
    "mean corpuscular hgb": "MCH",

    // Mean Corpuscular Hemoglobin Concentration
    mchc: "MCHC",

    // Cholesterol variations
    chol: "Cholesterol",
    "total cholesterol": "Cholesterol",

    // High-Density Lipoprotein
    hdl: "HDL Cholesterol",
    "hdl-c": "HDL Cholesterol",
    "good cholesterol": "HDL Cholesterol",

    // Low-Density Lipoprotein
    ldl: "LDL Cholesterol",
    "ldl-c": "LDL Cholesterol",
    "bad cholesterol": "LDL Cholesterol",

    // Triglycerides
    trig: "Triglycerides",
    tg: "Triglycerides",

    // Fasting Blood Sugar
    fbs: "Glucose (Fasting)",
    glucose: "Glucose (Fasting)",
    "blood sugar": "Glucose (Fasting)",
};

/**
 * Normalizes a raw parameter name extracted by OCR/AI into a standard name.
 * Default is to capitalize the first letter of each word if no alias is found.
 */
export const normalizeParameterName = (rawName: string): string => {
    if (!rawName) return "Unknown Parameter";

    const lowerName = rawName.trim().toLowerCase();

    if (parameterAliasMap[lowerName]) {
        return parameterAliasMap[lowerName];
    }

    // Formatting unknown parameters to Title Case properly
    return lowerName
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};
