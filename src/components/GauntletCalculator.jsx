import { useState, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { calculateScore } from '../utils/scoring';
import standardsData from '../data/standards.json';

export default function GauntletCalculator() {
  const [gender, setGender] = useState('male');
  const [ageGroup, setAgeGroup] = useState('35-39');
  const [bodyweight, setBodyweight] = useState(180);
  const [results, setResults] = useState({});

  // Get all test names from domains
  const allTests = useMemo(() => {
    return Object.values(standardsData.domains).flat();
  }, []);

  // Calculate scores for all tests
  const scores = useMemo(() => {
    const scoreData = {};
    allTests.forEach(testName => {
      const result = results[testName];
      if (result !== undefined && result !== null && result !== '') {
        scoreData[testName] = calculateScore(
          parseFloat(result),
          testName,
          gender,
          ageGroup,
          bodyweight
        );
      }
    });
    return scoreData;
  }, [results, gender, ageGroup, bodyweight, allTests]);

  // Prepare data for radar chart
  const radarData = useMemo(() => {
    return allTests.map(testName => ({
      test: testName,
      score: scores[testName] || 0,
    }));
  }, [allTests, scores]);

  // Create background ring data for Basic (33), Athletic (66), Elite (100)
  const basicRingData = useMemo(() => {
    return allTests.map(testName => ({ test: testName, basic: 33 }));
  }, [allTests]);

  const athleticRingData = useMemo(() => {
    return allTests.map(testName => ({ test: testName, athletic: 66 }));
  }, [allTests]);

  const eliteRingData = useMemo(() => {
    return allTests.map(testName => ({ test: testName, elite: 100 }));
  }, [allTests]);

  // Calculate domain averages
  const domainAverages = useMemo(() => {
    const averages = {};
    Object.entries(standardsData.domains).forEach(([domain, tests]) => {
      const domainScores = tests
        .map(test => scores[test])
        .filter(score => score !== undefined && score > 0);
      if (domainScores.length > 0) {
        averages[domain] = domainScores.reduce((a, b) => a + b, 0) / domainScores.length;
      } else {
        averages[domain] = 0;
      }
    });
    return averages;
  }, [scores]);

  // Find strongest and weakest domains
  const strongestDomain = useMemo(() => {
    const entries = Object.entries(domainAverages).filter(([_, avg]) => avg > 0);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  }, [domainAverages]);

  const weakestDomain = useMemo(() => {
    const entries = Object.entries(domainAverages).filter(([_, avg]) => avg > 0);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => (a[1] < b[1] ? a : b))[0];
  }, [domainAverages]);

  // Calculate overall hybrid level
  const hybridLevel = useMemo(() => {
    const allScores = Object.values(scores).filter(s => s > 0);
    if (allScores.length === 0) return 'N/A';
    
    const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    
    if (avgScore >= 100) return 'Elite+';
    if (avgScore >= 66) return 'Elite';
    if (avgScore >= 33) return 'Athletic';
    return 'Basic';
  }, [scores]);

  const handleResultChange = (testName, value) => {
    setResults(prev => ({
      ...prev,
      [testName]: value,
    }));
  };

  const getTestUnit = (testName) => {
    return standardsData.tests[testName]?.unit || '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-center mb-2">THE GAUNTLET</h1>
          <p className="text-center text-slate-400">Fitness Assessment Calculator</p>
        </header>

        {/* User Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Age Group</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="21-34">21-34</option>
              <option value="35-39">35-39</option>
              <option value="40-44">40-44</option>
              <option value="45-49">45-49</option>
              <option value="50+">50+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bodyweight (lbs)</label>
            <input
              type="number"
              value={bodyweight}
              onChange={(e) => setBodyweight(parseFloat(e.target.value) || 180)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Test Inputs by Domain */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(standardsData.domains).map(([domain, tests]) => (
            <div key={domain} className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">{domain}</h2>
              <div className="space-y-4">
                {tests.map(testName => (
                  <div key={testName}>
                    <label className="block text-sm font-medium mb-1">
                      {testName} ({getTestUnit(testName)})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={results[testName] || ''}
                      onChange={(e) => handleResultChange(testName, e.target.value)}
                      placeholder="Enter result"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Radar Chart */}
        <div className="bg-slate-900 rounded-lg p-6 mb-8 border border-slate-800">
          <h2 className="text-2xl font-semibold mb-4 text-center">Performance Radar</h2>
          <div className="flex justify-center gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-slate-500"></div>
              <span className="text-slate-400">Basic (33)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-slate-500 border-dashed border-t"></div>
              <span className="text-slate-400">Athletic (66)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-slate-500"></div>
              <span className="text-slate-400">Elite (100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 opacity-60"></div>
              <span className="text-blue-400">Your Score</span>
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid 
                  gridType="polygon"
                  stroke="#475569"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 120]}
                  tick={false}
                  axisLine={false}
                />
                <PolarAngleAxis 
                  dataKey="test" 
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                />
                {/* Background rings for Basic (33), Athletic (66), Elite (100) */}
                <Radar
                  name="Basic"
                  dataKey="basic"
                  data={basicRingData}
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
                <Radar
                  name="Athletic"
                  dataKey="athletic"
                  data={athleticRingData}
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
                <Radar
                  name="Elite"
                  dataKey="elite"
                  data={eliteRingData}
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1}
                />
                {/* User's performance overlay */}
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Report */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h2 className="text-2xl font-semibold mb-4">Summary Report</h2>
          <div className="space-y-3">
            <div className="text-lg">
              <span className="font-semibold">Your Hybrid Level:</span>{' '}
              <span className="text-blue-400 font-bold">{hybridLevel}</span>
            </div>
            {strongestDomain && (
              <div className="text-lg">
                <span className="font-semibold">Strongest Domain:</span>{' '}
                <span className="text-green-400">{strongestDomain}</span>
                {' '}({domainAverages[strongestDomain].toFixed(1)})
              </div>
            )}
            {weakestDomain && (
              <div className="text-lg">
                <span className="font-semibold">Weakest Domain:</span>{' '}
                <span className="text-red-400">{weakestDomain}</span>
                {' '}({domainAverages[weakestDomain].toFixed(1)})
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

