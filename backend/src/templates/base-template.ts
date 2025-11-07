import {
  baseStyles,
  containerStyles,
  headerStyles,
  logoStyles,
  contentStyles,
  footerStyles,
  footerTextStyles,
  linkStyles,
  colors,
} from './email-styles';

interface BaseTemplateProps {
  content: string;
  preheader?: string;
}

export const baseTemplate = ({
  content,
  preheader = '',
}: BaseTemplateProps) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Hive</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="${baseStyles} margin: 0; padding: 0; background-color: ${colors.muted};">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 40px 16px;">
    <tr>
      <td>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="${containerStyles} background-color: ${colors.background}; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="${headerStyles}">
              <div style="${logoStyles}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="${colors.primaryForeground}" stroke="${colors.primaryForeground}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="${colors.primaryForeground}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="${colors.primaryForeground}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="font-size: 18px; font-weight: 600; margin: 0; color: ${colors.foreground};">Hive</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="${contentStyles}">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="${footerStyles}">
              <p style="${footerTextStyles}">
                © ${new Date().getFullYear()} Hive. All rights reserved.
              </p>
              <p style="${footerTextStyles}">
                <a href="#" style="${linkStyles}">Privacy Policy</a> · 
                <a href="#" style="${linkStyles}">Terms of Service</a> · 
                <a href="#" style="${linkStyles}">Contact Support</a>
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
