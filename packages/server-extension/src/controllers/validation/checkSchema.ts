import {
  checkSchema as checkSchemaStandard,
  Meta,
  Schema,
  ValidationChain
} from 'express-validator';
import { CustomCondition } from 'express-validator/src/context-items';

const getFieldPrefix = (fieldName: string) => fieldName.match(/(\w+)\..+/)?.[1];

const getAllFields = (validationChain: ValidationChain[]) =>
  validationChain.reduce((map, chain) => {
    const builder = <any>chain.builder;
    const fieldName = <string>builder.fields[0];

    map.set(fieldName, chain);

    return map;
  }, new Map<string, ValidationChain>());

const isFieldOptional = (chain?: ValidationChain) => (<any>chain?.builder).optional.nullable;

const parentExists = (parentField: string) =>
  new CustomCondition((_input: any, meta: Meta) => Boolean(meta.req.body[parentField]));

export function checkSchema(schema: Schema, defaultLocations?: any): ValidationChain[] {
  const validationChain = checkSchemaStandard(schema, defaultLocations);

  const allFields = getAllFields(validationChain);

  allFields.forEach((chain, field) => {
    const compositeFieldPrefix = getFieldPrefix(field);

    if (compositeFieldPrefix && allFields.has(compositeFieldPrefix)) {
      const parentFieldChain = allFields.get(compositeFieldPrefix);

      if (isFieldOptional(parentFieldChain)) {
        const contextBuilder = <any>chain.builder;
        contextBuilder.stack.unshift(parentExists(compositeFieldPrefix));
      }
    }
  });

  return validationChain;
}
