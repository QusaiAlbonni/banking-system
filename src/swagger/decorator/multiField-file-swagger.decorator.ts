import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export function ApiMultipartField(
  dto?: Function,
  fileFields: string | string[] = 'file', // now accepts string or array
): MethodDecorator {
  const fields = Array.isArray(fileFields) ? fileFields : [fileFields];

  const fileProps = fields.reduce<Record<string, any>>((acc, name) => {
    acc[name] = {
      type: 'string',
      format: 'binary',
    };
    return acc;
  }, {});

  const bodySchema: SchemaObject | ReferenceObject = {
    allOf: [
      {
        type: 'object',
        properties: fileProps,
      },
    ],
  };

  const decorators = [
    ApiConsumes('multipart/form-data'),
  ] as Array<MethodDecorator>;

  if (dto) {
    decorators.push(ApiExtraModels(dto));
    bodySchema.allOf!.push({ $ref: getSchemaPath(dto) });
  }

  decorators.push(ApiBody({ schema: bodySchema }));

  return applyDecorators(...decorators);
}
