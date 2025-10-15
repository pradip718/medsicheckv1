// import {StyleSheet, Text, View} from 'react-native';

// import CustomBottomSheet from '@/components/BottomSheet';
// import {FONT} from '@/constants/fonts';
// import Button from '@/components/Button';
// import useLanguageStore from '@/store/languageStore';
// import Icon from '../Icon';
// import {goToHome} from '@/navigation/navigationUtils';
// import AntDesign from 'react-native-vector-icons/AntDesign';

// interface SymptomUploadBottomSheetProps {
//   open: boolean;
//   onClose: () => void;
//   onReplace: () => void;
// }

// const SymptomUploadBottomSheet = ({
//   open,
//   onClose,
//   onReplace,
// }: SymptomUploadBottomSheetProps) => {
//   const languages = useLanguageStore(store => store.languages);

//   const onSkip = () => {
//     onClose();
//     goToHome();
//   };

//   return (
//     <CustomBottomSheet
//       containerStyle={styles.sheetContainer}
//       open={open}
//       onClose={onClose}>
//       <View style={styles.container}>
//         <View>
//           <Text style={styles.title}>{languages?.symptom_upload_title}</Text>
//           <Text style={styles.infoText}>{languages?.symptom_upload_info}</Text>
//         </View>

//         <View style={styles.buttonContainer}>
//           <Button
//             text={languages?.replace_image}
//             rightIcon={<Icon name="chevron-right" size={20} color="#fff" />}
//             onPress={onReplace}
//           />
//           <Button
//             text={languages?.cancel}
//             variant="secondary"
//             rightIcon={<AntDesign name="close" size={20} color="#1671C0" />}
//             onPress={onSkip}
//           />
//         </View>
//       </View>
//     </CustomBottomSheet>
//   );
// };

// export default SymptomUploadBottomSheet;

// const styles = StyleSheet.create({
//   sheetContainer: {
//     paddingHorizontal: 0,
//   },
//   container: {
//     paddingBottom: 16,
//     paddingTop: 16,
//     paddingHorizontal: 16,
//     gap: 20,
//   },
//   title: {
//     textAlign: 'center',
//     fontSize: 20,
//     fontFamily: FONT.EXTRA_BOLD,
//     color: '#222A3D',
//     marginBottom: 12,
//   },
//   infoText: {
//     textAlign: 'center',
//     fontSize: 16,
//     fontFamily: FONT.SEMI_BOLD,
//     color: '#4B5363',
//     lineHeight: 22,
//   },
//   continueContainer: {
//     marginTop: 20,
//     marginHorizontal: 40,
//   },
//   buttonContainer: {
//     gap: 8,
//     marginTop: 16,
//   },
// });
