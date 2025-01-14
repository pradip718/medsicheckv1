import {isArray, isEmpty, isString} from 'lodash';
import moment from 'moment';
import {ScrollView} from 'moti';
import React, {PropsWithChildren, useState} from 'react';
import {StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import {compareOther, downloadFile} from '../../../../utils/methods';
import Icon from '../../../components/Icon';
import Pressable from '../../../components/Pressable';
import CustomText from '../../../components/Text';
import {useGetCommunicationDetails} from '../../../hooks/api/helpdesk';
import customColor from '../../../theme/customColor';

interface ColProp extends ViewProps {}
interface RowProp extends ViewProps {}

const Col = ({children, ...restProps}: PropsWithChildren<ColProp>) => {
  return (
    <View className="flex-[2]" {...restProps}>
      {children}
    </View>
  );
};

const Row = ({children, ...restProps}: PropsWithChildren<RowProp>) => (
  <View className="flex-row mb-4" {...restProps}>
    {children}
  </View>
);

const TicketDetails = ({ticket_id}: {ticket_id: string}) => {
  const {languages} = useLanguageStore();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isAttachmentExpanded, setIsAttachmentExpanded] = useState(false);

  const toggleDescription = () => {
    setIsDescriptionExpanded(prev => !prev);
  };
  const toggleAttachment = () => {
    setIsAttachmentExpanded(prev => !prev);
  };

  const {data: helpDeskDetails} = useGetCommunicationDetails({
    event_type: 'communication',
    ticket_id,
  });

  const ticketDetails = helpDeskDetails?.ticket_detail?.find(
    ticket => ticket?.ticket_id === ticket_id,
  );

  const renderDescription = () => {
    const MAX_CHARS = 100;
    if (isDescriptionExpanded || !ticketDetails?.description) {
      return ticketDetails?.description;
    }
    return ticketDetails?.description?.length > MAX_CHARS
      ? ticketDetails?.description?.slice(0, MAX_CHARS) + '...'
      : ticketDetails?.description;
  };

  const shouldShowToggle = isString(ticketDetails?.description)
    ? ticketDetails?.description?.length > 100
    : false;

  const shouldShowAttachmentToggle = isArray(helpDeskDetails?.attachment_detail)
    ? helpDeskDetails?.attachment_detail?.length > 1
    : false;

  const renderAttachments = () => {
    if (!helpDeskDetails?.attachment_detail) {
      return null;
    }

    const attachmentsToShow = isAttachmentExpanded
      ? helpDeskDetails.attachment_detail
      : helpDeskDetails.attachment_detail.slice(0, 1);

    return attachmentsToShow.map(attachment => (
      <Pressable
        key={attachment.attachment_id}
        className="flex-row items-center border border-ultramarineBlue py-1 px-2 rounded-3xl mt-2 max-w-[110px] mr-2"
        onPress={() => downloadFile(attachment.attachment_link)}>
        <CustomText
          className="text-sm text-ultramarineBlue font-isidoraMedium w-[80%]"
          numberOfLines={1}
          ellipsizeMode="middle">
          {attachment.attachment_id}
        </CustomText>
        <View className="w-[20%] items-center">
          <Icon name="download" size={16} color={customColor.ultramarineBlue} />
        </View>
      </Pressable>
    ));
  };

  return (
    <View>
      <ScrollView
        className="bg-slate-200 m-4 p-4 rounded-lg"
        contentContainerStyle={styles.contentContainer}>
        <Row>
          <Col>
            <CustomText className="text-base font-isidoraMedium">
              {languages?.title}
            </CustomText>
          </Col>
          <Col>
            <CustomText className="text-base font-isidoraMedium">
              {compareOther(ticketDetails?.subject || '')
                ? ticketDetails?.title
                : ticketDetails?.subject}
            </CustomText>
          </Col>
        </Row>

        <Row>
          <Col>
            <CustomText className="text-base font-isidoraMedium">
              {languages?.description}
            </CustomText>
          </Col>
          <Col>
            <CustomText className="text-base font-isidoraMedium">
              {renderDescription()}
            </CustomText>
            {shouldShowToggle && (
              <TouchableOpacity onPress={toggleDescription}>
                <CustomText className="text-ultramarineBlue font-isidoraSemiBold">
                  {isDescriptionExpanded ? 'View Less' : 'View More'}
                </CustomText>
              </TouchableOpacity>
            )}
          </Col>
        </Row>
        <Row>
          <Col>
            <CustomText className="text-base font-isidoraMedium">
              {languages?.priority}
            </CustomText>
          </Col>
          <Col>
            <CustomText className="text-base font-isidoraMedium">
              {ticketDetails?.priority}
            </CustomText>
          </Col>
        </Row>
        <Row>
          <Col>
            <CustomText className="text-base font-isidoraMedium">
              {languages?.createdOn}
            </CustomText>
          </Col>
          <Col>
            <CustomText className="text-base font-isidoraMedium">
              {moment(ticketDetails?.created_at).format('DD/MM/YYYY HH:mm')}
            </CustomText>
          </Col>
        </Row>
        <Row>
          <Col>
            <CustomText className="text-base font-isidoraMedium">
              {languages?.lastUpdatedOn}
            </CustomText>
          </Col>
          <Col>
            <CustomText className="text-base font-isidoraMedium">
              {moment(ticketDetails?.created_at).format('DD/MM/YYYY HH:mm')}
            </CustomText>
          </Col>
        </Row>
        {!isEmpty(helpDeskDetails?.attachment_detail) && (
          <Row>
            <Col>
              <CustomText className="text-base font-isidoraMedium">
                {languages?.attachments}
              </CustomText>
            </Col>
            <Col>
              {renderAttachments()}
              {shouldShowAttachmentToggle && (
                <TouchableOpacity onPress={toggleAttachment}>
                  <CustomText className="text-ultramarineBlue font-isidoraSemiBold">
                    {isAttachmentExpanded ? 'View Less' : 'View More'}
                  </CustomText>
                </TouchableOpacity>
              )}
            </Col>
          </Row>
        )}
      </ScrollView>
    </View>
  );
};

export default TicketDetails;

const styles = StyleSheet.create({
  contentContainer: {paddingBottom: 20},
});
