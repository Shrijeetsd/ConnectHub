jest.mock('react-native-background-actions', () => ({
    start: jest.fn(),
    stop: jest.fn(),
    isRunning: jest.fn(() => false),
}));

jest.mock('react-native-encrypted-storage', () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-device-info', () => ({
    getModel: jest.fn(() => 'Test Device'),
    getUniqueId: jest.fn(() => 'test-id'),
    getVersion: jest.fn(() => '1.0'),
}));

jest.mock('react-native-get-sms-android', () => ({
    list: jest.fn((filter, fail, success) => success(0, '[]')),
}));

jest.mock('react-native-webview', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        WebView: (props) => <View {...props} />,
    };
});

jest.mock('@sentry/react-native', () => ({
    init: jest.fn(),
    wrap: (App) => App,
}));
