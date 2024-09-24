import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, ScrollView, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '@/api/axios'; // axiosInstance 가져오기

interface SignupScreenProps {}

interface ErrorState {
  name: string;
  birthDate: string;
  idLastDigit: string;
  phoneNumber: string;
  verificationCode: string;
}

function SignupScreen({}: SignupScreenProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [idLastDigit, setIdLastDigit] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [resendText, setResendText] = useState('인증번호 전송');
  const [errors, setErrors] = useState<ErrorState>({ name: '', birthDate: '', idLastDigit: '', phoneNumber: '',  verificationCode: '' });

  const fadeAnim = {
    birthDate: useState(new Animated.Value(0))[0],
    phoneNumber: useState(new Animated.Value(0))[0],
    verificationCode: useState(new Animated.Value(0))[0],
    signup: useState(new Animated.Value(0))[0],
  };

  const fadeIn = (animatedValue: Animated.Value) => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (name) fadeIn(fadeAnim.birthDate);
  }, [name]);

  useEffect(() => {
    if (birthDate && idLastDigit) fadeIn(fadeAnim.phoneNumber);
  }, [birthDate, idLastDigit]);

  useEffect(() => {
    if (isVerified) fadeIn(fadeAnim.signup);
  }, [isVerified]);

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{0,4})(\d{0,4})$/);
    if (match) {
      return !match[2] ? match[1] : `${match[1]}-${match[2]}${match[3] ? `-${match[3]}` : ''}`;
    }
    return text;
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(formatPhoneNumber(text));
    setErrors(prev => ({ ...prev, phoneNumber: '' }));
  };

  const handleNumberInput = (text: string, setter: React.Dispatch<React.SetStateAction<string>>, field: keyof ErrorState) => {
    const numberOnly = text.replace(/[^0-9]/g, '');
    setter(numberOnly);
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateName = (name: string) => {
    const nameRegex = /^[가-힣a-zA-Z\s\d]{3,15}$/;
    return nameRegex.test(name);
  };

  const validateBirthDate = (birthDate: string) => {
    if (birthDate.length !== 6) return false;
    const year = parseInt(birthDate.slice(0, 2));
    const month = parseInt(birthDate.slice(2, 4));
    const day = parseInt(birthDate.slice(4, 6));
    return (year >= 0 && year <= 99) && (month >= 1 && month <= 12) && (day >= 1 && day <= 31);
  };

  const validateIdLastDigit = (digit: string) => {
    return ['1', '2', '3', '4'].includes(digit);
  };

  const validateInputs = () => {
    let newErrors: ErrorState = { name: '', birthDate: '', idLastDigit: '', phoneNumber: '', verificationCode: '', };
    let isValid = true;

    if (!validateName(name)) {
      newErrors.name = '이름을 올바르게 입력해주세요. (3-15자, 한글, 영문, 숫자만 가능)';
      isValid = false;
    }

    if (!validateBirthDate(birthDate)) {
      newErrors.birthDate = '올바른 생년월일을 입력해주세요. (YYMMDD 형식)';
      isValid = false;
    }

    if (!validateIdLastDigit(idLastDigit)) {
      newErrors.idLastDigit = '주민번호 뒷자리가 올바르지 않습니다.';
      isValid = false;
    }

    if (phoneNumber.replace(/[^0-9]/g, '').length !== 11) {
      newErrors.phoneNumber = '올바른 휴대폰 번호를 입력해주세요.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSendVerification = async () => {
    if (validateInputs()) {
      try {
        const response = await axiosInstance.post('/auth/phone', {
          phoneNumber: phoneNumber.replace(/-/g, ''), // 하이픈 제거
        });

        if (response.status === 200) {
          setShowVerificationCode(true);
          setResendText('재전송');
          fadeIn(fadeAnim.verificationCode);
          Alert.alert('인증번호가 전송되었습니다.');
        }
      } catch (error) {
        console.error('인증번호 전송 오류:', error);
        Alert.alert('인증번호 전송에 실패했습니다. 다시 시도해주세요.');
      }
    } else {
      // 경고 메시지 표시
      Alert.alert('올바른 값을 입력하세요.');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await axiosInstance.put('/auth/phone', {
        phoneNumber: phoneNumber.replace(/-/g, ''),
        verificationCode: verificationCode,
      });

      if (response.status === 200) {
        setIsVerified(true);
        setVerificationError('');
      }
    } catch (error) {
      setIsVerified(false);
      setVerificationError('인증 실패');
      console.error('인증 실패:', error);
    }
  };

  const getInputStyle = (field: keyof ErrorState) => [
    styles.input,
    errors[field] ? styles.inputError : {}
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>휴대폰 본인 확인</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            placeholder="홍길동"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrors(prev => ({ ...prev, name: '' }));
            }}
            style={getInputStyle('name')}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        </View>

        <Animated.View style={[styles.inputContainer, { opacity: fadeAnim.birthDate }]}>
          <Text style={styles.label}>주민등록번호</Text>
          <View style={styles.row}>
            <TextInput
              placeholder="생년월일 (6자리)"
              value={birthDate}
              onChangeText={(text) => handleNumberInput(text, setBirthDate, 'birthDate')}
              style={[getInputStyle('birthDate'), styles.birthInput]}
              keyboardType="numeric"
              maxLength={6}
            />
            <Text style={styles.dash}>-</Text>
            <TextInput
              placeholder="뒷자리"
              value={idLastDigit}
              onChangeText={(text) => handleNumberInput(text, setIdLastDigit, 'idLastDigit')}
              style={[getInputStyle('idLastDigit'), styles.idInput]}
              keyboardType="numeric"
              maxLength={1}
            />
            <Text>*******</Text>
          </View>
          {errors.birthDate ? <Text style={styles.errorText}>{errors.birthDate}</Text> : null}
          {errors.idLastDigit ? <Text style={styles.errorText}>{errors.idLastDigit}</Text> : null}
        </Animated.View>

        <Animated.View style={[styles.inputContainer, { opacity: fadeAnim.phoneNumber }]}>
          <Text style={styles.label}>휴대폰번호</Text>
          <View style={styles.row}>
            <TextInput
              placeholder="010-0000-0000"
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              style={[getInputStyle('phoneNumber'), styles.phoneInput]}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.button} onPress={handleSendVerification}>
              <Text style={styles.buttonText}>{resendText}</Text>
            </TouchableOpacity>
          </View>
          {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
        </Animated.View>

        {showVerificationCode && (
          <Animated.View style={[styles.inputContainer, { opacity: fadeAnim.verificationCode }]}>
            <Text style={styles.label}>인증번호</Text>
            <View style={styles.row}>
              <TextInput
                placeholder="인증번호 6자리 입력"
                value={verificationCode}
                onChangeText={(text) => handleNumberInput(text, setVerificationCode, 'verificationCode')}
                style={[styles.input, styles.codeInput]}
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
                <Text style={styles.buttonText}>확인</Text>
              </TouchableOpacity>
            </View>
            {/* 인증 성공/실패 메시지 */}
            {isVerified ? (
              <Text style={styles.successText}>인증 성공</Text>
            ) : (
              verificationError && <Text style={styles.errorText}>{verificationError}</Text>
            )}
          </Animated.View>
        )}

        {isVerified && (
          <Animated.View style={{ opacity: fadeAnim.signup }}>
            <TouchableOpacity style={styles.signupButton} onPress={() => {}}>
              <Text style={styles.signupButtonText}> 회원가입 (1/2) </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    height: 50,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  birthInput: {
    flex: 3,
  },
  idInput: {
    flex: 1,
    marginLeft: 10,
  },
  phoneInput: {
    flex: 1,
    marginRight: 10,
  },
  codeInput: {
    flex: 1,
    marginRight: 10,
  },
  dash: {
    marginHorizontal: 10,
    fontSize: 18,
    color: '#555',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#34C759',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  successText: {
    color: 'green',
    fontSize: 14,
    marginTop: 10,
  },
});

export default SignupScreen;
