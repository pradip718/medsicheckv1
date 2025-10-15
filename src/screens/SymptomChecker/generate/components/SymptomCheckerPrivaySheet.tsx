// import {useMemo, useState} from 'react';
// import {Image, ImageBackground, StyleSheet, Text, View} from 'react-native';

// import CustomBottomSheet from '@/components/BottomSheet';
// import Button from '@/components/Button';
// import Checkbox from '@/components/Checkbox';
// import Icon from '@/components/Icon';
// import {FONT} from '@/constants/fonts';
// import {STORAGE_KEY} from '@/constants/storage-keys';
// import useIntroPreference from '@/hooks/useIntroPreference';
// import useLanguageStore from '@/store/languageStore';
// import {getSymptomQuestion} from '@/api/symptom-checker/api';
// import {errorToast} from '@/utils/toast';
// import useSymptomChecker from '@/hooks/useSymptomChecker';

// interface SymptomCheckerBottomSheetProps {
//   open: boolean;
//   onClose: () => void;
// }

// const SymptomCheckerPrivacyBottomSheet = ({
//   open,
//   onClose,
// }: SymptomCheckerBottomSheetProps) => {
//   const {saveItem} = useIntroPreference(STORAGE_KEY.SYMPTOM_CHECKER_INTRO);

//   const {symptomCheckerNavigation} = useSymptomChecker();

//   const languages = useLanguageStore(store => store.languages);

//   const [dontShow, setDontShow] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const onSavePreference = async () => {
//     if (!dontShow) {
//       return;
//     }

//     await saveItem(true);
//   };

//   const onStart = async () => {
//     try {
//       setIsLoading(true);
//       await onSavePreference();
//       const response = await getSymptomQuestion({type: 'latest'});
//       if (response?.data?.q_id) {
//         symptomCheckerNavigation(response);

