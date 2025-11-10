export const colors = {
  background: '#FFFFFF',
  foreground: '#2A2A33',
  primary: '#D4A745',
  primaryForeground: '#FFFFFF',
  secondary: '#6B9CAA',
  muted: '#F5F5F7',
  mutedForeground: '#737380',
  border: '#E8E8EB',
};

export const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: ${colors.foreground};
`;

export const containerStyles = `
  max-width: 600px;
  margin: 0 auto;
  background-color: ${colors.background};
`;

export const headerStyles = `
  padding: 40px 32px 32px;
  text-align: center;
  border-bottom: 1px solid ${colors.border};
`;

export const logoStyles = `
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  display: inline-block;
`;

export const logoImageStyles = `
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 12px;
`;

export const contentStyles = `
  padding: 40px 32px;
`;

export const headingStyles = `
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px;
  color: ${colors.foreground};
  letter-spacing: -0.02em;
`;

export const textStyles = `
  font-size: 15px;
  margin: 0 0 24px;
  color: ${colors.mutedForeground};
  line-height: 1.7;
`;

export const buttonStyles = `
  display: inline-block;
  padding: 12px 32px;
  background-color: ${colors.primary};
  color: ${colors.primaryForeground};
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 15px;
  margin: 8px 0 24px;
  transition: all 0.2s;
`;

export const footerStyles = `
  padding: 24px 32px;
  text-align: center;
  border-top: 1px solid ${colors.border};
  background-color: ${colors.muted};
`;

export const footerTextStyles = `
  font-size: 13px;
  color: ${colors.mutedForeground};
  margin: 0 0 8px;
`;

export const linkStyles = `
  color: ${colors.secondary};
  text-decoration: none;
`;

export const codeBoxStyles = `
  padding: 16px 20px;
  background-color: ${colors.muted};
  border: 1px solid ${colors.border};
  border-radius: 6px;
  margin: 16px 0;
  text-align: center;
`;

export const codeStyles = `
  font-family: 'Courier New', monospace;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 4px;
  color: ${colors.foreground};
`;

export const dividerStyles = `
  height: 1px;
  background-color: ${colors.border};
  margin: 32px 0;
  border: none;
`;
