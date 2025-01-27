//
//  Copyright (c) 2016-2023, Nuralogix Corp.
//  All Rights reserved
//  THIS SOFTWARE IS LICENSED BY AND IS THE CONFIDENTIAL AND
//  PROPRIETARY PROPERTY OF NURALOGIX CORP. IT IS
//  PROTECTED UNDER THE COPYRIGHT LAWS OF THE USA, CANADA
//  AND OTHER FOREIGN COUNTRIES. THIS SOFTWARE OR ANY
//  PART THEREOF, SHALL NOT, WITHOUT THE PRIOR WRITTEN CONSENT
//  OF NURALOGIX CORP, BE USED, COPIED, DISCLOSED,
//  DECOMPILED, DISASSEMBLED, MODIFIED OR OTHERWISE TRANSFERRED
//  EXCEPT IN ACCORDANCE WITH THE TERMS AND CONDITIONS OF A
//  NURALOGIX CORP SOFTWARE LICENSE AGREEMENT.
//

import Foundation
import AnuraCore

extension MeasurementUIConfiguration {
    
    static var exampleCustomTheme : MeasurementUIConfiguration {
        // Start off from the default UI configuration
        let uiConfig = MeasurementUIConfiguration.defaultLegacyConfiguration
        
        // Customize Images
        uiConfig.logoImage = UIImage(named: "example_healthie_logo")
        uiConfig.heartRateImage = UIImage(named: "example_heart_shape")
        uiConfig.lightingQualityStarsFilledImage = UIImage(named: "example_light_full")
        uiConfig.lightingQualityStarsEmptyImage = UIImage(named: "example_light_empty")
        
        // Customize Fonts
        uiConfig.statusMessagesFont = UIFont(name: "AmericanTypewriter", size: 25)!
        uiConfig.countdownFont = UIFont(name: "AmericanTypewriter", size: 80)!
        uiConfig.heartRateFont = UIFont(name: "AmericanTypewriter-Bold", size: 30)!
        uiConfig.timerFont = UIFont(name: "AmericanTypewriter-Bold", size: 10)!
        
        // Customize Colors
        let greenColor = UIColor(red: 0, green: 0.77, blue: 0.42, alpha: 1.0)
        let darkMagentaColor = UIColor(red: 0.77, green: 0, blue: 0.35, alpha: 1.0)
        uiConfig.overlayBackgroundColor = UIColor(red: 0.2, green: 0, blue: 0.09, alpha: 0.75)
        uiConfig.measurementOutlineInactiveColor = .darkGray
        uiConfig.measurementOutlineActiveColor = darkMagentaColor
        uiConfig.heartRateShapeColor = greenColor
        uiConfig.lightingQualityStarsActiveColor = darkMagentaColor
        uiConfig.lightingQualityStarsInactiveColor = .darkGray
        uiConfig.statusMessagesTextColor = .white
        uiConfig.statusMessagesTextShadowColor = .black
        uiConfig.timerTextColor = .white
        uiConfig.heartRateTextColor = .white
        uiConfig.heartRateTextShadowColor = .black
        uiConfig.histogramActiveColor = greenColor
        uiConfig.histogramInactiveColor = darkMagentaColor
        
        return uiConfig
    }
    
}
