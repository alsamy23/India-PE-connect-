import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Calendar, 
  Target, 
  ShieldCheck, 
  Activity, 
  Layers, 
  CheckCircle2, 
  Info,
  Maximize2,
  Download
} from 'lucide-react';
import { FitnessResult, Student } from '../../types.ts';
import { parseFitnessValue } from '../../utils/bmiUtils.ts';

interface D3StudentProgressChartProps {
  student: Student;
  results: FitnessResult[];
  className?: string;
}

interface CBSEBenchmark {
  excellent: number;
  average: number;
  needsImprovement: number;
  unit: string;
  lowerIsBetter: boolean;
  description: string;
}

const CBSE_BENCHMARKS: Record<string, CBSEBenchmark> = {
  sprint_50m: {
    excellent: 8.2,
    average: 9.5,
    needsImprovement: 11.2,
    unit: 'sec',
    lowerIsBetter: true,
    description: 'CBSE 50m Speed Sprint Benchmark for Middle School'
  },
  run_600m: {
    excellent: 160, // 2:40 in seconds
    average: 210, // 3:30
    needsImprovement: 270, // 4:30
    unit: 'sec',
    lowerIsBetter: true,
    description: 'CBSE 600m Aerobic Stamina Benchmark'
  },
  broad_jump: {
    excellent: 165,
    average: 135,
    needsImprovement: 110,
    unit: 'cm',
    lowerIsBetter: false,
    description: 'CBSE Standing Broad Jump Explosive Power'
  },
  sit_reach: {
    excellent: 19,
    average: 12,
    needsImprovement: 6,
    unit: 'cm',
    lowerIsBetter: false,
    description: 'CBSE Hamstring & Lower Back Flexibility'
  },
  shuttle_4x10: {
    excellent: 11.8,
    average: 13.5,
    needsImprovement: 15.5,
    unit: 'sec',
    lowerIsBetter: true,
    description: 'CBSE 4x10m Shuttle Agility Benchmark'
  },
  shuttle_run: {
    excellent: 11.8,
    average: 13.5,
    needsImprovement: 15.5,
    unit: 'sec',
    lowerIsBetter: true,
    description: 'CBSE Shuttle Agility Benchmark'
  },
  bmi: {
    excellent: 18.5,
    average: 21.0,
    needsImprovement: 24.5,
    unit: 'kg/m²',
    lowerIsBetter: false, // Target range
    description: 'CBSE Healthy Body Mass Index Guideline'
  },
  curl_ups: {
    excellent: 25,
    average: 15,
    needsImprovement: 8,
    unit: 'reps',
    lowerIsBetter: false,
    description: 'CBSE Abdominal Muscular Endurance'
  },
  pushups: {
    excellent: 22,
    average: 14,
    needsImprovement: 7,
    unit: 'reps',
    lowerIsBetter: false,
    description: 'CBSE Upper Body Muscular Strength'
  },
  plate_tapping: {
    excellent: 36,
    average: 26,
    needsImprovement: 18,
    unit: 'count',
    lowerIsBetter: false,
    description: 'CBSE Limb Speed & Coordination'
  },
  flamingo: {
    excellent: 2,
    average: 5,
    needsImprovement: 9,
    unit: 'count',
    lowerIsBetter: true, // fewer falls is better
    description: 'CBSE Single-Leg Static Balance'
  }
};

// Default benchmark fallback for sport rubrics or non-standard tests
const DEFAULT_RUBRIC_BENCHMARK: CBSEBenchmark = {
  excellent: 8.5,
  average: 6.0,
  needsImprovement: 4.0,
  unit: 'pts',
  lowerIsBetter: false,
  description: 'CBSE Curricular Skill Proficiency Standard (1-10)'
};

