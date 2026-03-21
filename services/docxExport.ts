import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { saveAs } from 'file-saver';
import { QuestionPaper } from '../types.ts';

const textRunsFromMultiline = (text: string, bold = false, size = 22) => {
  const lines = text.split('\n');
  return lines.flatMap((line, index) => {
    const runs = [new TextRun({ text: line, bold, size, font: 'Calibri' })];
    if (index < lines.length - 1) {
      runs.push(new TextRun({ text: '', break: 1 }));
    }
    return runs;
  });
};

const createQuestionTable = (numberLabel: string, content: Paragraph[], marks: number) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 88, type: WidthType.PERCENTAGE },
            children: content,
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
          }),
          new TableCell({
            width: { size: 12, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: `[${marks}]`, bold: true, size: 22 })],
              }),
            ],
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
          }),
        ],
      }),
    ],
  });

const questionParagraphs = (question: QuestionPaper['sections'][number]['questions'][number], fallbackIndex: number) => {
  const numberLabel = `Q${question.questionNumber ?? fallbackIndex + 1}.`;
  const baseContent: Paragraph[] = [];

  if (question.caseStudyText) {
    baseContent.push(
      new Paragraph({
        spacing: { after: 120 },
        shading: { fill: 'F8FAFC' },
        children: [
          new TextRun({ text: 'Case Study: ', bold: true, size: 22 }),
          ...textRunsFromMultiline(question.caseStudyText, false, 22),
        ],
      }),
    );
  }

  if (question.figureLabel) {
    baseContent.push(
      new Paragraph({
        spacing: { after: 120 },
        shading: { fill: 'F8FAFC' },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `[Figure: ${question.figureLabel}]`, italics: true, size: 20, color: '666666' })],
      }),
    );
  }

  baseContent.push(
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: `${numberLabel} `, bold: true, size: 22 }),
        ...textRunsFromMultiline(question.question, false, 22),
      ],
    }),
  );

  if (question.options?.length) {
    question.options.forEach((option, optionIndex) => {
      baseContent.push(
        new Paragraph({
          indent: { left: 540 },
          spacing: { after: 80 },
          children: [
            new TextRun({ text: `${String.fromCharCode(65 + optionIndex)}) `, bold: true, size: 20 }),
            ...textRunsFromMultiline(option, false, 20),
          ],
        }),
      );
    });
  }

  if (question.subQuestions?.length) {
    question.subQuestions.forEach((subQuestion, subIndex) => {
      baseContent.push(
        new Paragraph({
          indent: { left: 540 },
          spacing: { after: 80 },
          children: [new TextRun({ text: `${subIndex + 1}. ${subQuestion}`, size: 20 })],
        }),
      );
    });
  }

  if (question.internalChoice) {
    baseContent.push(
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text: 'OR', bold: true, size: 20, color: 'B45309' })],
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [...textRunsFromMultiline(question.internalChoice, false, 20)],
      }),
    );
  }

  if (question.visuallyImpairedAlternative) {
    baseContent.push(
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text: 'Question for Visually Impaired', bold: true, size: 20, color: '475569' })],
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [...textRunsFromMultiline(question.visuallyImpairedAlternative, false, 20)],
      }),
    );
  }

  return createQuestionTable(numberLabel, baseContent, question.marks);
};

export const exportToWord = async (paper: QuestionPaper) => {
  const children: Array<Paragraph | Table> = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: paper.title.toUpperCase(), bold: true, size: 30 })],
    }),
  ];

  if (paper.displayGrade) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: paper.displayGrade, bold: true, size: 24 })],
      }),
    );
  }

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `TIME ALLOWED: ${paper.timeAllowed}`, bold: true, size: 20 })] })],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            }),
            new TableCell({
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `MAX MARKS: ${paper.maxMarks}`, bold: true, size: 20 })] })],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { after: 220 } }),
  );

  if (paper.generalInstructions?.length) {
    children.push(
      new Paragraph({
        spacing: { after: 140 },
        children: [new TextRun({ text: 'GENERAL INSTRUCTIONS:', bold: true, size: 22 })],
      }),
    );

    paper.generalInstructions.forEach((instruction, index) => {
      children.push(
        new Paragraph({
          indent: { left: 360, hanging: 240 },
          spacing: { after: 100 },
          children: [new TextRun({ text: `${index + 1}. ${instruction}`, size: 20 })],
        }),
      );
    });

    children.push(new Paragraph({ spacing: { after: 220 } }));
  }

  paper.sections.forEach((section) => {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 260, after: 100 },
        children: [new TextRun({ text: section.heading || section.sectionId, bold: true, size: 24, underline: {} })],
      }),
    );

    if (section.questionRange) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: section.questionRange, bold: true, size: 18, color: '64748B' })],
        }),
      );
    }

    children.push(
      new Paragraph({
        spacing: { after: 180 },
        children: [new TextRun({ text: section.instructions, italics: true, size: 18, color: '64748B' })],
      }),
    );

    section.questions.forEach((question, index) => {
      children.push(questionParagraphs(question, index));
      children.push(new Paragraph({ spacing: { after: 120 } }));
    });
  });

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${paper.title.replace(/\s+/g, '_')}.docx`);
};
