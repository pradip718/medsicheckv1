import {SymptomQuestion} from './api_response';

export type SymptomCheckerParams =
  | (SymptomQuestion & {
      choice?: string;
      isEdit?: boolean;
      answerId?: string;
      isFromReportList?: boolean;
    })
  | undefined;
