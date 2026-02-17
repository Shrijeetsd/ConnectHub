import React from 'react';
import {Text} from 'react-native';

const Icon = props => <Text style={props.style}>{props.name} (Icon)</Text>;

Icon.getImageSource = () => Promise.resolve({});
Icon.getRawGlyphMap = () => ({});
Icon.loadFont = () => Promise.resolve();
Icon.hasIcon = () => true;

export default {
  createIconSet: () => Icon,
  createIconSetFromFontello: () => Icon,
  createIconSetFromIcoMoon: () => Icon,
};
