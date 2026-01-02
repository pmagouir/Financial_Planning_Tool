import standardsData from '../data/standards.json';

/**
 * Calculates a normalized score (0-100+) for a test result
 * @param {number} result - The user's test result
 * @param {string} testName - Name of the test (e.g., "Deadlift")
 * @param {string} gender - "male" or "female"
 * @param {string} ageGroup - Age group (e.g., "35-39")
 * @param {number} bodyweight - User's bodyweight in lbs
 * @returns {number} Normalized score (0-100+)
 */
export function calculateScore(result, testName, gender, ageGroup, bodyweight) {
  const test = standardsData.tests[testName];
  if (!test) {
    return 0;
  }

  const genderData = test[gender];
  if (!genderData) {
    return 0;
  }

  const ageData = genderData[ageGroup];
  if (!ageData) {
    return 0;
  }

  const { basic, athletic, elite } = ageData;
  const { unit, type } = test;

  // Convert xBW units to absolute numbers
  let basicValue = basic;
  let athleticValue = athletic;
  let eliteValue = elite;

  if (unit === 'xBW') {
    basicValue = basic * bodyweight;
    athleticValue = athletic * bodyweight;
    eliteValue = elite * bodyweight;
  }

  // Handle "lower is better" logic for timed events (type: "low")
  if (type === 'low') {
    // For low type, lower result = higher score
    // We need to invert the comparison
    if (result <= eliteValue) {
      // Exceeds elite - score > 100
      // Calculate how much better than elite (as a percentage)
      const excess = (eliteValue - result) / eliteValue;
      return 100 + (excess * 50); // Cap at reasonable max, e.g., 150
    } else if (result <= athleticValue) {
      // Between athletic and elite: 66-100
      const range = athleticValue - eliteValue;
      const position = (athleticValue - result) / range;
      return 66 + (position * 34); // 66 to 100
    } else if (result <= basicValue) {
      // Between basic and athletic: 33-66
      const range = basicValue - athleticValue;
      const position = (basicValue - result) / range;
      return 33 + (position * 33); // 33 to 66
    } else {
      // Below basic: 0-33
      // For values above basic, we linearly interpolate down to 0
      // We'll use basic as the upper bound and assume anything significantly above gets 0
      const maxValue = basicValue * 1.5; // Assume 50% above basic is 0
      if (result >= maxValue) {
        return 0;
      }
      const range = maxValue - basicValue;
      const position = (maxValue - result) / range;
      return position * 33; // 0 to 33
    }
  } else {
    // Type: "high" - higher result = higher score
    if (result >= eliteValue) {
      // Exceeds elite - score > 100
      const excess = (result - eliteValue) / eliteValue;
      return 100 + (excess * 50); // Cap at reasonable max, e.g., 150
    } else if (result >= athleticValue) {
      // Between athletic and elite: 66-100
      const range = eliteValue - athleticValue;
      const position = (result - athleticValue) / range;
      return 66 + (position * 34); // 66 to 100
    } else if (result >= basicValue) {
      // Between basic and athletic: 33-66
      const range = athleticValue - basicValue;
      const position = (result - basicValue) / range;
      return 33 + (position * 33); // 33 to 66
    } else {
      // Below basic: 0-33
      // For values below basic, we linearly interpolate from 0
      if (result <= 0) {
        return 0;
      }
      const position = result / basicValue;
      return position * 33; // 0 to 33
    }
  }
}


