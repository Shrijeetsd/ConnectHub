import React from 'react';
import {View, Text} from 'react-native';

const WebView = props => {
  return (
    <View style={[{flex: 1, backgroundColor: 'white'}, props.style]}>
      <div style={{padding: 10, backgroundColor: '#eee', marginBottom: 5}}>
        <Text>WebView Source: {props.source?.uri}</Text>
      </div>
      <iframe
        src={props.source?.uri}
        style={{width: '100%', height: '100%', border: 'none', flex: 1}}
        title="webview-mock"
      />
    </View>
  );
};

export {WebView};
export default WebView;
