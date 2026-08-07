
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
  Share2,
  Users,
  Search,
  Check,
  CheckCheck,
  ListFilter,
  Table,
  FileSpreadsheet,
  Upload,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { evaluateFitnessTests } from '../services/geminiService.ts';
import { FitnessAssessment, KIFTBattery, KIFTTest, FitnessResult } from '../types.ts';
import { storageService } from '../services/storageService.ts';
import { fitnessService, Student, KIFT_BATTERIES } from '../services/fitnessService.ts';
import { calculateExactBMI, parseFitnessValue } from '../utils/bmiUtils.ts';
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
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('ALL');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [entryMode, setEntryMode] = useState<'batch' | 'single'>('batch');
  const [batchScores, setBatchScores] = useState<{ [studentId: string]: string }>({});
  const [batchSaving, setBatchSaving] = useState(false);
  const [batchSavedStatus, setBatchSavedStatus] = useState<{ [studentId: string]: boolean }>({});
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
        let displayVal = r.value;
        let unitStr = r.unit || '';
        let ratingStr = r.rating || 'Recorded';

        if (r.testId === 'bmi' || r.testName.toLowerCase().includes('bmi')) {
          const bmiRes = calculateExactBMI(r.value);
          displayVal = `${bmiRes.bmi} (${bmiRes.category})`;
          unitStr = 'kg/m²';
          ratingStr = bmiRes.category;
        }

        combinedTests.push({
          testName: r.testName,
          value: displayVal,
          unit: unitStr,
          term: r.term || selectedTerm,
          rating: ratingStr,
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
      let directRating = 'Recorded';
      if (selectedTest.id === 'bmi' || selectedTest.name.toLowerCase().includes('bmi')) {
        const bmiRes = calculateExactBMI(testValue);
        directRating = bmiRes.category;
      }

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
        rating: directRating,
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

  const handleBatchSave = async () => {
    if (!auth.currentUser) {
      setError("Please log in before saving class scores.");
      return;
    }

    const currentTests = selectedBattery ? selectedBattery.tests : (selectedTest ? [selectedTest] : []);
    if (currentTests.length === 0) {
      setError("Please select a fitness test or battery first.");
      return;
    }

    setBatchSaving(true);
    setError(null);
    let savedCount = 0;

    try {
      for (const student of filteredStudentsForSelect) {
        let schoolId = student.schoolId || userProfile?.schoolId;
        if (!schoolId) {
          schoolId = auth.currentUser.email === 'alsamy36@gmail.com' ? 'master_registry' : `personal_${auth.currentUser.uid}`;
        }

        for (const testItem of currentTests) {
          const val = (batchScores[`${student.id}_${testItem.id}`] || (currentTests.length === 1 ? batchScores[student.id] : '') || '').trim();
          if (val) {
            let cellRating = 'Recorded';
            if (testItem.id === 'bmi' || testItem.name.toLowerCase().includes('bmi')) {
              cellRating = calculateExactBMI(val).category;
            }

            await fitnessService.saveResult({
              id: Math.random().toString(36).substr(2, 9),
              teacherId: auth.currentUser.uid,
              schoolId: schoolId,
              studentId: student.id,
              testId: testItem.id,
              testName: testItem.name,
              value: val,
              unit: testItem.unit,
              date: new Date().toISOString(),
              term: selectedTerm,
              rating: cellRating,
              percentile: 0
            });

            setBatchSavedStatus(prev => ({
              ...prev,
              [student.id]: true,
              [`${student.id}_${testItem.id}`]: true
            }));
            savedCount++;
          }
        }
      }

      if (savedCount === 0) {
        setError("Please enter scores in the grid before clicking save.");
        return;
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
      toast.success(`Successfully saved ${savedCount} fitness test scores!`);
    } catch (err: any) {
      console.error("Batch save failed:", err);
      setError(formatFitnessError(err));
    } finally {
      setBatchSaving(false);
    }
  };

  const handleSingleRowSave = async (student: Student, testItem?: KIFTTest) => {
    if (!auth.currentUser) return;
    const targetTest = testItem || selectedTest;
    if (!targetTest) return;

    const val = (batchScores[`${student.id}_${targetTest.id}`] || batchScores[student.id])?.trim();
    if (!val) return;

    try {
      let schoolId = student.schoolId || userProfile?.schoolId;
      if (!schoolId) {
        schoolId = auth.currentUser.email === 'alsamy36@gmail.com' ? 'master_registry' : `personal_${auth.currentUser.uid}`;
      }

      let singleRating = 'Recorded';
      if (targetTest.id === 'bmi' || targetTest.name.toLowerCase().includes('bmi')) {
        singleRating = calculateExactBMI(val).category;
      }

      await fitnessService.saveResult({
        id: Math.random().toString(36).substr(2, 9),
        teacherId: auth.currentUser.uid,
        schoolId: schoolId,
        studentId: student.id,
        testId: targetTest.id,
        testName: targetTest.name,
        value: val,
        unit: targetTest.unit,
        date: new Date().toISOString(),
        term: selectedTerm,
        rating: singleRating,
        percentile: 0
      });

      setBatchSavedStatus(prev => ({ 
        ...prev, 
        [student.id]: true,
        [`${student.id}_${targetTest.id}`]: true
      }));
      toast.success(`Saved score for ${student.name} (${targetTest.name})`);
    } catch (err: any) {
      toast.error("Failed to save score");
    }
  };

  const handleExportCsvTemplate = () => {
    if (filteredStudentsForSelect.length === 0) {
      toast.error("No students in current filter to export.");
      return;
    }
    const currentTests = selectedBattery ? selectedBattery.tests : (selectedTest ? [selectedTest] : []);
    const headers = ['Roll Number', 'Student Name', 'Grade', 'Section', 'Gender', ...currentTests.map(t => `${t.name} (${t.unit})`)];
    
    const rows = filteredStudentsForSelect.map(s => [
      s.rollNumber || '',
      `"${s.name}"`,
      s.grade || '',
      s.section || '',
      s.gender || '',
      ...currentTests.map(t => batchScores[`${s.id}_${t.id}`] || (currentTests.length === 1 ? batchScores[s.id] : '') || '')
    ]);

    const csvStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Fitness_Data_Grid_Gr${selectedGradeFilter}_Sec${selectedSectionFilter}_${selectedTerm}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Spreadsheet CSV exported successfully!");
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          toast.error("CSV file is empty or missing data rows.");
          return;
        }

        const currentTests = selectedBattery ? selectedBattery.tests : (selectedTest ? [selectedTest] : []);
        let importedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
          const rollNum = row[0];
          const studentName = row[1]?.toLowerCase();

          const matchedStudent = filteredStudentsForSelect.find(s => 
            (rollNum && s.rollNumber && s.rollNumber === rollNum) ||
            (studentName && s.name.toLowerCase() === studentName)
          );

          if (matchedStudent) {
            currentTests.forEach((t, tIdx) => {
              const val = row[5 + tIdx];
              if (val && val !== '') {
                setBatchScores(prev => ({
                  ...prev,
                  [`${matchedStudent.id}_${t.id}`]: val,
                  [matchedStudent.id]: val
                }));
                setBatchSavedStatus(prev => ({
                  ...prev,
                  [`${matchedStudent.id}_${t.id}`]: false,
                  [matchedStudent.id]: false
                }));
                importedCount++;
              }
            });
          }
        }

        if (importedCount > 0) {
          toast.success(`Imported ${importedCount} scores from CSV!`);
        } else {
          toast.error("Could not match student names or roll numbers in the uploaded CSV.");
        }
      } catch (err) {
        console.error("CSV Parse Error:", err);
        toast.error("Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleGridKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    studentIdx: number,
    testIdx: number,
    totalStudents: number,
    totalTests: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextStudentIdx = e.shiftKey 
        ? Math.max(0, studentIdx - 1) 
        : Math.min(totalStudents - 1, studentIdx + 1);
      const targetEl = document.getElementById(`grid-input-${nextStudentIdx}-${testIdx}`);
      targetEl?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextStudentIdx = Math.min(totalStudents - 1, studentIdx + 1);
      const targetEl = document.getElementById(`grid-input-${nextStudentIdx}-${testIdx}`);
      targetEl?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevStudentIdx = Math.max(0, studentIdx - 1);
      const targetEl = document.getElementById(`grid-input-${prevStudentIdx}-${testIdx}`);
      targetEl?.focus();
    }
  };

  // Get unique grades and sections for filter dropdowns
  const uniqueGrades = Array.from(new Set(students.map(s => s.grade)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  const uniqueSections = Array.from(new Set(students.map(s => s.section)))
    .filter(Boolean)
    .sort();

  // Filter students based on grade, section, and roll number or name search
  const filteredStudentsForSelect = students.filter(s => {
    const matchesGrade = !selectedGradeFilter || selectedGradeFilter === 'ALL' || s.grade === selectedGradeFilter;
    const matchesSection = !selectedSectionFilter || selectedSectionFilter === 'ALL' || s.section === selectedSectionFilter;
    const queryLower = studentSearchQuery.toLowerCase().trim();
    const matchesSearch = !queryLower || 
      s.name.toLowerCase().includes(queryLower) || 
      (s.rollNumber && s.rollNumber.toLowerCase().includes(queryLower));
    return matchesGrade && matchesSection && matchesSearch;
  }).sort((a, b) => {
    if (a.rollNumber && b.rollNumber) {
      return a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true });
    }
    return a.name.localeCompare(b.name);
  });

  // Count unsaved batch scores
  const unsavedBatchCount = filteredStudentsForSelect.filter(s => batchScores[s.id] && batchScores[s.id].trim() !== '' && !batchSavedStatus[s.id]).length;

  // Ensure currently selected student is always presented in the dropdown
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
                  {/* Mode Switcher Tabs */}
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button 
                      onClick={() => setEntryMode('batch')}
                      className={`flex-1 py-3 px-4 rounded-xl font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        entryMode === 'batch' 
                          ? 'bg-[#0D2B52] text-white shadow-md' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Users size={16} className="text-[#D4A017]" />
                      <span>Class Roster Batch Entry ({filteredStudentsForSelect.length})</span>
                    </button>
                    <button 
                      onClick={() => setEntryMode('single')}
                      className={`flex-1 py-3 px-4 rounded-xl font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        entryMode === 'single' 
                          ? 'bg-[#0D2B52] text-white shadow-md' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <User size={16} className="text-[#D4A017]" />
                      <span>Single Student Search</span>
                    </button>
                  </div>

                  {/* Top Class Filter Toolbar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">1. Class / Grade</label>
                      <select 
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800"
                        value={selectedGradeFilter}
                        onChange={e => setSelectedGradeFilter(e.target.value)}
                      >
                        <option value="ALL">All Grades ({uniqueGrades.length})</option>
                        {uniqueGrades.map(g => (
                          <option key={g} value={g}>Grade {g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">2. Section</label>
                      <select 
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800"
                        value={selectedSectionFilter}
                        onChange={e => setSelectedSectionFilter(e.target.value)}
                      >
                        <option value="ALL">All Sections ({uniqueSections.length})</option>
                        {uniqueSections.map(s => (
                          <option key={s} value={s}>Section {s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">3. Roll # / Name Search</label>
                      <div className="relative">
                        <input 
                          type="text"
                          placeholder="Search student..."
                          className="w-full p-2.5 pl-8 bg-white border border-slate-300 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800"
                          value={studentSearchQuery}
                          onChange={e => setStudentSearchQuery(e.target.value)}
                        />
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        {studentSearchQuery && (
                          <button onClick={() => setStudentSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">4. Term</label>
                      <select 
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800"
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

                  {entryMode === 'batch' ? (
                    /* SPREADSHEET-STYLE BULK FITNESS DATA GRID MODE */
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-5">
                      {/* Grid Header & Quick Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <Table size={18} className="text-[#0D2B52]" />
                            <h3 className="text-base font-black text-[#0D2B52] uppercase tracking-tight">
                              Class Fitness Data Grid ({filteredStudentsForSelect.length})
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Battery: <strong className="text-indigo-600 uppercase">{selectedBattery?.category || selectedTest?.name}</strong> &bull; Phase: <strong>{selectedTerm}</strong> &bull; <span className="text-slate-400">Use Enter / Arrow keys to navigate rows</span>
                          </p>
                        </div>

                        {/* CSV Import/Export & Batch Save Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={handleExportCsvTemplate}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Export Class Fitness Spreadsheet as CSV"
                          >
                            <FileSpreadsheet size={14} className="text-emerald-600" />
                            <span>Export CSV</span>
                          </button>

                          <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer">
                            <Upload size={14} className="text-indigo-600" />
                            <span>Import CSV</span>
                            <input 
                              type="file" 
                              accept=".csv" 
                              className="hidden" 
                              onChange={handleImportCsv}
                            />
                          </label>

                          <button
                            onClick={handleBatchSave}
                            disabled={batchSaving || filteredStudentsForSelect.length === 0}
                            className="px-5 py-2.5 bg-[#0D2B52] hover:bg-[#164077] text-white border-2 border-slate-900 rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            {batchSaving ? (
                              <Loader2 size={16} className="animate-spin text-[#D4A017]" />
                            ) : isSaved ? (
                              <CheckCircle2 size={16} className="text-emerald-400" />
                            ) : (
                              <Save size={16} className="text-[#D4A017]" />
                            )}
                            <span>{batchSaving ? 'Saving Grid...' : isSaved ? 'Grid Saved!' : `Save All Class Scores (${unsavedBatchCount})`}</span>
                          </button>
                        </div>
                      </div>

                      {/* Spreadsheet Data Grid */}
                      {filteredStudentsForSelect.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                          <Users size={32} className="mx-auto mb-2 text-slate-300" />
                          <p className="font-bold text-xs uppercase">No students found matching this class / search filter.</p>
                          <p className="text-[10px] text-slate-400 mt-1">Try changing the Class or Section filter above, or add students in the Student Management tab.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[520px] shadow-inner custom-scrollbar">
                            {(() => {
                              const currentTests = selectedBattery ? selectedBattery.tests : (selectedTest ? [selectedTest] : []);

                              return (
                                <table className="w-full text-left border-collapse bg-white">
                                  <thead>
                                    <tr className="bg-[#0D2B52] text-white text-[10px] font-black uppercase tracking-wider sticky top-0 z-20">
                                      <th className="p-3 border-r border-slate-700 w-12 text-center select-none">Roll</th>
                                      <th className="p-3 border-r border-slate-700 min-w-[150px] select-none">Student Name</th>
                                      <th className="p-3 border-r border-slate-700 w-20 text-center select-none">Class</th>
                                      {currentTests.map((t, tIdx) => (
                                        <th key={t.id} className="p-3 border-r border-slate-700 min-w-[130px] text-center select-none">
                                          <div className="truncate max-w-[140px] mx-auto" title={t.name}>{t.name}</div>
                                          <div className="text-[9px] font-normal text-[#D4A017]">({t.unit})</div>
                                        </th>
                                      ))}
                                      <th className="p-3 text-center w-14 select-none">Save</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {filteredStudentsForSelect.map((student, sIdx) => {
                                      return (
                                        <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors text-xs">
                                          <td className="p-2 font-black text-slate-900 border-r border-slate-100 text-center bg-slate-50/60">
                                            {student.rollNumber || (sIdx + 1)}
                                          </td>
                                          <td className="p-2 font-bold text-slate-800 border-r border-slate-100">
                                            <div className="truncate max-w-[160px]" title={student.name}>{student.name}</div>
                                            <div className="text-[9px] font-medium text-slate-400">{student.gender} &bull; {student.age} yrs</div>
                                          </td>
                                          <td className="p-2 font-semibold text-slate-600 border-r border-slate-100 text-center text-[10px]">
                                            Gr {student.grade}-{student.section}
                                          </td>

                                          {currentTests.map((test, tIdx) => {
                                            const cellKey = `${student.id}_${test.id}`;
                                            const currentVal = batchScores[cellKey] ?? (currentTests.length === 1 ? batchScores[student.id] : '') ?? '';
                                            const isSavedCell = batchSavedStatus[cellKey] ?? (currentTests.length === 1 ? batchSavedStatus[student.id] : false);

                                            return (
                                              <td key={test.id} className="p-1 border-r border-slate-100 text-center">
                                                <div className="relative">
                                                  <input
                                                    id={`grid-input-${sIdx}-${tIdx}`}
                                                    type="text"
                                                    placeholder={test.id === 'bmi' || test.name.toLowerCase().includes('bmi') ? 'wt/ht (e.g. 28/140)' : test.unit}
                                                    className={`w-full p-2 text-center font-black text-xs rounded-xl border-2 outline-none transition-all ${
                                                      isSavedCell 
                                                        ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 focus:ring-2 focus:ring-emerald-500' 
                                                        : currentVal 
                                                          ? 'bg-amber-50/90 border-amber-300 text-amber-900 focus:ring-2 focus:ring-amber-500' 
                                                          : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                                                    }`}
                                                    value={currentVal}
                                                    onChange={e => {
                                                      const val = e.target.value;
                                                      setBatchScores(prev => ({
                                                        ...prev,
                                                        [cellKey]: val,
                                                        [student.id]: val
                                                      }));
                                                      setBatchSavedStatus(prev => ({
                                                        ...prev,
                                                        [cellKey]: false,
                                                        [student.id]: false
                                                      }));
                                                    }}
                                                    onKeyDown={e => handleGridKeyDown(e, sIdx, tIdx, filteredStudentsForSelect.length, currentTests.length)}
                                                  />
                                                  {isSavedCell && (
                                                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
                                                      <Check size={12} />
                                                    </span>
                                                  )}
                                                </div>
                                              </td>
                                            );
                                          })}

                                          <td className="p-1 text-center">
                                            <button
                                              onClick={() => handleSingleRowSave(student)}
                                              className="p-2 bg-slate-100 hover:bg-[#0D2B52] hover:text-white text-slate-700 rounded-xl text-xs transition-colors cursor-pointer"
                                              title="Save Row Scores"
                                            >
                                              <Save size={14} />
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              );
                            })()}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-2 pt-1">
                            <span>Tip: Press Enter to move down rows, Tab to move across columns.</span>
                            <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                              <CheckCircle2 size={12} /> Green cells = Saved to DB
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Error display */}
                      {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-start space-x-2">
                          <AlertCircle size={16} className="flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* SINGLE STUDENT SEARCH & ENTRY MODE */
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                      {/* Search Grid Cards for Quick Selection */}
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                          Select Student from School List ({filteredStudentsForSelect.length} matching)
                        </label>

                        {/* Interactive Student Pill Picker */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 mb-4 custom-scrollbar">
                          {filteredStudentsForSelect.slice(0, 18).map(s => (
                            <button
                              key={s.id}
                              onClick={() => handleStudentChange(s.id)}
                              className={`p-2.5 rounded-xl text-left border-2 transition-all cursor-pointer flex items-center justify-between ${
                                selectedStudentId === s.id
                                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                              }`}
                            >
                              <div className="truncate">
                                <p className="font-bold text-xs truncate">{s.name}</p>
                                <p className={`text-[9.5px] ${selectedStudentId === s.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                                  Roll #{s.rollNumber || 'N/A'} &bull; Gr {s.grade}-{s.section}
                                </p>
                              </div>
                              {selectedStudentId === s.id && <CheckCircle2 size={14} className="shrink-0 ml-1 text-emerald-300" />}
                            </button>
                          ))}
                        </div>

                        {/* Fallback Select Dropdown */}
                        <select 
                          className={`w-full p-3 border-2 rounded-2xl font-bold text-xs outline-none transition-all ${
                            selectedStudentId 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-900 focus:ring-2 focus:ring-indigo-500' 
                              : 'bg-slate-50 border-slate-100 text-slate-600 focus:ring-2 focus:ring-indigo-500'
                          }`}
                          value={selectedStudentId}
                          onChange={e => handleStudentChange(e.target.value)}
                        >
                          <option value="">Manual Entry (Not Linked)</option>
                          {finalStudentsList.map(s => (
                            <option key={s.id} value={s.id}>{s.name} (Roll #{s.rollNumber || 'N/A'} - Grade {s.grade} {s.section})</option>
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
                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                            title="Generate printer-friendly CBSE PDF Report Card for Student"
                          >
                            <FileText size={14} />
                            <span>Generate CBSE PDF Report Card</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                        <div className="flex-1 min-w-[130px]">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Age</label>
                          <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                            value={age}
                            disabled={!!selectedStudentId}
                            onChange={e => setAge(e.target.value)}
                          >
                            {[...Array(60)].map((_, i) => <option key={i} value={i+5}>{i+5} Years</option>)}
                          </select>
                        </div>

                        <div className="flex-1 min-w-[130px]">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Gender</label>
                          <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                            value={gender}
                            disabled={!!selectedStudentId}
                            onChange={e => setGender(e.target.value)}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>

                        <div className="flex-[2] min-w-[220px]">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Score ({selectedTest.unit})</label>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder={selectedTest.unit}
                              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                              value={testValue}
                              onChange={e => {
                                setTestValue(e.target.value);
                                setResult(null);
                              }}
                            />
                            <button 
                              onClick={handleCalculate}
                              disabled={loading || !testValue}
                              className="bg-indigo-600 text-white px-4 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                              title="Analyze Performance"
                            >
                              {loading ? <Loader2 className="animate-spin" size={14} /> : <Calculator size={14} />}
                              <span>Analyze</span>
                            </button>
                            <button 
                              onClick={async () => {
                                if (!testValue) return;
                                if (!result) {
                                  setLoading(true);
                                  try {
                                    await handleSaveDirectly();
                                  } finally {
                                    setLoading(false);
                                  }
                                } else {
                                  handleSave();
                                }
                              }}
                              disabled={loading || !testValue}
                              className={`px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                                isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                              }`}
                            >
                              {isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
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
                  )}

                  {/* Result Card */}
                  {result && (
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 animate-slide-up">
                      <div className="flex flex-wrap justify-between items-center mb-8 pb-4 border-b border-slate-100 gap-4">
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Assessment Report</h3>
                        <div className="flex flex-wrap items-center gap-3">
                          <button 
                            onClick={() => generateStudentCbsePdfReportCard()}
                            className="flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
                            title="Download CBSE Compliant PDF Report Card"
                          >
                            <FileText size={16} />
                            <span>Download CBSE PDF Report</span>
                          </button>
                          <button 
                            onClick={handleSave}
                            disabled={isSaved}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer ${
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

                  {/* PERSISTENT FLOATING MOBILE STICKY SAVE BAR */}
                  <div className="fixed bottom-0 left-0 right-0 z-50 p-3.5 bg-[#0D2B52] border-t-4 border-[#D4A017] shadow-[0_-8px_25px_rgba(0,0,0,0.35)] md:hidden flex items-center justify-between gap-3">
                    <div className="text-white min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#D4A017] animate-pulse"></span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#D4A017] truncate">
                          {selectedTest.name}
                        </p>
                      </div>
                      <p className="text-xs font-extrabold text-white truncate">
                        {entryMode === 'batch' 
                          ? `${unsavedBatchCount} scores pending save` 
                          : testValue 
                            ? `Value: ${testValue} ${selectedTest.unit}` 
                            : 'Enter test value below'}
                      </p>
                    </div>

                    <button
                      onClick={entryMode === 'batch' ? handleBatchSave : async () => {
                        if (!testValue) return;
                        if (!result) {
                          setLoading(true);
                          try { await handleSaveDirectly(); } finally { setLoading(false); }
                        } else { handleSave(); }
                      }}
                      disabled={entryMode === 'batch' ? (batchSaving || unsavedBatchCount === 0) : (!testValue || loading)}
                      className="px-5 py-3 bg-[#D4A017] hover:bg-[#e0b028] text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg border-2 border-slate-900 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                      {batchSaving || loading ? (
                        <Loader2 size={16} className="animate-spin text-slate-900" />
                      ) : isSaved ? (
                        <CheckCircle2 size={16} className="text-emerald-900" />
                      ) : (
                        <Save size={16} className="text-slate-900" />
                      )}
                      <span>{isSaved ? 'Saved!' : 'SAVE FIT SCORES'}</span>
                    </button>
                  </div>
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
