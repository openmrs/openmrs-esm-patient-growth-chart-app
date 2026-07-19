import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  concepts: {
    _type: Type.Object,
    _description: 'Concepts used to record growth observations',
    _default: {
      weightUuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      heightUuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
};

export type ConfigObject = {
  concepts: {
    weightUuid: string;
    heightUuid: string;
  };
};
