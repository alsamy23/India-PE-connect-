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
  Minimize2,
  Download,
  BarChart3,
  Radar as RadarIcon,
  Flame,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  BarChart as RechartsBarChart,
  Bar,
  Legend
} from 'recharts';
import { FitnessResult, Student } from '../../types.ts';
import { parseFitnessValue, calculateExactBMI } from '../../utils/bmiUtils.ts';

export interface D3StudentProgressChartProps {
  student: Student;
  results: FitnessResult[];
  className?: string;
  defaultTestId?: string;
  showMultiTestComparison?: boolean;
}

interface CBSEBenchmark {
  excellent: number;
  average: number;
  needsImprovement: number;
  unit: string;
  lowerIsBetter: boolean;
  category: 'Speed' | 'Endurance' | 'Strength' | 'Flexibility' | 'Agility' | 'Balance' | 'Composition' | 'Skill';
  description: string;
}

export const CBSE_BENCHMARKS: Record<string, CBSEBenchmark> = {
  sprint_50m: {
    excellent: 8.2,
    average: 9.5,
    needsImprovement: 11.2,
    unit: 'sec',
    lowerIsBetter: true,
    category: 'Speed',
    description: 'CBSE 50m Speed Sprint Benchmark for Middle & Senior School'
  },
  sprint_30m: {
    excellent: 5.2,
    average: 6.2,
    needsImprovement: 7.5,
    unit: 'sec',
    lowerIsBetter: true,
    category: 'Speed',
    description: 'CBSE 30m Speed Sprint for Primary/Middle'
  },
  sprint_25m: {
    excellent: 4.5,
    average: 5.4,
    needsImprovement: 6.8,
    unit: 'sec',
    lowerIsBetter: true,
    category: 'Speed',
    description: 'CBSE 25m Sprint Acceleration'
  },
  run_600m: {
    excellent: 160, // 2:40 in seconds (displayed as mm:ss or sec)
    average: 210,   // 3:30
    needsImprovement: 270, // 4:30
    unit: 'sec',
    lowerIsBetter: true,
    category: 'Endurance',
    description: 'CBSE 600m Aerobic Stamina & Cardiovascular Endurance'
  },
  broad_jump: {
    excellent: 165,
    average: 135,
    needsImprovement: 110,
    unit: 'cm',
    lowerIsBetter: false,
    category: 'Strength',
    description: 'CBSE Standing Broad Jump Explosive Leg Power'
  },
  sit_reach: {
    excellent: 19,
    average: 12,
    needsImprovement: 6,
    unit: 'cm',
    lowerIsBetter: false,
    category: 'Flexibility',
    description: 'CBSE Hamstring & Lower Back Flexibility Range'
  },
  shuttle_4x10: {
    excellent: 11.8,
    average: 13.5,
    needsImprovement: 15.5,
    unit: 'sec',
    lowerIsBetter: true,
    category: 'Agility',
    description: 'CBSE 4x10m Shuttle Run Agility & Change of Direction'
  },
  shuttle_run: {
    excellent: 11.8,
    average: 13.5,
    needsImprovement: 15.5,
    unit: 'sec',
    lowerIsBetter: true,
    category: 'Agility',
    description: 'CBSE Shuttle Agility & Deceleration'
  },
  bmi: {
    excellent: 20.5,
    average: 22.0,
    needsImprovement: 26.0,
    unit: 'kg/m²',
    lowerIsBetter: false,
    category: 'Composition',
    description: 'CBSE Healthy Body Mass Index Guideline (18.5 - 24.9)'
  },
  curl_ups: {
    excellent: 25,
    average: 15,
    needsImprovement: 8,
    unit: 'reps',
    lowerIsBetter: false,
    category: 'Strength',
    description: 'CBSE Abdominal Muscular Endurance (30s Khelo India / 60s Senior)'
  },
  pushups: {
    excellent: 22,
    average: 14,
    needsImprovement: 7,
    unit: 'reps',
    lowerIsBetter: false,
    category: 'Strength',
    description: 'CBSE Upper Body Muscular Strength & Endurance (60s continuous)'
  },
  plate_tapping: {
    excellent: 36,
    average: 26,
    needsImprovement: 18,
    unit: 'count',
    lowerIsBetter: false,
    category: 'Speed',
    description: 'CBSE Limb Speed & Visual-Motor Coordination'
  },
  flamingo: {
    excellent: 2,
    average: 5,
    needsImprovement: 9,
    unit: 'count',
    lowerIsBetter: true, // fewer falls is superior
    category: 'Balance',
    description: 'CBSE Single-Leg Static Balance Test (Falls in 60s)'
  }
};

