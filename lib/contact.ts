export const CONTACT_EMAIL = "hello@quickpdfkit.com";

export function contactMailto({
  name,
  email,
  message,
  subject,
  bodyName,
  bodyEmail,
}: {
  name: string;
  email: string;
  message: string;
  subject: string;
  bodyName: string;
  bodyEmail: string;
}): string {
  const normalizedMessage = message.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
  const body = `${bodyName}: ${name}\r\n${bodyEmail}: ${email}\r\n\r\n${normalizedMessage}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
