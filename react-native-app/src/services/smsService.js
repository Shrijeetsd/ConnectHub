import SmsAndroid from 'react-native-get-sms-android';
import { PermissionsAndroid, Platform } from 'react-native';

const requestPermissions = async () => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.READ_SMS,
                PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
                PermissionsAndroid.PERMISSIONS.SEND_SMS, // if needed
            ]);
            return granted;
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
            (fail) => {
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
    getSms,
};
