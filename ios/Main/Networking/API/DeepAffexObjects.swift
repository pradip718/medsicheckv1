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

struct ID: Codable {
    let id: String
    
    enum CodingKeys: String, CodingKey {
        case id = "ID"
    }
}

struct DeviceToken: Codable {
    let token, refreshToken: String
    
    enum CodingKeys: String, CodingKey {
        case token = "Token"
        case refreshToken = "RefreshToken"
    }
}

struct License: Codable {
    let key, deviceTypeID, name, identifier: String
    let version: String
    var tokenExpiresIn: Int?
    var refreshTokenExpiresIn: Int?
    
    enum CodingKeys: String, CodingKey {
        case key = "Key"
        case deviceTypeID = "DeviceTypeID"
        case name = "Name"
        case identifier = "Identifier"
        case version = "Version"
        case tokenExpiresIn = "TokenExpiresIn"
        case refreshTokenExpiresIn = "RefreshTokenExpiresIn"
    }
}

struct CreateMeasurementRequest: Codable {
    let studyID: String
    let resolution: Int
    let partnerID: String?
    
    enum CodingKeys: String, CodingKey {
        case studyID = "StudyID"
        case resolution = "Resolution"
        case partnerID = "PartnerID"
    }
}

struct MeasurementDataRequest: Codable {
    
    enum Action: String, Codable {
        case firstProcess = "FIRST::PROCESS"
        case firstIgnore = "FIRST::IGNORE"
        
        case chunkProcess = "CHUNK::PROCESS"
        case chunkIgnore = "CHUNK::IGNORE"
        
        case lastProcess = "LAST::PROCESS"
        case lastIgnore = "LAST::IGNORE"
    }
    
    let action: Action
    let payload: Data
    
    enum CodingKeys: String, CodingKey {
        case action = "Action"
        case payload = "Payload"
    }
}

struct TokenStatus: Codable, Equatable {

    var organizationID: String?
    var id: String?
    var type: String?
    var deviceID: String?
    var exp: Int?
    var iat: Int?
    var iss: String?
    var roleID: String?
    var activeLicense: Bool?

    enum CodingKeys: String, CodingKey {
        case organizationID = "OrganizationID"
        case id = "ID"
        case type = "Type"
        case deviceID = "DeviceID"
        case exp = "exp"
        case iat = "iat"
        case iss = "iss"
        case roleID = "RoleID"
        case activeLicense = "ActiveLicense"
    }
}

struct StudySDKConfigRequest: Codable {
    let studyID: String
    let sdkID: String
    let md5Hash: String?
    
    enum CodingKeys: String, CodingKey {
        case studyID = "StudyID"
        case sdkID = "SDKID"
        case md5Hash = "MD5Hash"
    }
}

struct StudySDKConfigData: Codable, Equatable {
    let configFile: String
    let md5Hash: String
    
    enum CodingKeys: String, CodingKey {
        case configFile = "ConfigFile"
        case md5Hash = "MD5Hash"
    }
}
