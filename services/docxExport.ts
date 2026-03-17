
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  HeadingLevel,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  LevelFormat
} from 'docx';
import { saveAs } from 'file-saver';
import { QuestionPaper } from '../types.ts';

/**
 * Exports a QuestionPaper object to a Word document (.docx)
 */
export const exportToWord = async (paper: QuestionPaper) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title Header
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: paper.title.toUpperCase(),
              bold: true,
              size: 32,
              font: "Calibri",
            }),
          ],
        }),

        // Info Line (Class, Time, Marks)
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: `CLASS: ${paper.grade}`, bold: true, size: 24 })] })],
                  borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                }),
                new TableCell({
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `TIME: ${paper.timeAllowed}`, bold: true, size: 24 })] })],
                  borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                }),
                new TableCell({
                  children: [new Paragraph({ alignment: AlignmentType.END, children: [new TextRun({ text: `MAX MARKS: ${paper.maxMarks}`, bold: true, size: 24 })] })],
                  borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                }),
              ],
            }),
          ],
        }),

        new Paragraph({
          children: [new TextRun({ text: "________________________________________________________________________________", bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        // General Instructions
        ...(paper.generalInstructions && paper.generalInstructions.length > 0 ? [
          new Paragraph({
            children: [new TextRun({ text: "GENERAL INSTRUCTIONS:", bold: true, size: 20 })],
            spacing: { after: 200 },
          }),
          ...paper.generalInstructions.map((ins, idx) => 
            new Paragraph({
              text: `${idx + 1}. ${ins}`,
              indent: { left: 720, hanging: 360 },
              spacing: { after: 120 },
              style: "ListBullet",
              children: [
                new TextRun({
                  text: `${idx + 1}. ${ins}`,
                  size: 20,
                  font: "Calibri",
                })
              ]
            })
          ),
          new Paragraph({ spacing: { after: 400 } }),
        ] : []),

        // Sections
        ...paper.sections.flatMap((section, sidx) => [
          // Section Header
          new Paragraph({
             alignment: AlignmentType.CENTER,
             spacing: { before: 400, after: 200 },
             children: [
               new TextRun({
                 text: section.sectionId.toUpperCase(),
                 bold: true,
                 size: 24,
                 underline: {},
               }),
             ],
          }),
          // Section Instructions
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: section.instructions,
                italics: true,
                size: 18,
                color: "666666",
              }),
            ],
          }),

          // Questions
          ...section.questions.flatMap((q, qidx) => {
            const questionParagraphs = [];

            // Case Study text if present
            if (q.caseStudyText) {
              questionParagraphs.push(
                new Paragraph({
                  shading: { fill: "F3F4F6" },
                  indent: { left: 360, right: 360 },
                  spacing: { before: 200, after: 200 },
                  children: [
                    new TextRun({
                      text: "CASE STUDY: ",
                      bold: true,
                      size: 20,
                    }),
                    new TextRun({
                      text: q.caseStudyText,
                      size: 20,
                    }),
                  ],
                })
              );
            }

            // Question text + marks
            questionParagraphs.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 90, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({
                            spacing: { before: 120, after: 120 },
                            children: [
                              new TextRun({ text: `${qidx + 1}. `, bold: true, size: 22 }),
                              new TextRun({ text: q.question, size: 22 }),
                            ],
                          })
                        ],
                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                      }),
                      new TableCell({
                        width: { size: 10, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.TOP,
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.END,
                            spacing: { before: 120, after: 120 },
                            children: [
                              new TextRun({ text: `(${q.marks})`, bold: true, size: 20 })
                            ],
                          })
                        ],
                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                      })
                    ]
                  })
                ]
              })
            );

            // Options if MCQ
            if (q.options && q.options.length > 0) {
              const optionsRows = [];
              // Create 2 columns for options
              for (let i = 0; i < q.options.length; i += 2) {
                optionsRows.push(
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            indent: { left: 720 },
                            children: [
                              new TextRun({ text: `${String.fromCharCode(65 + i)}) `, bold: true, size: 20 }),
                              new TextRun({ text: q.options[i], size: 20 })
                            ]
                          })
                        ],
                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                      }),
                      new TableCell({
                        children: [
                          i + 1 < q.options.length ? new Paragraph({
                            indent: { left: 720 },
                            children: [
                              new TextRun({ text: `${String.fromCharCode(65 + i + 1)}) `, bold: true, size: 20 }),
                              new TextRun({ text: q.options[i + 1], size: 20 })
                            ]
                          }) : new Paragraph({})
                        ],
                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                      })
                    ]
                  })
                );
              }
              questionParagraphs.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: optionsRows }));
            }

            return questionParagraphs;
          })
        ])
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${paper.title.replace(/\s+/g, '_')}.docx`);
};