const DEFAULT_RUBRIC_BENCHMARK: CBSEBenchmark = {
  excellent: 8.5,
  average: 6.0,
  needsImprovement: 4.0,
  unit: 'pts',
  lowerIsBetter: false,
  category: 'Skill',
  description: 'CBSE Curricular Skill Proficiency Standard (1-10)'
};

export const D3StudentProgressChart: React.FC<D3StudentProgressChartProps> = ({
  student,
  results,
  className = '',
  defaultTestId,
  showMultiTestComparison = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Active view tab: 'd3-timeline' | 'recharts-radar' | 'recharts-multitrend'
  const [activeVisualizer, setActiveVisualizer] = useState<'d3-timeline' | 'recharts-radar' | 'recharts-multitrend'>('d3-timeline');

  // Group available test types from student's results
  const availableTests = useMemo(() => {
    const map = new Map<string, { id: string; name: string; unit: string; count: number }>();
    results.forEach(r => {
      const cleanName = r.testName.split('(')[0].trim();
      const existing = map.get(r.testId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(r.testId, { id: r.testId, name: cleanName, unit: r.unit, count: 1 });
      }
    });
    return Array.from(map.values());
  }, [results]);

  const [selectedTestId, setSelectedTestId] = useState<string>(defaultTestId || '');
  const [showBenchmarkOverlay, setShowBenchmarkOverlay] = useState<boolean>(true);
  const [showDataLabels, setShowDataLabels] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Select first test or defaultTestId automatically
  useEffect(() => {
    if (defaultTestId && availableTests.some(t => t.id === defaultTestId)) {
      setSelectedTestId(defaultTestId);
    } else if (availableTests.length > 0 && (!selectedTestId || !availableTests.some(t => t.id === selectedTestId))) {
      setSelectedTestId(availableTests[0].id);
    }
  }, [availableTests, selectedTestId, defaultTestId]);

  // Current selected test details
  const currentTestInfo = useMemo(() => {
    return availableTests.find(t => t.id === selectedTestId) || availableTests[0];
  }, [availableTests, selectedTestId]);

  // Active CBSE Benchmark definition
  const benchmark = useMemo(() => {
    if (!selectedTestId) return DEFAULT_RUBRIC_BENCHMARK;
    if (CBSE_BENCHMARKS[selectedTestId]) return CBSE_BENCHMARKS[selectedTestId];
    return DEFAULT_RUBRIC_BENCHMARK;
  }, [selectedTestId]);

  // Extract chronological data points for selected test
  const chartData = useMemo(() => {
    if (!selectedTestId) return [];
    
    const filtered = results.filter(r => r.testId === selectedTestId);
    const termOrder: Record<string, number> = { 'Baseline': 1, 'Term 1': 2, 'Term 2': 3, 'Final': 4 };
    
    return filtered.map(r => {
      const numVal = parseFitnessValue(r.value);
      const parsedDate = new Date(r.date);
      const isValidDate = !isNaN(parsedDate.getTime());
      
      return {
        id: r.id,
        term: r.term || 'Session',
        dateStr: r.date || new Date().toISOString().split('T')[0],
        dateObj: isValidDate ? parsedDate : new Date(),
        val: numVal,
        rawVal: r.value,
        unit: r.unit || benchmark.unit,
        rating: r.rating || 'Standard',
        testName: r.testName
      };
    }).sort((a, b) => {
      if (a.dateObj.getTime() !== b.dateObj.getTime()) {
        return a.dateObj.getTime() - b.dateObj.getTime();
      }
      return (termOrder[a.term] || 0) - (termOrder[b.term] || 0);
    });
  }, [results, selectedTestId, benchmark]);

  // Multi-term progression data across ALL tests for Recharts comparison
  const multiTestData = useMemo(() => {
    const terms = ['Baseline', 'Term 1', 'Term 2', 'Final'];
    const mapByTerm: Record<string, Record<string, number>> = {};

    terms.forEach(t => {
      mapByTerm[t] = { term: t as any };
    });

    results.forEach(r => {
      const termKey = r.term || 'Term 1';
      if (!mapByTerm[termKey]) {
        mapByTerm[termKey] = { term: termKey as any };
      }
      const num = parseFitnessValue(r.value);
      const tName = r.testName.split('(')[0].trim();
      mapByTerm[termKey][tName] = num;
    });

    return Object.values(mapByTerm).filter(item => Object.keys(item).length > 1);
  }, [results]);

  // Radar chart data covering physical fitness components
  const radarChartData = useMemo(() => {
    const components: { subject: string; key: string; fullMark: number; standard: number }[] = [
      { subject: 'Speed (50m)', key: 'sprint_50m', fullMark: 100, standard: 75 },
      { subject: 'Stamina (600m)', key: 'run_600m', fullMark: 100, standard: 70 },
      { subject: 'Power (Broad Jump)', key: 'broad_jump', fullMark: 100, standard: 80 },
      { subject: 'Flexibility (Sit & Reach)', key: 'sit_reach', fullMark: 100, standard: 75 },
      { subject: 'Agility (Shuttle)', key: 'shuttle_4x10', fullMark: 100, standard: 70 },
      { subject: 'Strength (Push/Curls)', key: 'pushups', fullMark: 100, standard: 80 },
      { subject: 'Balance (Flamingo)', key: 'flamingo', fullMark: 100, standard: 85 },
    ];

    return components.map(c => {
      const matchingRes = results.find(r => r.testId === c.key || r.testId.includes(c.key.split('_')[0]));
      let score = 50; // default baseline

      if (matchingRes) {
        const val = parseFitnessValue(matchingRes.value);
        const b = CBSE_BENCHMARKS[c.key] || DEFAULT_RUBRIC_BENCHMARK;
        if (b.lowerIsBetter) {
          // e.g. 50m sprint: 8s is 95, 12s is 40
          score = Math.max(20, Math.min(100, Math.round(100 - ((val - b.excellent) / b.excellent) * 60)));
        } else {
          // e.g. Broad jump: 165 is 95, 100 is 50
          score = Math.max(20, Math.min(100, Math.round((val / b.excellent) * 90)));
        }
      }

      return {
        subject: c.subject,
        studentScore: score,
        cbseBenchmark: c.standard,
        fullMark: c.fullMark
      };
    });
  }, [results]);

  // Metrics computation for KPI cards
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
    let bestEntry = chartData[0];
    chartData.forEach(d => {
      if (benchmark.lowerIsBetter) {
        if (d.val < bestVal) {
          bestVal = d.val;
          bestEntry = d;
        }
      } else {
        if (d.val > bestVal) {
          bestVal = d.val;
          bestEntry = d;
        }
      }
    });

    // Comparison against CBSE Excellent benchmark
    const diffVsBenchmark = last.val - benchmark.excellent;
    const pctVsBenchmark = ((Math.abs(diffVsBenchmark) / benchmark.excellent) * 100).toFixed(1);
    let benchmarkStatus = '';
    
    if (benchmark.lowerIsBetter) {
      if (last.val <= benchmark.excellent) {
        benchmarkStatus = `Exceeds CBSE Elite Standard (+${pctVsBenchmark}%)`;
      } else if (last.val <= benchmark.average) {
        benchmarkStatus = `Meets CBSE Average Norm`;
      } else {
        benchmarkStatus = `Developing Towards Standard`;
      }
    } else {
      if (last.val >= benchmark.excellent) {
        benchmarkStatus = `Exceeds CBSE Elite Standard (+${pctVsBenchmark}%)`;
      } else if (last.val >= benchmark.average) {
        benchmarkStatus = `Meets CBSE Average Norm`;
      } else {
        benchmarkStatus = `Developing Towards Standard`;
      }
    }

    return {
      first,
      last,
      rawChange: change,
      changeFormatted: Math.abs(change).toFixed(1),
      pctChange: Math.abs(parseFloat(pctChange)),
      isImproved,
      bestVal,
      bestEntry,
      benchmarkStatus,
      totalEntries: chartData.length
    };
  }, [chartData, benchmark]);

  // Render D3 SVG Chart
  useEffect(() => {
    if (activeVisualizer !== 'd3-timeline') return;
    if (!svgRef.current || !containerRef.current || chartData.length === 0) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawing

    const margin = { top: 40, right: 130, bottom: 50, left: 55 };
    const width = Math.max(300, container.clientWidth - margin.left - margin.right);
    const height = (isExpanded ? 420 : 310) - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) return;

    const g = svg
      .attr('width', container.clientWidth)
      .attr('height', isExpanded ? 420 : 310)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale (X-Axis: Term / Date)
    const xDomain = chartData.map((d, i) => `${d.term} • ${d.dateStr} (${i + 1})`);
    const xScale = d3.scalePoint()
      .domain(xDomain)
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
    
    // Give breathing room top and bottom
    const padding = (yMax - yMin) * 0.18 || 5;
    yMin = Math.max(0, yMin - padding);
    yMax = yMax + padding;

    // Y Scale (Y-Axis: Metric score)
    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height, 0]);

    // Background Grid lines
    const makeYGridlines = () => d3.axisLeft(yScale).ticks(5);

    g.append('g')
      .attr('class', 'grid-lines')
      .call(
        makeYGridlines()
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .attr('stroke-opacity', 0.12)
      .attr('stroke', '#94a3b8')
      .attr('stroke-dasharray', '3,3');

    // CBSE Benchmark Shaded Reference Lines & Badges
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
          .attr('x', width + 8)
          .attr('y', yExc - 11)
          .attr('width', 112)
          .attr('height', 22)
          .attr('rx', 6)
          .attr('fill', '#ecfdf5')
          .attr('stroke', '#10b981')
          .attr('stroke-width', 1);

        benchmarkGroup.append('text')
          .attr('x', width + 14)
          .attr('y', yExc + 4)
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
          .attr('x', width + 8)
          .attr('y', yAvg - 11)
          .attr('width', 112)
          .attr('height', 22)
          .attr('rx', 6)
          .attr('fill', '#eef2ff')
          .attr('stroke', '#6366f1')
          .attr('stroke-width', 1);

        benchmarkGroup.append('text')
          .attr('x', width + 14)
          .attr('y', yAvg + 4)
          .attr('fill', '#4338ca')
          .attr('font-size', '9px')
          .attr('font-weight', '900')
          .text(`CBSE Norm: ${benchmark.average} ${benchmark.unit}`);
      }
    }

    // Line Generator (Monotone Bezier Curve)
    const lineGenerator = d3.line<any>()
      .x((d, i) => xScale(`${d.term} • ${d.dateStr} (${i + 1})`) || 0)
      .y(d => yScale(d.val))
      .curve(d3.curveMonotoneX);

    // Area Generator (Gradient Fill under line)
    const areaGenerator = d3.area<any>()
      .x((d, i) => xScale(`${d.term} • ${d.dateStr} (${i + 1})`) || 0)
      .y0(height)
      .y1(d => yScale(d.val))
      .curve(d3.curveMonotoneX);

    // Gradient Definition
    const svgDefs = svg.append('defs');
    const areaGradient = svgDefs.append('linearGradient')
      .attr('id', 'd3-student-progress-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4f46e5')
      .attr('stop-opacity', 0.28);

    areaGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4f46e5')
      .attr('stop-opacity', 0.0);

    // Draw Area under line
    g.append('path')
      .datum(chartData)
      .attr('fill', 'url(#d3-student-progress-gradient)')
      .attr('d', areaGenerator);

    // Draw Progress Line with Animated Stroke
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
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Draw Interactive Data Nodes (Dots)
    const dots = g.selectAll('.data-dot')
      .data(chartData)
      .enter()
      .append('g')
      .attr('class', 'data-dot')
      .attr('transform', (d, i) => `translate(${xScale(`${d.term} • ${d.dateStr} (${i + 1})`) || 0}, ${yScale(d.val)})`);

    // Outer glow ring
    dots.append('circle')
      .attr('r', 9)
      .attr('fill', '#4f46e5')
      .attr('fill-opacity', 0.15)
      .attr('class', 'glow-ring');

    // Personal Best Highlight Ring
    dots.filter(d => metrics?.bestEntry?.id === d.id)
      .append('circle')
      .attr('r', 13)
      .attr('fill', '#f59e0b')
      .attr('fill-opacity', 0.2)
      .attr('stroke', '#d97706')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,2');

    // Inner dot
    dots.append('circle')
      .attr('r', 5.5)
      .attr('fill', d => metrics?.bestEntry?.id === d.id ? '#f59e0b' : '#ffffff')
      .attr('stroke', d => metrics?.bestEntry?.id === d.id ? '#d97706' : '#4f46e5')
      .attr('stroke-width', 2.5)
      .attr('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).transition().duration(150).attr('r', 8.5).attr('fill', '#4f46e5');
        setHoveredPoint(d);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).transition().duration(150).attr('r', 5.5).attr('fill', metrics?.bestEntry?.id === d.id ? '#f59e0b' : '#ffffff');
        setHoveredPoint(null);
      });

    // Value Labels above dots
    if (showDataLabels) {
      dots.append('text')
        .attr('y', -14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#0f172a')
        .attr('font-size', '10px')
        .attr('font-weight', '900')
        .text(d => `${d.rawVal} ${d.unit}`);
    }

    // X-Axis
    const xAxis = d3.axisBottom(xScale).tickFormat((d: string) => {
      const parts = d.split(' • ');
      return parts[0] || d;
    });

    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#475569')
      .attr('font-size', '10px')
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

  }, [chartData, benchmark, showBenchmarkOverlay, showDataLabels, activeVisualizer, isExpanded, metrics]);

  // Handle Resize for Fluid Responsiveness
  useEffect(() => {
    const handleResize = () => {
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
        <Activity size={36} className="mx-auto text-slate-400 mb-2" />
        <h4 className="text-sm font-black uppercase text-slate-700">No Assessment Records Logged Yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Record at least one Khelo India physical fitness test to unlock D3 longitudinal growth curves and Recharts athletic radar maps.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-3xl border-2 border-slate-900 p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] ${className}`}>
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-[#0D2B52] text-[#D4A017] rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border border-[#D4A017]/30 shadow-2xs">
              <Activity size={14} className="text-[#D4A017]" />
              D3 & Recharts Growth Analytics
            </span>
            <span className="text-xs font-black uppercase text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
              CBSE HPE Strand 1
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 mt-2 flex items-center gap-2">
            <span>Fitness Test Progress Over Time</span>
            <span className="text-xs font-bold text-slate-400 normal-case hidden sm:inline">({student.name})</span>
          </h3>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            Longitudinal visualization mapping student performance across academic terms against official CBSE benchmarks.
          </p>
        </div>

        {/* Visualizer Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start lg:self-center">
          <button
            type="button"
            onClick={() => setActiveVisualizer('d3-timeline')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeVisualizer === 'd3-timeline'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Activity size={14} />
            <span>D3 Time Curve</span>
          </button>

          {showMultiTestComparison && (
            <button
              type="button"
              onClick={() => setActiveVisualizer('recharts-multitrend')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeVisualizer === 'recharts-multitrend'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BarChart3 size={14} />
              <span>Multi-Test Trends</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveVisualizer('recharts-radar')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeVisualizer === 'recharts-radar'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <RadarIcon size={14} />
            <span>Athletic Radar</span>
          </button>
        </div>
      </div>

      {/* D3 TIMELINE MODE VIEW */}
      {activeVisualizer === 'd3-timeline' && (
        <div className="space-y-4 pt-4 animate-in fade-in">
          {/* Controls Bar: Test Selector + Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Target Fitness Parameter:
              </span>
              <select
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                className="bg-white text-slate-900 font-black text-xs px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:outline-none shadow-2xs cursor-pointer min-w-[200px]"
              >
                {availableTests.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.unit}) • {t.count} record{t.count > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBenchmarkOverlay(!showBenchmarkOverlay)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 cursor-pointer ${
                  showBenchmarkOverlay
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Toggle CBSE Elite & Average threshold reference lines"
              >
                <ShieldCheck size={14} className={showBenchmarkOverlay ? 'text-emerald-600' : 'text-slate-400'} />
                <span>CBSE Norm Lines</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDataLabels(!showDataLabels)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 cursor-pointer ${
                  showDataLabels
                    ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Target size={14} className={showDataLabels ? 'text-indigo-600' : 'text-slate-400'} />
                <span>Score Labels</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title={isExpanded ? "Collapse height" : "Expand chart height"}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          </div>

          {/* KPI Metric Summary Grid */}
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Growth Rate */}
              <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200/70 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">Growth Delta</span>
                  {metrics.isImproved ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[9px] font-black uppercase">
                      Improving
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[9px] font-black uppercase">
                      Baseline Focus
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  {metrics.isImproved ? (
                    <TrendingUp size={22} className="text-emerald-600 shrink-0" />
                  ) : (
                    <TrendingDown size={22} className="text-amber-600 shrink-0" />
                  )}
                  <span className={`text-xl font-black ${metrics.isImproved ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {metrics.isImproved ? '+' : '-'}{metrics.pctChange}%
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-600 mt-1 truncate">
                  {metrics.first.term} ({metrics.first.rawVal}) → {metrics.last.term} ({metrics.last.rawVal})
                </span>
              </div>

              {/* Personal Best Record */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/70 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-800">Personal Best (PR)</span>
                  <Award size={14} className="text-amber-600" />
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-xl font-black text-slate-900">
                    {metrics.bestVal}
                  </span>
                  <span className="text-xs font-bold text-slate-600">{currentTestInfo?.unit}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-600 mt-1">
                  Recorded during {metrics.bestEntry?.term}
                </span>
              </div>

              {/* CBSE Benchmark Comparison */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/70 flex flex-col justify-between col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-900">CBSE HPE Performance Norm</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-md">
                    Elite Standard: {benchmark.excellent} {benchmark.unit}
                  </span>
                </div>
                <div className="text-xs font-black text-emerald-950 mt-1.5">
                  {metrics.benchmarkStatus}
                </div>
                <span className="text-[10px] font-bold text-slate-600 mt-1 line-clamp-1">
                  {benchmark.description}
                </span>
              </div>
            </div>
          )}

          {/* D3 SVG Chart Container */}
          <div ref={containerRef} className="w-full relative overflow-x-auto rounded-2xl bg-slate-50/60 p-2 border border-slate-200">
            <svg ref={svgRef} className={`w-full overflow-visible ${isExpanded ? 'h-[420px]' : 'h-[310px]'}`} />

            {/* Hover Tooltip Card */}
            {hoveredPoint && (
              <div className="absolute top-4 right-4 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl z-20 text-xs font-mono border border-slate-700 animate-in fade-in max-w-xs">
                <div className="font-black text-[#D4A017] uppercase tracking-wider border-b border-slate-800 pb-1.5 mb-1.5 flex items-center justify-between gap-4">
                  <span>{hoveredPoint.term}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{hoveredPoint.dateStr}</span>
                </div>
                <div className="text-slate-200 text-xs">
                  Recorded Score: <strong className="text-white text-sm">{hoveredPoint.rawVal} {hoveredPoint.unit}</strong>
                </div>
                <div className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>CBSE Rating: {hoveredPoint.rating}</span>
                </div>
              </div>
            )}
          </div>

          {/* Legend & Footnote */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[10px] text-slate-500 font-bold">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 bg-indigo-600 rounded-full"></span>
                <span>Student Score Trajectory</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-600"></span>
                <span>Personal Best (PR)</span>
              </div>
              {showBenchmarkOverlay && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-emerald-500 border-t border-dashed border-emerald-600"></span>
                    <span>CBSE Elite Benchmark</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-indigo-500 border-t border-dashed border-indigo-600"></span>
                    <span>CBSE Average Norm</span>
                  </div>
                </>
              )}
            </div>
            <div className="text-slate-400 font-black uppercase text-[9px] tracking-widest">
              D3.js Smooth Spline Interpolation
            </div>
          </div>
        </div>
      )}

      {/* RECHARTS MULTI-TEST PROGRESSION TRENDS */}
      {activeVisualizer === 'recharts-multitrend' && (
        <div className="space-y-5 pt-4 animate-in fade-in">
          <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200/80 flex items-start gap-3">
            <BarChart3 size={20} className="text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 font-medium leading-relaxed">
              <strong className="font-bold uppercase text-indigo-900 block mb-0.5">Multi-Test Performance Progress:</strong>
              Compare physical performance metrics across terms. The area charts visualize trends across multiple parameters over consecutive assessments.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTests.slice(0, 6).map((test) => {
              const testResults = results
                .filter(r => r.testId === test.id)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(r => ({
                  term: r.term || 'Session',
                  value: parseFitnessValue(r.value),
                  raw: r.value,
                  unit: r.unit
                }));

              if (testResults.length === 0) return null;

              return (
                <div key={test.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between h-56">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2">
                    <span className="font-black text-xs uppercase tracking-tight text-slate-800 truncate">
                      {test.name}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                      {test.unit}
                    </span>
                  </div>

                  <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={testResults} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${test.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="term" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                          formatter={(val: any) => [`${val} ${test.unit}`, 'Score']}
                        />
                        <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill={`url(#grad-${test.id})`} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RECHARTS ATHLETIC RADAR VIEW */}
      {activeVisualizer === 'recharts-radar' && (
        <div className="space-y-4 pt-4 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Radar Chart */}
            <div className="h-80 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-black text-xs uppercase tracking-tight text-slate-800 flex items-center gap-1.5">
                  <RadarIcon size={16} className="text-indigo-600" />
                  <span>Physical Fitness Radar Profile</span>
                </span>
                <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  Relative Percentile Index
                </span>
              </div>

              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 9, fontWeight: 900 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#94a3b8' }} />
                    <Radar name={student.name} dataKey="studentScore" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.5} />
                    <Radar name="CBSE Standard" dataKey="cbseBenchmark" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeDasharray="3 3" />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 800 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Analysis Breakdown Card */}
            <div className="space-y-3">
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A017]">
                  Athletic Profile Assessment
                </span>
                <h4 className="text-base font-black text-white">
                  Holistic HPE Physical Literacy
                </h4>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  The radar graph maps {student.name}'s relative balance across endurance, upper/lower body power, speed, agility, and static balance against standard Khelo India age norms.
                </p>
              </div>

              <div className="space-y-2">
                {radarChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
                    <span className="text-slate-800">{item.subject}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.studentScore >= item.cbseBenchmark ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                          style={{ width: `${Math.min(100, item.studentScore)}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-black min-w-[35px] text-right ${item.studentScore >= item.cbseBenchmark ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        {item.studentScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
