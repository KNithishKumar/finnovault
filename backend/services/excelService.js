const ExcelJS = require('exceljs');

const generateFinancialReportExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet('Financial Report', {
    views: [{ showGridLines: false }]
  });

  // =========================
  // COLORS
  // =========================

  const primaryColor = '011123';
  const lightGray = 'F3F4F6';
  const borderColor = 'D1D5DB';
  const textColor = '1F2937';
  const secondaryText = '6B7280';
  const green = '15803D';
  const red = 'DC2626';
  const white = 'FFFFFF';

  // =========================
  // COLUMN WIDTHS
  // =========================

  worksheet.columns = [
    { key: 'date', width: 16 },
    { key: 'type', width: 14 },
    { key: 'category', width: 22 },
    { key: 'amount', width: 18 },
    { key: 'paymentMethod', width: 20 },
    { key: 'description', width: 40 }
  ];

  // =========================
  // TITLE
  // =========================

  worksheet.mergeCells('A1:F1');

  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'FINNOVAULT';
  titleCell.font = {
    name: 'Calibri',
    size: 22,
    bold: true,
    color: { argb: white }
  };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: primaryColor }
  };
  titleCell.alignment = {
    horizontal: 'left',
    vertical: 'middle'
  };

  worksheet.getRow(1).height = 38;

  // =========================
  // REPORT INFORMATION
  // =========================

  worksheet.mergeCells('A2:F2');

  worksheet.getCell('A2').value = 'Financial Report';
  worksheet.getCell('A2').font = {
    size: 14,
    bold: true,
    color: { argb: textColor }
  };

  worksheet.mergeCells('A3:C3');
  worksheet.getCell('A3').value =
    `User: ${data.user?.name || 'User'}`;

  worksheet.mergeCells('D3:F3');
  worksheet.getCell('D3').value =
    `Email: ${data.user?.email || '-'}`;

  worksheet.getCell('A3').font = {
    size: 10,
    color: { argb: secondaryText }
  };

  worksheet.getCell('D3').font = {
    size: 10,
    color: { argb: secondaryText }
  };

  worksheet.mergeCells('A4:C4');
  worksheet.getCell('A4').value =
    `Generated: ${new Date().toLocaleDateString('en-IN')}`;

  worksheet.getCell('A4').font = {
    size: 10,
    color: { argb: secondaryText }
  };

  // =========================
  // SUMMARY TITLE
  // =========================

  worksheet.mergeCells('A6:F6');

  worksheet.getCell('A6').value = 'FINANCIAL SUMMARY';

  worksheet.getCell('A6').font = {
    size: 13,
    bold: true,
    color: { argb: primaryColor }
  };

  worksheet.getCell('A6').alignment = {
    horizontal: 'left'
  };

  // =========================
  // SUMMARY CARDS
  // =========================

  const summaryData = [
    {
      label: 'Total Income',
      value: data.summary?.totalIncome || 0,
      color: green
    },
    {
      label: 'Total Expense',
      value: data.summary?.totalExpense || 0,
      color: red
    },
    {
      label: 'Net Cash Flow',
      value: data.summary?.netCashFlow || 0,
      color: primaryColor
    },
    {
      label: 'Net Worth',
      value: data.summary?.netWorth || 0,
      color: primaryColor
    }
  ];

  const summaryColumns = [
    ['A7:B8'],
    ['C7:D8'],
    ['E7:F8']
  ];

  // First three cards
  const cards = [
    {
      range: 'A7:B8',
      label: 'Total Income',
      value: data.summary?.totalIncome || 0,
      color: green
    },
    {
      range: 'C7:D8',
      label: 'Total Expense',
      value: data.summary?.totalExpense || 0,
      color: red
    },
    {
      range: 'E7:F8',
      label: 'Net Cash Flow',
      value: data.summary?.netCashFlow || 0,
      color: primaryColor
    }
  ];

  cards.forEach((card) => {
    worksheet.mergeCells(card.range);

    const cell = worksheet.getCell(card.range.split(':')[0]);

    cell.value = `${card.label}\n₹${Number(card.value).toLocaleString(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )}`;

    cell.font = {
      size: 11,
      bold: true,
      color: { argb: card.color }
    };

    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: lightGray }
    };

    cell.border = {
      top: {
        style: 'thin',
        color: { argb: borderColor }
      },
      bottom: {
        style: 'thin',
        color: { argb: borderColor }
      },
      left: {
        style: 'thin',
        color: { argb: borderColor }
      },
      right: {
        style: 'thin',
        color: { argb: borderColor }
      }
    };
  });

  // Net Worth
  worksheet.mergeCells('A9:F9');

  worksheet.getCell('A9').value =
    `Net Worth: ₹${Number(
      data.summary?.netWorth || 0
    ).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  worksheet.getCell('A9').font = {
    size: 12,
    bold: true,
    color: { argb: primaryColor }
  };

  worksheet.getCell('A9').alignment = {
    horizontal: 'center',
    vertical: 'middle'
  };

  worksheet.getCell('A9').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: lightGray }
  };

  worksheet.getCell('A9').border = {
    top: {
      style: 'thin',
      color: { argb: borderColor }
    },
    bottom: {
      style: 'thin',
      color: { argb: borderColor }
    },
    left: {
      style: 'thin',
      color: { argb: borderColor }
    },
    right: {
      style: 'thin',
      color: { argb: borderColor }
    }
  };

  worksheet.getRow(7).height = 30;
  worksheet.getRow(8).height = 30;
  worksheet.getRow(9).height = 28;

  // =========================
  // TRANSACTIONS TITLE
  // =========================

  worksheet.mergeCells('A11:F11');

  worksheet.getCell('A11').value = 'TRANSACTIONS';

  worksheet.getCell('A11').font = {
    size: 13,
    bold: true,
    color: { argb: primaryColor }
  };

  // =========================
  // TABLE HEADER
  // =========================

  const headerRow = worksheet.getRow(12);

  headerRow.values = [
    'Date',
    'Type',
    'Category',
    'Amount',
    'Payment Method',
    'Description'
  ];

  headerRow.height = 25;

  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: white }
    };

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: primaryColor }
    };

    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    cell.border = {
      top: {
        style: 'thin',
        color: { argb: primaryColor }
      },
      bottom: {
        style: 'thin',
        color: { argb: primaryColor }
      },
      left: {
        style: 'thin',
        color: { argb: primaryColor }
      },
      right: {
        style: 'thin',
        color: { argb: primaryColor }
      }
    };
  });

  // =========================
  // TRANSACTION ROWS
  // =========================

  const transactions = data.transactions || [];

  transactions.forEach((tx, index) => {
    const row = worksheet.addRow({
      date: new Date(tx.date),
      type: (tx.type || '-').toUpperCase(),
      category: tx.category || '-',
      amount: Number(tx.amount || 0),
      paymentMethod: tx.paymentMethod || '-',
      description: tx.description || '-'
    });

    row.height = 25;

    // Date
    row.getCell('A').numFmt = 'dd-mmm-yyyy';

    // Amount
    row.getCell('D').numFmt = '₹#,##0.00';

    // Alignment
    row.getCell('A').alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    row.getCell('B').alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    row.getCell('C').alignment = {
      horizontal: 'left',
      vertical: 'middle'
    };

    row.getCell('D').alignment = {
      horizontal: 'right',
      vertical: 'middle'
    };

    row.getCell('E').alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    row.getCell('F').alignment = {
      horizontal: 'left',
      vertical: 'middle',
      wrapText: true
    };

    // Type color
    const typeCell = row.getCell('B');

    if ((tx.type || '').toUpperCase() === 'INCOME') {
      typeCell.font = {
        bold: true,
        color: { argb: green }
      };
    } else if ((tx.type || '').toUpperCase() === 'EXPENSE') {
      typeCell.font = {
        bold: true,
        color: { argb: red }
      };
    }

    // Alternate rows
    if (index % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FAFAFA' }
        };
      });
    }

    // Borders
    row.eachCell((cell) => {
      cell.border = {
        top: {
          style: 'thin',
          color: { argb: borderColor }
        },
        bottom: {
          style: 'thin',
          color: { argb: borderColor }
        },
        left: {
          style: 'thin',
          color: { argb: borderColor }
        },
        right: {
          style: 'thin',
          color: { argb: borderColor }
        }
      };
    });
  });

  // =========================
  // EMPTY TRANSACTIONS
  // =========================

  if (transactions.length === 0) {
    const row = worksheet.addRow([
      'No transactions available'
    ]);

    worksheet.mergeCells(
      `A${row.number}:F${row.number}`
    );

    row.getCell(1).alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    row.getCell(1).font = {
      italic: true,
      color: { argb: secondaryText }
    };

    row.height = 30;
  }

  // =========================
  // FILTER + FREEZE
  // =========================

  worksheet.autoFilter = {
    from: 'A12',
    to: 'F12'
  };

  worksheet.views = [
    {
      state: 'frozen',
      ySplit: 12,
      showGridLines: false
    }
  ];

  // =========================
  // PRINT SETTINGS
  // =========================

  worksheet.pageSetup = {
    orientation: 'landscape',
    paperSize: worksheet.PAPERSIZE_A4,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0
  };

  worksheet.pageSetup.margins = {
    left: 0.3,
    right: 0.3,
    top: 0.5,
    bottom: 0.5,
    header: 0.2,
    footer: 0.2
  };

  worksheet.printOptions = {
    horizontalCentered: true,
    verticalCentered: false
  };

  // =========================
  // FOOTER
  // =========================

  worksheet.headerFooter.oddFooter = {
    left: 'Finnovault',
    right: 'Page &P of &N'
  };

  // =========================
  // RETURN BUFFER
  // =========================

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
};


// =====================================================
// CSV GENERATOR
// =====================================================

const generateFinancialReportCSV = (data) => {

  const escapeCSV = (value) => {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);

    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  let csvContent =
    'Date,Type,Category,Amount,Payment Method,Description\n';

  // Transactions
  (data.transactions || []).forEach((tx) => {

    csvContent += [
      escapeCSV(formatDate(tx.date)),
      escapeCSV((tx.type || '-').toUpperCase()),
      escapeCSV(tx.category || '-'),
      Number(tx.amount || 0).toFixed(2),
      escapeCSV(tx.paymentMethod || '-'),
      escapeCSV(tx.description || '-')
    ].join(',');

    csvContent += '\n';
  });

  // Empty line
  csvContent += '\n';

  // Summary
  csvContent += [
    escapeCSV('Financial Summary'),
    '',
    '',
    '',
    '',
    ''
  ].join(',');

  csvContent += '\n';

  csvContent += [
    escapeCSV('Total Income'),
    '',
    '',
    Number(data.summary?.totalIncome || 0).toFixed(2),
    '',
    ''
  ].join(',');

  csvContent += '\n';

  csvContent += [
    escapeCSV('Total Expense'),
    '',
    '',
    Number(data.summary?.totalExpense || 0).toFixed(2),
    '',
    ''
  ].join(',');

  csvContent += '\n';

  csvContent += [
    escapeCSV('Net Cash Flow'),
    '',
    '',
    Number(data.summary?.netCashFlow || 0).toFixed(2),
    '',
    ''
  ].join(',');

  csvContent += '\n';

  csvContent += [
    escapeCSV('Net Worth'),
    '',
    '',
    Number(data.summary?.netWorth || 0).toFixed(2),
    '',
    ''
  ].join(',');

  return Buffer.from('\uFEFF' + csvContent, 'utf-8');
};


module.exports = {
  generateFinancialReportExcel,
  generateFinancialReportCSV
};