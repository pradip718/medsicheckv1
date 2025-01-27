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


enum DeepAffexEndpointPathsMini : String {
    case auth = "/auth"
    case renew = "/auths/renew"
    case measurements = "/measurements"
    case license = "/organizations/licenses"
    case addData = "/measurements/{MeasurementID}/data"
    case subscribeToResults = "/measurements/{MeasurementID}/results"
    case studySDKConfig = "/studies/sdkconfig"
}

protocol DeepAffexEndPoint: Endpoint {
    var token : String { get set }
}

extension DeepAffexEndPoint {
    var scheme: String {
        return "https"
    }
    
    var host: String {
        return AppConfig.deepaffexAPIHostname
    }
    
    var port: Int {
        return 443
    }
    
    var httpHeaders: [String : String]? {
        var headers = ["Content-Type": "application/json"];
        if token.isEmpty == false {
            headers["Authorization"] = "Bearer \(token)"
        }
        return headers
    }
    
    var errorType : GenericError {
        return DFXAPIError.init(code: "", message: "")
    }
}

struct WebSocketEndpoint : DeepAffexEndPoint {
    var token: String = ""
    
    var scheme: String {
        return "wss"
    }
    
    var request: URLRequest? {
        var request = request(forEndpoint: "/")
        request?.setValue("json", forHTTPHeaderField: "Sec-WebSocket-Protocol")
        return request
    }
    
    var httpMethod: HTTPMethod {
        return .GET
    }
    
    var queryItems: [URLQueryItem]? {
        return nil
    }
    
    var port: Int {
        return 443
    }
}

struct LicenseEndpoint : DeepAffexEndPoint {
    var token: String = ""
    var license : License
    
    var request: URLRequest? {
        return request(forEndpoint: DeepAffexEndpointPathsMini.license.rawValue, body: license)
    }
    
    var httpMethod: HTTPMethod {
        return .POST
    }
    
    var queryItems: [URLQueryItem]? {
        return nil
    }
}

struct CreateMeasurementEndpoint : DeepAffexEndPoint {
    var token: String = ""
    var create : CreateMeasurementRequest
    
    var request: URLRequest? {
        return request(forEndpoint: DeepAffexEndpointPathsMini.measurements.rawValue, body: create)
    }
    
    var httpMethod: HTTPMethod {
        return .POST
    }
    
    var queryItems: [URLQueryItem]? {
        return nil
    }
}

struct AddMeasurementDataEndpoint : DeepAffexEndPoint {
    var token: String = ""
    var measurementID: String
    var data : MeasurementDataRequest
    
    var request: URLRequest? {
        let template = URITemplate(template: DeepAffexEndpointPathsMini.addData.rawValue)
        let url = template.expand(["MeasurementID": measurementID])
        return request(forEndpoint: url, body: data)
    }
    
    var httpMethod: HTTPMethod {
        return .POST
    }
    
    var queryItems: [URLQueryItem]? {
        return nil
    }
}

struct GetMeasurementResultsEndpoint : DeepAffexEndPoint {
    var token: String = ""
    var measurementID: String
    
    var request: URLRequest? {
        let template = URITemplate(template: DeepAffexEndpointPathsMini.subscribeToResults.rawValue)
        let url = template.expand(["MeasurementID": measurementID])
        return request(forEndpoint: url)
    }
    
    var httpMethod: HTTPMethod {
        return .GET
    }
    
    var queryItems: [URLQueryItem]? {
        return nil
    }
}

struct VerifyTokenEndpoint : DeepAffexEndPoint {
    var token: String
    
    var request: URLRequest? {
        return request(forEndpoint: DeepAffexEndpointPathsMini.auth.rawValue)
    }
    
    var httpMethod: HTTPMethod {
        return .GET
    }
    
    var queryItems: [URLQueryItem]? {
        return nil
    }
}

struct RenewTokenEndpoint : DeepAffexEndPoint {
    var token: String
    var tokenToBeRefreshed: DeviceToken
    
    var request: URLRequest? {
        return request(forEndpoint: DeepAffexEndpointPathsMini.renew.rawValue,
                       body: tokenToBeRefreshed)
    }
    
    var httpMethod: HTTPMethod {
        return .POST
    }
    
    var queryItems: [URLQueryItem]? {
        return nil
    }
}

struct RetrieveSDKStudyConfigEndpoint : DeepAffexEndPoint {
    var token: String
    var studySDKConfigRequest : StudySDKConfigRequest
    
    var request: URLRequest? {
        return request(forEndpoint: DeepAffexEndpointPathsMini.studySDKConfig.rawValue,
                       body: studySDKConfigRequest)
    }
    
    var httpMethod: HTTPMethod {
        return .POST
    }
    
    var queryItems: [URLQueryItem]? {
        return nil
    }
}

struct DFXAPIError : GenericError {
    var code: String
    var message: String
}
