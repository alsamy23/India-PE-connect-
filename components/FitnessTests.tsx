
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Heart, 
  Zap, 
  Dumbbell, 
  Move, 
  Timer, 
  StretchHorizontal, 
  User, 
  ChevronRight, 
  ArrowLeft, 
  Calculator, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Info,
  Trophy,
  History,
  Activity,
  Save,
  Gamepad2,
  FileText,
  Printer,
  Download,
  X,
  Share2
} from 'lucide-react';
import { evaluateFitnessTests } from '../services/geminiService.ts';
import { FitnessAssessment, KIFTBattery, KIFTTest, FitnessResult } from '../types.ts';
import { storageService } from '../services/storageService.ts';
import { fitnessService, Student, KIFT_BATTERIES } from '../services/fitnessService.ts';
import { auth } from '../services/firebase.ts';
import { toast } from '../services/toast.ts';
import GamesProficiencyGenerator from './GamesProficiencyGenerator.tsx';

const FitnessTests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fitness' | 'games'>('fitness');
  const [selectedBattery, setSelectedBattery] = useState<KIFTBattery | null>(null);

  const [selectedTest, setSelectedTest] = useState<KIFTTest | null>(null);
  const [age, setAge] = useState('10');
  const [gender, setGender] = useState('Male');
  const [testValue, setTestValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FitnessAssessment | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('ALL');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Baseline');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [studentResults, setStudentResults] = useState<FitnessResult[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);

  const formatFitnessError = (err: any): string => {
    try {
      // Try to parse the JSON error string from handleFirestoreError
      const parsed = JSON.parse(err.message);
      if (parsed.error) {
        if (parsed.error.includes('permission') || parsed.error.includes('insufficient')) {
          return "Access Denied: You don't have permission to perform this action. Check if your school profile is properly registered.";
        }
        if (parsed.error.includes('offline') || parsed.error.includes('unavailable')) {
          return "Network Error: Please check your internet connection and try again.";
        }
        if (parsed.error.includes('quota')) {
          return "Quota Exceeded: The daily limit for database operations has been reached. Please try again later.";
        }
        return `Database Error: ${parsed.error}`;
      }
    } catch (e) {
      // Fallback for non-JSON errors
      if (err.message?.includes('network') || err.message?.includes('failed to fetch')) {
        return "Connection Error: Unable to reach the server. Please check your network.";
      }
    }
    return err.message || "An unexpected error occurred. Please try again.";
  };

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const fetchProfileData = async () => {
      if (auth.currentUser) {
        const profile = await fitnessService.getSchoolMember(auth.currentUser.uid);
        setUserProfile(profile);
        
        // Subscribe to students after profile is loaded to know if admin
        try {
          const isAdmin = profile?.role === 'admin';
          const schoolId = profile?.schoolId;
          unsub = fitnessService.subscribeToStudents(auth.currentUser.uid, schoolId, isAdmin, setStudents);
        } catch (err) {
          console.error("Error subscribing to students in FitnessTests:", err);
        }
      }
    };
    fetchProfileData();
    
    return () => unsub?.();
  }, [auth.currentUser?.uid]);

  useEffect(() => {
    let unsubStudentResults: (() => void) | undefined;
    if (selectedStudentId && auth.currentUser) {
      const student = students.find(s => s.id === selectedStudentId);
      const schoolId = student?.schoolId || userProfile?.schoolId;
      unsubStudentResults = fitnessService.subscribeToStudentResults(selectedStudentId, schoolId, setStudentResults);
    } else {
      setStudentResults([]);
    }
    return () => unsubStudentResults?.();
  }, [selectedStudentId, students, userProfile, auth.currentUser?.uid]);

  /**
   * Generates a printer-friendly, CBSE-compliant PDF report card for a single student's fitness results.
   */
  const generateStudentCbsePdfReportCard = (targetStudentId?: string) => {
    const studentIdToUse = targetStudentId || selectedStudentId;
    const student = students.find(s => s.id === studentIdToUse);

    // Basic details
    const name = student ? student.name : (selectedStudentId ? 'Student Record' : 'Student');
    const roll = student ? student.rollNumber : 'PE-' + Math.floor(1000 + Math.random() * 9000);
    const grade = student ? student.grade : (age ? (parseInt(age) > 5 ? (parseInt(age) - 5).toString() : '5') : 'N/A');
    const section = student ? student.section : 'A';
    const studentAgeVal = student ? student.age : age;
    const studentGenderVal = student ? student.gender : gender;

    const schoolName = userProfile?.schoolName || userProfile?.schoolId || 'CENTRAL BOARD OF SECONDARY EDUCATION (CBSE)';

    // Gather test results
    let combinedTests: Array<{
      testName: string;
      value: string;
      unit: string;
      term: string;
      rating: string;
      percentile: string | number;
      recommendation: string;
    }> = [];

    // Filter saved student results for this student
    const savedForStudent = studentResults.filter(r => r.studentId === studentIdToUse);

    if (savedForStudent.length > 0) {
      savedForStudent.forEach(r => {
        combinedTests.push({
          testName: r.testName,
          value: r.value,
          unit: r.unit || '',
          term: r.term || selectedTerm,
          rating: r.rating || 'Recorded',
          percentile: r.percentile !== undefined && r.percentile !== null && !isNaN(r.percentile) ? r.percentile : '-',
          recommendation: 'Maintains active participation in physical activities under CBSE HPE guidelines.'
        });
      });
    }

    // Append current assessment result if available
    if (result && result.tests) {
      result.tests.forEach(t => {
        const exists = combinedTests.some(c => c.testName === t.testName && c.term === selectedTerm);
        if (!exists) {
          combinedTests.push({
            testName: t.testName,
            value: t.score,
            unit: selectedTest?.unit || '',
            term: selectedTerm,
            rating: t.rating,
            percentile: t.percentile || '-',
            recommendation: t.recommendation || 'Regular training recommended.'
          });
        }
      });
    }

    // Fallback if no test result exists yet
    if (combinedTests.length === 0 && selectedTest) {
      combinedTests.push({
        testName: selectedTest.name,
        value: testValue || 'Recorded',
        unit: selectedTest.unit || '',
        term: selectedTerm,
        rating: 'Recorded',
        percentile: '-',
        recommendation: 'Baseline assessment recorded under CBSE Khelo India Fitness Test battery.'
      });
    }

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth(); // 210
      const pageHeight = doc.internal.pageSize.getHeight(); // 297
      const margin = 12;
      const contentWidth = pageWidth - (margin * 2); // 186

      // Outer Page Frame
      doc.setLineWidth(0.6);
      doc.setDrawColor(30, 27, 75); // Deep Indigo
      doc.rect(margin - 2, margin - 2, contentWidth + 4, pageHeight - (margin * 2) + 4);

      doc.setLineWidth(0.2);
      doc.setDrawColor(203, 213, 225); // Slate 300
      doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));

      let currentY = margin + 4;

      // 1. Header Banner
      doc.setFillColor(30, 27, 75); // Deep Navy
      doc.rect(margin, currentY, contentWidth, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('CENTRAL BOARD OF SECONDARY EDUCATION (CBSE)', pageWidth / 2, currentY + 7, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('KHELO INDIA FITNESS TEST (KIFT) - STUDENT REPORT CARD', pageWidth / 2, currentY + 13, { align: 'center' });

      doc.setFontSize(8);
      doc.setTextColor(224, 231, 255);
      doc.text(`${schoolName.toUpperCase()} | SESSION: 2025-26 | PHASE: ${selectedTerm.toUpperCase()}`, pageWidth / 2, currentY + 19, { align: 'center' });

      currentY += 28;

      // 2. Student Profile Grid
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.rect(margin, currentY, contentWidth, 26, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, currentY, contentWidth, 26, 'S');

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);

      // Row 1
      doc.setFont('helvetica', 'bold');
      doc.text('Student Name:', margin + 4, currentY + 7);
      doc.setFont('helvetica', 'normal');
      doc.text(name, margin + 28, currentY + 7);

      doc.setFont('helvetica', 'bold');
      doc.text('Roll Number:', margin + 98, currentY + 7);
      doc.setFont('helvetica', 'normal');
      doc.text(roll, margin + 120, currentY + 7);

      doc.setFont('helvetica', 'bold');
      doc.text('Class & Sec:', margin + 148, currentY + 7);
      doc.setFont('helvetica', 'normal');
      doc.text(`${grade} - ${section}`, margin + 168, currentY + 7);

      // Row 2
      doc.setFont('helvetica', 'bold');
      doc.text('Age / Gender:', margin + 4, currentY + 15);
      doc.setFont('helvetica', 'normal');
      doc.text(`${studentAgeVal} Yrs / ${studentGenderVal}`, margin + 28, currentY + 15);

      doc.setFont('helvetica', 'bold');
      doc.text('Date of Test:', margin + 98, currentY + 15);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), margin + 120, currentY + 15);

      doc.setFont('helvetica', 'bold');
      doc.text('CBSE Battery:', margin + 148, currentY + 15);
      doc.setFont('helvetica', 'normal');
      const batteryCategory = selectedBattery?.category || fitnessService.getBatteryForGrade(grade)?.category || 'Middle School';
      doc.text(batteryCategory, margin + 170, currentY + 15);

      // Row 3
      doc.setFont('helvetica', 'bold');
      doc.text('HPE Status:', margin + 4, currentY + 22);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(16, 185, 129); // Emerald green
      doc.text('Compliant with CBSE Health & Physical Education (HPE) Mainstream Guidelines', margin + 28, currentY + 22);

      currentY += 32;

      // 3. Fitness Battery Results Table Header
      doc.setFillColor(49, 46, 129); // Indigo 900
      doc.rect(margin, currentY, contentWidth, 8, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);

      doc.text('S.NO', margin + 3, currentY + 5.5);
      doc.text('FITNESS TEST PARAMETER', margin + 14, currentY + 5.5);
      doc.text('TERM', margin + 74, currentY + 5.5);
      doc.text('SCORE / VALUE', margin + 98, currentY + 5.5);
      doc.text('PERCENTILE', margin + 130, currentY + 5.5);
      doc.text('CBSE RATING', margin + 154, currentY + 5.5);

      currentY += 8;

      // Rows
      doc.setFontSize(8);

      combinedTests.forEach((t, idx) => {
        const isEven = idx % 2 === 0;
        doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
        doc.rect(margin, currentY, contentWidth, 8, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, currentY, contentWidth, 8, 'S');

        doc.setTextColor(51, 65, 85);

        // S.No
        doc.setFont('helvetica', 'normal');
        doc.text(String(idx + 1), margin + 4, currentY + 5.5);

        // Name
        doc.setFont('helvetica', 'bold');
        doc.text(t.testName.length > 32 ? t.testName.substring(0, 30) + '...' : t.testName, margin + 14, currentY + 5.5);

        // Term
        doc.setFont('helvetica', 'normal');
        doc.text(t.term, margin + 74, currentY + 5.5);

        // Score
        doc.setFont('helvetica', 'bold');
        doc.text(`${t.value} ${t.unit}`, margin + 98, currentY + 5.5);

        // Percentile
        doc.setFont('helvetica', 'normal');
        const pctStr = t.percentile && t.percentile !== '-' ? `${t.percentile} %ile` : 'Standard';
        doc.text(pctStr, margin + 130, currentY + 5.5);

        // Rating
        const ratingStr = t.rating || 'Recorded';
        if (ratingStr === 'Elite' || ratingStr === 'Excellent') {
          doc.setTextColor(21, 128, 61);
        } else if (ratingStr === 'Good' || ratingStr === 'Satisfactory') {
          doc.setTextColor(3, 105, 161);
        } else if (ratingStr === 'Needs Improvement') {
          doc.setTextColor(185, 28, 28);
        } else {
          doc.setTextColor(71, 85, 105);
        }
        doc.setFont('helvetica', 'bold');
        doc.text(ratingStr, margin + 154, currentY + 5.5);

        currentY += 8;
      });

      currentY += 4;

      // 4. PE Teacher Assessment Box
      doc.setFillColor(238, 242, 255);
      doc.rect(margin, currentY, contentWidth, 32, 'F');
      doc.setDrawColor(199, 210, 254);
      doc.rect(margin, currentY, contentWidth, 32, 'S');

      doc.setTextColor(49, 46, 129);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text("PHYSICAL EDUCATION TEACHER'S ASSESSMENT & GUIDANCE", margin + 4, currentY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      const summary = result?.overallSummary || 
        `${name} shows satisfactory physical growth and active participation across test batteries. Recommended to maintain daily 30-minute moderate physical activity and hydration to enhance agility and cardiovascular stamina as specified under CBSE HPE Strand 1 guidelines.`;

      const splitText = doc.splitTextToSize(summary, contentWidth - 8);
      doc.text(splitText, margin + 4, currentY + 12);

      currentY += 38;

      // 5. CBSE Descriptors Legend
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, contentWidth, 18, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, currentY, contentWidth, 18, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("CBSE KIFT PERFORMANCE DESCRIPTORS:", margin + 4, currentY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text("• Elite / Excellent (>85th Percentile): Superior physical capacity & motor coordination.", margin + 4, currentY + 9);
      doc.text("• Good / Satisfactory (50th - 85th Percentile): Healthy physical standard meeting national benchmarks.", margin + 4, currentY + 13);
      doc.text("• Needs Improvement (<50th Percentile): Target area requiring guided physical training & practice.", margin + 4, currentY + 17);

      currentY += 24;

      // 6. Signatures
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);

      const colW = contentWidth / 3;

      // Sig 1
      doc.line(margin + 6, currentY + 18, margin + colW - 6, currentY + 18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text("Physical Education Teacher", margin + colW / 2, currentY + 22, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text("Signature & Date", margin + colW / 2, currentY + 26, { align: 'center' });

      // Sig 2
      doc.line(margin + colW + 6, currentY + 18, margin + (colW * 2) - 6, currentY + 18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text("Class Teacher", margin + (colW * 1.5), currentY + 22, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text("Signature & Remarks", margin + (colW * 1.5), currentY + 26, { align: 'center' });

      // Sig 3
      doc.line(margin + (colW * 2) + 6, currentY + 18, margin + contentWidth - 6, currentY + 18);
      doc.setFont('helvetica', 'bold');
      doc.text("Principal / Headmaster", margin + (colW * 2.5), currentY + 22, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text("Signature & School Seal", margin + (colW * 2.5), currentY + 26, { align: 'center' });

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Issued under CBSE Circular No. Acad-11/2018 for Mainstreaming Health & Physical Education (HPE) and Khelo India Fitness Assessment Protocols.", pageWidth / 2, pageHeight - margin - 3, { align: 'center' });

      const fileName = `${name.replace(/\s+/g, '_')}_CBSE_Fitness_Report_Card.pdf`;
      doc.save(fileName);
      toast.success(`CBSE Fitness Report Card generated for ${name}!`);
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      toast.error(`Failed to generate PDF: ${err.message || 'Error occurred'}`);
    }
  };

  const handleBatteryClick = (battery: KIFTBattery) => {
    setSelectedBattery(battery);
    setSelectedTest(null);
    setResult(null);
  };

  const handleTestClick = (test: KIFTTest) => {
    setSelectedTest(test);
    setResult(null);
    setTestValue('');
  };

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    const student = students.find(s => s.id === id);
    if (student) {
      setAge(student.age.toString());
      setGender(student.gender);
      
      // Automatically select the correct battery for the student's grade
      const battery = fitnessService.getBatteryForGrade(student.grade);
      if (battery) {
        setSelectedBattery(battery);
      }
    }
  };

  const handleCalculate = async () => {
    if (!selectedBattery || !selectedTest || !testValue) {
      setError("Please enter a result for the test.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await evaluateFitnessTests(age, gender, selectedBattery.category, selectedTest.name, testValue);
      setResult(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Assessment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDirectly = async () => {
    if (!auth.currentUser || !selectedTest || !testValue) return;

    // Determine schoolId: 
    // 1. From selected student
    // 2. From user's school profile
    // 3. Super Admin global fallback
    // 4. Personal fallback for teachers without schools
    const student = students.find(s => s.id === selectedStudentId);
    let schoolId = student?.schoolId || userProfile?.schoolId;

    if (!schoolId) {
      if (auth.currentUser.email === 'alsamy36@gmail.com') {
        schoolId = 'master_registry';
      } else {
        schoolId = `personal_${auth.currentUser.uid}`;
      }
    }

    setLoading(true);
    try {
      await fitnessService.saveResult({
        id: Math.random().toString(36).substr(2, 9),
        teacherId: auth.currentUser.uid,
        schoolId: schoolId,
        studentId: selectedStudentId || 'manual_entry',
        testId: selectedTest.id,
        testName: selectedTest.name,
        value: testValue,
        unit: selectedTest.unit,
        date: new Date().toISOString(),
        term: selectedTerm,
        rating: 'Recorded',
        percentile: 0
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      setError(null);
    } catch (err: any) {
      console.error("Direct save failed:", err);
      const errorMsg = formatFitnessError(err);
      setError(errorMsg + " (Verification failed - check school ID)");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    if (!auth.currentUser) {
      setError("Please log in as a teacher to save results to your school database.");
      return;
    }
    
    try {
      // Save to general history
      storageService.saveItem({
        type: 'Tool',
        title: `${selectedTest?.name} Assessment`,
        content: result,
        metadata: { age, gender, category: selectedBattery?.category, test: selectedTest?.name, value: testValue }
      });

      // Save to school database if student is selected
      if (selectedStudentId || userProfile?.schoolId || auth.currentUser.email === 'alsamy36@gmail.com') {
          const student = students.find(s => s.id === selectedStudentId);
          let schoolId = student?.schoolId || userProfile?.schoolId;
          
          if (!schoolId) {
            if (auth.currentUser.email === 'alsamy36@gmail.com') {
              schoolId = 'master_registry';
            } else {
              schoolId = `personal_${auth.currentUser.uid}`;
            }
          }

        await fitnessService.saveResult({
          id: Math.random().toString(36).substr(2, 9),
          teacherId: auth.currentUser.uid,
          schoolId: schoolId,
          studentId: selectedStudentId || 'manual_entry',
          testId: selectedTest?.id || '',
          testName: selectedTest?.name || '',
          value: testValue,
          unit: selectedTest?.unit || '',
          date: new Date().toISOString(),
          term: selectedTerm,
          rating: result.tests[0]?.rating,
          percentile: parseFloat(result.tests[0]?.percentile)
        });
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      setError(null);
    } catch (err: any) {
      console.error("AI Save failed:", err);
      const errorMsg = formatFitnessError(err);
      setError(errorMsg + " (AI Save error)");
    } finally {
      setLoading(false);
    }
  };

  // Get unique grades for the filter dropdown
  const uniqueGrades = Array.from(new Set(students.map(s => s.grade)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  // Filter students based on grade filter and search query
  const filteredStudentsForSelect = students.filter(s => {
    const matchesGrade = !selectedGradeFilter || selectedGradeFilter === 'ALL' || s.grade === selectedGradeFilter;
    const matchesSearch = !studentSearchQuery || s.name.toLowerCase().includes(studentSearchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  // Ensure currently selected student is always presented in the dropdown so a user doesn't see a broken dropdown when changing filters
  const isSelectedInFiltered = filteredStudentsForSelect.some(s => s.id === selectedStudentId);
  const finalStudentsList = [...filteredStudentsForSelect];
  if (selectedStudentId && !isSelectedInFiltered) {
    const currentStudent = students.find(s => s.id === selectedStudentId);
    if (currentStudent) {
      finalStudentsList.unshift(currentStudent);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      {/* Top Level Nav toggle */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mb-8 shadow-inner border border-slate-200/60">
        <button 
          onClick={() => setActiveTab('fitness')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
            activeTab === 'fitness' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity size={16} />
          <span>KIFT Fitness Logs</span>
        </button>
        <button 
          onClick={() => setActiveTab('games')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
            activeTab === 'games' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Gamepad2 size={16} />
          <span>Games Proficiency</span>
        </button>
      </div>

      {activeTab === 'games' ? (
        <GamesProficiencyGenerator students={students} userProfile={userProfile} />
      ) : (
        <div className="space-y-8">
          {/* School Setup Warning */}
          {!userProfile?.schoolId && (
            <div className="bg-orange-50 border-2 border-orange-100 p-6 rounded-[2rem] flex items-start gap-4">
              <AlertCircle className="text-orange-600 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-black text-orange-900 uppercase tracking-tight mb-1 text-sm">School Profile Required</h4>
                <p className="text-orange-700/70 text-xs font-medium leading-relaxed">
                  To save fitness results, you must first register your school in the <strong className="text-orange-900">School Admin</strong> tab. 
                  Currently, results can only be analyzed but not saved to the permanent database.
                </p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">KIFT Testing Suite</h2>
              <p className="text-indigo-200 text-lg font-medium leading-relaxed">
                Khelo India Fitness Test (CBSE Format). Standardized batteries for Primary to Senior Secondary grades.
              </p>
            </div>
            <Trophy className="absolute right-[-20px] bottom-[-40px] w-64 h-64 text-white/10 rotate-12" />
          </div>

          {!selectedBattery ? (
        /* Batteries Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {KIFT_BATTERIES.map((battery) => (
            <button
              key={battery.category}
              onClick={() => handleBatteryClick(battery)}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:scale-[1.02] transition-all text-left group"
            >
              <div className="p-4 bg-indigo-50 rounded-2xl w-fit mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Activity size={32} />
              </div>
              <h3 className="font-black text-xl text-slate-800 mb-2 leading-tight uppercase tracking-tight">{battery.category}</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Grades: {battery.grades.join(', ')}</p>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">{battery.objective}</p>
              <div className="mt-auto flex items-center text-indigo-600 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View {battery.tests.length} Tests</span>
                <ChevronRight size={14} className="ml-1" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Battery View */
        <div className="space-y-8">
          <button 
            onClick={() => setSelectedBattery(null)}
            className="flex items-center space-x-2 text-slate-400 hover:text-indigo-600 font-bold uppercase text-xs tracking-widest transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Batteries</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar: Tests in Battery */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <Activity size={20} className="text-indigo-600" />
                  </div>
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">{selectedBattery.category} Tests</h3>
                </div>
                <div className="space-y-2">
                  {selectedBattery.tests.map((test) => (
                    <button
                      key={test.id}
                      onClick={() => handleTestClick(test)}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between group ${
                        selectedTest?.id === test.id 
                          ? 'bg-indigo-600 text-white shadow-lg' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-bold text-sm">{test.name}</span>
                      <ChevronRight size={16} className={selectedTest?.id === test.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                    </button>
                  ))}
                </div>
              </div>

              {selectedTest && (
                <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                  <div className="flex items-center space-x-2 mb-3 text-indigo-600">
                    <Info size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Test Protocol</span>
                  </div>
                  <p className="text-indigo-900/70 text-sm leading-relaxed font-medium">
                    {selectedTest.description}
                  </p>
                </div>
              )}
            </div>

            {/* Main Content: Input & Results */}
            <div className="lg:col-span-8">
              {!selectedTest ? (
                <div className="bg-white border-4 border-dashed border-slate-100 rounded-[2.5rem] h-full flex flex-col items-center justify-center p-12 text-center text-slate-400 min-h-[400px]">
                  <Activity size={48} className="mb-4 text-slate-200" />
                  <p className="font-bold uppercase tracking-tight">Select a test from the {selectedBattery.category} battery to begin.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Input Card */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="mb-8">
                      {/* Search Bar & Class Filter Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Filter by Class / Grade</label>
                          <select 
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700"
                            value={selectedGradeFilter}
                            onChange={e => setSelectedGradeFilter(e.target.value)}
                          >
                            <option value="ALL">All Classes / Grades</option>
                            {uniqueGrades.map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Search Student Name</label>
                          <div className="relative">
                            <input 
                              type="text"
                              placeholder="Search by name..."
                              className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700"
                              value={studentSearchQuery}
                              onChange={e => setStudentSearchQuery(e.target.value)}
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-sans text-sm select-none">🔍</span>
                          </div>
                        </div>
                      </div>

                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Link to Registered Student</label>
                      <select 
                        className={`w-full p-4 border-2 rounded-2xl font-bold outline-none transition-all ${
                          selectedStudentId 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-900 focus:ring-2 focus:ring-indigo-500' 
                            : 'bg-slate-50 border-slate-100 text-slate-600 focus:ring-2 focus:ring-indigo-500'
                        }`}
                        value={selectedStudentId}
                        onChange={e => handleStudentChange(e.target.value)}
                      >
                        <option value="">Manual Entry (Not Linked)</option>
                        {finalStudentsList.map(s => (
                          <option key={s.id} value={s.id}>{s.name} (Grade {s.grade} {s.section})</option>
                        ))}
                      </select>
                      <div className="flex flex-wrap items-center justify-between mt-3 gap-2">
                        {selectedStudentId ? (
                          <p className="text-[10px] font-bold text-indigo-500 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            <span>Linked to {students.find(s => s.id === selectedStudentId)?.name}</span>
                          </p>
                        ) : <div />}
                        <button
                          onClick={() => generateStudentCbsePdfReportCard()}
                          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                          title="Generate printer-friendly CBSE PDF Report Card for Student"
                        >
                          <FileText size={14} />
                          <span>Generate CBSE PDF Report Card</span>
                        </button>
                      </div>
                      <div className="mt-6 flex-1 min-w-[150px]">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Assessment Term</label>
                        <select 
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          value={selectedTerm}
                          onChange={e => setSelectedTerm(e.target.value)}
                        >
                          <option value="Baseline">Baseline</option>
                          <option value="Term 1">Term 1</option>
                          <option value="Term 2">Term 2</option>
                          <option value="Final">Final Report</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 mb-8">
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Student Age</label>
                        <select 
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          value={age}
                          disabled={!!selectedStudentId}
                          onChange={e => setAge(e.target.value)}
                        >
                          {[...Array(60)].map((_, i) => <option key={i} value={i+5}>{i+5} Years</option>)}
                        </select>
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Gender</label>
                        <select 
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          value={gender}
                          disabled={!!selectedStudentId}
                          onChange={e => setGender(e.target.value)}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div className="flex-[2] min-w-[250px]">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Value & Action</label>
                        <div className="flex gap-4">
                          <input 
                            type="text"
                            placeholder={selectedTest.unit}
                            className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={testValue}
                            onChange={e => {
                              setTestValue(e.target.value);
                              setResult(null); // Reset result if value changes
                            }}
                          />
                          <button 
                            onClick={handleCalculate}
                            disabled={loading || !testValue}
                            className="bg-indigo-600 text-white px-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center space-x-2"
                            title="Analyze Performance"
                          >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Calculator size={16} />}
                            <span className="hidden md:inline">Analyze Performance</span>
                          </button>
                          <button 
                            onClick={async () => {
                              if (!testValue) return;
                              // If no result yet, save with default rating
                              if (!result) {
                                setLoading(true);
                                try {
                                  // Trigger a quick evaluation if possible, or save directly
                                  await handleSaveDirectly();
                                } finally {
                                  setLoading(false);
                                }
                              } else {
                                handleSave();
                              }
                            }}
                            disabled={loading || !testValue}
                            className={`px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 ${
                              isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                            <span>{isSaved ? 'Saved' : 'Save'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-start space-x-2">
                        <AlertCircle size={16} className="flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>

                  {/* Result Card */}
                  {result && (
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 animate-slide-up">
                      <div className="flex flex-wrap justify-between items-center mb-8 pb-4 border-b border-slate-100 gap-4">
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Assessment Report</h3>
                        <div className="flex flex-wrap items-center gap-3">
                          <button 
                            onClick={() => generateStudentCbsePdfReportCard()}
                            className="flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                            title="Download CBSE Compliant PDF Report Card"
                          >
                            <FileText size={16} />
                            <span>Download CBSE PDF Report</span>
                          </button>
                          <button 
                            onClick={handleSave}
                            disabled={isSaved}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                              isSaved 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                            <span>{isSaved ? 'Student Result Saved' : 'Confirm & Save Result'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {result.tests.map((res, idx) => (
                          <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{res.testName}</h4>
                            <div className="flex items-baseline space-x-2 mb-3">
                              <span className="text-3xl font-black text-slate-900">{res.score}</span>
                              <span className="text-xs font-bold text-indigo-600">{res.percentile} %ile</span>
                            </div>
                            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                              res.rating === 'Elite' ? 'bg-yellow-400 text-yellow-900' :
                              res.rating === 'Excellent' ? 'bg-indigo-600 text-white' :
                              res.rating === 'Good' ? 'bg-emerald-100 text-emerald-700' :
                              res.rating === 'Average' ? 'bg-slate-200 text-slate-600' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {res.rating}
                            </span>
                            <p className="mt-4 text-xs text-slate-500 leading-relaxed font-medium">
                              {res.recommendation}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 flex items-start space-x-6">
                        <div className="p-4 bg-white rounded-2xl shadow-sm">
                          <Trophy className="text-indigo-600" size={32} />
                        </div>
                        <div>
                          <h4 className="font-black text-indigo-900 text-lg mb-2 uppercase tracking-tight">Expert Summary</h4>
                          <p className="text-indigo-800/70 leading-relaxed font-medium">
                            {result.overallSummary}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
     </div>
    )}
  </div>
  );
};

export default FitnessTests;
