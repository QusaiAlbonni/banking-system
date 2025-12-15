type GenericDecorator =
  | ClassDecorator
  | MethodDecorator
  | PropertyDecorator
  | ParameterDecorator;

export function CombineDecorators<T extends GenericDecorator>(
  ...decorators: T[]
): T {
  return ((...args: any[]) => {
    for (const decorator of decorators) {
      (decorator as any)(...args);
    }
  }) as T;
}
