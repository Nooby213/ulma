import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import CustomButton from '@/components/common/CustomButton';
import InputField from '@/components/common/InputField';
import TitleTextField from '@/components/common/TitleTextField';
import useAuthStore from '@/store/useAuthStore'; // authStore 파일 경로에 맞게 수정해주세요

function LoginScreen() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    try {
      const response = await login(loginId, password);
      Alert.alert('로그인 성공', response.msg);
      // 여기에 로그인 성공 후 네비게이션 로직을 추가할 수 있습니다.
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Alert.alert('로그인 실패', '아이디 또는 비밀번호가 올바르지 않습니다.');
      } else {
        Alert.alert('오류', '로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TitleTextField frontLabel="아이디를 입력해주세요." />
      <InputField
        value={loginId}
        onChangeText={setLoginId}
        placeholder="아이디"
        autoCapitalize="none"
      />
      <TitleTextField frontLabel="비밀번호를 입력해주세요." />
      <InputField
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호"
        secureTextEntry
      />
      <CustomButton label="로그인 하기" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default LoginScreen;