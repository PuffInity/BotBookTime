/**
 * @file email-layout.template.ts
 * @summary Спільний HTML-layout для всіх email-шаблонів у єдиному стилі.
 */

type EmailStatusTone = "warning" | "success" | "danger" | "info";

type EmailDetailRow = {
    label: string;
    value: string;
};

type RenderEmailLayoutInput = {
    title: string;
    subtitle?: string;
    greeting?: string;
    intro?: string;
    statusLabel?: string;
    statusTone?: EmailStatusTone;
    detailsTitle?: string;
    detailsRows?: EmailDetailRow[];
    highlightHtml?: string;
    notice?: string;
    ctaText?: string;
    ctaUrl?: string;
    secondaryCtaText?: string;
    secondaryCtaUrl?: string;
    closing?: string;
    footerNote?: string;
};

const statusToneStyles: Record<EmailStatusTone, { bg: string; fg: string; border: string }> = {
    warning: { bg: "#fff7ed", fg: "#c2410c", border: "#fdba74" },
    success: { bg: "#ecfdf5", fg: "#166534", border: "#86efac" },
    danger: { bg: "#fef2f2", fg: "#b91c1c", border: "#fca5a5" },
    info: { bg: "#eff6ff", fg: "#1d4ed8", border: "#93c5fd" },
};

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const withLineBreaks = (value: string): string => escapeHtml(value).replace(/\n/g, "<br/>");

const renderStatusBadge = (label?: string, tone: EmailStatusTone = "info"): string => {
    if (!label) return "";
    const palette = statusToneStyles[tone];

    return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
  <tr>
    <td style="background-color: ${palette.bg}; color: ${palette.fg}; font-size: 13px; font-weight: bold; padding: 10px 16px; border-radius: 999px; border: 1px solid ${palette.border};">
      ${escapeHtml(label)}
    </td>
  </tr>
</table>
`;
};

const renderDetails = (title = "Деталі", rows: EmailDetailRow[] = []): string => {
    if (rows.length === 0) return "";

    const bodyRows = rows
        .map((row, index) => {
            const border = index === rows.length - 1 ? "" : "border-bottom: 1px solid #f3f4f6;";
            return `
<tr>
  <td style="padding: 14px 20px; font-size: 14px; color: #6b7280; width: 38%; ${border}">${escapeHtml(row.label)}</td>
  <td style="padding: 14px 20px; font-size: 14px; color: #111827; ${border}">${escapeHtml(row.value)}</td>
</tr>
`;
        })
        .join("");

    return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; margin-bottom: 24px;">
  <tr>
    <td colspan="2" style="background-color: #f9fafb; padding: 16px 20px; font-size: 16px; font-weight: bold; color: #111827; border-bottom: 1px solid #e5e7eb;">
      ${escapeHtml(title)}
    </td>
  </tr>
  ${bodyRows}
</table>
`;
};

const renderNotice = (notice?: string): string => {
    if (!notice) return "";

    return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-left: 4px solid #111827; border-radius: 10px; margin-bottom: 24px;">
  <tr>
    <td style="padding: 16px 18px; font-size: 14px; line-height: 1.7; color: #4b5563;">
      ${withLineBreaks(notice)}
    </td>
  </tr>
</table>
`;
};

const renderCta = (text?: string, url?: string): string => {
    if (!text || !url) return "";
    return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
  <tr>
    <td style="background-color: #111827; border-radius: 10px;">
      <a href="${escapeHtml(url)}" style="display: inline-block; padding: 12px 20px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold;">
        ${escapeHtml(text)}
      </a>
    </td>
  </tr>
</table>
`;
};

const renderSecondaryCta = (text?: string, url?: string): string => {
    if (!text || !url) return "";
    return `
<p style="margin: -12px 0 24px; font-size: 13px; line-height: 1.6;">
  <a href="${escapeHtml(url)}" style="color: #4b5563;">${escapeHtml(text)}</a>
</p>
`;
};

export const renderEmailLayout = (input: RenderEmailLayoutInput): string => {
    const footerNote =
        input.footerNote ??
        "Це автоматичне повідомлення. Якщо дія виконувалась не вами, просто проігноруйте лист.";

    return `
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(input.title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: Arial, Helvetica, sans-serif; color: #222222;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f7; margin: 0; padding: 24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #111827, #374151); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; line-height: 1.3; color: #ffffff;">${escapeHtml(input.title)}</h1>
              ${
                  input.subtitle
                      ? `<p style="margin: 10px 0 0; font-size: 15px; line-height: 1.6; color: #e5e7eb;">${withLineBreaks(input.subtitle)}</p>`
                      : ""
              }
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 24px;">
              ${
                  input.greeting
                      ? `<p style="margin: 0 0 16px; font-size: 18px; line-height: 1.6; font-weight: bold; color: #111827;">${withLineBreaks(input.greeting)}</p>`
                      : ""
              }
              ${
                  input.intro
                      ? `<p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #4b5563;">${withLineBreaks(input.intro)}</p>`
                      : ""
              }

              ${renderStatusBadge(input.statusLabel, input.statusTone)}
              ${input.highlightHtml ?? ""}
              ${renderDetails(input.detailsTitle, input.detailsRows)}
              ${renderNotice(input.notice)}
              ${renderCta(input.ctaText, input.ctaUrl)}
              ${renderSecondaryCta(input.secondaryCtaText, input.secondaryCtaUrl)}

              ${
                  input.closing
                      ? `<p style="margin: 0; font-size: 14px; line-height: 1.7; color: #6b7280;">${withLineBreaks(input.closing)}</p>`
                      : ""
              }
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #9ca3af;">
                ${withLineBreaks(footerNote)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};
