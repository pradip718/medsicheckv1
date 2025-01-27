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

import UIKit
import class AVFoundation.AVCaptureDevice
import AnuraCore

@objc class StartSession: NSObject {
  @objc static let shared = StartSession()
  var api : DeepAffexMiniAPIClient!
  var measurementDelegate : MeasurementDelegate!
  var user : AnuraUser = .empty
  var measurementDefaultConfig: MeasurementConfiguration?
  var measurementDefaultUIConfig: MeasurementUIConfiguration?
  
  @objc func start(properties: String) {
    user = AnuraUser.convertFromString(properties) ?? .empty
    checkEmbeddedLicense()
    initializeAPI()
    startAnuraMeasurement()
  }
  
  @objc func synchronizeConfiguration(_ configJson: String) {
    self.measurementDefaultConfig = Configuration.getConfigurationFromJsonString(configJson)
  }
  
  @objc func synchronizeUIConfiguration(_ uiConfigJson: String) {
    self.measurementDefaultUIConfig = Configuration.getUIConfigurationFromJsonString(uiConfigJson)
  }
  
  func checkEmbeddedLicense() {
    if AppConfig.deepaffexLicenseKey.isEmpty || AppConfig.deepaffexStudyID.isEmpty {
      fatalError("You must provide a license key and study ID to use this app")
    }
  }
  
  func initializeAPI() {
    api = DeepAffexMiniAPIClient(network: WebService())
    measurementDelegate = MeasurementDelegate(api: self.api)
  }
  
  func startAnuraMeasurement() {
    // Startup flow does the following:
    //  1- Registers your device with DeepAffex using the embedded license key
    //  2- Validates the device token if a license was already registered
    //  3- Renews the token if it's expired
    //  4- Downloads the latest SDK study configuration associated with the embedded study ID
    
    api.beginStartupFlow { (sdkConfigResult) in
      switch sdkConfigResult {
      case .success(let sdkConfig):
        self.requestCameraPermissionsAndDisplayAnuraViewController(with: sdkConfig)
      case .failure(let error):
        self.startupFlowError(error)
      }
    }
  }
  
  func requestCameraPermissionsAndDisplayAnuraViewController(with sdkConfig: (Data)) {
    // Request Camera Permissions
    AVCaptureDevice.requestAccess(for: .video) { granted in
      DispatchQueue.main.async {
        if granted {
          self.presentAnuraMeasurementViewController(sdkConfig: sdkConfig)
        } else {
          self.handleCameraPermissionError()
        }
      }
    }
  }
  
  func presentAnuraMeasurementViewController(sdkConfig: Data) {
    let config = self.measurementDefaultConfig ?? .defaultConfiguration
    let uiConfig = self.measurementDefaultUIConfig ?? .defaultConfiguration

    // Set sdkConfig to measurement config
    config.studyFile = sdkConfig
            
    // Create Face Tracker
    let faceTracker = MediaPipeFaceTracker(quality: .high)
    
    // Create Anura Measurement View Controller
    let viewController = AnuraMeasurementViewController(measurementConfiguration: config,
                                                        uiConfiguration: uiConfig,
                                                        faceTracker: faceTracker)
    
    // Set Delegate
    viewController.delegate = measurementDelegate
    
    // Pass the Anura user struct to the measurement delegate
    measurementDelegate.user = user
        
    // Present View Controller
    RCTPresentedViewController()?.present(viewController, animated: true) {
      print("started Measurement")
    }
  }
  
  // MARK: Error Handling
  private func startupFlowError(_ error: Error) {
    switch error as? DeepAffexMiniAPIClient.Error {
      
    case .tokenVerificationFailed:
      tokenError()
    case .registerLicenseFailed:
      registerLicenseError()
    case .sdkConfigFailed:
      sdkConfigurationFileError()
    case .none:
      print("There was an error in starting up Anura Core: \(error.localizedDescription)")
    }
  }
  
  private func tokenError() {
    showAlert(title: "Token Error",
              message: "There was an error in verifying your DeepAffex token. Please check the error log or contact support.")
  }
  
  private func registerLicenseError() {
    showAlert(title: "License Error",
              message: "There was an error registering your DeepAffex license key. Please check the error log or contact support.")
  }
  
  private func sdkConfigurationFileError() {
    showAlert(title: "SDK Configuration File Error",
              message: "There was an error retreiving the SDK configuration file. Please check the error log or contact support.")
  }
  
  private func handleCameraPermissionError() {
    showAlert(title: "No Camera Permission",
              message: "Please grant the app access to the camera before starting a measurement")
  }
  
  private func showAlert(title: String, message: String, activateMeasurementButton: Bool = true) {
    let alert = UIAlertController(title: title,
                                  message: message,
                                  preferredStyle: .alert)
    
    let okay = UIAlertAction.init(title: "OK",
                                  style: .default) {(_) in
      UIApplication.shared.delegate?.window??.rootViewController?.dismiss(animated: true,
                                                                          completion: nil)
    }
    alert.addAction(okay)
    DispatchQueue.main.async {
      UIApplication.shared.delegate?.window??.rootViewController?.present(alert,
                                                                          animated: true,
                                                                          completion: nil)
    }
  }
}
