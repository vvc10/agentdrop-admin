import fs from 'fs';
import path from 'path';

export interface TemplateVariables {
  [key: string]: string;
}

export class TemplateUtils {
  /**
   * Load an HTML template from the templates directory
   */
  static loadTemplate(templateName: string): string {
    const templatePath = path.join(process.cwd(), 'templates', templateName);
    
    try {
      return fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      console.error(`Failed to load template: ${templateName}`, error);
      throw new Error(`Template not found: ${templateName}`);
    }
  }

  /**
   * Replace template variables with actual values
   */
  static processTemplate(template: string, variables: TemplateVariables): string {
    let processedTemplate = template;
    
    // Replace all variables in the format {{VARIABLE_NAME}}
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return processedTemplate;
  }

  /**
   * Load and process a template with variables
   */
  static loadAndProcessTemplate(templateName: string, variables: TemplateVariables): string {
    const template = this.loadTemplate(templateName);
    return this.processTemplate(template, variables);
  }
}
