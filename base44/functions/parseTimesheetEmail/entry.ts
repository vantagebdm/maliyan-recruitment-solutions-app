import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Gmail webhook payload — platform pre-enriches with new_message_ids
    const messageIds = body?.data?.new_message_ids ?? [];
    if (messageIds.length === 0) {
      return Response.json({ status: 'no_messages' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    const processed = [];

    for (const messageId of messageIds) {
      try {
        // Fetch full message
        const res = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
          { headers: authHeader }
        );
        if (!res.ok) continue;
        const message = await res.json();

        // Extract subject
        const headers = message.payload?.headers || [];
        const subject = headers.find((h: any) => h.name?.toLowerCase() === 'subject')?.value || '';
        const from = headers.find((h: any) => h.name?.toLowerCase() === 'from')?.value || '';

        // Only process emails that look like timesheet submissions
        const isTimesheet = /timesheet|shift report|shift summary|weekly hours|week ending/i.test(subject) ||
                            /timesheet|shift report|shift summary|weekly hours|week ending/i.test(from);

        if (!isTimesheet) continue;

        // Extract plain text body
        let textBody = '';
        const extractBody = (payload: any): string => {
          if (!payload) return '';
          if (payload.body?.data) {
            try {
              return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            } catch {
              return '';
            }
          }
          if (payload.parts) {
            for (const part of payload.parts) {
              if (part.mimeType === 'text/plain') {
                const b = extractBody(part);
                if (b) return b;
              }
            }
            // fallback: try text/html
            for (const part of payload.parts) {
              if (part.mimeType === 'text/html') {
                const b = extractBody(part);
                if (b) return b;
              }
            }
          }
          return '';
        };
        textBody = extractBody(message.payload);

        if (!textBody) continue;

        // Use LLM to parse the email into structured timesheet data
        const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are parsing a timesheet / shift report email. Extract the following fields from the email content. If a field is not present, use null. For total_ordinary_hours, total_overtime_hours, and total_allowances, extract numbers only (no units). For week_ending, use YYYY-MM-DD format. For candidate_name, extract the employee's full name.

EMAIL SUBJECT: ${subject}
EMAIL BODY:
${textBody.substring(0, 5000)}`,
          response_json_schema: {
            type: 'object',
            properties: {
              candidate_name: { type: 'string' },
              candidate_id: { type: 'string' },
              client_name: { type: 'string' },
              site: { type: 'string' },
              week_ending: { type: 'string' },
              total_ordinary_hours: { type: 'number' },
              total_overtime_hours: { type: 'number' },
              total_allowances: { type: 'number' },
              pay_rate: { type: 'number' },
              charge_rate: { type: 'number' }
            }
          }
        });

        const parsed = llmRes || {};

        // Require at least a name or candidate id
        if (!parsed.candidate_name && !parsed.candidate_id) continue;

        // Build timesheet payload
        const payload: Record<string, any> = {
          candidate_name: parsed.candidate_name || null,
          candidate_id: parsed.candidate_id || null,
          client_name: parsed.client_name || null,
          site: parsed.site || null,
          week_ending: parsed.week_ending || null,
          total_ordinary_hours: parsed.total_ordinary_hours || 0,
          total_overtime_hours: parsed.total_overtime_hours || 0,
          total_allowances: parsed.total_allowances || 0,
          status: 'submitted',
          source: 'sts_hub_email'
        };
        if (parsed.pay_rate) payload.pay_rate = parsed.pay_rate;
        if (parsed.charge_rate) payload.charge_rate = parsed.charge_rate;

        // Create timesheet record
        const ts = await base44.asServiceRole.entities.Timesheet.create(payload);

        // Send notification email to accounts team
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: 'accounts@maliyanpartners.com.au',
            subject: `New Shift Report (Email) — ${payload.candidate_name || payload.candidate_id || 'Unknown'} (Week ending ${payload.week_ending || '—'})`,
            body: [
              `A new shift report was received via email at management@thestshub.com.au.`,
              ``,
              `Employee: ${payload.candidate_name || '—'}`,
              `Client: ${payload.client_name || '—'}`,
              `Site: ${payload.site || '—'}`,
              `Week Ending: ${payload.week_ending || '—'}`,
              `Ordinary Hours: ${payload.total_ordinary_hours}`,
              `Overtime Hours: ${payload.total_overtime_hours}`,
              `Allowances: $${payload.total_allowances}`,
              ``,
              `Review this report in the Timesheets page — Submitted Shift Reports section.`
            ].join('\n')
          });
        } catch (emailErr) {
          console.error('Failed to send notification email:', emailErr.message);
        }

        processed.push({ messageId, timesheetId: ts.id });
      } catch (msgErr) {
        console.error(`Failed to process message ${messageId}:`, msgErr.message);
      }
    }

    return Response.json({ status: 'processed', count: processed.length, processed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});