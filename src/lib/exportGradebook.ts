import * as XLSX from 'xlsx';

interface Assignment {
  id: string;
  title: string;
  maxScore: number;
}

interface StudentGrade {
  studentId: string;
  name: string;
  scores: Record<string, number | null>;
  average: number;
}

interface ExportOptions {
  className: string;
  classCode: string;
  teacherName?: string;
  exportDate?: Date;
  assignments: Assignment[];
  gradebook: StudentGrade[];
}

export function exportGradebookToExcel(options: ExportOptions) {
  const { className, classCode, teacherName, assignments, gradebook } = options;
  const exportDate = options.exportDate || new Date();

  // Create workbook
  const wb = XLSX.utils.book_new();

  // =====================
  // Sheet 1: Gradebook
  // =====================
  
  // Header rows with class info
  const headerRows = [
    ['BẢNG ĐIỂM LỚP HỌC'],
    [],
    ['Lớp:', className],
    ['Mã lớp:', classCode],
    ['Giảng viên:', teacherName || 'N/A'],
    ['Ngày xuất:', exportDate.toLocaleDateString('vi-VN')],
    [],
  ];

  // Column headers
  const columnHeaders = [
    'STT',
    'Họ và tên',
    'MSSV',
    ...assignments.map(a => a.title),
    'Điểm TB',
    'Xếp loại',
  ];

  // Helper function to get grade classification
  const getClassification = (avg: number): string => {
    if (avg >= 9) return 'Xuất sắc';
    if (avg >= 8) return 'Giỏi';
    if (avg >= 7) return 'Khá';
    if (avg >= 5) return 'Trung bình';
    return 'Yếu';
  };

  // Data rows
  const dataRows = gradebook.map((student, index) => [
    index + 1,
    student.name,
    student.studentId,
    ...assignments.map(a => student.scores[a.id] ?? ''),
    student.average,
    getClassification(student.average),
  ]);

  // Summary row
  const avgScores = assignments.map(a => {
    const scores = gradebook.map(s => s.scores[a.id]).filter(s => s !== null) as number[];
    return scores.length > 0 ? (scores.reduce((sum, s) => sum + s, 0) / scores.length) : '';
  });
  const classAverage = gradebook.reduce((sum, s) => sum + s.average, 0) / gradebook.length;

  const summaryRows = [
    [],
    [
      '',
      'ĐIỂM TRUNG BÌNH LỚP',
      '',
      ...avgScores.map(s => typeof s === 'number' ? s.toFixed(2) : ''),
      classAverage.toFixed(2),
      '',
    ],
  ];

  // Combine all rows
  const allRows = [
    ...headerRows,
    columnHeaders,
    ...dataRows,
    ...summaryRows,
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Set column widths
  const colWidths = [
    { wch: 5 },   // STT
    { wch: 25 },  // Họ tên
    { wch: 12 },  // MSSV
    ...assignments.map(() => ({ wch: 15 })), // Assignment columns
    { wch: 10 },  // Điểm TB
    { wch: 12 },  // Xếp loại
  ];
  ws['!cols'] = colWidths;

  // Merge cells for title
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: columnHeaders.length - 1 } }, // Title row
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Bảng điểm');

  // =====================
  // Sheet 2: Statistics
  // =====================
  
  const statsRows = [
    ['THỐNG KÊ ĐIỂM SỐ'],
    [],
    ['Tổng số học sinh:', gradebook.length],
    ['Điểm trung bình lớp:', classAverage.toFixed(2)],
    ['Điểm cao nhất:', Math.max(...gradebook.map(s => s.average)).toFixed(2)],
    ['Điểm thấp nhất:', Math.min(...gradebook.map(s => s.average)).toFixed(2)],
    [],
    ['PHÂN LOẠI HỌC LỰC'],
    ['Xếp loại', 'Số lượng', 'Tỷ lệ'],
    ['Xuất sắc (≥9)', gradebook.filter(s => s.average >= 9).length, `${((gradebook.filter(s => s.average >= 9).length / gradebook.length) * 100).toFixed(1)}%`],
    ['Giỏi (8-9)', gradebook.filter(s => s.average >= 8 && s.average < 9).length, `${((gradebook.filter(s => s.average >= 8 && s.average < 9).length / gradebook.length) * 100).toFixed(1)}%`],
    ['Khá (7-8)', gradebook.filter(s => s.average >= 7 && s.average < 8).length, `${((gradebook.filter(s => s.average >= 7 && s.average < 8).length / gradebook.length) * 100).toFixed(1)}%`],
    ['Trung bình (5-7)', gradebook.filter(s => s.average >= 5 && s.average < 7).length, `${((gradebook.filter(s => s.average >= 5 && s.average < 7).length / gradebook.length) * 100).toFixed(1)}%`],
    ['Yếu (<5)', gradebook.filter(s => s.average < 5).length, `${((gradebook.filter(s => s.average < 5).length / gradebook.length) * 100).toFixed(1)}%`],
    [],
    ['THỐNG KÊ THEO BÀI TẬP'],
    ['Bài tập', 'Điểm TB', 'Cao nhất', 'Thấp nhất', 'Số bài đã chấm'],
  ];

  // Assignment stats
  assignments.forEach(a => {
    const scores = gradebook.map(s => s.scores[a.id]).filter(s => s !== null) as number[];
    if (scores.length > 0) {
      statsRows.push([
        a.title,
        (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(2),
        Math.max(...scores),
        Math.min(...scores),
        scores.length,
      ]);
    } else {
      statsRows.push([a.title, 'Chưa có điểm', '', '', 0]);
    }
  });

  const wsStats = XLSX.utils.aoa_to_sheet(statsRows);
  wsStats['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
  ];
  wsStats['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
  ];

  XLSX.utils.book_append_sheet(wb, wsStats, 'Thống kê');

  // Generate filename
  const dateStr = exportDate.toISOString().split('T')[0];
  const filename = `BangDiem_${classCode}_${dateStr}.xlsx`;

  // Export file
  XLSX.writeFile(wb, filename);

  return filename;
}
