import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  GetCommunicationDetailsResponse,
  GetHelpDeskDetailsResponse,
  PatchCreateTicket,
  PostCreateCommunication,
  PostCreateTicket,
} from '../../../types/helpdesk';
import {
  deleteTicket,
  getHelpdeskDetails,
  patchCreateTicket,
  postCreateCommunication,
  postCreateTicket,
} from '../../api/helpdesk';
import {
  DELETE_HELP_DESK_TICKET,
  GET_COMMUNICATION_DETAILS,
  GET_HELP_DESK_DETAILS,
} from '../../constants/hooks';

interface GetHelpDeskDetailsProps extends UseQueryOptions {}
interface GetCommunicationDetailsProps extends UseQueryOptions {
  event_type: 'communication';
  ticket_id: string;
}

export const useGetHelpdeskDetails = (
  props?: Omit<GetHelpDeskDetailsProps, 'queryKey'>,
) => {
  return useQuery({
    queryKey: [GET_HELP_DESK_DETAILS],
    queryFn: async () => await getHelpdeskDetails(),
    // gcTime: 0,
    ...props,
  }) as UseQueryResult<GetHelpDeskDetailsResponse>;
};

export const useGetCommunicationDetails = (
  props?: Omit<GetCommunicationDetailsProps, 'queryKey'>,
) => {
  return useQuery({
    queryKey: [GET_COMMUNICATION_DETAILS],
    queryFn: async () =>
      await getHelpdeskDetails(props?.event_type, props?.ticket_id),
    gcTime: 0,
    ...props,
  }) as UseQueryResult<GetCommunicationDetailsResponse>;
};

export const usePostCreateTicket = (
  props?: Omit<
    UseMutationOptions<any, Error, PostCreateTicket, unknown>,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: postCreateTicket,
    ...props,
  });
};

export const usePostCommunication = (
  props?: Omit<
    UseMutationOptions<
      any,
      Error,
      | PostCreateCommunication & {
          ticket_id: string;
        },
      unknown
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: postCreateCommunication,
    ...props,
  });
};

export const usePatchTicket = (
  props?: Omit<
    UseMutationOptions<
      any,
      Error,
      PatchCreateTicket & {
        ticket_id: string;
      },
      unknown
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: patchCreateTicket,
    ...props,
  });
};

export const useDeleteHelpDeskTicket = (
  props?: Omit<UseMutationOptions<any, Error, string[], unknown>, 'mutationFn'>,
) => {
  return useMutation({
    mutationKey: [DELETE_HELP_DESK_TICKET],
    mutationFn: deleteTicket,
    ...props,
  }) as UseMutationResult<any>;
};
