import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.candidate_id) {
      return Response.json({ error: 'candidate_id is required' }, { status: 400 });
    }
    if (!body.week_ending) {
      return Response.json({ error: 'week_ending is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Build payload with only provided values
    const payload = {
      candidate_id: body.candidate_id,
      week_ending: body.week_ending,
      status: body.status || 'submitted',
      total_ordinary_hours: body.total_ordinary_hours || 0,
      total_overtime_hours: body.total_overtime_hours || 0,
      total_allowances: body.total_allowances || 0,
      entries: body.entries || [],
      source: 'sts_hub',
    };
    if (body.candidate_name) payload.candidate_name = body.candidate_name;
    if (body.placement_id) payload.placement_id = body.placement_id;
    if (body.job_id) payload.job_id = body.job_id;
    if (body.client_id) payload.client_id = body.client_id;
    if (body.client_name) payload.client_name = body.client_name;
    if (body.site) payload.site = body.site;
    if (body.pay_rate) payload.pay_rate = body.pay_rate;
    if (body.charge_rate) payload.charge_rate = body.charge_rate;
    if (body.employee_signature) payload.employee_signature = body.employee_signature;

    // Use service role so the STS Hub can submit without a user session
    const timesheet = await base44.asServiceRole.entities.Timesheet.create(payload);

    // Notify accounts team that a new shift report has been received
    const recipient = 'accounts@maliyanpartners.com.au';
    const subject = `New Shift Report — ${payload.candidate_name || payload.candidate_id} (Week ending ${payload.week_ending})`;
    const emailBody = [
      `A new shift report has been submitted via the STS Hub.`,
      ``,
      `Employee: ${payload.candidate_name || payload.candidate_id}`,
      `Client: ${payload.client_name || '—'}`,
      `Site: ${payload.site || '—'}`,
      `Week Ending: ${payload.week_ending}`,
      `Ordinary Hours: ${payload.total_ordinary_hours || 0}`,
      `Overtime Hours: ${payload.total_overtime_hours || 0}`,
      `Allowances: $${payload.total_allowances || 0}`,
      `Status: ${payload.status}`,
      ``,
      `Review this report in the Timesheets page — Submitted Shift Reports section.`
    ].join('\n');

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({ to: recipient, subject, body: emailBody });
    } catch (emailErr) {
      // Don't fail the whole request if the email notification fails
      console.error('Failed to send notification email:', emailErr.message);
    }

    return Response.json({ status: 'received', id: timesheet.id }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});