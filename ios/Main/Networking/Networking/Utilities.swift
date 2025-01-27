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

extension Data {
    
    var requestID: String? {
        guard self.count >= 13 else {
            return nil
        }
        let data = subdata(in: 3..<13)
        return String(data: data, encoding: .utf8)
    }
    
    var responseID: String? {
        guard self.count >= 10 else {
            return nil
        }
        let data = subdata(in: 0..<10)
        return String(data: data, encoding: .utf8)
    }
    
    var responseBody: Data {
        guard self.count > 13 else {
            return Data()
        }
        return advanced(by: 13)
    }
}
