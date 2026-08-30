const PDFDocument = require('pdfkit');

const generateFinancialReportPDF = (data, stream) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    bufferPages: true
  });

  doc.pipe(stream);

  const primaryColor = '#011123';
  const textColor = '#1F2937';
  const secondaryText = '#6B7280';
  const borderColor = '#D1D5DB';
  const lightGray = '#F3F4F6';
  const white = '#FFFFFF';
  const green = '#15803D';
  const red = '#DC2626';

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const contentWidth = pageWidth - 100;

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const drawTableHeader = (y) => {
    const columns = [
      { title: 'Date', x: 50, width: 70 },
      { title: 'Type', x: 120, width: 65 },
      { title: 'Category', x: 185, width: 105 },
      { title: 'Amount', x: 290, width: 85 },
      { title: 'Description', x: 375, width: 175 }
    ];

    doc
      .roundedRect(50, y - 5, contentWidth, 28, 4)
      .fill(primaryColor);

    columns.forEach((col) => {
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(white)
        .text(
          col.title,
          col.x + 6,
          y + 3,
          {
            width: col.width - 12,
            align: col.title === 'Amount' ? 'right' : 'left'
          }
        );
    });

    return y + 32;
  };

  // =========================
  // HEADER
  // =========================

  doc
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .fontSize(25)
    .text('Finnovault', 50, 50);

  doc
    .fillColor(textColor)
    .font('Helvetica')
    .fontSize(11)
    .text('Financial Report', 50, 80);

  doc
    .fillColor(secondaryText)
    .fontSize(9)
    .text(
      `Generated on ${formatDate(new Date())}`,
      50,
      98
    );

  // User box
  doc
    .roundedRect(370, 50, 175, 60, 6)
    .fill(lightGray);

  doc
    .fillColor(secondaryText)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text('REPORT FOR', 385, 62);

  doc
    .fillColor(textColor)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(
      data.user?.name || 'User',
      385,
      76,
      { width: 145 }
    );

  doc
    .fillColor(secondaryText)
    .font('Helvetica')
    .fontSize(8)
    .text(
      data.user?.email || '-',
      385,
      91,
      { width: 145 }
    );

  // =========================
  // FINANCIAL SUMMARY
  // =========================

  doc
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .fontSize(15)
    .text('Financial Summary', 50, 145);

  doc
    .moveTo(50, 168)
    .lineTo(545, 168)
    .lineWidth(1)
    .strokeColor(borderColor)
    .stroke();

  const cardY = 185;
  const cardGap = 10;
  const cardWidth = (contentWidth - cardGap * 3) / 4;
  const cardHeight = 72;

  const cards = [
    {
      label: 'Total Income',
      value: formatCurrency(data.summary?.totalIncome),
      color: green
    },
    {
      label: 'Total Expense',
      value: formatCurrency(data.summary?.totalExpense),
      color: red
    },
    {
      label: 'Net Cash Flow',
      value: formatCurrency(data.summary?.netCashFlow),
      color: primaryColor
    },
    {
      label: 'Net Worth',
      value: formatCurrency(data.summary?.netWorth),
      color: primaryColor
    }
  ];

  cards.forEach((card, index) => {
    const x = 50 + index * (cardWidth + cardGap);

    doc
      .roundedRect(x, cardY, cardWidth, cardHeight, 6)
      .fill(lightGray);

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(secondaryText)
      .text(
        card.label,
        x + 10,
        cardY + 12,
        {
          width: cardWidth - 20
        }
      );

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(card.color)
      .text(
        card.value,
        x + 10,
        cardY + 37,
        {
          width: cardWidth - 20
        }
      );
  });

  // =========================
  // TRANSACTIONS
  // =========================

  doc
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .fontSize(15)
    .text('Recent Transactions', 50, 290);

  doc
    .moveTo(50, 313)
    .lineTo(545, 313)
    .lineWidth(1)
    .strokeColor(borderColor)
    .stroke();

  let y = 330;

  const transactions = data.transactions || [];

  if (transactions.length === 0) {
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(secondaryText)
      .text(
        'No transactions available.',
        50,
        y + 20,
        {
          width: contentWidth,
          align: 'center'
        }
      );
  } else {
    y = drawTableHeader(y);

    transactions.forEach((tx, index) => {
      const description = tx.description || '-';

      const descriptionHeight = doc.heightOfString(description, {
        width: 163,
        font: 'Helvetica',
        fontSize: 8.5
      });

      const rowHeight = Math.max(30, descriptionHeight + 12);

      // New page
      if (y + rowHeight > pageHeight - 55) {
        doc.addPage();

        y = 50;

        doc
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(15)
          .text('Recent Transactions', 50, y);

        y += 28;

        y = drawTableHeader(y);
      }

      // Alternate row background
      if (index % 2 === 0) {
        doc
          .rect(50, y - 4, contentWidth, rowHeight)
          .fill('#FAFAFA');
      }

      // Row border
      doc
        .moveTo(50, y + rowHeight - 4)
        .lineTo(545, y + rowHeight - 4)
        .lineWidth(0.5)
        .strokeColor(borderColor)
        .stroke();

      // Date
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(textColor)
        .text(
          formatDate(tx.date),
          56,
          y + 5,
          {
            width: 58
          }
        );

      // Type
      const type = (tx.type || '-').toUpperCase();

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(
          type === 'INCOME'
            ? green
            : type === 'EXPENSE'
              ? red
              : textColor
        )
        .text(
          type,
          126,
          y + 5,
          {
            width: 53
          }
        );

      // Category
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(textColor)
        .text(
          tx.category || '-',
          191,
          y + 5,
          {
            width: 93
          }
        );

      // Amount
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(textColor)
        .text(
          formatCurrency(tx.amount),
          296,
          y + 5,
          {
            width: 73,
            align: 'right'
          }
        );

      // Description
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(textColor)
        .text(
          description,
          381,
          y + 5,
          {
            width: 163
          }
        );

      y += rowHeight;
    });
  }

  // =========================
  // FOOTERS
  // =========================

  const range = doc.bufferedPageRange();

  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(secondaryText)
      .text(
        'Finnovault • Confidential Financial Report',
        50,
        pageHeight - 35,
        {
          width: contentWidth,
          align: 'left'
        }
      );

    doc
      .text(
        `Page ${i + 1} of ${range.count}`,
        50,
        pageHeight - 35,
        {
          width: contentWidth,
          align: 'right'
        }
      );
  }

  doc.end();
};

module.exports = {
  generateFinancialReportPDF
};