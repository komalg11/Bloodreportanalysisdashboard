import { ExtractedParameter } from "../utils/parameterExtractor";

interface ParameterInsight {
    parameter: string;
    status: "Normal" | "High" | "Low";
    message: string;
}

/**
 * Rules-based insight definitions keyed by normalized parameter name.
 */
const INSIGHT_RULES: Record<string, { low?: string; high?: string }> = {
    Hemoglobin: {
        low: "Your hemoglobin is below normal range, which may indicate anemia. Consider including iron-rich foods like spinach, red meat, and lentils in your diet. Please consult your doctor for further evaluation.",
        high: "Your hemoglobin is above normal range. This could be due to dehydration or other conditions. Stay hydrated and consult your doctor if symptoms persist.",
    },
    "Red Blood Cells": {
        low: "Your red blood cell count is low, which could indicate anemia or nutritional deficiencies. Ensure adequate intake of iron, vitamin B12, and folic acid.",
        high: "Your red blood cell count is elevated. This could be related to dehydration, smoking, or other conditions. Please consult your doctor.",
    },
    "White Blood Cells": {
        low: "Your white blood cell count is low, which could affect your immune function. Avoid exposure to infections and consult your doctor.",
        high: "Your white blood cell count is elevated, which may indicate an infection or inflammation. Monitor your symptoms and consult your doctor.",
    },
    Platelets: {
        low: "Your platelet count is low, which could affect blood clotting. Avoid activities that may cause injury and consult your doctor promptly.",
        high: "Your platelet count is elevated. This could be reactive or indicate an underlying condition. Please consult your doctor.",
    },
    "Total Cholesterol": {
        high: "Your total cholesterol is above the desirable level. Consider reducing saturated fats, increasing fiber intake, exercising regularly, and maintaining a healthy weight.",
    },
    "HDL Cholesterol": {
        low: "Your HDL (good) cholesterol is low. Regular aerobic exercise, healthy fats (olive oil, nuts, fish), and quitting smoking can help raise it.",
    },
    "LDL Cholesterol": {
        high: "Your LDL (bad) cholesterol is elevated. Reduce intake of trans fats and saturated fats, increase soluble fiber, and consider regular exercise.",
    },
    Triglycerides: {
        high: "Your triglyceride levels are elevated. Limit sugar and refined carbohydrate intake, reduce alcohol consumption, and increase physical activity.",
    },
    "Blood Sugar (Fasting)": {
        low: "Your fasting blood sugar is low (hypoglycemia). Eat regular, balanced meals and monitor your blood sugar levels.",
        high: "Your fasting blood sugar is elevated, which could indicate pre-diabetes or diabetes. Reduce sugar intake, exercise regularly, and consult your doctor for further screening.",
    },
    HbA1c: {
        high: "Your HbA1c is above normal, indicating poor blood sugar control over the past 2-3 months. This may suggest pre-diabetes or diabetes. Please consult your doctor for management advice.",
    },
    "Vitamin D": {
        low: "Your Vitamin D level is below normal. Increase sunlight exposure (15-20 minutes daily), consume Vitamin D-rich foods like fatty fish, fortified milk, and egg yolks. A supplement may also be recommended.",
    },
    "Vitamin B12": {
        low: "Your Vitamin B12 is low, which can cause fatigue and neurological issues. Include dairy, eggs, meat, or fortified cereals in your diet. Supplementation may be needed.",
    },
    Iron: {
        low: "Your iron levels are low. Include iron-rich foods such as red meat, beans, and fortified cereals. Vitamin C helps with iron absorption.",
        high: "Your iron levels are elevated. Excess iron can be harmful. Consult your doctor to rule out conditions like hemochromatosis.",
    },
    ESR: {
        high: "Your ESR is elevated, which may indicate inflammation, infection, or an autoimmune condition. Please consult your doctor for evaluation.",
    },
    Creatinine: {
        high: "Your creatinine is elevated, which may indicate reduced kidney function. Stay hydrated, limit protein intake, and consult your doctor.",
    },
    Urea: {
        high: "Your blood urea is elevated, which may suggest kidney issues or dehydration. Ensure adequate hydration and consult your doctor.",
    },
    "SGPT (ALT)": {
        high: "Your SGPT (ALT) is elevated, which may indicate liver stress. Avoid alcohol, reduce fatty foods, and consult your doctor.",
    },
    "SGOT (AST)": {
        high: "Your SGOT (AST) is elevated, which may indicate liver or muscle issues. Please consult your doctor for further evaluation.",
    },
    "Bilirubin (Total)": {
        high: "Your bilirubin is elevated, which may indicate liver dysfunction or bile duct issues. Please consult your doctor.",
    },
    TSH: {
        low: "Your TSH is low, which may indicate an overactive thyroid (hyperthyroidism). Consult your doctor for thyroid function evaluation.",
        high: "Your TSH is elevated, which may indicate an underactive thyroid (hypothyroidism). Consult your doctor; thyroid medication may be needed.",
    },
    "Uric Acid": {
        high: "Your uric acid is elevated, which may increase the risk of gout. Reduce intake of red meat, shellfish, and alcohol. Stay well hydrated.",
    },
};

/**
 * Generate health insights and recommendations from extracted parameters.
 * Uses rules-based logic — no AI dependency.
 */
export function generateInsights(parameters: ExtractedParameter[]): {
    insights: string;
    recommendations: string;
} {
    const abnormalInsights: ParameterInsight[] = [];
    const normalParams: string[] = [];

    for (const param of parameters) {
        if (param.status === "Normal") {
            normalParams.push(param.name);
            continue;
        }

        const rule = INSIGHT_RULES[param.name];
        if (rule) {
            const message = param.status === "Low" ? rule.low : rule.high;
            if (message) {
                abnormalInsights.push({
                    parameter: param.name,
                    status: param.status,
                    message,
                });
            }
        } else {
            // Generic insight for parameters without specific rules
            abnormalInsights.push({
                parameter: param.name,
                status: param.status,
                message: `Your ${param.name} is ${param.status.toLowerCase()}. Please consult your doctor for further evaluation.`,
            });
        }
    }

    // Build insights text
    let insights: string;
    if (abnormalInsights.length === 0) {
        insights = "All your blood parameters are within normal ranges. Your overall health profile looks good. Continue maintaining a healthy lifestyle with balanced nutrition and regular exercise.";
    } else {
        const abnormalSummary = abnormalInsights
            .map((i) => `${i.parameter} is ${i.status}`)
            .join(", ");

        insights = `Your blood report shows some parameters that need attention: ${abnormalSummary}. `;

        if (normalParams.length > 0) {
            insights += `The following parameters are within normal range: ${normalParams.join(", ")}. `;
        }

        insights += "Please review the recommendations below and consult your healthcare provider for personalized medical advice.";
    }

    // Build recommendations
    let recommendations: string;
    if (abnormalInsights.length === 0) {
        recommendations = "• Continue your current healthy lifestyle.\n• Maintain a balanced diet rich in fruits, vegetables, and lean proteins.\n• Stay physically active with regular exercise.\n• Schedule routine health check-ups every 6-12 months.";
    } else {
        recommendations = abnormalInsights
            .map((i) => `• ${i.parameter} (${i.status}): ${i.message}`)
            .join("\n");
        recommendations += "\n• Schedule a follow-up appointment with your doctor to discuss these results.";
    }

    return { insights, recommendations };
}
