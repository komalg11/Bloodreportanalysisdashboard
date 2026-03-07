import dotenv from "dotenv";
import { ExtractedParameter } from "../utils/parameterExtractor";

dotenv.config();

/**
 * Normalize parameter names and units without using external AI
 */
export const normalizeParameters = async (
  parameters: ExtractedParameter[]
): Promise<ExtractedParameter[]> => {

  const NORMALIZATION_MAP: Record<string, string> = {
    hb: "Hemoglobin",
    hgb: "Hemoglobin",
    hemoglobin: "Hemoglobin",

    cholesterol: "Total Cholesterol",
    "total cholesterol": "Total Cholesterol",

    glucose: "Blood Sugar",
    sugar: "Blood Sugar",
    "blood sugar": "Blood Sugar",

    wbc: "WBC Count",
    "wbc count": "WBC Count",
    "white blood cells": "WBC Count",

    platelet: "Platelets",
    platelets: "Platelets",

    "vitamin d": "Vitamin D"
  };

  return parameters.map((param) => {

    const normalizedName =
      NORMALIZATION_MAP[param.name.toLowerCase()] || param.name;

    return {
      ...param,
      name: normalizedName
    };
  });
};


/**
 * Generate health insights using rule-based logic
 */
export const generateInsightsWithAI = async (
  parameters: ExtractedParameter[]
): Promise<{ insights: string; recommendations: string }> => {

  const insights: string[] = [];
  const recommendations: string[] = [];

  parameters.forEach((param) => {

    const name = param.name.toLowerCase();
    const value = param.value;

    if (name === "hemoglobin" && value < 13.5) {
      insights.push(
        "Your hemoglobin level appears lower than the typical range. This may indicate mild anemia."
      );

      recommendations.push(
        "Increase iron-rich foods such as spinach, beans, and lean meat."
      );
    }

    if (name === "total cholesterol" && value > 200) {
      insights.push(
        "Your cholesterol level is slightly elevated, which may increase cardiovascular risk over time."
      );

      recommendations.push(
        "Reduce fried and processed foods and include more fruits and vegetables."
      );
    }

    if (name === "vitamin d" && value < 30) {
      insights.push(
        "Vitamin D levels appear slightly low."
      );

      recommendations.push(
        "Spend more time in sunlight and consider vitamin D rich foods."
      );
    }

  });

  if (insights.length === 0) {
    insights.push(
      "Most of your blood parameters appear within normal ranges based on the available data."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Maintain a balanced diet, regular exercise, and routine medical checkups."
    );
  }

  return {
    insights: insights.join(" "),
    recommendations: recommendations.map(r => `• ${r}`).join("\n")
  };
};