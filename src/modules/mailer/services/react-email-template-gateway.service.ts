import { render } from '@react-email/components';
import * as React from 'react';
import { Injectable } from '@nestjs/common';
import { ITemplateGateway } from '../itemplate-gateway.interface';

@Injectable()
export class ReactEmailTemplateGatewayService implements ITemplateGateway {
  async load(input: {
    templateName: string;
    variables: { name: string; value: string }[];
  }): Promise<string> {
    const DynamicComponent =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      (await require(`../../../emails/${input.templateName}`)).default;
    const obj = input.variables.reduce((acc, curr) => {
      acc[curr.name] = curr.value;
      return acc;
    }, {});
    const component = React.createElement(DynamicComponent, obj);
    return render(component);
  }
}
