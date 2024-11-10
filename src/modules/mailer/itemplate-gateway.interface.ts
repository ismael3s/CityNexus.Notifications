export interface ITemplateGateway {
  load(input: { templateName: string; variables: any[] }): Promise<string>;
}
