/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const calculateDrawLength = (wingspanCm: number) => {
  return parseFloat(((wingspanCm / 2.54) / 2.5).toFixed(1));
};

export const getIdealArrowLength = (drawLength: number) => {
  return parseFloat((drawLength + 1.5).toFixed(1));
};

export const calculateArrowSpine = (arrowLength: number, drawWeight: number, bowType: string = 'recurve', pointWeight: number = 100) => {
  // Base Spine Chart (Standardized for 28" shaft, 100gr point)
  // Bow type multiplier (Compound bows are much more aggressive/energetic)
  const energeticMultiplier = bowType === 'compound' ? 1.6 : (bowType === 'traditional' ? 0.9 : 1.0);
  const virtualWeight = drawWeight * energeticMultiplier;

  let baseSpine: number;
  if (virtualWeight >= 75) baseSpine = 250;
  else if (virtualWeight >= 70) baseSpine = 300;
  else if (virtualWeight >= 65) baseSpine = 340;
  else if (virtualWeight >= 60) baseSpine = 370;
  else if (virtualWeight >= 55) baseSpine = 400;
  else if (virtualWeight >= 50) baseSpine = 450;
  else if (virtualWeight >= 45) baseSpine = 500;
  else if (virtualWeight >= 40) baseSpine = 550;
  else if (virtualWeight >= 36) baseSpine = 600;
  else if (virtualWeight >= 32) baseSpine = 650;
  else if (virtualWeight >= 28) baseSpine = 750;
  else if (virtualWeight >= 24) baseSpine = 850;
  else if (virtualWeight >= 20) baseSpine = 1000;
  else if (virtualWeight >= 15) baseSpine = 1200;
  else baseSpine = 1400;

  // Length Adjustment: 1" = ~55 spine units
  const lengthDiff = arrowLength - 28;
  let adjustedSpine = baseSpine - (lengthDiff * 55);

  // Point Weight Adjustment: Every grain above 100 weakens dynamic spine
  const weightDiff = pointWeight - 100;
  adjustedSpine = adjustedSpine - (weightDiff * 0.7);

  const finalSpine = Math.round(adjustedSpine / 10) * 10;

  return Math.max(200, Math.min(1800, finalSpine));
};

// Deprecated or Bridge function to maintain compatibility during migration if needed
export const calculateArrowSpecs = (drawLength: number, drawWeight: number, bowType: string = 'recurve', pointWeight: number = 100) => {
  const arrowLength = getIdealArrowLength(drawLength);
  const arrowSpine = calculateArrowSpine(arrowLength, drawWeight, bowType, pointWeight);
  return { arrowLength, arrowSpine };
};

export const calculateBraceHeight = (riser: number, limbs: 'short' | 'medium' | 'long') => {
  // Total Bow Length mapping
  let bowLength = riser + (limbs === 'short' ? 41 : limbs === 'long' ? 45 : 43);
  
  // Average Recommended Brace Heights (ATA Estimates for modern recurve)
  if (bowLength <= 66) return 8.3; // Approx 21-23 cm
  if (bowLength <= 68) return 8.6;
  if (bowLength <= 70) return 8.9;
  return 9.1;
};
