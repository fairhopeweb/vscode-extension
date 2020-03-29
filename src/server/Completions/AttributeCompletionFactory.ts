import { AureliaApplication } from "../FileParser/Model/AureliaApplication";
import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from 'vscode-languageserver';
import { autoinject } from 'aurelia-dependency-injection';
import ElementLibrary from './Library/_elementLibrary';
import { GlobalAttributes } from './Library/_elementStructure';
import BaseAttributeCompletionFactory from './BaseAttributeCompletionFactory';
import AureliaSettings from "../AureliaSettings";

@autoinject()
export default class AureliaAttributeCompletionFactory extends BaseAttributeCompletionFactory {

  public constructor(
    public library: ElementLibrary,
    private readonly settings: AureliaSettings) {
    super(library);
  }

  public create(elementName: string, existingAttributes: string[], aureliaApplication: AureliaApplication): CompletionItem[] {

    const result: CompletionItem[] = [];
    const element = this.getElement(elementName);

    this.addViewModelBindables(result, elementName, aureliaApplication);

    if (element.hasGlobalAttributes) {
      this.addAttributes(GlobalAttributes.attributes, result, existingAttributes, this.settings.quote);
    }

    if (typeof element.attributes !== 'undefined') {
      this.addAttributes(element.attributes, result, existingAttributes, this.settings.quote);
    }

    if (element.hasGlobalEvents) {
      this.addEvents(GlobalAttributes.events, result, existingAttributes, this.settings.quote);
    }

    if (typeof element.events !== 'undefined') {
      this.addEvents(element.events, result, existingAttributes, this.settings.quote);
    }

    return result;
  }

  /**
   * Look at the View Model and provide all class variables as completion in kebab case.
   * TODO: Only bindables should be provided.
   */
  private addViewModelBindables(result: CompletionItem[], elementName: string, aureliaApplication: AureliaApplication) {
    if (typeof aureliaApplication.components !== 'undefined') {
      aureliaApplication.components.forEach(component => {
        if (component.name !== elementName) return;
        if (typeof component.viewModel === 'undefined') return;
        if (typeof component.viewModel.properties === 'undefined') return;

        component.viewModel.properties.forEach(property => {
          if (!property.isBindable) return;

          const quote = this.settings.quote;
          const varAsKebabCase = property.name.split(/(?=[A-Z])/).map(s => s.toLowerCase()).join('-');
          result.push({
            documentation: property.type,
            detail: 'View Model Bindable',
            insertText: `${varAsKebabCase}.$\{1:bind}=${quote}$\{0:${property.name}}${quote}`,
            insertTextFormat: InsertTextFormat.Snippet,
            kind: CompletionItemKind.Variable,
            label: `View Model: ${varAsKebabCase}`
          });
        });
      });
    }
  }
}
