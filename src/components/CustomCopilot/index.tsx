// import {useAsyncStorage} from '@react-native-async-storage/async-storage';
// import React from 'react';
// import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
// import {useCopilot} from 'react-native-copilot';
// import {Button} from 'react-native-paper';
// import useUserProfileStore from '../../../store/profileStore';
// import {HOMEPAGE_WALKTHROUGH} from '../../constants/AsyncStorageKeys';
// import useGetUserAttributes from '../../hooks/api/useGetUserAttributes';
// import CustomText from '../Text';

// const CustomCopilot = (props: any) => {
//   const {setItem} = useAsyncStorage(HOMEPAGE_WALKTHROUGH);
//   const {data: userAttributes} = useGetUserAttributes();
//   const {setIsWalkThroughVisible} = useUserProfileStore();
//   const {labels} = props;
//   const {goToNext, goToPrev, stop, currentStep, isFirstStep, isLastStep} =
//     useCopilot();

//   const handleStop = async () => {
//     void stop();
//     await setItem(
//       JSON.stringify({
//         id: userAttributes?.user_id,
//         completed: true,
//       }),
//     );
//     setIsWalkThroughVisible(false);
//   };
//   const handleNext = () => {
//     void goToNext();
//   };

//   const handlePrev = () => {
//     void goToPrev();
//   };

//   return (
//     <View>
//       <View style={styles.tooltipContainer}>
//         <Text testID="stepDescription" style={styles.tooltipText}>
//           {currentStep?.text}
//         </Text>
//       </View>
//       <View style={[styles.bottomBar]} className="space-x-2">
//         {!isLastStep ? (
//           <TouchableOpacity onPress={handleStop}>
//             <Button className="bg-blueBerry text-white">
//               <CustomText className="text-white font-isidoraSemiBold">
//                 {labels.skip}
//               </CustomText>
//             </Button>
//           </TouchableOpacity>
//         ) : null}
//         {!isFirstStep ? (
//           <TouchableOpacity onPress={handlePrev}>
//             <Button className="bg-blueBerry text-white font-isidoraSemiBold">
//               {labels.previous}
//             </Button>
//           </TouchableOpacity>
//         ) : null}
//         {!isLastStep ? (
//           <TouchableOpacity onPress={handleNext}>
//             <Button className="bg-blueBerry text-white">
//               <CustomText className="text-white font-isidoraSemiBold">
//                 {labels.next}
//               </CustomText>
//             </Button>
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity onPress={handleStop}>
//             <Button className="bg-blueBerry text-white">
//               <CustomText className="text-white font-isidoraSemiBold">
//                 {labels.finish}
//               </CustomText>
//             </Button>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// };

// export default CustomCopilot;

// const styles = StyleSheet.create({
//   container: {
//     position: 'absolute',
//     left: 0,
//     top: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 10,
//   },
//   arrow: {
//     position: 'absolute',
//     borderColor: 'transparent',
//     borderWidth: 10,
//   },
//   tooltip: {
//     position: 'absolute',
//     paddingTop: 15,
//     paddingHorizontal: 15,
//     backgroundColor: '#fff',
//     borderRadius: 3,
//     overflow: 'hidden',
//   },
//   tooltipText: {
//     color: '#000',
//   },
//   tooltipContainer: {
//     flex: 1,
//   },
//   // stepNumberContainer: {
//   //   position: 'absolute',
//   //   width: STEP_NUMBER_DIAMETER,
//   //   height: STEP_NUMBER_DIAMETER,
//   //   overflow: 'hidden',
//   //   zIndex: ZINDEX + 1,
//   // },
//   // stepNumber: {
//   //   flex: 1,
//   //   alignItems: 'center',
//   //   justifyContent: 'center',
//   //   borderWidth: 2,
//   //   borderRadius: STEP_NUMBER_RADIUS,
//   //   borderColor: '#FFFFFF',
//   //   backgroundColor: '#27ae60',
//   // },
//   stepNumberText: {
//     fontSize: 10,
//     backgroundColor: 'transparent',
//     color: '#FFFFFF',
//   },
//   button: {
//     padding: 10,
//   },
//   buttonText: {
//     color: '#27ae60',
//   },
//   bottomBar: {
//     marginVertical: 10,
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//   },
//   overlayRectangle: {
//     position: 'absolute',
//     backgroundColor: 'rgba(0,0,0,0.2)',
//     left: 0,
//     top: 0,
//     bottom: 0,
//     right: 0,
//   },
//   overlayContainer: {
//     position: 'absolute',
//     left: 0,
//     top: 0,
//     bottom: 0,
//     right: 0,
//   },
// });
