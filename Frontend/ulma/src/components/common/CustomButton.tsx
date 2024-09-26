import React from 'react';
import {
  Dimensions,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import {colors} from '@/constants';

interface CustomButtonProps extends PressableProps {
  label: string;
  variant?: 'filled' | 'outlined';
  size?: 'large' | 'medium';
  inValid?: boolean;
  customStyle?: StyleProp<ViewStyle>; // 타입을 StyleProp<ViewStyle>로 변경
  howDown?: number;
}

const deviceHeight = Dimensions.get('screen').height;

function CustomButton({
  label,
  variant = 'filled',
  size = 'large',
  inValid = false,
  customStyle,
  howDown = 30,
  ...props
}: CustomButtonProps) {
  return (
    <View style={styles.wrap}>
      <Pressable
        disabled={inValid}
        style={({pressed}) => [
          styles.container,
          pressed ? styles[`${variant}Pressed`] : styles[variant],
          inValid && styles.inValid,
          customStyle ? customStyle : null, // customStyle이 있으면 추가
          {bottom: howDown},
        ]}
        {...props}>
        <View style={styles[size]}>
          <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
  },
  inValid: {
    opacity: 0.5,
  },
  filled: {
    backgroundColor: colors.GREEN_700,
  },
  outlined: {
    backgroundColor: colors.GREEN_300,
  },
  filledPressed: {
    backgroundColor: colors.GREEN_300,
  },
  outlinedPressed: {
    backgroundColor: colors.GREEN_300,
    opacity: 0.5,
  },
  maxSize: {
    width: '100%',
    paddingVertical: deviceHeight > 700 ? 16 : 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  large: {
    width: '90%',
    paddingVertical: deviceHeight > 700 ? 16 : 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  medium: {
    width: '45%',
    paddingVertical: deviceHeight > 700 ? 16 : 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  filledText: {
    color: colors.WHITE,
  },
  outlinedText: {
    color: colors.GREEN_700,
  },
});

export default CustomButton;
