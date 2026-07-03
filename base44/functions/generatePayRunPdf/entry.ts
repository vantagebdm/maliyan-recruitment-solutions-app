import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { timesheet_ids } = body;

    if (!timesheet_ids || !Array.isArray(timesheet_ids) || timesheet_ids.length === 0) {
      return Response.json({ error: 'timesheet_ids array is required' }, { status: 400 });
    }

    // Fetch all selected timesheets using service role
    const allTimesheets = [];
    for (const id of timesheet_ids) {
      const ts = await base44.asServiceRole.entities.Timesheet.get(id);
      if (ts) allTimesheets.push(ts);
    }

    if (allTimesheets.length === 0) {
      return Response.json({ error: 'No timesheets found' }, { status: 404 });
    }

    // Group by client
    const byClient = {};
    for (const ts of allTimesheets) {
      const client = ts.client_name || 'Unknown Client';
      if (!byClient[client]) byClient[client] = [];
      byClient[client].push(ts);
    }

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let y = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PAY RUN SUMMARY', margin, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Perth' })}`, margin, y);
    y += 4;
    doc.text(`Total Timesheets: ${allTimesheets.length}`, margin, y);
    y += 8;
    doc.setTextColor(0);

    let grandTotalHours = 0;
    let grandTotalGross = 0;

    for (const [clientName, tsList] of Object.entries(byClient)) {
      // Check page break
      if (y > pageHeight - 40) { doc.addPage(); y = 20; }

      // Client header
      doc.setFillColor(220, 230, 240);
      doc.rect(margin, y - 4, pageWidth - margin * 2, 8, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(clientName, margin + 2, y + 1);
      y += 8;

      // Table header
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Employee', margin, y);
      doc.text('Week Ending', margin + 70, y);
      doc.text('Ord Hrs', margin + 110, y);
      doc.text('OT Hrs', margin + 130, y);
      doc.text('Rate', margin + 145, y);
      doc.text('Gross', margin + 170, y);
      y += 4;
      doc.setDrawColor(200);
      doc.line(margin, y - 1, pageWidth - margin, y - 1);

      doc.setFont('helvetica', 'normal');
      let clientHours = 0;
      let clientGross = 0;

      for (const ts of tsList) {
        if (y > pageHeight - 20) { doc.addPage(); y = 20; }

        const ordHrs = ts.total_ordinary_hours || 0;
        const otHrs = ts.total_overtime_hours || 0;
        const rate = ts.pay_rate || 0;
        const gross = ordHrs * rate + otHrs * rate * 1.5;

        doc.text(String(ts.candidate_name || '—').substring(0, 35), margin, y);
        doc.text(ts.week_ending ? new Date(ts.week_ending).toLocaleDateString('en-AU') : '—', margin + 70, y);
        doc.text(ordHrs.toFixed(1), margin + 110, y);
        doc.text(otHrs.toFixed(1), margin + 130, y);
        doc.text('$' + rate.toFixed(2), margin + 145, y);
        doc.text('$' + gross.toFixed(2), margin + 170, y);

        clientHours += ordHrs + otHrs;
        clientGross += gross;
        y += 5;
      }

      // Client subtotal
      y += 2;
      doc.setFont('helvetica', 'bold');
      doc.line(margin, y - 1, pageWidth - margin, y - 1);
      doc.text(`Subtotal: ${clientHours.toFixed(1)} hrs`, margin, y + 3);
      doc.text(`$${clientGross.toFixed(2)}`, margin + 170, y + 3);
      y += 8;

      grandTotalHours += clientHours;
      grandTotalGross += clientGross;
    }

    // Grand total
    if (y > pageHeight - 20) { doc.addPage(); y = 20; }
    y += 4;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 4, pageWidth - margin * 2, 10, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`GRAND TOTAL: ${grandTotalHours.toFixed(1)} hrs`, margin + 2, y + 2);
    doc.text(`$${grandTotalGross.toFixed(2)}`, margin + 170, y + 2);

    const pdfBase64 = doc.output('datauristring').split(',')[1];
    return Response.json({
      filename: `payrun_${new Date().toISOString().split('T')[0]}.pdf`,
      base64: pdfBase64
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});