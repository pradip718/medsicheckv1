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

@objc class AppConfig: NSObject {
  
  // Your DeepAffex license key and study ID can be obtained
  // by your administrator from DeepAffex Dashboard:
  // https://dashboard.deepaffex.ai
  
  // Must provide a DeepAffex license key for the app to work
  static var deepaffexLicenseKey = ""

  // Must provide a study ID to send measurement data
  static var deepaffexStudyID = ""

  // DeepAffex API Hostname
  // International: api.deepaffex.ai
  // China: api.deepaffex.cn
  static var deepaffexAPIHostname = ""

  @objc static func synchronizeAppConfiguration(_ appConfigJson: String) {
    var appConfigDic: [String: Any] = [:]
    if !appConfigJson.isEmpty, let jsonData = appConfigJson.data(using: .utf8) {
      do {
        if let dictionary = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any] {
          appConfigDic = dictionary
        }
      } catch {
        print("App Config JSON parsing Error: \(error)")
      }
    }
    
    if let deepaffexLicenseKey = appConfigDic["deepaffexLicenseKey"] as? String {
      Self.deepaffexLicenseKey = deepaffexLicenseKey
    }
    
    if let deepaffexStudyID = appConfigDic["deepaffexStudyID"] as? String {
      Self.deepaffexStudyID = deepaffexStudyID
    }

    if let deepaffexAPIHostname = appConfigDic["deepaffexAPIHostname"] as? String {
      Self.deepaffexAPIHostname = deepaffexAPIHostname
    }
  }
}

@objc class Configuration: NSObject {
  @objc static func getConfigurationFromJsonString(_ configJson: String) -> MeasurementConfiguration {
    var configDic: [String: Any] = [:]
    if !configJson.isEmpty, let jsonData = configJson.data(using: .utf8) {
      do {
        if let dictionary = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any] {
          configDic = dictionary
        }
      } catch {
        print("Config JSON parsing Error: \(error)")
      }
    }

    let config = MeasurementConfiguration.defaultConfiguration
    
    if let measurementDuration = configDic["measurementDuration"] as? Double {
      config.measurementDuration = measurementDuration
    }
    
    if let cameraPosition = configDic["cameraPosition"] as? String {
      config.cameraPosition = cameraPosition == "back" ? .back : .front
    }

    if let frameRate = configDic["frameRate"] as? Int {
      config.frameRate = CMTimeMake(value: 1, timescale: Int32(frameRate))
    }
    
    if let countdownDuration = configDic["countdownDuration"] as? Int {
      config.countdownDuration = Double(countdownDuration)
    }

    if let screenLightControlEnabled = configDic["screenLightControlEnabled"] as? Bool {
      config.screenLightControlEnabled = screenLightControlEnabled
    }

    if let defaultConstraintsEnabled = configDic["defaultConstraintsEnabled"] as? Bool {
      config.defaultConstraintsEnabled = defaultConstraintsEnabled
    }
    
    if let defaultConstraintsDuringMeasurementEnabled = configDic["defaultConstraintsDuringMeasurementEnabled"] as? Bool {
      config.defaultConstraintsDuringMeasurementEnabled = defaultConstraintsDuringMeasurementEnabled
    }
    
    if let lightingQualityConstraintEnabled = configDic["lightingQualityConstraintEnabled"] as? Bool {
      config.lightingQualityConstraintEnabled = lightingQualityConstraintEnabled
    }
    
