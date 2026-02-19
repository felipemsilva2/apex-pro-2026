/**
 * Centralized utility for all fitness and nutrition calculations.
 * Ensures precision, consistency, and professional-grade accuracy.
 */

// --- Nutrition Calculations ---

export interface MacroResult {
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
}

/**
 * Standard rounding for macros (1 decimal place)
 */
export const roundMacro = (val: number): number => Math.round(val * 10) / 10;

/**
 * Standard rounding for calories (0 decimal places)
 */
export const roundKcal = (val: number): number => Math.round(val);

/**
 * Calculate macros based on quantity, serving size and base values.
 * Default serving size is 100 (standard in nutrition tables).
 */
export function calculateMacros(
    quantity: number,
    baseKcal: number,
    baseProtein: number,
    baseCarbs: number,
    baseFats: number,
    baseServingSize: number = 100
): MacroResult {
    const ratio = quantity / (baseServingSize || 100);

    return {
        kcal: roundKcal(baseKcal * ratio),
        protein: roundMacro(baseProtein * ratio),
        carbs: roundMacro(baseCarbs * ratio),
        fats: roundMacro(baseFats * ratio),
    };
}

// --- Body Metrics Calculations ---

/**
 * Calculate BMI (Body Mass Index)
 * @param weightKg Weight in Kilograms
 * @param heightM Height in Meters
 */
export function calculateBMI(weightKg: number, heightM: number): number {
    if (!weightKg || !heightM) return 0;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * @param gender 'male' | 'female'
 */
export function calculateBMR(
    weightKg: number,
    heightCm: number,
    ageYears: number,
    gender: 'male' | 'female' | string
): number {
    if (!weightKg || !heightCm || !ageYears) return 0;

    // Mifflin-St Jeor Equation
    const base = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears);
    const offset = gender === 'male' ? 5 : -161;

    return Math.round(base + offset);
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure) based on Activity Level
 * @param mode 'sedentary' | 'light' | 'moderate' | 'active' | 'extra_active'
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
    const activityMultipliers: Record<string, number> = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'extra_active': 1.9
    };

    const multiplier = activityMultipliers[activityLevel] || 1.2;
    return Math.round(bmr * multiplier);
}

/**
 * Calculate WHR (Waist-Hip Ratio)
 */
export function calculateWHR(waistCm: number, hipCm: number): number {
    if (!waistCm || !hipCm) return 0;
    return Math.round((waistCm / hipCm) * 100) / 100;
}

/**
 * Calculate Lean Mass and Fat Mass
 */
export function calculateComposition(weightKg: number, bodyFatPercentage: number) {
    const fatMass = weightKg * (bodyFatPercentage / 100);
    const leanMass = weightKg - fatMass;

    return {
        fatMassKg: roundMacro(fatMass),
        leanMassKg: roundMacro(leanMass)
    };
}
