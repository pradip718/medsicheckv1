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

protocol DeepAffexMiniAPIProtocol {
    var token: String { get }
    
    // Startup flow does the following:
    //  1- Registers your device with DeepAffex using the embedded license key
    //  2- Validates the device token if a license was already registered
    //  3- Renews the token if it's expired
    //  4- Downloads the latest SDK study configuration associated with the embedded study ID
    func beginStartupFlow(_ completion: @escaping ResultCallback<Data>)
    
    // https://dfxapiversion10.docs.apiary.io/#reference/0/organizations/register-license
    func registerLicense(_ license: License, _ completion: @escaping ResultCallback<DeviceToken>)
    
    // https://dfxapiversion10.docs.apiary.io/#reference/0/studies/retrieve-sdk-study-config-data
    func retrieveStudySDKConfig(studyID: String, sdkID: String, _ completion: @escaping ResultCallback<Data>)
    
    // https://dfxapiversion10.docs.apiary.io/#reference/0/measurements/create
    func createMeasurement(studyID: String, resolution: Int, partnerID: String?, _ completion: @escaping ResultCallback<ID>)
    
    // https://dfxapiversion10.docs.apiary.io/#reference/0/measurements/add-data
    func addData(measurementID: String, data: MeasurementDataRequest, _ completion: @escaping ResultCallback<ID>)
    
    // https://dfxapiversion10.docs.apiary.io/#reference/0/general/verify-token
    func verifyToken(_ completion: @escaping ResultCallback<Bool>)
    
    // https://dfxapiversion10.docs.apiary.io/#reference/0/auths/renew
    func renewToken(_ completion: @escaping ResultCallback<DeviceToken>)
    
    func cancelAll()
}
