import { authConfig } from "./config";
export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export interface EmailProvider {
    send(options: EmailOptions): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
class ConsoleEmailProvider implements EmailProvider {
    async send(options: EmailOptions) {
        console.log("\n" + "=".repeat(60));
        console.log(" EMAIL (Console Provider - Development Only)");
        console.log("=".repeat(60));
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log("-".repeat(60));
        console.log(options.text || options.html);
        console.log("=".repeat(60) + "\n");
        return { success: true, messageId: `console-${Date.now()}` };
    }
}
class ResendEmailProvider implements EmailProvider {
    private apiKey: string;
    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }
    async send(options: EmailOptions) {
        try {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: authConfig.email.from,
                    to: options.to,
                    subject: options.subject,
                    html: options.html,
                    text: options.text,
                }),
            });
            if (!response.ok) {
                const error = await response.text();
                console.error("[EMAIL] Resend error:", error);
                return { success: false, error };
            }
            const data = await response.json();
            return { success: true, messageId: data.id };
        }
        catch (error) {
            console.error("[EMAIL] Failed to send email:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
}
function getEmailProvider(): EmailProvider {
    switch (authConfig.email.provider) {
        case "resend":
            if (!authConfig.email.resendApiKey) {
                console.warn("[EMAIL] Resend API key not configured, falling back to console");
                return new ConsoleEmailProvider();
            }
            return new ResendEmailProvider(authConfig.email.resendApiKey);
        case "console":
        default:
            return new ConsoleEmailProvider();
    }
}
const emailProvider = getEmailProvider();
export async function sendVerificationEmail(to: string, verificationUrl: string, userName?: string) {
    const name = userName || "there";
    return emailProvider.send({
        to,
        subject: "Verify your email - God Complex",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0e14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0e14; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="color: #3B82F6; font-size: 24px; font-weight: bold; letter-spacing: 0.2em; margin: 0;">
                GOD COMPLEX
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="background-color: #0B101A; border: 1px solid #1E293B; border-radius: 12px; padding: 40px;">
              <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 20px 0; letter-spacing: 0.1em;">
                VERIFY YOUR IDENTITY
              </h2>
              
              <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                Hello ${name},<br><br>
                Click the button below to verify your email address and complete your registration.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; background-color: #3B82F6; color: #ffffff; padding: 16px 40px; text-decoration: none; font-weight: bold; letter-spacing: 0.15em; font-size: 14px; border-radius: 8px;">
                      VERIFY EMAIL
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6B7280; font-size: 12px; margin: 30px 0 0 0;">
                If you didn't create an account, you can safely ignore this email.
              </p>
              
              <p style="color: #4B5563; font-size: 11px; margin: 20px 0 0 0; word-break: break-all;">
                Or copy this link: ${verificationUrl}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 30px;">
              <p style="color: #4B5563; font-size: 11px; margin: 0;">
                This email was sent by God Complex. Do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
        text: `
God Complex - Verify Your Email

Hello ${name},

Click the link below to verify your email address:
${verificationUrl}

If you didn't create an account, you can safely ignore this email.
    `,
    });
}
export async function sendPasswordResetEmail(to: string, resetUrl: string, userName?: string) {
    const name = userName || "there";
    return emailProvider.send({
        to,
        subject: "Reset your password - God Complex",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 40px; background-color: #0a0e14; font-family: sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0B101A; border: 1px solid #1E293B; border-radius: 12px; padding: 40px;">
    <h1 style="color: #3B82F6; font-size: 24px; margin-bottom: 30px;">GOD COMPLEX</h1>
    <h2 style="color: #ffffff; font-size: 18px;">Reset Your Password</h2>
    <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6;">
      Hello ${name},<br><br>
      Click the button below to reset your password. This link expires in 1 hour.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; background-color: #3B82F6; color: #ffffff; padding: 16px 40px; text-decoration: none; font-weight: bold; border-radius: 8px;">
        RESET PASSWORD
      </a>
    </div>
    <p style="color: #6B7280; font-size: 12px;">
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
    `,
        text: `
God Complex - Reset Your Password

Hello ${name},

Click the link below to reset your password (expires in 1 hour):
${resetUrl}

If you didn't request this, you can safely ignore this email.
    `,
    });
}
export { emailProvider };
