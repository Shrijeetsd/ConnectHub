import SmsAndroid from 'react-native-get-sms-android';
import { PermissionsAndroid, Platform } from 'react-native';

const PERMISSIONS = [
  PermissionsAndroid.PERMISSIONS.READ_SMS,
  PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
  PermissionsAndroid.PERMISSIONS.SEND_SMS,
  PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
];

const checkPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      if (Platform.Version >= 33) {
        const notification = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        if (!notification) return false;
      }

      const readSms = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
      const receiveSms = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);

      return readSms && receiveSms;
    } catch (e) {
      console.warn(e);
      return false;
    }
  }
  return true;
};

const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const permissionsToRequest = [
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      ];

      if (Platform.Version >= 33) {
        permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }

      const granted = await PermissionsAndroid.requestMultiple(permissionsToRequest);

      // Check if essential permissions are granted
      const readSms = granted[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED;
      const receiveSms = granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === PermissionsAndroid.RESULTS.GRANTED;

      return readSms && receiveSms;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

const getSms = (filter = {}) => {
  return new Promise((resolve, reject) => {
    /*
         minDate: timestamp (long)
         maxDate: timestamp (long)
         bodyRegex: string (regex to filter body)
         read: 0 or 1 (0 = unread, 1 = read)
         _id: int (message id)
         address: string (sender address)
         indexFrom: int (start index)
         maxCount: int (count to return)
        */
    SmsAndroid.list(
      JSON.stringify(filter),
      fail => {
        reject(fail);
      },
      (count, smsList) => {
        const arr = JSON.parse(smsList);
        resolve(arr);
      },
    );
  });
};

export default {
  requestPermissions,
  checkPermissions,
  getSms,
};
