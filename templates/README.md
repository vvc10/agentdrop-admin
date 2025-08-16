# Email Templates

This directory contains HTML email templates for the Agentdrop application.

## Template Structure

### Current Templates
- `beta-approval-email.html` - Email sent when users are approved for beta access

### Template Variables

Templates use the following variable format: `{{VARIABLE_NAME}}`

#### Beta Approval Email Variables
- `{{USER_NAME}}` - The recipient's name
- `{{SIGNUP_URL}}` - The sign-up URL for the application
- `{{TRACKING_URL}}` - URL for email open tracking pixel

## How to Modify Templates

### 1. Edit the HTML File
Simply edit the `.html` file in this directory. The template will be automatically loaded when emails are sent.

### 2. Add New Variables
If you need to add new variables:

1. Add the placeholder in the HTML template: `{{NEW_VARIABLE}}`
2. Update the `generateBetaApprovalEmailHTML` method in `lib/email-service.ts`
3. Add the variable to the `variables` object:

```typescript
const variables: TemplateVariables = {
  USER_NAME: data.name,
  SIGNUP_URL: signupUrl,
  TRACKING_URL: trackingUrl,
  NEW_VARIABLE: 'new value' // Add your new variable here
};
```

### 3. Create New Email Templates
To create a new email template:

1. Create a new `.html` file in this directory
2. Use the same variable format: `{{VARIABLE_NAME}}`
3. Add a new method in `EmailService` class
4. Use `TemplateUtils.loadAndProcessTemplate()` to load the template

## Template Features

- **Responsive Design**: All templates are mobile-friendly
- **CSS-in-HTML**: Styles are embedded for maximum email client compatibility
- **Variable Replacement**: Dynamic content using `{{VARIABLE}}` placeholders
- **Tracking Support**: Built-in tracking pixel support

## Best Practices

1. **Test in Multiple Email Clients**: Test templates in Gmail, Outlook, Apple Mail, etc.
2. **Use Inline CSS**: Email clients often strip external CSS
3. **Keep it Simple**: Avoid complex layouts that might break in email clients
4. **Use Web-Safe Fonts**: Stick to fonts that work across all email clients
5. **Optimize Images**: Use web-optimized images and provide alt text

## File Structure
```
templates/
├── README.md
├── beta-approval-email.html
└── [future templates...]
```