    if let chunkDuration = configDic["chunkDuration"] as? Int {
      config.chunkDuration = Double(chunkDuration)
    }
    return config
  }
  
  @objc static func getUIConfigurationFromJsonString(_ uiConfigJson: String) -> MeasurementUIConfiguration {
    var uiConfigDic: [String: Any] = [:]
    if !uiConfigJson.isEmpty, let jsonData = uiConfigJson.data(using: .utf8) {
      do {
        if let dictionary = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any] {
          uiConfigDic = dictionary
        }
      } catch {
        print("UI Config JSON parsing Error: \(error)")
      }
    }

    let uiConfig = MeasurementUIConfiguration.defaultConfiguration 
    
    if let logoImage = uiConfigDic["logoImage"] as? String {
      uiConfig.logoImage = UIImage(named: logoImage)
    }
    
    if let heartRateImage = uiConfigDic["heartRateImage"] as? String {
      uiConfig.heartRateImage = UIImage(named: heartRateImage)
    }
    
    if let lightingQualityStarsFilledImage = uiConfigDic["lightingQualityStarsFilledImage"] as? String {
      uiConfig.lightingQualityStarsFilledImage = UIImage(named: lightingQualityStarsFilledImage)
    }
    
    if let lightingQualityStarsEmptyImage = uiConfigDic["lightingQualityStarsEmptyImage"] as? String {
      uiConfig.lightingQualityStarsEmptyImage = UIImage(named: lightingQualityStarsEmptyImage)
    }
    
    if let statusMessagesFont = uiConfigDic["statusMessagesFont"] as? [String: Any],
       let fontName = statusMessagesFont["fontName"] as? String,
       let size = statusMessagesFont["size"] as? CGFloat,
       let font = UIFont(name: fontName, size: size) {
      uiConfig.statusMessagesFont = font
    }
    
    if let countdownFont = uiConfigDic["countdownFont"] as? [String: Any],
       let fontName = countdownFont["fontName"] as? String,
       let size = countdownFont["size"] as? CGFloat,
       let font = UIFont(name: fontName, size: size) {
      uiConfig.countdownFont = font
    }
    
    if let heartRateFont = uiConfigDic["heartRateFont"] as? [String: Any],
       let fontName = heartRateFont["fontName"] as? String,
       let size = heartRateFont["size"] as? CGFloat,
       let font = UIFont(name: fontName, size: size) {
      uiConfig.heartRateFont = font
    }
    
    if let timerFont = uiConfigDic["timerFont"] as? [String: Any],
       let fontName = timerFont["fontName"] as? String,
       let size = timerFont["size"] as? CGFloat,
       let font = UIFont(name: fontName, size: size) {
      uiConfig.timerFont = font
    }
    
    if let overlayBackgroundColor = uiConfigDic["overlayBackgroundColor"] as? [String: Any],
       let hex = overlayBackgroundColor["hex"] as? String,
       let alpha = overlayBackgroundColor["alpha"] as? CGFloat {
      uiConfig.overlayBackgroundColor = UIColor(hex: hex, alpha: alpha)
    }
    
    if let measurementOutlineInactiveColor = uiConfigDic["measurementOutlineInactiveColor"] as? [String: Any],
       let hex = measurementOutlineInactiveColor["hex"] as? String,
       let alpha = measurementOutlineInactiveColor["alpha"] as? CGFloat {
      uiConfig.measurementOutlineInactiveColor = UIColor(hex: hex, alpha: alpha)
    }
    
    if let measurementOutlineActiveColor = uiConfigDic["measurementOutlineActiveColor"] as? [String: Any],
       let hex = measurementOutlineActiveColor["hex"] as? String,
       let alpha = measurementOutlineActiveColor["alpha"] as? CGFloat {
      uiConfig.measurementOutlineActiveColor = UIColor(hex: hex, alpha: alpha)
    }
    
    if let heartRateShapeColor = uiConfigDic["heartRateShapeColor"] as? [String: Any],
       let hex = heartRateShapeColor["hex"] as? String,
       let alpha = heartRateShapeColor["alpha"] as? CGFloat {
      uiConfig.heartRateShapeColor = UIColor(hex: hex, alpha: alpha)
    }
    
    if let lightingQualityStarsActiveColor = uiConfigDic["lightingQualityStarsActiveColor"] as? [String: Any],
       let hex = lightingQualityStarsActiveColor["hex"] as? String,
       let alpha = lightingQualityStarsActiveColor["alpha"] as? CGFloat {
      uiConfig.lightingQualityStarsActiveColor = UIColor(hex: hex, alpha: alpha)
    }
    
    if let lightingQualityStarsInactiveColor = uiConfigDic["lightingQualityStarsInactiveColor"] as? [String: Any],
       let hex = lightingQualityStarsInactiveColor["hex"] as? String,
       let alpha = lightingQualityStarsInactiveColor["alpha"] as? CGFloat {
      uiConfig.lightingQualityStarsInactiveColor = UIColor(hex: hex, alpha: alpha)
    }
    
    if let timerTextColor = uiConfigDic["timerTextColor"] as? [String: Any],
       let hex = timerTextColor["hex"] as? String,
       let alpha = timerTextColor["alpha"] as? CGFloat {
      uiConfig.timerTextColor = UIColor(hex: hex, alpha: alpha)
    }
    
    if let statusMessagesTextColor = uiConfigDic["statusMessagesTextColor"] as? [String: Any],
       let hex = statusMessagesTextColor["hex"] as? String,
       let alpha = statusMessagesTextColor["alpha"] as? CGFloat {
      uiConfig.statusMessagesTextColor = UIColor(hex: hex, alpha: alpha)
    }
    
    if let statusMessagesTextShadowColor = uiConfigDic["statusMessagesTextShadowColor"] as? [String: Any],
       let hex = statusMessagesTextShadowColor["hex"] as? String,
       let alpha = statusMessagesTextShadowColor["alpha"] as? CGFloat {
      uiConfig.statusMessagesTextShadowColor = UIColor(hex: hex, alpha: alpha)
    }
    
    if let heartRateTextColor = uiConfigDic["heartRateTextColor"] as? [String: Any],
       let hex = heartRateTextColor["hex"] as? String,
       let alpha = heartRateTextColor["alpha"] as? CGFloat {
      uiConfig.heartRateTextColor = UIColor(hex: hex, alpha: alpha)
    }
    
    if let heartRateTextShadowColor = uiConfigDic["heartRateTextShadowColor"] as? [String: Any],
       let hex = heartRateTextShadowColor["hex"] as? String,
       let alpha = heartRateTextShadowColor["alpha"] as? CGFloat {
      uiConfig.heartRateTextShadowColor = UIColor(hex: hex, alpha: alpha)
    }
    
    if let histogramActiveColor = uiConfigDic["histogramActiveColor"] as? [String: Any],
       let hex = histogramActiveColor["hex"] as? String,
       let alpha = histogramActiveColor["alpha"] as? CGFloat {
      uiConfig.histogramActiveColor = UIColor(hex: hex, alpha: alpha)
    }
    
    if let histogramInactiveColor = uiConfigDic["histogramInactiveColor"] as? [String: Any],
       let hex = histogramInactiveColor["hex"] as? String,
       let alpha = histogramInactiveColor["alpha"] as? CGFloat {
      uiConfig.histogramInactiveColor = UIColor(hex: hex, alpha: alpha)
    }
    
    if let showHeartRateDuringMeasurement = uiConfigDic["showHeartRateDuringMeasurement"] as? Bool {
      uiConfig.showHeartRateDuringMeasurement = showHeartRateDuringMeasurement
    }
    
    if let showLightingQualityStars = uiConfigDic["showLightingQualityStars"] as? Bool {
      uiConfig.showLightingQualityStars = showLightingQualityStars
    }
    
    if let showCountdown = uiConfigDic["showCountdown"] as? Bool {
      uiConfig.showCountdown = showCountdown
    }
    
    if let showOverlay = uiConfigDic["showOverlay"] as? Bool {
      uiConfig.showOverlay = showOverlay
    }
    
    if let showMeasurementOutline = uiConfigDic["showMeasurementOutline"] as? Bool {
      uiConfig.showMeasurementOutline = showMeasurementOutline
    }
    
    if let showStatusMessages = uiConfigDic["showStatusMessages"] as? Bool {
      uiConfig.showStatusMessages = showStatusMessages
    }
    
    if let showMeasurementStartedMessage = uiConfigDic["showMeasurementStartedMessage"] as? Bool {
      uiConfig.showMeasurementStartedMessage = showMeasurementStartedMessage
    }
    
    if let animateHeartRateImage = uiConfigDic["animateHeartRateImage"] as? Bool {
      uiConfig.animateHeartRateImage = animateHeartRateImage
    }
    
    if let showHistograms = uiConfigDic["showHistograms"] as? Bool {
      uiConfig.showHistograms = showHistograms
    }
    
    return uiConfig
  }
}

extension UIColor {
    convenience init(hex: String, alpha: CGFloat = 1.0) {
        let scanner = Scanner(string: hex)
        var rgbValue: UInt64 = 0
        scanner.scanHexInt64(&rgbValue)
        
        let r = (rgbValue & 0xff0000) >> 16
        let g = (rgbValue & 0xff00) >> 8
        let b = rgbValue & 0xff
        
        self.init(
            red: CGFloat(r) / 0xff,
            green: CGFloat(g) / 0xff,
            blue: CGFloat(b) / 0xff,
            alpha: alpha
        )
    }
}