export const D3StudentProgressChart: React.FC<D3StudentProgressChartProps> = ({
  student,
  results,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Group available test types from student's results
  const availableTests = useMemo(() => {
    const map = new Map<string, { id: string; name: string; unit: string }>();
    results.forEach(r => {
      const cleanName = r.testName.split('(')[0].trim();
      if (!map.has(r.testId)) {
        map.set(r.testId, { id: r.testId, name: cleanName, unit: r.unit });
      }
    });
    return Array.from(map.values());
  }, [results]);

  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [showBenchmarkOverlay, setShowBenchmarkOverlay] = useState<boolean>(true);
  const [showDataLabels, setShowDataLabels] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  // Select first test automatically when availableTests change
  useEffect(() => {
    if (availableTests.length > 0 && (!selectedTestId || !availableTests.some(t => t.id === selectedTestId))) {
      setSelectedTestId(availableTests[0].id);
    }
  }, [availableTests, selectedTestId]);

  // Current selected test details
  const currentTestInfo = useMemo(() => {
    return availableTests.find(t => t.id === selectedTestId) || availableTests[0];
  }, [availableTests, selectedTestId]);

  // Extract chronological data points for selected test
  const chartData = useMemo(() => {
    if (!selectedTestId) return [];
    
    const filtered = results.filter(r => r.testId === selectedTestId);
    
    // Sort chronologically by date and term order
    const termOrder: Record<string, number> = { 'Baseline': 1, 'Term 1': 2, 'Term 2': 3, 'Final': 4 };
    
    return filtered.map(r => {
      const numVal = parseFitnessValue(r.value);
      const parsedDate = new Date(r.date);
      const isValidDate = !isNaN(parsedDate.getTime());
      
      return {
        id: r.id,
        term: r.term || 'Test',
        dateStr: r.date,
        dateObj: isValidDate ? parsedDate : new Date(),
        val: numVal,
        rawVal: r.value,
        unit: r.unit,
        rating: r.rating || 'Standard',
        testName: r.testName
      };
    }).sort((a, b) => {
      if (a.dateObj.getTime() !== b.dateObj.getTime()) {
        return a.dateObj.getTime() - b.dateObj.getTime();
      }
      return (termOrder[a.term] || 0) - (termOrder[b.term] || 0);
    });
  }, [results, selectedTestId]);

  // Active CBSE Benchmark definition
  const benchmark = useMemo(() => {
    if (!selectedTestId) return DEFAULT_RUBRIC_BENCHMARK;
    if (CBSE_BENCHMARKS[selectedTestId]) return CBSE_BENCHMARKS[selectedTestId];
    if (selectedTestId.startsWith('rubric_')) return DEFAULT_RUBRIC_BENCHMARK;
    return DEFAULT_RUBRIC_BENCHMARK;
  }, [selectedTestId]);

  // Metrics computation for cards
  const metrics = useMemo(() => {
    if (chartData.length === 0) return null;
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    
    const change = last.val - first.val;
    const pctChange = first.val !== 0 ? ((change / first.val) * 100).toFixed(1) : '0';
    
    let isImproved = false;
    if (benchmark.lowerIsBetter) {
      isImproved = change < 0;
    } else {
      isImproved = change > 0;
    }

    // Personal best
    let bestVal = chartData[0].val;
    let bestDate = chartData[0].term;
    chartData.forEach(d => {
      if (benchmark.lowerIsBetter) {
        if (d.val < bestVal) {
          bestVal = d.val;
          bestDate = d.term;
        }
      } else {
        if (d.val > bestVal) {
          bestVal = d.val;
          bestDate = d.term;
        }
      }
    });

    // Comparison against CBSE Excellent benchmark
    const diffVsBenchmark = last.val - benchmark.excellent;
    const pctVsBenchmark = ((Math.abs(diffVsBenchmark) / benchmark.excellent) * 100).toFixed(1);
    let benchmarkStatus = '';
    
    if (benchmark.lowerIsBetter) {
      if (last.val <= benchmark.excellent) {
        benchmarkStatus = `Exceeds CBSE Elite Standard by ${pctVsBenchmark}%`;
      } else if (last.val <= benchmark.average) {
        benchmarkStatus = `Meets CBSE Average Target`;
      } else {
        benchmarkStatus = `Below CBSE Standard Target`;
      }
    } else {
      if (last.val >= benchmark.excellent) {
        benchmarkStatus = `Exceeds CBSE Elite Standard by ${pctVsBenchmark}%`;
      } else if (last.val >= benchmark.average) {
        benchmarkStatus = `Meets CBSE Average Target`;
      } else {
        benchmarkStatus = `Below CBSE Standard Target`;
      }
    }

    return {
      first,
      last,
      change: Math.abs(change).toFixed(1),
      pctChange: Math.abs(parseFloat(pctChange)),
      isImproved,
      bestVal,
      bestDate,
      benchmarkStatus,
      totalEntries: chartData.length
    };
  }, [chartData, benchmark]);

  // Render D3 SVG Chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || chartData.length === 0) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawing

    const margin = { top: 35, right: 120, bottom: 50, left: 55 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) return;

    const g = svg
      .attr('width', container.clientWidth)
      .attr('height', 300)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale (X-Axis: Term / Date)
    const xScale = d3.scalePoint()
      .domain(chartData.map(d => `${d.term} (${d.dateStr})`))
      .range([0, width])
      .padding(0.4);

    // Calculate Y Domain considering values and CBSE benchmarks
    const allYValues = [
      ...chartData.map(d => d.val),
      benchmark.excellent,
      benchmark.average,
      benchmark.needsImprovement
    ];

    let yMin = d3.min(allYValues) || 0;
    let yMax = d3.max(allYValues) || 100;
    
    // Give 15% breathing room top and bottom
    const padding = (yMax - yMin) * 0.15 || 5;
    yMin = Math.max(0, yMin - padding);
    yMax = yMax + padding;

    // Y Scale (Y-Axis: Metric score)
    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height, 0]);

    // Grid lines background
    const makeYGridlines = () => d3.axisLeft(yScale).ticks(5);

    g.append('g')
      .attr('class', 'grid-lines')
      .call(
        makeYGridlines()
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .attr('stroke-opacity', 0.15)
      .attr('stroke', '#cbd5e1')
      .attr('stroke-dasharray', '3,3');

    // CBSE Benchmark Shaded Zones / Reference Lines
    if (showBenchmarkOverlay) {
      const benchmarkGroup = g.append('g').attr('class', 'cbse-benchmarks');

      // 1. Excellent Benchmark Line
      const yExc = yScale(benchmark.excellent);
      if (yExc >= 0 && yExc <= height) {
        benchmarkGroup.append('line')
          .attr('x1', 0)
          .attr('x2', width)
          .attr('y1', yExc)
          .attr('y2', yExc)
          .attr('stroke', '#10b981') // emerald
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,4');

        benchmarkGroup.append('rect')
          .attr('x', width + 6)
          .attr('y', yExc - 10)
          .attr('width', 105)
          .attr('height', 20)
          .attr('rx', 6)
          .attr('fill', '#ecfdf5')
          .attr('stroke', '#10b981')
          .attr('stroke-width', 1);

        benchmarkGroup.append('text')
          .attr('x', width + 12)
          .attr('y', yExc + 3)
          .attr('fill', '#047857')
          .attr('font-size', '9px')
          .attr('font-weight', '900')
          .text(`CBSE Elite: ${benchmark.excellent} ${benchmark.unit}`);
      }

      // 2. Average Benchmark Line
      const yAvg = yScale(benchmark.average);
      if (yAvg >= 0 && yAvg <= height) {
        benchmarkGroup.append('line')
          .attr('x1', 0)
          .attr('x2', width)
          .attr('y1', yAvg)
          .attr('y2', yAvg)
          .attr('stroke', '#6366f1') // indigo
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '4,3');

        benchmarkGroup.append('rect')
          .attr('x', width + 6)
          .attr('y', yAvg - 10)
          .attr('width', 105)
          .attr('height', 20)
          .attr('rx', 6)
          .attr('fill', '#eef2ff')
          .attr('stroke', '#6366f1')
          .attr('stroke-width', 1);

        benchmarkGroup.append('text')
          .attr('x', width + 12)
          .attr('y', yAvg + 3)
          .attr('fill', '#4338ca')
          .attr('font-size', '9px')
          .attr('font-weight', '900')
          .text(`CBSE Target: ${benchmark.average} ${benchmark.unit}`);
      }
    }

    // Line Generator (Monotone Bezier Curve)
    const lineGenerator = d3.line<any>()
      .x(d => xScale(`${d.term} (${d.dateStr})`) || 0)
      .y(d => yScale(d.val))
      .curve(d3.curveMonotoneX);

    // Area Generator (Gradient Fill under line)
    const areaGenerator = d3.area<any>()
      .x(d => xScale(`${d.term} (${d.dateStr})`) || 0)
      .y0(height)
      .y1(d => yScale(d.val))
      .curve(d3.curveMonotoneX);

    // Gradient Definition
    const svgDefs = svg.append('defs');
    const areaGradient = svgDefs.append('linearGradient')
      .attr('id', 'student-progress-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4f46e5')
      .attr('stop-opacity', 0.25);

    areaGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4f46e5')
      .attr('stop-opacity', 0.0);

    // Draw Area under line
    g.append('path')
      .datum(chartData)
      .attr('fill', 'url(#student-progress-gradient)')
      .attr('d', areaGenerator);

    // Draw Progress Line with Animation
    const path = g.append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 3.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', lineGenerator);

    // Animate line draw
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Draw Interactive Data Nodes (Dots)
    const dots = g.selectAll('.data-dot')
      .data(chartData)
      .enter()
      .append('g')
      .attr('class', 'data-dot')
      .attr('transform', d => `translate(${xScale(`${d.term} (${d.dateStr})`) || 0}, ${yScale(d.val)})`);

    // Outer glow ring
    dots.append('circle')
      .attr('r', 8)
      .attr('fill', '#4f46e5')
      .attr('fill-opacity', 0.15)
      .attr('class', 'glow-ring');

    // Inner dot
    dots.append('circle')
      .attr('r', 5)
      .attr('fill', '#ffffff')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2.5)
      .attr('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).transition().duration(150).attr('r', 8).attr('fill', '#4f46e5');
        setHoveredPoint(d);
      })
      .on('mouseout', function () {
        d3.select(this).transition().duration(150).attr('r', 5).attr('fill', '#ffffff');
        setHoveredPoint(null);
      });

    // Value Labels above dots
    if (showDataLabels) {
      dots.append('text')
        .attr('y', -12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#1e293b')
        .attr('font-size', '10px')
        .attr('font-weight', '900')
        .text(d => `${d.rawVal} ${d.unit}`);
    }

    // X-Axis
    const xAxis = d3.axisBottom(xScale);
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#475569')
      .attr('font-size', '9px')
      .attr('font-weight', '800')
      .attr('dy', '1.2em');

    // Y-Axis
    const yAxis = d3.axisLeft(yScale).ticks(5);
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#475569')
      .attr('font-size', '9px')
      .attr('font-weight', '800');

  }, [chartData, benchmark, showBenchmarkOverlay, showDataLabels]);

  // Handle Resize for Fluid Responsiveness
  useEffect(() => {
    const handleResize = () => {
      // Trigger state re-render by toggling a dummy state or forcing layout update
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  if (availableTests.length === 0) {
    return (
      <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-8 text-center my-4">
        <Activity size={32} className="mx-auto text-slate-400 mb-2" />
        <h4 className="text-sm font-black uppercase text-slate-700">No Physical Test Records</h4>
        <p className="text-xs text-slate-500 mt-1">Record fitness test results to unlock the D3 Long-Term Progress Chart.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-3xl border-2 border-slate-900 p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={16} />
              D3 Analytics Engine
            </span>
            <span className="text-xs font-black uppercase text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              CBSE HPE Norms
            </span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mt-2">
            Long-Term Progress & CBSE Growth Tracker
          </h3>
          <p className="text-xs font-bold text-slate-500">
            Interactive D3 visualization tracking {student.name}'s performance progression across terms vs. official CBSE benchmarks.
          </p>
        </div>

        {/* Test Selector Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-black uppercase text-slate-500 ml-2">Select Test:</span>
            <select
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              className="bg-white text-slate-900 font-extrabold text-xs px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {availableTests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.unit})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowBenchmarkOverlay(!showBenchmarkOverlay)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 cursor-pointer ${
              showBenchmarkOverlay
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck size={14} className={showBenchmarkOverlay ? 'text-emerald-600' : 'text-slate-400'} />
            <span>CBSE Target Lines</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Grid */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
          {/* Growth Rate */}
          <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Progress Trend</span>
            <div className="flex items-center gap-1.5 mt-1">
              {metrics.isImproved ? (
                <TrendingUp size={20} className="text-emerald-600 shrink-0" />
              ) : (
                <TrendingDown size={20} className="text-amber-600 shrink-0" />
              )}
              <span className={`text-lg font-black ${metrics.isImproved ? 'text-emerald-700' : 'text-amber-700'}`}>
                {metrics.isImproved ? '+' : '-'}{metrics.pctChange}%
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-500 mt-0.5">
              From Baseline ({metrics.first.rawVal}) to {metrics.last.term} ({metrics.last.rawVal})
            </span>
          </div>

          {/* Personal Best */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">Personal Best</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Award size={20} className="text-amber-600 shrink-0" />
              <span className="text-lg font-black text-slate-900">
                {metrics.bestVal} <span className="text-xs font-bold opacity-60">{currentTestInfo?.unit}</span>
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-500 mt-0.5">
              Achieved during {metrics.bestDate}
            </span>
          </div>

          {/* CBSE Benchmark Comparison */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col justify-between col-span-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-800">CBSE Norm Alignment</span>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-xs font-black text-emerald-950">
                {metrics.benchmarkStatus}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-md shrink-0">
                Target: {benchmark.excellent} {benchmark.unit}
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-0.5 line-clamp-1">
              {benchmark.description}
            </span>
          </div>
        </div>
      )}

      {/* D3 SVG Chart Container */}
      <div ref={containerRef} className="w-full relative my-2 overflow-x-auto">
        <svg ref={svgRef} className="w-full h-[300px] overflow-visible" />

        {/* Hover Floating Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-slate-900 text-white p-3 rounded-2xl shadow-xl z-20 text-xs font-mono border border-slate-700 animate-in fade-in">
            <div className="font-black text-[#D4A017] uppercase tracking-wider border-b border-slate-800 pb-1 mb-1">
              {hoveredPoint.term} ({hoveredPoint.dateStr})
            </div>
            <div className="text-slate-200">
              Score: <strong className="text-white text-sm">{hoveredPoint.rawVal} {hoveredPoint.unit}</strong>
            </div>
            <div className="text-[10px] text-emerald-400 font-bold mt-1">
              Rating: {hoveredPoint.rating}
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer / Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-200 text-[10px] text-slate-500 font-bold">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-indigo-600 rounded-full"></span>
            <span>Student Performance Score</span>
          </div>
          {showBenchmarkOverlay && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-500 border-t border-dashed border-emerald-600"></span>
                <span>CBSE Elite Threshold</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-indigo-500 border-t border-dashed border-indigo-600"></span>
                <span>CBSE Average Target</span>
              </div>
            </>
          )}
        </div>
        <div className="text-slate-400">
          Powered by D3.js • CBSE HPE Standards
        </div>
      </div>
    </div>
  );
};
