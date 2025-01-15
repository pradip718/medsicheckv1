/*
 *              Copyright (c) 2016-2023, Nuralogix Corp.
 *                      All Rights reserved
 *
 *      THIS SOFTWARE IS LICENSED BY AND IS THE CONFIDENTIAL AND
 *      PROPRIETARY PROPERTY OF NURALOGIX CORP. IT IS
 *      PROTECTED UNDER THE COPYRIGHT LAWS OF THE USA, CANADA
 *      AND OTHER FOREIGN COUNTRIES. THIS SOFTWARE OR ANY
 *      PART THEREOF, SHALL NOT, WITHOUT THE PRIOR WRITTEN CONSENT
 *      OF NURALOGIX CORP, BE USED, COPIED, DISCLOSED,
 *      DECOMPILED, DISASSEMBLED, MODIFIED OR OTHERWISE TRANSFERRED
 *      EXCEPT IN ACCORDANCE WITH THE TERMS AND CONDITIONS OF A
 *      NURALOGIX CORP SOFTWARE LICENSE AGREEMENT.
 */

// Your DeepAffex license key and study ID can be obtained by your administrator from DeepAffex Dashboard: https://dashboard.deepaffex.ai
const AppConfig = {
  // Must provide a DeepAffex license key for the app to work
  deepaffexLicenseKey: 'dd3106bf-c0f0-465f-9d5f-a98b03663494',

  // Must provide a study ID to send measurement data
  deepaffexStudyID: '626c4642-0ce2-47a9-a969-876892ce5f6f',

  // DeepAffex API Hostname
  // International: api.deepaffex.ai
  // China: api.deepaffex.cn
  deepaffexAPIHostname: 'api.deepaffex.ai',
};

export default AppConfig;
