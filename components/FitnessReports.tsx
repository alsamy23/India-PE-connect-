
import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toJpeg } from 'html-to-image';
import { 
  FileText, 
  Download, 
  Printer, 
  ChevronRight, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Users, 
  User,
  Activity,
  ArrowLeft,
  Calendar,
  BarChart3,
  Trophy,
  Zap,
  Info,
  Loader2,
  Database,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { fitnessService, Student, FitnessResult, Team, SchoolMember, School, KIFT_BATTERIES } from '../services/fitnessService.ts';
import { 
  parseFitnessValue, 
  calculateExactBMI, 
  calculateTestTrend, 
  formatTestDisplayValue 
} from '../utils/bmiUtils.ts';
import { auth } from '../services/firebase.ts';
import { toast } from '../services/toast.ts';
import Logo from './Logo.tsx';
import { D3StudentProgressChart } from './fitness/D3StudentProgressChart.tsx';

interface FitnessReportsProps {
  initialStudentId?: string;
}

const FitnessReports: React.FC<FitnessReportsProps> = ({ initialStudentId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<FitnessResult[]>([]);
  const [studentSpecificResults, setStudentSpecificResults] = useState<FitnessResult[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  
  // Playground states
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [showDbExplorer, setShowDbExplorer] = useState(false);
  const [activeDbTab, setActiveDbTab] = useState<'student' | 'results' | 'rubric'>('student');
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'individual' | 'class' | 'school'>('individual');
  const [selectedId, setSelectedId] = useState<string>(initialStudentId || '');
  const [reportData, setReportData] = useState<any>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialStudentId) {
      setSelectedId(initialStudentId);
      setSelectedType('individual');
    }
  }, [initialStudentId]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState<SchoolMember | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [editableSchoolName, setEditableSchoolName] = useState("SmartPE Public School");

  useEffect(() => {
    let unsubResults: (() => void) | undefined;
    let unsubTeams: (() => void) | undefined;
    let unsubStudents: (() => void) | undefined;

    const fetchAllData = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const profile = await fitnessService.getSchoolMember(auth.currentUser.uid);
        setUserProfile(profile);

        if (profile) {
          try {
            const schoolData = await fitnessService.getSchool(profile.schoolId);
            setSchool(schoolData);
            if (schoolData?.name) {
              setEditableSchoolName(schoolData.name);
            }
          } catch (schoolErr) {
            console.error("Error loading school info:", schoolErr);
          }

          const isAdmin = profile.role === 'admin';
          unsubResults = fitnessService.subscribeToResults(
            auth.currentUser.uid,
            profile.schoolId,
            isAdmin,
            setResults
          );
          unsubTeams = fitnessService.subscribeToTeams(
            auth.currentUser.uid,
            profile.schoolId,
            isAdmin,
            setTeams
          );
          unsubStudents = fitnessService.subscribeToStudents(
            auth.currentUser.uid,
            profile.schoolId,
            isAdmin,
            (data) => {
              setStudents(data);
              setLoading(false);
            }
          );
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error in FitnessReports data fetch:", err);
        setLoading(false);
      }
    };

    fetchAllData();
    
    return () => {
      unsubResults?.();
      unsubTeams?.();
      unsubStudents?.();
    };
  }, [auth.currentUser?.uid]);

  useEffect(() => {
    let unsubStudentResults: (() => void) | undefined;

    if (selectedType === 'individual' && selectedId) {
      const student = students.find(s => s.id === selectedId);
      const schoolId = student?.schoolId || userProfile?.schoolId;
      unsubStudentResults = fitnessService.subscribeToStudentResults(selectedId, schoolId, setStudentSpecificResults);
    } else {
      setStudentSpecificResults([]);
    }

    return () => unsubStudentResults?.();
  }, [selectedId, selectedType, students, userProfile]);

  const calculateAvg = (resultsList: FitnessResult[]) => {
    if (resultsList.length === 0) return 'N/A';
    const sum = resultsList.reduce((acc, r) => acc + parseFitnessValue(r.value), 0);
    return (sum / resultsList.length).toFixed(1);
  };

  const groupCount = (list: any[], key: string) => {
    return list.reduce((acc, item) => {
      const val = item[key];
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
  };

  const parseValue = (val: string) => {
    return parseFitnessValue(val);
  };

  const generateReport = React.useCallback(() => {
    if (!selectedId && selectedType !== 'school') return;
    
    setIsGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      let data: any = {};
      
      if (selectedType === 'individual') {
        const student = students.find(s => s.id === selectedId);
        // Use studentSpecificResults if available, fallback to general results filter
        const studentResults = studentSpecificResults.length > 0 
          ? studentSpecificResults 
          : results.filter(r => r.studentId === selectedId);
        
        // Group by term
        const byTerm: Record<string, FitnessResult[]> = {};
        studentResults.forEach(r => {
          if (!byTerm[r.term]) byTerm[r.term] = [];
          byTerm[r.term].push(r);
        });

        // Separate physical and rubric results for cleaner visual charting
        const physicalResults = studentResults.filter(r => !r.testId.startsWith('rubric_'));

        // Prep chart data - use latest for radar
        const latestByTest: Record<string, FitnessResult> = {};
        physicalResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(r => {
          if (!latestByTest[r.testId]) {
            latestByTest[r.testId] = r;
          }
        });

        const radarData = Object.values(latestByTest).map(r => ({
          subject: r.testName.split('(')[0].trim(),
          A: parseValue(r.value),
          fullMark: 100
        }));

        const progressData = physicalResults.reduce((acc: any, r) => {
          const existing = acc.find((item: any) => item.term === r.term);
          if (existing) {
            existing[r.testName] = parseValue(r.value);
          } else {
            acc.push({ term: r.term, [r.testName]: parseValue(r.value) });
          }
          return acc;
        }, []).sort((a: any, b: any) => {
          const order = ['Baseline', 'Term 1', 'Term 2', 'Final'];
          return order.indexOf(a.term) - order.indexOf(b.term);
        });

        // Comparison benchmarks - compare student averages vs school averages for same tests
        const comparisonData = Object.values(latestByTest).map(r => {
          const sameTestResults = results.filter(res => res.testId === r.testId);
          const schoolAvg = sameTestResults.length > 0 
            ? sameTestResults.reduce((sum, res) => sum + parseValue(res.value), 0) / sameTestResults.length
            : 0;
            
          return {
            name: r.testName.split('(')[0].trim(),
            student: parseValue(r.value),
            average: parseFloat(schoolAvg.toFixed(1))
          };
        });

        // Calculate dynamic feedback based on actual scores
        const feedbackItems: { testName: string; rating: string; status: 'Excellent' | 'Satisfactory' | 'Needs Improvement'; details: string; isImprovement: boolean }[] = [];
        const strengths: string[] = [];
        const improvements: string[] = [];
        let totalImprovementCount = 0;

        // Get latest result for ALL tests including rubrics
        const latestAllByTest: Record<string, FitnessResult> = {};
        [...studentResults].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(r => {
          if (!latestAllByTest[r.testId]) {
            latestAllByTest[r.testId] = r;
          }
        });

        Object.entries(latestAllByTest).forEach(([testId, result]) => {
          const val = parseValue(result.value);
          const name = result.testName.split('(')[0].trim();
          
          // Get baseline & subsequent terms if they exist
          const baselineResult = studentResults.find(r => r.testId === testId && r.term === 'Baseline');
          const term1Result = studentResults.find(r => r.testId === testId && r.term === 'Term 1');
          const term2Result = studentResults.find(r => r.testId === testId && r.term === 'Term 2');
          
          const baselineVal = baselineResult ? parseValue(baselineResult.value) : null;
          const term1Val = term1Result ? parseValue(term1Result.value) : null;
          const term2Val = term2Result ? parseValue(term2Result.value) : null;
          
          let rating: string = 'Satisfactory';
          let status: 'Excellent' | 'Satisfactory' | 'Needs Improvement' = 'Satisfactory';
          let details = '';
          let isImprovement = false;

          // Check if there was improvement across terms
          if (baselineVal !== null) {
            const currentVal = term2Val ?? term1Val ?? val;
            if (testId === 'sprint_50m' || testId === 'shuttle_4x10' || testId === 'run_600m') {
              // Lower is better for timed sprints/runs
              if (currentVal < baselineVal) {
                isImprovement = true;
                totalImprovementCount++;
              }
            } else {
              // Higher is better for jumps, flexibility, and rubrics
              if (currentVal > baselineVal) {
                isImprovement = true;
                totalImprovementCount++;
              }
            }
          }

          // Specific test rating rules
          if (testId === 'bmi' || name.toLowerCase().includes('bmi')) {
            const bmiRes = calculateExactBMI(result.value);
            rating = `${bmiRes.category} (${bmiRes.bmi} kg/m²)`;
            status = bmiRes.rating;
            details = bmiRes.details;
          } else if (testId === 'sprint_50m') {
            if (val < 8.5) {
              rating = 'Excellent (Exceptional Speed)';
              status = 'Excellent';
              details = 'Outstanding sprint timing! Displays elite starting velocity and stride acceleration.';
            } else if (val <= 10.0) {
              rating = 'Satisfactory (Good Pace)';
              status = 'Satisfactory';
              details = 'Displays a healthy, active speed level. Focus on explosive knee drives to further lower the sprint timing.';
            } else {
              rating = 'Needs Improvement (Below Average)';
              status = 'Needs Improvement';
              details = 'Acceleration is slightly below peak level. Wall-sprints and high-knees exercises are recommended to build rapid acceleration.';
            }
          } else if (testId === 'shuttle_4x10') {
            if (val < 12.0) {
              rating = 'Excellent (Superb Agility)';
              status = 'Excellent';
              details = 'Outstanding balance and reaction times! Quick direction changes show top-tier ankle stability and muscle control.';
            } else if (val <= 14.5) {
              rating = 'Satisfactory (Healthy Agility)';
              status = 'Satisfactory';
              details = 'Good change of direction. Focus on keeping the center of gravity low when turning around cones to shave off precious seconds.';
            } else {
              rating = 'Needs Improvement (Below Average)';
              status = 'Needs Improvement';
              details = 'Reaction times are slightly slower. Cone lateral bounds and ladder drills are highly recommended.';
            }
          } else if (testId === 'run_600m') {
            if (val < 160) { // 2:40
              rating = 'Excellent (High Endurance)';
              status = 'Excellent';
              details = 'Excellent cardiovascular efficiency! Displays very fast recovery rates and high aerobic stamina.';
            } else if (val <= 210) { // 3:30
              rating = 'Satisfactory (Good Stamina)';
              status = 'Satisfactory';
              details = 'Satisfactory cardiovascular endurance. Continuous jogging of 15-20 mins will expand aerobic capacity further.';
            } else {
              rating = 'Needs Improvement (Below Average)';
              status = 'Needs Improvement';
              details = 'Cardiovascular stamina requires building up. Standard interval walking/jogging and lap training will improve endurance.';
            }
          } else if (testId === 'broad_jump') {
            if (val > 160) {
              rating = 'Excellent (Powerful Leap)';
              status = 'Excellent';
              details = 'Exceptional explosive lower-body strength! Excellent hip extension and coordinated landing mechanics.';
            } else if (val >= 130) {
              rating = 'Satisfactory (Good Power)';
              status = 'Satisfactory';
              details = 'Good explosive leaping strength. Squat jumps and skipping will help build faster vertical/horizontal drive.';
            } else {
              rating = 'Needs Improvement (Below Average)';
              status = 'Needs Improvement';
              details = 'Lower-body drive is below par. Focused calf raises, squats, and broad-jump repetitions are recommended.';
            }
          } else if (testId === 'sit_reach') {
            if (val > 18) {
              rating = 'Excellent (High Flexibility)';
              status = 'Excellent';
              details = 'Elite hamstring and lower-back flexibility. Reduced risk of muscle strain during rigorous sports.';
            } else if (val >= 10) {
              rating = 'Satisfactory (Good Range)';
              status = 'Satisfactory';
              details = 'Healthy, acceptable range of motion. Continuous static stretching pre/post-workouts will maintain and improve this flexibility.';
            } else {
              rating = 'Needs Improvement (Below Average)';
              status = 'Needs Improvement';
              details = 'Hamstring and posterior muscles are tight. Focus on hamstring stretches, seated forward bends, and yoga stretches daily.';
            }
          } else if (testId.startsWith('rubric_')) {
            if (val >= 9) {
              rating = 'Mastery (Excellent)';
              status = 'Excellent';
              details = 'Demonstrates supreme skill command. High game IQ, superb positioning, and execution of complex tactical play.';
            } else if (val >= 7) {
              rating = 'Advanced (Satisfactory)';
              status = 'Excellent';
              details = 'Strong technical proficiency. Accurate distribution and spatial control under match pressure.';
            } else if (val >= 5) {
              rating = 'Proficient (Satisfactory)';
              status = 'Satisfactory';
              details = 'Healthy competency in basic rules and dribble patterns. Maintain teamwork and target practice.';
            } else {
              rating = 'Developing (Needs Improvement)';
              status = 'Needs Improvement';
              details = 'Working to grasp core positioning and consistent ball-touch control. Practice wall-passes and 1v1 play.';
            }
          } else {
            if (val >= 80) {
              rating = 'Excellent';
              status = 'Excellent';
              details = 'Outstanding competence and skill integration across general physical tasks.';
            } else if (val >= 50) {
              rating = 'Satisfactory';
              status = 'Satisfactory';
              details = 'Achieved target performance criteria. Regular physical activities will support continued fitness.';
            } else {
              rating = 'Needs Improvement';
              status = 'Needs Improvement';
              details = 'Below peer average. Needs guided physical guidance, continuous practices, and motor-skill games.';
            }
          }

          feedbackItems.push({
            testName: name,
            rating,
            status,
            details,
            isImprovement
          });

          if (status === 'Excellent' || (status === 'Satisfactory' && isImprovement)) {
            strengths.push(`${name}: Rated as ${rating}. ${details}`);
          } else if (status === 'Needs Improvement') {
            improvements.push(`${name}: Rated as ${rating}. ${details}`);
          }
        });

        // Generate overall summary narrative
        let computedSummary = "";
        if (student?.name) {
          const improvementText = totalImprovementCount > 0 
            ? `shows remarkable developmental progress, demonstrating measurable improvement in ${totalImprovementCount} fitness criteria since baseline tests.`
            : `maintains robust physical capabilities with solid athletic interest.`;
            
          const topStrength = strengths.length > 0 
            ? `Particularly outstanding progress or high competency was demonstrated in ${strengths[0].split(':')[0].trim()}.` 
            : "";
            
          const keyImprovement = improvements.length > 0
            ? `To further elevate performance, specialized focus is recommended in ${improvements[0].split(':')[0].trim()}.`
            : "No critical areas require correction. Continue staying active and healthy!";

          computedSummary = `${student.name} ${improvementText} ${topStrength} ${keyImprovement}`;
        } else {
          computedSummary = "Consistent physical growth observed across multiple testing metrics.";
        }

        data = {
          title: `Fitness Report: ${student?.name}`,
          subtitle: `Roll No: ${student?.rollNumber} | Grade: ${student?.grade}-${student?.section}`,
          student,
          studentResults, // Store filtered results directly
          byTerm,
          terms: ['Baseline', 'Term 1', 'Term 2', 'Final'].filter(t => byTerm[t]),
          overallSummary: computedSummary,
          feedbackItems,
          strengths,
          improvements,
          radarData,
          progressData,
          latestByTest,
          comparisonData
        };
      } else if (selectedType === 'class') {
        const team = teams.find(t => t.id === selectedId);
        const teamStudents = team?.studentIds ? students.filter(s => team.studentIds.includes(s.id)) : [];
        const teamResults = results.filter(r => teamStudents.some(s => s.id === r.studentId));
        
        // Distribution of tests
        const testCounts = groupCount(teamResults, 'testName');
        const distributionData = Object.entries(testCounts).map(([name, count]) => ({
          name: name.split('(')[0].trim(),
          count
        }));

        // Average scores by test for the class
        const testAverages: Record<string, { sum: number, count: number, unit: string }> = {};
        teamResults.forEach(r => {
          if (!testAverages[r.testName]) {
            testAverages[r.testName] = { sum: 0, count: 0, unit: r.unit };
          }
          const val = parseValue(r.value);
          testAverages[r.testName].sum += val;
          testAverages[r.testName].count += 1;
        });

        const classAverageData = Object.entries(testAverages).map(([name, stats]) => ({
          name: name.split('(')[0].trim(),
          average: parseFloat((stats.sum / stats.count).toFixed(1)),
          unit: stats.unit
        }));

        data = {
          title: `Class Progress Report: ${team?.name}`,
          subtitle: `Grade: ${team?.grade}-${team?.section} | Total Students: ${teamStudents.length}`,
          team,
          studentCount: teamStudents.length,
          avgBmi: calculateAvg(teamResults.filter(r => r.testId === 'bmi')),
          participation: `${Math.round((new Set(teamResults.map(r => r.studentId)).size / teamStudents.length) * 100)}%`,
          testCounts,
          distributionData,
          classAverageData,
          totalAssessments: teamResults.length
        };
      } else {
        // School-wide analysis
        const gradeStats: Record<string, { total: number, results: number, avg: number, bmiSum: number, bmiCount: number }> = {};
        const schoolTestAverages: Record<string, { sum: number, count: number }> = {};
        
        results.forEach(r => {
          const student = students.find(s => s.id === r.studentId);
          if (!student) return;
          
          if (!gradeStats[student.grade]) {
            gradeStats[student.grade] = { total: 0, results: 0, avg: 0, bmiSum: 0, bmiCount: 0 };
          }
          
          const val = parseValue(r.value);
          gradeStats[student.grade].avg += val;
          gradeStats[student.grade].results += 1;

          if (r.testId === 'bmi') {
            gradeStats[student.grade].bmiSum += val;
            gradeStats[student.grade].bmiCount += 1;
          }

          if (!schoolTestAverages[r.testName]) {
            schoolTestAverages[r.testName] = { sum: 0, count: 0 };
          }
          schoolTestAverages[r.testName].sum += val;
          schoolTestAverages[r.testName].count += 1;
        });

        const barChartData = Object.entries(gradeStats).map(([grade, stats]) => ({
          grade: `Gen ${grade}`,
          average: parseFloat((stats.avg / stats.results).toFixed(1)),
          bmi: stats.bmiCount > 0 ? parseFloat((stats.bmiSum / stats.bmiCount).toFixed(1)) : 0
        })).sort((a, b) => a.grade.localeCompare(b.grade));

        const schoolAverages = Object.entries(schoolTestAverages).map(([name, stats]) => ({
          name: name.split('(')[0].trim(),
          average: parseFloat((stats.sum / stats.count).toFixed(1))
        }));

        Object.keys(gradeStats).forEach(grade => {
          gradeStats[grade].avg = gradeStats[grade].avg / gradeStats[grade].results;
        });

        // Identify grades needing improvement (bottom 30% or below a certain threshold)
        const sortedGrades = Object.entries(gradeStats)
          .sort((a, b) => a[1].avg - b[1].avg);
        
        const focusGrades = sortedGrades.slice(0, Math.ceil(sortedGrades.length * 0.3)).map(g => g[0]);

        data = {
          title: "School-wide Fitness Overview",
          subtitle: `Total Students: ${students.length} | Academic Year: 2024-25`,
          totalResults: results.length,
          topPerformers: students.slice(0, 5), // Mock
          testDistribution: groupCount(results, 'testName'),
          gradeStats,
          focusGrades,
          totalStudents: students.length,
          barChartData,
          schoolAverages
        };
      }
      
      setReportData(data);
      setIsGenerating(false);
    }, 1000);
  }, [selectedId, selectedType, students, results, teams, studentSpecificResults]);

  useEffect(() => {
    if (initialStudentId && students.length > 0 && results.length > 0) {
      generateReport();
    }
  }, [initialStudentId, students.length, results.length, generateReport]);

  // Also trigger if student results subscription updates for the selected student
  useEffect(() => {
    if (selectedType === 'individual' && selectedId && studentSpecificResults.length > 0) {
      generateReport();
    }
  }, [studentSpecificResults.length, selectedId, selectedType]);

  const handleGenerateDummyData = async () => {
    if (generatingDemo) return;
    try {
      setGeneratingDemo(true);
      const teacherId = auth.currentUser?.uid || 'temp_teacher_id';
      const schoolId = userProfile?.schoolId || `personal_${teacherId}`;
      const studentId = 'demo_kabir_dutt';

      const demoStudent: Student = {
        id: studentId,
        teacherId,
        schoolId,
        name: 'Kabir Dutt',
        rollNumber: 'PE-2026-07',
        grade: '8',
        section: 'A',
        gender: 'Male',
        age: 13,
        attendance: 94,
        performance: 'Excellent'
      };

      // 10 tests across 3 terms = 30 results
      const testCases = [
        // BMI
        { testId: 'bmi', testName: 'BMI (Height & Weight)', unit: 'kg/m²', valB: '18.2', valT1: '18.5', valT2: '18.7' },
        // Speed
        { testId: 'sprint_50m', testName: '50m Sprint Speed', unit: 'sec', valB: '9.2', valT1: '8.8', valT2: '8.4' },
        // Endurance
        { testId: 'run_600m', testName: '600m Endurance Run', unit: 'min:sec', valB: '3:05', valT1: '2:55', valT2: '2:42' },
        // Power
        { testId: 'broad_jump', testName: 'Standing Broad Jump', unit: 'cm', valB: '145', valT1: '155', valT2: '165' },
        // Flexibility
        { testId: 'sit_reach', testName: 'Sit & Reach Flexibility', unit: 'cm', valB: '14', valT1: '17', valT2: '19' },
        // Agility
        { testId: 'shuttle_4x10', testName: '4×10m Shuttle Run', unit: 'sec', valB: '13.5', valT1: '12.8', valT2: '12.2' },
        
        // GAME RUBRICS (Football Skills out of 10)
        { testId: 'rubric_fb_dribble', testName: 'Football: Dribbling & Control (Rubric)', unit: 'rating', valB: '5', valT1: '7', valT2: '9' },
        { testId: 'rubric_fb_pass', testName: 'Football: Passing & Accuracy (Rubric)', unit: 'rating', valB: '4', valT1: '6', valT2: '8' },
        { testId: 'rubric_fb_shoot', testName: 'Football: Shooting & Form (Rubric)', unit: 'rating', valB: '4', valT1: '5', valT2: '8' },
        { testId: 'rubric_fb_tactics', testName: 'Football: Positioning & Tactics (Rubric)', unit: 'rating', valB: '3', valT1: '6', valT2: '9' }
      ];

      const getRubricRating = (val: number) => {
        if (val >= 9) return 'Mastery';
        if (val >= 7) return 'Advanced';
        if (val >= 5) return 'Proficient';
        if (val >= 3) return 'Developing';
        return 'Novice';
      };

      const resultsToSave: FitnessResult[] = [];

      testCases.forEach(test => {
        const isRubric = test.testId.startsWith('rubric_');
        // Baseline
        resultsToSave.push({
          id: `${studentId}_${test.testId}_baseline`,
          teacherId,
          schoolId,
          studentId,
          testId: test.testId,
          testName: test.testName,
          value: test.valB,
          unit: test.unit,
          date: '2024-09-10',
          term: 'Baseline',
          rating: isRubric ? getRubricRating(parseFloat(test.valB)) : 'Average'
        });

        // Term 1
        resultsToSave.push({
          id: `${studentId}_${test.testId}_term1`,
          teacherId,
          schoolId,
          studentId,
          testId: test.testId,
          testName: test.testName,
          value: test.valT1,
          unit: test.unit,
          date: '2024-12-12',
          term: 'Term 1',
          rating: isRubric ? getRubricRating(parseFloat(test.valT1)) : 'Good'
        });

        // Term 2
        resultsToSave.push({
          id: `${studentId}_${test.testId}_term2`,
          teacherId,
          schoolId,
          studentId,
          testId: test.testId,
          testName: test.testName,
          value: test.valT2,
          unit: test.unit,
          date: '2025-03-15',
          term: 'Term 2',
          rating: isRubric ? getRubricRating(parseFloat(test.valT2)) : 'Excellent'
        });
      });

      // Save to Firestore
      await fitnessService.saveStudent(demoStudent);
      const resultPromises = resultsToSave.map(res => fitnessService.saveResult(res));
      await Promise.all(resultPromises);

      // Select student in the UI
      setSelectedType('individual');
      setSelectedId(studentId);

      toast.success('Successfully populated "Kabir Dutt" with Baseline, Term 1 & Term 2 marks and Football rubrics in Firestore!');
    } catch (err) {
      console.error('Error generating demo database data:', err);
      toast.error('Failed to create demo database entry in Firestore.');
    } finally {
      setGeneratingDemo(false);
    }
  };

  const handlePrint = () => {
    try {
      const reportElement = reportRef.current;
      if (!reportElement) {
        toast.error("Could not find the report element to print.");
        return;
      }

      toast.info("Preparing your print layout...");

      // Create a hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.zIndex = '-9999';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        toast.error("Could not initialize printing context.");
        return;
      }

      // Copy all styles and link tags from main document to print iframe
      let stylesHtml = '';
      document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
        stylesHtml += node.outerHTML;
      });

      // Extract raw report HTML
      const reportHtml = reportElement.innerHTML;

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${reportData ? reportData.title : 'Fitness Report'}</title>
            ${stylesHtml}
            <style>
              @page {
                size: A4 portrait;
                margin: 0;
              }
              body {
                background: white !important;
                color: #0f172a !important;
                font-family: system-ui, -apple-system, sans-serif;
                margin: 0 !important;
                padding: 0 !important;
              }
              .pdf-page-section {
                width: 210mm !important;
                height: 297mm !important;
                box-sizing: border-box !important;
                page-break-after: always !important;
                break-after: page !important;
                margin: 0 !important;
                padding: 20mm !important;
                border: none !important;
                box-shadow: none !important;
                overflow: hidden !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                background-color: white !important;
              }
              /* Hide navigation or action elements from the print */
              .print\\:hidden, button, .no-print {
                display: none !important;
              }
              /* Support background graphics and colors on all browsers */
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .grid {
                display: grid !important;
              }
            </style>
          </head>
          <body>
            <div>
              ${reportHtml}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.focus();
                  window.print();
                  setTimeout(function() {
                    window.parent.document.body.removeChild(window.frameElement);
                  }, 1000);
                }, 1200);
              };
            </script>
          </body>
        </html>
      `);
      iframeDoc.close();
    } catch (e) {
      console.error("Print failed:", e);
      window.focus();
      window.print();
    }
  };

  const exportToPDF = async () => {
    if (!reportRef.current) {
      toast.error("Could not find the report element to generate PDF.");
      return;
    }

    setDownloadingPdf(true);
    toast.info("Generating your high-quality, neat multi-page PDF report. Please wait...");

    try {
      const el = reportRef.current;
      
      // Select all `.pdf-page-section` elements inside the report
      const pageElements = el.querySelectorAll('.pdf-page-section');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // mm
      const pageHeight = 297; // mm

      if (pageElements.length > 0) {
        for (let i = 0; i < pageElements.length; i++) {
          const pageEl = pageElements[i] as HTMLElement;
          
          if (i > 0) {
            pdf.addPage();
          }

          // Use html-to-image with pixelRatio: 2 for high definition crispness
          const dataUrl = await toJpeg(pageEl, {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            filter: (node) => {
              if (node instanceof HTMLElement) {
                if (node.classList.contains('print:hidden') || node.classList.contains('no-print') || node.tagName === 'BUTTON') {
                  return false;
                }
              }
              return true;
            }
          });

          // Render image filling the A4 page perfectly
          pdf.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
        }
      } else {
        // Fallback for screens with no `.pdf-page-section` (e.g., class or school reports)
        const originalMaxHeight = el.style.maxHeight;
        const originalOverflow = el.style.overflow;
        const originalBorder = el.style.border;
        const originalBoxShadow = el.style.boxShadow;

        el.style.maxHeight = 'none';
        el.style.overflow = 'visible';
        el.style.border = 'none';
        el.style.boxShadow = 'none';

        await new Promise((resolve) => setTimeout(resolve, 400));

        const dataUrl = await toJpeg(el, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          filter: (node) => {
            if (node instanceof HTMLElement) {
              if (node.classList.contains('print:hidden') || node.classList.contains('no-print') || node.tagName === 'BUTTON') {
                return false;
              }
            }
            return true;
          }
        });

        // Restore original styling safely
        el.style.maxHeight = originalMaxHeight;
        el.style.overflow = originalOverflow;
        el.style.border = originalBorder;
        el.style.boxShadow = originalBoxShadow;

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const imgHeight = (img.height * pageWidth) / img.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(dataUrl, 'JPEG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add extra pages if needed
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(dataUrl, 'JPEG', 0, position, pageWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      const name = reportData ? reportData.title.replace(/\s+/g, '_').toLowerCase() : 'fitness_report';
      pdf.save(`${name}.pdf`);
      toast.success("PDF Report downloaded successfully!");
    } catch (error) {
      console.error("PDF high-fidelity generation failed, using html2canvas fallback:", error);
      
      try {
        const el = reportRef.current;
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          ignoreElements: (node) => {
            return node.classList.contains('print:hidden') || node.classList.contains('no-print') || node.tagName === 'BUTTON';
          },
          onclone: (clonedDoc) => {
            const card = clonedDoc.querySelector('.max-h-\\[80vh\\]') as HTMLElement;
            if (card) {
              card.style.maxHeight = 'none';
              card.style.overflow = 'visible';
              card.style.border = 'none';
              card.style.boxShadow = 'none';
            }
          }
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        const name = reportData ? reportData.title.replace(/\s+/g, '_').toLowerCase() : 'fitness_report';
        pdf.save(`${name}.pdf`);
        toast.success("PDF downloaded successfully via fallback!");
      } catch (fbErr) {
        console.error("Fallback failed:", fbErr);
        toast.error("Could not download PDF directly in this sandbox. Try standard Print!");
      }
    } finally {
      setDownloadingPdf(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = "";
    const filename = `${reportData.title.replace(/\s+/g, '_').toLowerCase()}_export.csv`;

    if (selectedType === 'individual') {
      const headers = ["Test Name", "Baseline", "Term 1", "Term 2", "Final", "Unit"];
      csvContent += headers.join(",") + "\n";

      const testGroups = (reportData.studentResults || []).reduce((acc: any, r: FitnessResult) => {
        if (!acc[r.testName]) acc[r.testName] = { baseline: '', term1: '', term2: '', final: '', unit: r.unit };
        if (r.term === 'Baseline') acc[r.testName].baseline = r.value;
        if (r.term === 'Term 1') acc[r.testName].term1 = r.value;
        if (r.term === 'Term 2') acc[r.testName].term2 = r.value;
        if (r.term === 'Final') acc[r.testName].final = r.value;
        return acc;
      }, {});

      Object.entries(testGroups).forEach(([name, data]: [string, any]) => {
        csvContent += `"${name}",${data.baseline},${data.term1},${data.term2},${data.final},"${data.unit}"\n`;
      });
    } else if (selectedType === 'class') {
      const headers = ["Test Name", "Assessment Count"];
      csvContent += headers.join(",") + "\n";
      
      Object.entries(reportData.testDistribution || reportData.testCounts || {}).forEach(([name, count]) => {
        csvContent += `"${name}",${count}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteResult = async (resultId: string) => {
    if (!window.confirm("Are you sure you want to delete this fitness result? This action cannot be undone.")) return;
    
    try {
      await fitnessService.deleteResult(resultId);
      // The real-time listener will update the UI automatically
    } catch (err) {
      console.error("Error deleting result:", err);
      alert("Failed to delete result. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in pb-36">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Fitness Reports</h2>
          <p className="text-slate-500 font-medium">Generate professional progress reports and data comparisons.</p>
        </div>
      </div>

      {/* ⚡ Database & Rubrics Playground */}
      <div className="bg-slate-50 border-2 border-slate-900 rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] print:hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-dashed border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-2xl border-2 border-slate-900 text-white">
              <Zap size={28} className="fill-current" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Database & Rubrics Playground</h3>
              <p className="text-xs font-bold text-slate-500">
                Generate dummy PE records (Baseline, Term 1 & 2) and skill rubrics, and explore how they map inside Firestore.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleGenerateDummyData}
              disabled={generatingDemo}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-slate-900 rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center gap-2"
            >
              <Sparkles size={16} className="animate-pulse" />
              <span>{generatingDemo ? 'Populating...' : '⚡ Generate Dummy Student Data'}</span>
            </button>
            <button
              onClick={() => setShowDbExplorer(!showDbExplorer)}
              className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-900 rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center gap-2"
            >
              <Database size={16} />
              <span>{showDbExplorer ? 'Hide Firestore Explorer' : '📂 View Database Schema'}</span>
            </button>
          </div>
        </div>

        {/* DB Schema Explorer Panel */}
        {showDbExplorer && (
          <div className="bg-slate-900 rounded-3xl p-6 text-white font-mono text-xs border-2 border-slate-900 shadow-inner space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-[10px] text-slate-400 font-bold ml-2 uppercase tracking-wider">FIRESTORE SCHEMA VIEWER</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['student', 'results', 'rubric'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveDbTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all ${
                      activeDbTab === tab 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'student' ? 'Student Doc' : tab === 'results' ? 'Physical Result Doc' : 'Sport Rubric Doc'}
                  </button>
                ))}
              </div>
            </div>

            {activeDbTab === 'student' && (
              <div className="space-y-3">
                <div className="text-slate-400 font-sans">
                  <p className="font-bold text-slate-300 mb-1">Collection Path: <code className="text-indigo-400 bg-slate-800 px-1.5 py-0.5 rounded">/students/demo_kabir_dutt</code></p>
                  <p className="text-[11px]">Stores the core student metadata, roll numbers, demographics, and cumulative grades.</p>
                </div>
                <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto text-emerald-400 max-h-64">
{`{
  "id": "demo_kabir_dutt",
  "name": "Kabir Dutt",
  "rollNumber": "PE-2026-07",
  "grade": "8",
  "section": "A",
  "gender": "Male",
  "age": 13,
  "dob": "2013-05-15",
  "attendance": 94,
  "performance": "Excellent",
  "teacherId": "auth_current_user_uid",
  "schoolId": "personal_auth_current_user_uid"
}`}
                </pre>
              </div>
            )}

            {activeDbTab === 'results' && (
              <div className="space-y-3">
                <div className="text-slate-400 font-sans">
                  <p className="font-bold text-slate-300 mb-1">Collection Path: <code className="text-indigo-400 bg-slate-800 px-1.5 py-0.5 rounded">/results/demo_kabir_dutt_sprint_50m_baseline</code></p>
                  <p className="text-[11px]">Stores a single physical measurement result linked back to a student ID and associated with a particular term (Baseline, Term 1, or Term 2).</p>
                </div>
                <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto text-emerald-400 max-h-64">
{`{
  "id": "demo_kabir_dutt_sprint_50m_baseline",
  "studentId": "demo_kabir_dutt",
  "testId": "sprint_50m",
  "testName": "50m Sprint Speed",
  "value": "9.2",
  "unit": "sec",
  "date": "2024-09-10",
  "term": "Baseline",
  "rating": "Average",
  "teacherId": "auth_current_user_uid",
  "schoolId": "personal_auth_current_user_uid"
}`}
                </pre>
              </div>
            )}

            {activeDbTab === 'rubric' && (
              <div className="space-y-3">
                <div className="text-slate-400 font-sans">
                  <p className="font-bold text-slate-300 mb-1">Collection Path: <code className="text-indigo-400 bg-slate-800 px-1.5 py-0.5 rounded">/results/demo_kabir_dutt_rubric_fb_dribble_term2</code></p>
                  <p className="text-[11px]">Stores a qualitative sport skill rubric evaluation out of 10. We use <code className="text-amber-400 font-mono">testId</code> prefix <code className="text-amber-400 font-mono">rubric_</code> and specify the unit as <code className="text-amber-400 font-mono">"rating"</code> so that the app separates it from standard physical measurements in charts while displaying it in matrices!</p>
                </div>
                <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto text-emerald-400 max-h-64">
{`{
  "id": "demo_kabir_dutt_rubric_fb_dribble_term2",
  "studentId": "demo_kabir_dutt",
  "testId": "rubric_fb_dribble",
  "testName": "Football: Dribbling & Control (Rubric)",
  "value": "9",
  "unit": "rating",
  "date": "2025-03-15",
  "term": "Term 2",
  "rating": "Mastery",
  "teacherId": "auth_current_user_uid",
  "schoolId": "personal_auth_current_user_uid"
}`}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Step-by-Step Reporting Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-slate-200 rounded-[2rem] p-6 font-sans">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-wider">
              <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 font-black rounded-full text-[10px]">1</span>
              <span>Generate or Select</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              Click the button above to populate Kabir Dutt's records. Alternatively, select any other student from the list in the configuration sidebar.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-wider">
              <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 font-black rounded-full text-[10px]">2</span>
              <span>Review Performance & Rubrics</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              The dashboard immediately compiles a visual progress report showing the physical radar, multi-term progress lines, and custom Football Game Rubrics.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-wider">
              <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 font-black rounded-full text-[10px]">3</span>
              <span>Download & Print PDF</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              <strong className="text-indigo-600">Download Branded PDF:</strong> Click the <strong className="text-[#0D2B52]">"Download PDF"</strong> button on the report menu to export branded, print-ready multi-page documents. <strong className="text-indigo-600">Spreadsheets:</strong> Use <strong className="text-slate-800">"Excel / CSV"</strong> for bulk data.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Report Configuration */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="text-xl font-black uppercase tracking-tight mb-6">Report Config</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Report Scope</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'individual', label: 'Student', icon: User },
                    { id: 'class', label: 'Class', icon: Users },
                    { id: 'school', label: 'School', icon: Activity }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => { setSelectedType(type.id as any); setSelectedId(''); }}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                        selectedType === type.id 
                          ? 'bg-indigo-600 border-slate-900 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]' 
                          : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <type.icon size={20} className="mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedType !== 'school' && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Select {selectedType === 'individual' ? 'Student' : 'Class'}
                  </label>
                  <select 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                    value={selectedId}
                    onChange={e => setSelectedId(e.target.value)}
                  >
                    <option value="">Choose {selectedType === 'individual' ? 'Student' : 'Class'}...</option>
                    {selectedType === 'individual' ? (
                      students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)
                    ) : (
                      teams.map(t => <option key={t.id} value={t.id}>{t.name} (Grade {t.grade})</option>)
                    )}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <button 
                  onClick={generateReport}
                  disabled={isGenerating || (!selectedId && selectedType !== 'school')}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                  <span>Generate Report</span>
                </button>

                {reportData && (
                  <button 
                    onClick={exportToPDF}
                    disabled={downloadingPdf}
                    className="w-full py-3.5 bg-[#0D2B52] hover:bg-[#164077] text-white border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    title="Export Branded PDF Document"
                  >
                    {downloadingPdf ? (
                      <Loader2 size={16} className="animate-spin text-[#D4A017]" />
                    ) : (
                      <Download size={16} className="text-[#D4A017]" />
                    )}
                    <span>{downloadingPdf ? 'Exporting PDF...' : 'Download PDF'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-8 rounded-[2.5rem] border-2 border-indigo-100">
            <h4 className="text-sm font-black text-indigo-900 uppercase tracking-tight mb-4 flex items-center gap-2">
              <TrendingUp size={16} />
              <span>Report Types</span>
            </h4>
            <div className="space-y-2">
              {[
                { name: 'Baseline vs Term 1', desc: 'Initial assessment comparison' },
                { name: 'Full Academic Year', desc: 'Progress across all 3 terms' },
                { name: 'BMI & Growth', desc: 'Physical health tracking' }
              ].map(item => (
                <div key={item.name} className="p-4 bg-white/50 rounded-xl">
                  <p className="text-xs font-black text-indigo-900 uppercase tracking-tight">{item.name}</p>
                  <p className="text-[10px] font-bold text-indigo-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!reportData ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] h-full flex flex-col items-center justify-center p-12 text-center text-slate-400 min-h-[500px]"
              >
                <BarChart3 size={64} className="mb-6 text-slate-100" />
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2">No Report Selected</h3>
                <p className="max-w-xs font-medium">Select a student or class and click generate to view the fitness analysis.</p>
              </motion.div>
            ) : (
              <motion.div 
                ref={reportRef}
                key="report"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] border-2 border-slate-900 overflow-hidden shadow-2xl overflow-y-auto max-h-[80vh] print:max-h-none print:border-none print:shadow-none"
              >
                {/* Report Header */}
                <div className="p-10 border-b-2 border-slate-900 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:bg-white">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                      <Trophy size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">KIFT Performance Report</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{reportData.title}</h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{reportData.subtitle}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 print:hidden">
                    <button 
                      onClick={handlePrint}
                      className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-900 rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center gap-2 cursor-pointer"
                      title="Print Report"
                    >
                      <Printer size={16} />
                      <span>Print</span>
                    </button>
                    <button 
                      onClick={exportToPDF}
                      disabled={downloadingPdf}
                      className="px-4 py-3 bg-[#0D2B52] hover:bg-[#164077] text-white border-2 border-slate-900 rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] disabled:bg-slate-400 disabled:shadow-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center gap-2 cursor-pointer"
                      title="Export Branded PDF Document"
                    >
                      {downloadingPdf ? (
                        <Loader2 size={16} className="animate-spin text-[#D4A017]" />
                      ) : (
                        <Download size={16} className="text-[#D4A017]" />
                      )}
                      <span>{downloadingPdf ? 'Exporting PDF...' : 'Download PDF'}</span>
                    </button>
                    <button 
                      onClick={exportToCSV}
                      className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-slate-900 rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center gap-2 cursor-pointer"
                      title="Export to CSV"
                    >
                      <Download size={16} />
                      <span>Excel / CSV</span>
                    </button>
                  </div>
                </div>

                {/* Report Body */}
                <div className="p-6 md:p-10 bg-slate-50 space-y-12 print:p-0 print:space-y-0">
                  {selectedType === 'individual' ? (
                    <>
                      {/* Interactive Edit Tip (Only shown on screen) */}
                      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3 print:hidden shadow-sm">
                        <span className="text-xl">💡</span>
                        <p className="text-xs font-bold text-indigo-950">
                          <strong className="text-indigo-600">Interactive Feature:</strong> You can click and type to edit the <strong className="uppercase">School Name</strong> directly in any page header below. The name will automatically update across all pages and save perfectly in your PDF / Print report.
                        </p>
                      </div>

                      {/* Interactive D3 Student Progress Chart (On-Screen Visualization) */}
                      {reportData.student && (
                        <div className="print:hidden">
                          <D3StudentProgressChart 
                            student={reportData.student} 
                            results={reportData.studentResults || []} 
                          />
                        </div>
                      )}

                      {/* PAGE 1: STUDENT OVERVIEW & FITNESS RADAR */}
                      <div id="pdf-page-1" className="pdf-page-section bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-8 flex flex-col justify-between animate-fade-in relative overflow-hidden" style={{ minHeight: '297mm' }}>
                        {/* Subtle Confidential Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.025] p-10">
                          <div className="flex flex-col items-center justify-center -rotate-30 transform select-none">
                            <div className="text-slate-900 font-sans font-black text-8xl uppercase tracking-[0.2em] whitespace-nowrap">
                              CONFIDENTIAL
                            </div>
                            <div className="text-indigo-950 font-sans font-black text-base uppercase tracking-[0.5em] whitespace-nowrap mt-4">
                              SmartPE India System
                            </div>
                          </div>
                        </div>

                        {/* Page 1 Header with SmartPE India Branding */}
                        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start bg-white relative z-10">
                          <div className="space-y-3">
                            <Logo variant="color" showText={true} className="scale-90 origin-left" />
                            <div className="space-y-1 mt-1">
                              <input
                                type="text"
                                value={editableSchoolName}
                                onChange={(e) => setEditableSchoolName(e.target.value)}
                                placeholder="Enter School Name"
                                className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-transparent border-b border-dashed border-indigo-200 hover:border-indigo-600 focus:border-indigo-600 focus:outline-none py-0.5 px-1 w-full max-w-[350px] transition-all"
                                title="Click to edit school name"
                              />
                              <div className="flex items-center gap-2 text-slate-400">
                                <Trophy size={12} className="text-amber-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest">KIFT Performance Report Card</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end justify-between h-full pt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-sm">
                              {reportData.student?.name}
                            </span>
                            <div className="text-[9px] text-slate-400 font-bold mt-2">
                              Grade {reportData.student?.grade}-{reportData.student?.section} | {reportData.terms[reportData.terms.length - 1] || 'Term 2'}
                            </div>
                          </div>
                        </div>

                        {/* KPI Highlights Row */}
                        <div className="grid grid-cols-3 gap-6">
                          <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-md">
                            <Trophy className="mb-2 opacity-50" size={24} />
                            <div className="text-3xl font-black mb-0.5">
                              {reportData.terms.length > 0 ? reportData.terms[reportData.terms.length - 1] : 'No Data'}
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Current Phase</p>
                          </div>
                          <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-md">
                            <Activity className="mb-2 opacity-50 text-emerald-400" size={24} />
                            <div className="text-3xl font-black mb-0.5">
                              {Object.keys(reportData.byTerm).reduce((acc: number, t: string) => acc + reportData.byTerm[t].length, 0)}
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Total Tests Completed</p>
                          </div>
                          <div className="p-6 bg-emerald-500 rounded-3xl text-white shadow-md">
                            <TrendingUp className="mb-2 opacity-50" size={24} />
                            <div className="text-3xl font-black mb-0.5">
                              {reportData.terms.length > 1 ? 'Improving' : 'Baseline'}
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Progress Status</p>
                          </div>
                        </div>

                        {/* Visual Profile Block */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch flex-1">
                          {/* Left Column: Fitness Radar Chart */}
                          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-between min-h-[350px]">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Zap size={18} className="text-orange-500" />
                                <h4 className="font-black text-sm uppercase tracking-tight text-slate-800">Physical Fitness Radar</h4>
                              </div>
                              <span className="text-[9px] font-black px-2.5 py-1 bg-white text-slate-400 rounded-full uppercase tracking-widest border border-slate-200">
                                {reportData.terms[0] || 'Baseline'} Profile
                              </span>
                            </div>
                            <div className="flex-1 w-full flex items-center justify-center">
                              {reportData.radarData.length > 2 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={reportData.radarData}>
                                    <PolarGrid stroke="#cbd5e1" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 9, fontWeight: 900 }} />
                                    <Radar
                                      name={reportData.student?.name}
                                      dataKey="A"
                                      stroke="#4f46e5"
                                      fill="#4f46e5"
                                      fillOpacity={0.6}
                                    />
                                  </RadarChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="text-center p-8 bg-white rounded-2xl w-full">
                                  <Activity size={32} className="mx-auto mb-3 text-slate-200" />
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Need values for at least 3 tests<br/>to generate your fitness radar.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Column: Key Performance Indicators & Benchmark Comparison */}
                          <div className="flex flex-col justify-between gap-6">
                            {/* Flex/Balance Row */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-5 bg-slate-900 rounded-[1.5rem] text-white flex flex-col justify-between shadow-sm">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Flexibility Standard</p>
                                <div className="text-xl font-black">
                                  {reportData.latestByTest['sit_reach']?.value || '--'}
                                  <span className="text-xs ml-1 opacity-50">cm</span>
                                </div>
                              </div>
                              <div className="p-5 bg-indigo-600 rounded-[1.5rem] text-white flex flex-col justify-between shadow-sm">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Balance Retention</p>
                                <div className="text-xl font-black">
                                  {reportData.latestByTest['flamingo']?.value || '--'}
                                  <span className="text-xs ml-1 opacity-50">sec</span>
                                </div>
                              </div>
                            </div>

                            {/* Benchmark Comparison Bar Chart */}
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex-1 flex flex-col justify-between">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h4 className="text-xs font-black uppercase tracking-tight flex items-center gap-1.5 text-slate-800">
                                    <BarChart3 size={16} className="text-indigo-600" />
                                    <span>Benchmark Comparison</span>
                                  </h4>
                                  <p className="text-[9px] font-bold text-slate-400">Student vs. School Average</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-sm"></div>
                                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">Student</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-slate-200 rounded-sm"></div>
                                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">School Avg</span>
                                  </div>
                                </div>
                              </div>
                              <div className="h-44 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={reportData.comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 8, fontWeight: 900 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 8, fontWeight: 900 }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 5px 10px rgb(0 0 0 / 0.05)', fontSize: 9 }} />
                                    <Bar dataKey="student" fill="#4f46e5" radius={[3, 3, 0, 0]} barSize={20} />
                                    <Bar dataKey="average" fill="#e2e8f0" radius={[3, 3, 0, 0]} barSize={20} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Page 1 Footer */}
                        <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-4 relative z-10">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="text-[8px] font-black uppercase tracking-wider text-indigo-600">SmartPE India</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">CONFIDENTIAL STUDENT RECORD</span>
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Page 1 of 4</span>
                        </div>
                      </div>

                      {/* PAGE 2: PROGRESSION ANALYSIS & PERFORMANCE HISTORY */}
                      <div id="pdf-page-2" className="pdf-page-section bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between relative overflow-hidden" style={{ height: '1050px', maxHeight: '1050px', overflow: 'hidden', boxSizing: 'border-box' }}>
                        {/* Subtle Confidential Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.025] p-10">
                          <div className="flex flex-col items-center justify-center -rotate-30 transform select-none">
                            <div className="text-slate-900 font-sans font-black text-8xl uppercase tracking-[0.2em] whitespace-nowrap">
                              CONFIDENTIAL
                            </div>
                            <div className="text-indigo-950 font-sans font-black text-base uppercase tracking-[0.5em] whitespace-nowrap mt-4">
                              SmartPE India System
                            </div>
                          </div>
                        </div>

                        <div>
                          {/* Running Page Header with SmartPE India Logo */}
                          <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-6 relative z-10">
                            <div className="flex items-center gap-2">
                              <Logo showText={false} className="scale-50 origin-left -mr-6 -my-3 flex-shrink-0" />
                              <span className="font-sans font-black text-xs text-indigo-600 uppercase tracking-widest">{editableSchoolName}</span>
                              <span className="text-slate-300">|</span>
                              <span className="font-sans text-[10px] font-black text-slate-400 uppercase tracking-widest">Page 2: Trend & Progress</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-sans font-black text-[10px] text-slate-800 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full">{reportData.student?.name}</span>
                              <span className="font-sans font-bold text-[9px] text-slate-400 uppercase tracking-wider">{reportData.student?.grade}-{reportData.student?.section}</span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 px-2.5 py-1 bg-indigo-50 rounded-full border border-indigo-100">Performance History</span>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 mt-2">D3 Progress Chart & CBSE Benchmarks</h3>
                            <p className="text-[10px] font-bold text-slate-400">Chronological analysis of physical standard indicators vs. CBSE benchmarks across consecutive terms.</p>
                          </div>

                          {reportData.student && (
                            <div className="mb-6">
                              <D3StudentProgressChart 
                                student={reportData.student} 
                                results={reportData.studentResults || []} 
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-6 items-stretch">
                            {Object.entries((reportData.studentResults || []).reduce((acc: any, r: FitnessResult) => {
                              const tName = r.testName.split('(')[0].trim();
                              if (!acc[tName] && !r.testId.startsWith('rubric_')) {
                                acc[tName] = [];
                              }
                              if (!r.testId.startsWith('rubric_')) {
                                acc[tName].push({
                                  term: r.term,
                                  value: parseValue(r.value),
                                  unit: r.unit,
                                  date: r.date
                                });
                              }
                              return acc;
                            }, {})).slice(0, 4).map(([testName, testData]: [string, any], idx) => {
                              const sortedData = [...testData].sort((a, b) => {
                                const order = ['Baseline', 'Term 1', 'Term 2', 'Final'];
                                return order.indexOf(a.term) - order.indexOf(b.term);
                              });
                              
                              return sortedData.length > 0 ? (
                                <div key={testName} className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 flex flex-col justify-between h-[280px]">
                                  <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-black text-[10px] uppercase tracking-widest text-slate-700">{testName}</h5>
                                    <span className="text-[8px] font-black uppercase text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">{sortedData[0].unit}</span>
                                  </div>
                                  <div className="flex-1 w-full flex items-center justify-center">
                                    {sortedData.length > 1 ? (
                                      <ResponsiveContainer width="100%" height={190}>
                                        <LineChart data={sortedData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                                          <XAxis dataKey="term" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 8, fontWeight: 900 }} />
                                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 8, fontWeight: 900 }} />
                                          <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 5px 10px rgb(0 0 0 / 0.05)', fontSize: 9 }} />
                                          <Line 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke={['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5]} 
                                            strokeWidth={2.5} 
                                            dot={{ r: 3, strokeWidth: 1.5, fill: 'white' }}
                                            activeDot={{ r: 5, strokeWidth: 0 }}
                                          />
                                        </LineChart>
                                      </ResponsiveContainer>
                                    ) : (
                                      <div className="text-center p-4 bg-white rounded-xl w-full flex flex-col items-center justify-center h-full border border-slate-100">
                                        <TrendingUp size={24} className="mb-2 text-indigo-200" />
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-normal">
                                          Single Value Recorded: {sortedData[0].value} {sortedData[0].unit}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>

                        {/* Static Page Footer */}
                        <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-6 relative z-10">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="text-[8px] font-black uppercase tracking-wider text-indigo-600">SmartPE India</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">CONFIDENTIAL STUDENT RECORD</span>
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Page 2 of 4</span>
                        </div>
                      </div>

                      {/* PAGE 3: SPORT MASTERY RUBRICS */}
                      <div id="pdf-page-3" className="pdf-page-section bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between relative overflow-hidden" style={{ height: '1050px', maxHeight: '1050px', overflow: 'hidden', boxSizing: 'border-box' }}>
                        {/* Subtle Confidential Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.025] p-10">
                          <div className="flex flex-col items-center justify-center -rotate-30 transform select-none">
                            <div className="text-slate-900 font-sans font-black text-8xl uppercase tracking-[0.2em] whitespace-nowrap">
                              CONFIDENTIAL
                            </div>
                            <div className="text-indigo-950 font-sans font-black text-base uppercase tracking-[0.5em] whitespace-nowrap mt-4">
                              SmartPE India System
                            </div>
                          </div>
                        </div>

                        <div>
                          {/* Running Page Header with SmartPE India Logo */}
                          <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-6 relative z-10">
                            <div className="flex items-center gap-2">
                              <Logo showText={false} className="scale-50 origin-left -mr-6 -my-3 flex-shrink-0" />
                              <span className="font-sans font-black text-xs text-indigo-600 uppercase tracking-widest">{editableSchoolName}</span>
                              <span className="text-slate-300">|</span>
                              <span className="font-sans text-[10px] font-black text-slate-400 uppercase tracking-widest">Page 3: Skill Mastery Matrices</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-sans font-black text-[10px] text-slate-800 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full">{reportData.student?.name}</span>
                              <span className="font-sans font-bold text-[9px] text-slate-400 uppercase tracking-wider">{reportData.student?.grade}-{reportData.student?.section}</span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 px-2.5 py-1 bg-indigo-50 rounded-full border border-indigo-100">Curricular Standard</span>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 mt-2">Sport Mastery Rubrics</h3>
                            <p className="text-[10px] font-bold text-slate-400">Detailed qualitative skill assessments demonstrating ball-handling, passing, and athletic execution standards.</p>
                          </div>

                          {reportData.studentResults.some((r: FitnessResult) => r.testId.startsWith('rubric_')) ? (
                            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                              <table className="w-full text-left border-collapse table-fixed">
                                <thead>
                                  <tr className="bg-slate-900 text-white">
                                    <th className="p-3 text-[9px] font-black uppercase tracking-widest w-[30%]">Skill Criteria</th>
                                    <th className="p-3 text-[9px] font-black uppercase tracking-widest text-center w-[15%]">Baseline</th>
                                    <th className="p-3 text-[9px] font-black uppercase tracking-widest text-center w-[15%]">Term 1</th>
                                    <th className="p-3 text-[9px] font-black uppercase tracking-widest text-center w-[15%]">Term 2</th>
                                    <th className="p-3 text-[9px] font-black uppercase tracking-widest text-right w-[25%]">Mastery Level</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  {[
                                    {
                                      id: 'rubric_fb_dribble',
                                      name: 'Dribbling & Ball Control',
                                      desc: 'Keeping the ball close under pressure, speed changes, and utilizing both feet.',
                                      levels: {
                                        B: { val: '5/10', rate: 'Proficient' },
                                        T1: { val: '7/10', rate: 'Advanced' },
                                        T2: { val: '9/10', rate: 'Mastery' }
                                      }
                                    },
                                    {
                                      id: 'rubric_fb_pass',
                                      name: 'Passing & Accuracy',
                                      desc: 'Precision passing over varying distances, proper weight of pass, and non-dominant foot use.',
                                      levels: {
                                        B: { val: '4/10', rate: 'Developing' },
                                        T1: { val: '6/10', rate: 'Proficient' },
                                        T2: { val: '8/10', rate: 'Advanced' }
                                      }
                                    },
                                    {
                                      id: 'rubric_fb_shoot',
                                      name: 'Shooting & Form',
                                      desc: 'Proper kicking mechanics, ankle lock, directional accuracy, and shooting on the volley.',
                                      levels: {
                                        B: { val: '4/10', rate: 'Developing' },
                                        T1: { val: '5/10', rate: 'Proficient' },
                                        T2: { val: '7/10', rate: 'Advanced' }
                                      }
                                    },
                                    {
                                      id: 'rubric_fb_tactics',
                                      name: 'Positioning & Tactics',
                                      desc: 'Game awareness, defensive recovery, spatial distribution, and supporting runs.',
                                      levels: {
                                        B: { val: '3/10', rate: 'Developing' },
                                        T1: { val: '6/10', rate: 'Proficient' },
                                        T2: { val: '9/10', rate: 'Mastery' }
                                      }
                                    }
                                  ].map((rubric) => {
                                    const baseVal = reportData.studentResults.find((r: FitnessResult) => r.testId === rubric.id && r.term === 'Baseline');
                                    const t1Val = reportData.studentResults.find((r: FitnessResult) => r.testId === rubric.id && r.term === 'Term 1');
                                    const t2Val = reportData.studentResults.find((r: FitnessResult) => r.testId === rubric.id && r.term === 'Term 2');

                                    const displayBVal = baseVal ? baseVal.value : rubric.levels.B.val;
                                    const displayBRate = baseVal ? (parseInt(baseVal.value) >= 8 ? 'Advanced' : parseInt(baseVal.value) >= 5 ? 'Proficient' : 'Developing') : rubric.levels.B.rate;

                                    const displayT1Val = t1Val ? t1Val.value : rubric.levels.T1.val;
                                    const displayT1Rate = t1Val ? (parseInt(t1Val.value) >= 8 ? 'Advanced' : parseInt(t1Val.value) >= 5 ? 'Proficient' : 'Developing') : rubric.levels.T1.rate;

                                    const displayT2Val = t2Val ? t2Val.value : rubric.levels.T2.val;
                                    const displayT2Rate = t2Val ? (parseInt(t2Val.value) >= 8 ? 'Advanced' : parseInt(t2Val.value) >= 5 ? 'Proficient' : 'Developing') : rubric.levels.T2.rate;

                                    const getBadgeColor = (rate: string) => {
                                      if (rate === 'Mastery' || rate === 'Advanced') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                                      if (rate === 'Proficient' || rate === 'Satisfactory') return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
                                      return 'bg-orange-50 text-orange-700 border border-orange-200';
                                    };

                                    return (
                                      <tr key={rubric.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-3">
                                          <p className="font-bold text-slate-800 text-[10px]">{rubric.name}</p>
                                          <p className="text-[8px] text-slate-400 font-bold mt-0.5 leading-normal">{rubric.desc}</p>
                                        </td>
                                        <td className="p-3 text-center">
                                          <span className="text-[10px] font-black text-slate-900 block">{displayBVal}</span>
                                          <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full mt-1 inline-block ${getBadgeColor(displayBRate)}`}>
                                            {displayBRate}
                                          </span>
                                        </td>
                                        <td className="p-3 text-center">
                                          <span className="text-[10px] font-black text-slate-900 block">{displayT1Val}</span>
                                          <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full mt-1 inline-block ${getBadgeColor(displayT1Rate)}`}>
                                            {displayT1Rate}
                                          </span>
                                        </td>
                                        <td className="p-3 text-center">
                                          <span className="text-[10px] font-black text-slate-900 block">{displayT2Val}</span>
                                          <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full mt-1 inline-block ${getBadgeColor(displayT2Rate)}`}>
                                            {displayT2Rate}
                                          </span>
                                        </td>
                                        <td className="p-3 text-right">
                                          <div className="flex flex-col items-end">
                                            <span className="font-black text-slate-900 text-[10px]">Active Standard</span>
                                            <span className="text-[7px] text-slate-400 font-bold mt-0.5">Verified PE Curricular Check</span>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center p-12 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-200">
                              <Trophy size={32} className="text-slate-300 mb-3" />
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                Skill rubrics assessments have not been recorded<br/>for this sport profile yet.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Static Page Footer */}
                        <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-6 relative z-10">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="text-[8px] font-black uppercase tracking-wider text-indigo-600">SmartPE India</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">CONFIDENTIAL STUDENT RECORD</span>
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Page 3 of 4</span>
                        </div>
                      </div>

                      {/* Performance Table */}
                      <div className="space-y-6">
                        <h4 className="font-black text-xl uppercase tracking-tight flex items-center gap-2">
                          <Activity size={20} className="text-indigo-600" />
                          <span>Detailed Results</span>
                        </h4>
                        <div className="border-2 border-slate-900 rounded-3xl overflow-hidden">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-900 text-white">
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Test Name</th>
                                {['Baseline', 'Term 1', 'Term 2', 'Final'].filter(t => reportData.terms.includes(t)).map(term => (
                                  <th key={term} className="p-4 text-[10px] font-black uppercase tracking-widest text-center">{term}</th>
                                ))}
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Trend</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {/* Group results by test name for row-wise display */}
                              {Object.entries(
                                (reportData.studentResults || []).reduce((acc: any, r: FitnessResult) => {
                                  if (!acc[r.testName]) acc[r.testName] = { testId: r.testId, unit: r.unit, rawTerms: {}, terms: {} };
                                  acc[r.testName].rawTerms[r.term] = r.value;
                                  acc[r.testName].terms[r.term] = formatTestDisplayValue(r.testName, r.testId, r.value, r.unit);
                                  return acc;
                                }, {})
                              ).map(([testName, testData]: [string, any]) => {
                                const trend = calculateTestTrend(testData.testId, testName, testData.rawTerms);
                                return (
                                  <tr key={testName} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-black text-xs md:text-sm uppercase tracking-tight text-slate-800">{testName}</td>
                                    {['Baseline', 'Term 1', 'Term 2', 'Final'].filter(t => reportData.terms.includes(t)).map(term => (
                                      <td key={term} className="p-4 text-xs font-bold text-slate-700 text-center">
                                        {testData.terms[term] || '-'}
                                      </td>
                                    ))}
                                    <td className="p-4 text-right">
                                      <div className={`flex items-center justify-end font-black text-xs gap-1 ${
                                        trend.isPositive ? 'text-emerald-600' : 'text-amber-600'
                                      }`}>
                                        {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        <span>{trend.text}</span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* PAGE 4: DEVELOPMENTAL NOTES & QUALITATIVE FEEDBACK */}
                      <div id="pdf-page-4" className="pdf-page-section bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between relative overflow-hidden" style={{ height: '1050px', maxHeight: '1050px', overflow: 'hidden', boxSizing: 'border-box' }}>
                        {/* Subtle Confidential Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.025] p-10">
                          <div className="flex flex-col items-center justify-center -rotate-30 transform select-none">
                            <div className="text-slate-900 font-sans font-black text-8xl uppercase tracking-[0.2em] whitespace-nowrap">
                              CONFIDENTIAL
                            </div>
                            <div className="text-indigo-950 font-sans font-black text-base uppercase tracking-[0.5em] whitespace-nowrap mt-4">
                              SmartPE India System
                            </div>
                          </div>
                        </div>

                        <div>
                          {/* Running Page Header with SmartPE India Logo */}
                          <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-6 relative z-10">
                            <div className="flex items-center gap-2">
                              <Logo showText={false} className="scale-50 origin-left -mr-6 -my-3 flex-shrink-0" />
                              <span className="font-sans font-black text-xs text-indigo-600 uppercase tracking-widest">{editableSchoolName}</span>
                              <span className="text-slate-300">|</span>
                              <span className="font-sans text-[10px] font-black text-slate-400 uppercase tracking-widest">Page 4: Qualitative Feedback & Parameter Matrix</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-sans font-black text-[10px] text-slate-800 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full">{reportData.student?.name}</span>
                              <span className="font-sans font-bold text-[9px] text-slate-400 uppercase tracking-wider">{reportData.student?.grade}-{reportData.student?.section}</span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 px-2.5 py-1 bg-indigo-50 rounded-full border border-indigo-100">Evaluative Feedback</span>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 mt-2">Instructor Developmental Notes</h3>
                            <p className="text-[10px] font-bold text-slate-400">Holistic pedagogical review highlighting athletic strengths, areas of improvement, and tactical metrics.</p>
                          </div>

                          <div className="space-y-4">
                            {/* Overall Summary Card */}
                            <div className="bg-slate-900 text-white p-5 rounded-[1.5rem] border border-slate-950">
                              <h5 className="font-black text-[9px] uppercase tracking-widest text-indigo-400 mb-1">Overall Assessment Summary</h5>
                              <p className="text-slate-200 text-[11px] font-semibold leading-relaxed">
                                {reportData.overallSummary}
                              </p>
                            </div>

                            {/* Strengths & Recommendations Grid */}
                            <div className="grid grid-cols-2 gap-4">
                              {/* Strengths */}
                              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-2">
                                <div className="flex items-center gap-1.5 text-emerald-800">
                                  <span className="text-xs">👍</span>
                                  <h5 className="font-black text-[9px] uppercase tracking-widest">Demonstrated Strengths</h5>
                                </div>
                                {reportData.strengths && reportData.strengths.length > 0 ? (
                                  <ul className="space-y-1.5">
                                    {reportData.strengths.slice(0, 2).map((item: string, idx: number) => {
                                      const [title, desc] = item.split(': Rated as ');
                                      return (
                                        <li key={idx} className="text-[9px] text-slate-700 font-bold leading-normal">
                                          <strong className="text-emerald-700 block uppercase tracking-tight text-[8px]">{title}</strong>
                                          <span className="opacity-90">{desc}</span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                ) : (
                                  <p className="text-[8px] font-bold text-slate-400">No high-performing physical parameters registered yet.</p>
                                )}
                              </div>

                              {/* Improvements */}
                              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 space-y-2">
                                <div className="flex items-center gap-1.5 text-orange-800">
                                  <span className="text-xs">🎯</span>
                                  <h5 className="font-black text-[9px] uppercase tracking-widest">Recommended Actions</h5>
                                </div>
                                {reportData.improvements && reportData.improvements.length > 0 ? (
                                  <ul className="space-y-1.5">
                                    {reportData.improvements.slice(0, 2).map((item: string, idx: number) => {
                                      const [title, desc] = item.split(': Rated as ');
                                      return (
                                        <li key={idx} className="text-[9px] text-slate-700 font-bold leading-normal">
                                          <strong className="text-orange-700 block uppercase tracking-tight text-[8px]">{title}</strong>
                                          <span className="opacity-90">{desc}</span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                ) : (
                                  <div className="text-[8px] text-slate-600 font-bold leading-normal">
                                    <p className="text-emerald-700 font-black uppercase tracking-wider text-[8px]">Exceptional Standard Profile!</p>
                                    <p className="text-slate-500 mt-0.5 leading-normal">Meets or exceeds physical guidelines. Continue daily play to preserve athletic capacity.</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Parameter Status & Rating Matrix Grid */}
                            {reportData.feedbackItems && reportData.feedbackItems.length > 0 && (
                              <div className="space-y-2 pt-3 border-t border-slate-100">
                                <h5 className="font-black text-[9px] uppercase tracking-widest text-slate-400">Individual Standard Parameter Ratings</h5>
                                <div className="grid grid-cols-3 gap-3">
                                  {reportData.feedbackItems.slice(0, 6).map((item: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between h-[110px]">
                                      <div>
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                          <span className="font-black text-[9px] text-slate-800 uppercase tracking-tight truncate">{item.testName.split('(')[0].trim()}</span>
                                          <span className={`text-[6px] font-black uppercase tracking-wider px-1 py-0.2 rounded-full ${
                                            item.status === 'Excellent' 
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : item.status === 'Satisfactory'
                                              ? 'bg-indigo-100 text-indigo-800'
                                              : 'bg-orange-100 text-orange-800'
                                          }`}>
                                            {item.status === 'Excellent' ? 'Excellent' : item.status === 'Satisfactory' ? 'Satisfactory' : 'Developing'}
                                          </span>
                                        </div>
                                        <p className="text-[8px] text-slate-500 font-black tracking-tight uppercase line-clamp-1 mb-0.5">{item.rating}</p>
                                        <p className="text-[8px] text-slate-400 font-semibold leading-normal line-clamp-2">{item.details}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Static Page Footer */}
                        <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-6 relative z-10">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="text-[8px] font-black uppercase tracking-wider text-indigo-600">SmartPE India</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">CONFIDENTIAL STUDENT RECORD</span>
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Page 4 of 4</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Class/School stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 bg-indigo-50 rounded-[2rem] border-2 border-indigo-100">
                          <div className="text-indigo-600 mb-4">{selectedType === 'class' ? <Users size={32} /> : <Users size={32} />}</div>
                          <div className="text-4xl font-black text-indigo-900 mb-1">
                            {selectedType === 'class' ? reportData.studentCount : reportData.totalStudents}
                          </div>
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                            {selectedType === 'class' ? 'Students in Class' : 'Enrolled Students'}
                          </p>
                        </div>
                        <div className="p-8 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100">
                          <div className="text-emerald-600 mb-4"><Activity size={32} /></div>
                          <div className="text-4xl font-black text-emerald-900 mb-1">
                            {selectedType === 'class' ? reportData.totalAssessments : reportData.totalResults}
                          </div>
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Tests Recorded</p>
                        </div>
                        <div className="p-8 bg-orange-50 rounded-[2rem] border-2 border-orange-100">
                          <div className="text-orange-600 mb-4"><Zap size={32} /></div>
                          <div className="text-4xl font-black text-orange-900 mb-1">
                            {selectedType === 'class' ? reportData.avgBmi : (reportData.focusGrades.length > 0 ? `Grade ${reportData.focusGrades[0]}` : 'None')}
                          </div>
                          <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                            {selectedType === 'class' ? 'Average BMI' : 'Requires Improvement'}
                          </p>
                        </div>
                      </div>

                      {selectedType === 'class' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100">
                            <h4 className="text-lg font-black uppercase tracking-tight mb-8">Test Distribution</h4>
                            <div className="h-64 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportData.distributionData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                                  <YAxis hide />
                                  <Tooltip />
                                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                          <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100">
                            <h4 className="text-lg font-black uppercase tracking-tight mb-8">Class Averages</h4>
                            <div className="h-64 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart outerRadius="80%" data={reportData.classAverageData}>
                                  <PolarGrid />
                                  <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                                  <Radar name="Class Average" dataKey="average" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedType === 'school' && (
                        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm">
                           <h4 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-8">
                              <TrendingUp size={20} className="text-indigo-600" />
                              <span>Grade-wise Fitness Levels</span>
                            </h4>
                            <div className="h-80 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportData.barChartData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                  <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                  <Bar dataKey="average" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                  <Bar dataKey="bmi" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                        </div>
                      )}

                      {/* Grade Analysis Section */}
                      {selectedType === 'school' && reportData.gradeStats && (
                        <div className="space-y-6">
                          <h4 className="font-black text-xl uppercase tracking-tight flex items-center gap-2">
                            <BarChart3 size={20} className="text-indigo-600" />
                            <span>Performance by Grade</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(reportData.gradeStats).map(([grade, stats]: [string, any]) => {
                              const needsFix = reportData.focusGrades?.includes(grade);
                              return (
                                <div key={grade} className={`p-6 rounded-3xl border-2 transition-all ${
                                  needsFix ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'
                                }`}>
                                  <div className="flex justify-between items-start mb-4">
                                    <h5 className="font-black text-lg uppercase tracking-tight">Grade {grade}</h5>
                                    {needsFix && (
                                      <span className="px-2 py-1 bg-orange-200 text-orange-700 text-[8px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                                        <Info size={10} />
                                        Focus Needed
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      <span>Avg Score</span>
                                      <span className={needsFix ? 'text-orange-600' : 'text-slate-900'}>{stats.avg?.toFixed(1) || '0.0'}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${needsFix ? 'bg-orange-500' : 'bg-indigo-600'}`}
                                        style={{ width: `${Math.min(stats.avg || 0, 100)}%` }}
                                      />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
                                      {stats.results || 0} assessments completed
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Test counts */}
                      <div className="space-y-6 pt-6">
                        <h4 className="font-black text-xl uppercase tracking-tight">Test Distribution</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(reportData.testDistribution || reportData.testCounts || {}).map(([name, count]: [string, any]) => (
                            <div key={name} className="p-6 bg-white border-2 border-slate-100 rounded-3xl">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{name}</p>
                              <p className="text-2xl font-black text-slate-900">{count}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Print Footer */}
                <div className="p-10 bg-slate-50 border-t-2 border-slate-900 hidden print:block">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Verification</p>
                      <div className="flex gap-12">
                        <div className="w-32 border-b border-slate-900 pb-2 text-[10px] font-bold text-slate-600 uppercase text-center">
                          PE Instructor
                        </div>
                        <div className="w-32 border-b border-slate-900 pb-2 text-[10px] font-bold text-slate-600 uppercase text-center">
                          Principal
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Date</p>
                      <p className="font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Close Button print hide */}
                <div className="p-8 flex justify-center print:hidden bg-slate-50 border-t border-slate-100">
                  <button 
                    onClick={() => setReportData(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-black text-xs uppercase tracking-widest transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Config</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FitnessReports;
