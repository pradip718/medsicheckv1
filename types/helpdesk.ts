import {DocumentPickerResponse} from 'react-native-document-picker';

export type PostCreateTicket = {
  subject: string;
  title?: string;
  description: string;
  priority: string;
  status: string;
  sub_status: string;
  tags: string[];
  files?: DocumentPickerResponse[];
  ticket_comment?: string;
};

export type PostCreateCommunication =
  | {
      message: string;
      comments?: string;
      read_flag?: string;
      files?: DocumentPickerResponse[];
    }
  | {
      message?: string;
      comments?: string;
      read_flag: string;
      files?: DocumentPickerResponse[];
    };

export type PostCreateTicketResponse = {};

export type PatchCreateTicket = Partial<PostCreateTicket>;

export type HelpDeskDetails = {
  created_at: string;
  ticket_id: string;
  status: string;
  sub_status: string;
  subject: string;
  description: string;
  priority: string;
  tags: string[];
  title: string | null;
  age: string;
  read_flag: boolean;
};
export type GetHelpDeskDetailsResponse = HelpDeskDetails[];

export type CommunicationDetails = {
  communication_id: string;
  message: string;
  comments: string;
  attachment_id: string;
  sent_by: string;
  read_flag: boolean;
};

export type AttachmentDetails = {
  attachment_id: string;
  attachment_link: string;
};

export type GetCommunicationDetailsResponse = {
  attachment_detail: AttachmentDetails[];
  communication_detail: CommunicationDetails[];
  ticket_detail: HelpDeskDetails[];
};

export type PostCreateCommunicationResponse = {
  communication_id: string;
};