//         setTimeout(() => {
//           onClose();
//         }, 1000);
//       }
//     } catch (error) {
//       errorToast();
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const steps = useMemo(
//     () => [
//       {
//         title: languages?.symptom_checker_step_title_1,
//         desc: languages?.symptom_checker_step_desc_1,
//         image: require('@/assets/images/reports/click_photos.png'),
//       },
//       {
//         title: languages?.symptom_checker_step_title_2,
//         desc: languages?.symptom_checker_step_desc_2,
//         image: require('@/assets/images/reports/answer.png'),
//       },
//       {
//         title: languages?.symptom_checker_step_title_3,
//         desc: languages?.symptom_checker_step_desc_3,
//         image: require('@/assets/images/reports/generate.png'),
//       },
//     ],
//     [languages],
//   );

//   return (
//     <CustomBottomSheet
//       containerStyle={styles.sheetContainer}
//       open={open}
//       onClose={onClose}>
//       <View style={styles.container}>
//         <View style={styles.dontShowContainer}>
//           <Checkbox
//             label={languages?.dont_show_again}
//             checked={dontShow}
//             onCheck={setDontShow}
//           />
//         </View>

//         <Text style={styles.checkHealthText}>
//           {languages?.interpret_symptoms}
//         </Text>

//         <View style={styles.answerGenerate}>
//           {steps.map((step, index) => {
//             return (
//               <View key={step.title}>
//                 <View style={styles.stepContainer}>
//                   <Image
//                     source={step.image}
//                     resizeMode="contain"
//                     style={styles.stepImage}
//                   />
//                   <View style={styles.stepTextContainer}>
//                     <Text style={styles.stepTitle}>{step.title}</Text>
//                     <Text style={styles.stepDesc}>{step.desc}</Text>
//                   </View>
//                 </View>
//                 {index !== steps.length - 1 && (
//                   <View style={styles.stepDivider} />
//                 )}
//               </View>
//             );
//           })}
//         </View>

//         <View style={styles.privacyContainer}>
//           <ImageBackground
//             source={require('@/assets/images/reports/privacy_background.png')}
//             style={styles.privacyBackgroundImage}>
//             <View style={styles.privacyContentContainer}>
//               <Text style={styles.privacyTitleText}>
//                 {languages?.your_privacy_is_our_priority}
//               </Text>
//               <View style={styles.privacyContent}>
//                 <View style={styles.privacyImageContainer}>
//                   <Image
//                     source={require('@/assets/images/reports/lock.png')}
//                     style={styles.privacyImage}
//                     resizeMode="contain"
//                   />
//                 </View>
//                 <Text style={styles.privacyInfoText}>
//                   {languages?.report_privacy_info}
//                 </Text>
//               </View>
//             </View>
//           </ImageBackground>
//         </View>

//         <View style={styles.buttonContainer}>
//           <Button
//             text={languages?.back}
//             buttonStyle={styles.backButton}
//             buttonTextStyle={styles.backButtonText}
//             onPress={onClose}
//           />
//           <Button
//             text={languages?.start}
//             rightIcon={<Icon name="chevron-right" size={20} color="#fff" />}
//             buttonStyle={styles.flex}
//             onPress={onStart}
//             isLoading={isLoading}
//             disabled={isLoading}
//           />
//         </View>
//       </View>
//     </CustomBottomSheet>
//   );
// };

// export default SymptomCheckerPrivacyBottomSheet;

// const styles = StyleSheet.create({
//   sheetContainer: {
//     paddingHorizontal: 0,
//   },
//   container: {
//     paddingBottom: 16,
//     paddingTop: 8,
//     paddingHorizontal: 20,
//   },
//   flex: {
//     flex: 1,
//   },
//   dontShowContainer: {
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   checkHealthText: {
//     textAlign: 'center',
//     fontFamily: FONT.BOLD,
//     fontSize: 16,
//     marginBottom: 16,
//   },
//   stepContainer: {
//     marginBottom: 8,
//     flexDirection: 'row',
//     gap: 16,
//     alignItems: 'center',
//   },
//   stepImage: {
//     width: 72,
//     height: 72,
//   },
//   answerGenerate: {
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     backgroundColor: '#F3F4F6',
//     borderRadius: 28,
//   },
//   stepTextContainer: {
//     flex: 1,
//     flexWrap: 'wrap',
//   },
//   stepTitle: {
//     fontFamily: FONT.BOLD,
//     fontSize: 16,
//   },
//   stepDesc: {
//     flexWrap: 'wrap',
//     width: '100%',
//     fontFamily: FONT.REGULAR,
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   stepDivider: {
//     width: '100%',
//     height: 1,
//     backgroundColor: '#E5E7EB',
//     marginVertical: 16,
//   },
//   moreInfoText: {
//     fontFamily: FONT.SEMI_BOLD,
//     fontSize: 14,
//     marginVertical: 16,
//     textAlign: 'center',
//     color: '#1671C0',
//   },
//   privacyContainer: {
//     borderRadius: 32,
//     overflow: 'hidden',
//     marginTop: 16,
//   },
//   privacyBackgroundImage: {
//     width: '100%',
//     // height: 150,
//   },
//   privacyContentContainer: {
//     paddingVertical: 16,
//     paddingHorizontal: 24,
//   },
//   privacyTitleText: {
//     fontFamily: FONT.BOLD,
//     fontSize: 16,
//     color: '#fff',
//     marginBottom: 8,
//   },
//   privacyContent: {
//     flexDirection: 'row',
//     gap: 8,
//     marginBottom: 4,
//     alignItems: 'center',
//   },
//   privacyImageContainer: {
//     backgroundColor: '#02061752',
//     height: 80,
//     width: 80,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 20,
//   },
//   privacyImage: {
//     width: 60,
//     height: 60,
//   },
//   privacyInfoText: {
//     fontFamily: FONT.REGULAR,
//     fontSize: 14,
//     lineHeight: 20,
//     color: '#fff',
//     flexWrap: 'wrap',
//     width: '75%',
//   },
//   learnMoreButton: {
//     borderColor: '#fff',
//     backgroundColor: 'transparent',
//     height: 42,
//     borderRadius: 10,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     gap: 10,
//     marginTop: 20,
//   },
//   backButton: {
//     flex: 1,
//     backgroundColor: '#D7EEFC',
//     borderColor: '#D7EEFC',
//   },
//   backButtonText: {
//     color: '#1671C0',
//   },
// });
