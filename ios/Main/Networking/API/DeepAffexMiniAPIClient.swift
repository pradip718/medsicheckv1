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

class DeepAffexMiniAPIClient : DeepAffexMiniAPIProtocol {
    
    enum Error : Swift.Error {
        case tokenVerificationFailed
        case registerLicenseFailed
        case sdkConfigFailed
    }
    
    var network : WebServiceProtocol
    
    // Note: We do not reccomend storing the DFX API token in in UserDefaults
    // Please use secure storage, such as system keychain
    var token : String {
       get {
        return UserDefaults.standard.string(forKey: #function) ?? ""
       }
       set {
           UserDefaults.standard.set(newValue, forKey: #function)
       }
    }
    
    var refreshToken : String {
       get {
        return UserDefaults.standard.string(forKey: #function) ?? ""
       }
       set {
           UserDefaults.standard.set(newValue, forKey: #function)
       }
    }
    
    private var lastSDKConfigHash : String? {
        get {
            return UserDefaults.standard.string(forKey: #function)
        }
        set {
            UserDefaults.standard.set(newValue, forKey: #function)
        }
    }
    
    private var lastSDKConfig : Data? {
        get {
            return UserDefaults.standard.data(forKey: #function)
        }
        set {
            UserDefaults.standard.set(newValue, forKey: #function)
        }
    }
    
    init(network: WebServiceProtocol) {
        self.network = network
    }
    
    func beginStartupFlow(_ completion: @escaping ResultCallback<Data>) {
        if token.isEmpty {
            // License hasn't been registered yet
            registerLicenseAndRetrieveSDKConfig(completion)
        } else {
            // License was already registered,
            // so checking if the DeepAffex API token is still valid
            // if not, refresh the token
            verifyToken { [weak self] (result) in
                switch result {
                case .success(let hasValidToken):
                    if hasValidToken {
                        // With a valid token, the latest SDK study configuration can be retrieved
                        self?.retrieveSDKConfig(completion)
                    } else {
                        self?.renewToken { result in
                            switch result {
                            case .success(_):
                                self?.retrieveSDKConfig(completion)
                            case .failure(_):
                                self?.registerLicenseAndRetrieveSDKConfig(completion)
                            }
                        }
                    }
                case .failure(_):
                    completion(.failure(Error.tokenVerificationFailed))
                }
            }
        }
    }
    
    func registerLicense(_ license: License, _ completion: @escaping (NetworkResult<DeviceToken>) -> Void) {
        let endpoint = LicenseEndpoint(token: token, license: license)
        network.request(endpoint, waitFor: 0) { (result : NetworkResult<DeviceToken>) in
            switch result {
            case .success(let tokenResponse):
                self.token = tokenResponse.token
                self.refreshToken = tokenResponse.refreshToken
            default:
                break
            }
            completion(result)
        }
    }
    
    func retrieveStudySDKConfig(studyID: String, sdkID: String, _ completion: @escaping ResultCallback<Data>) {
        let sdkConfigRequest = StudySDKConfigRequest(studyID: studyID,
                                                     sdkID: sdkID,
                                                     md5Hash: lastSDKConfigHash)
        let endpoint = RetrieveSDKStudyConfigEndpoint(token: token,
                                                      studySDKConfigRequest: sdkConfigRequest)
        network.request(endpoint, waitFor: 0) { [weak self] (result: NetworkResult<StudySDKConfigData>) in
            switch result {
            case .success(let configData):
                if let sdkConfigData = Data(base64Encoded: configData.configFile) {
                    self?.lastSDKConfig = sdkConfigData
                    completion(.success(sdkConfigData))
                } else if let lastSDKConfig = self?.lastSDKConfig {
                    completion(.success(lastSDKConfig))
                } else {
                    completion(.failure(Error.sdkConfigFailed))
                }
            case .failure(let error):
                if let lastSDKConfig = self?.lastSDKConfig {
                    completion(.success(lastSDKConfig))
                } else {
                    completion(.failure(error))
                }
            }
        }
    }
    
    func createMeasurement(studyID: String, resolution: Int, partnerID: String?, _ completion: @escaping  (NetworkResult<ID>) -> Void) {
        let create = CreateMeasurementRequest(studyID: studyID,
                                              resolution: resolution,
                                              partnerID: partnerID)
        let endpoint = CreateMeasurementEndpoint(token: token, create: create)
        network.request(endpoint, waitFor: 0, completion: completion)
    }
    
    func addData(measurementID: String, data: MeasurementDataRequest, _ completion: @escaping (NetworkResult<ID>) -> Void) {
        let addMeasurementData = AddMeasurementDataEndpoint(token: token, measurementID: measurementID, data: data)
        network.request(addMeasurementData, waitFor: 0, completion: completion)
    }
    
    func verifyToken(_ completion: @escaping ResultCallback<Bool>) {
        let verifyToken = VerifyTokenEndpoint(token: token)
        network.request(verifyToken, waitFor: 0) { (result: NetworkResult<TokenStatus>) in
            switch result {
            case .success(let tokenStatus):
                completion(.success(tokenStatus.activeLicense == true))
            case .failure(let error as HTTPStatusCode):
                if error == .unauthorized || error == .forbidden {
                    completion(.success(false))
                } else {
                    completion(.failure(error))
                }
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }
    
    func renewToken(_ completion: @escaping ResultCallback<DeviceToken>) {
        let tokenToBeRefreshed = DeviceToken(token: token, refreshToken: refreshToken)
        let request = RenewTokenEndpoint(token: "", tokenToBeRefreshed: tokenToBeRefreshed)
        network.request(request, waitFor: 0) { (result: NetworkResult<DeviceToken>) in
            switch result {
            case .success(let tokenResponse):
                self.token = tokenResponse.token
                self.refreshToken = tokenResponse.refreshToken
                completion(.success(tokenResponse))
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }
    
    func cancelAll() {
        network.clearRequests()
    }
    
    //MARK: - Helpers
    
    func registerLicenseAndRetrieveSDKConfig(_ completion: @escaping ResultCallback<Data>) {
        registerLicense { [weak self] (result) in
            switch result {
            case .success(()):
                self?.retrieveSDKConfig(completion)
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }
    
    func registerLicense(_ completion: @escaping ResultCallback<Void>) {
        guard let bundleIdentifier = Bundle.main.bundleIdentifier,
              let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String,
              let appName = Bundle.main.infoDictionary?["CFBundleDisplayName"] as? String else {
            completion(.failure(Error.registerLicenseFailed))
            return
        }
        
        let license = License(key: AppConfig.deepaffexLicenseKey,
                              deviceTypeID: "IPHONE",
                              name: appName,
                              identifier: bundleIdentifier,
                              version: appVersion)
        
        registerLicense(license) { (result : NetworkResult<DeviceToken>) in
            switch result {
            case .success(_):
                completion(.success(()))
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }
    
    func retrieveSDKConfig(_ completion: @escaping ResultCallback<Data>) {
        retrieveStudySDKConfig(studyID: AppConfig.deepaffexStudyID,
                                   sdkID: "default",
                                   completion)
    }
}
