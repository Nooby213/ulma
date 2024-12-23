import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {authNavigations} from '@/constants/navigations';
import useSignupStore from '@/store/useSignupStore';
import axiosInstance from '@/api/axios'; // axiosInstance import
import {AuthStackParamList} from '@/navigations/stack/AuthStackNavigator';
import {StackNavigationProp} from '@react-navigation/stack';
import {AxiosError} from 'axios';
import {colors} from '@/constants';
import Toast from 'react-native-toast-message';

interface SignupScreenProps {}

interface ErrorState {
  name: string;
  birthDate: string;
  idLastDigit: string;
  phoneNumber: string;
  verificationCode: string;
}

function SignupScreen1({}: SignupScreenProps) {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

  const {setSignupData, setPhoneVerified, isPhoneVerified} = useSignupStore(); // useSignupStore에서 필요한 상태 가져오기

  const [name, setName] = useState(''); // 이름 입력 상태
  const [birthDate, setBirthDate] = useState(''); // 생년월일 앞자리 입력 상태
  const [idLastDigit, setIdLastDigit] = useState(''); // 뒷자리 한자리 입력 상태
  const [phoneNumber, setPhoneNumber] = useState(''); // 휴대폰 번호 입력 상태
  const [verificationCode, setVerificationCode] = useState(''); // 인증번호 입력 받는 곳
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [resendText, setResendText] = useState('인증번호 전송');
  const [errors, setErrors] = useState<ErrorState>({
    name: '',
    birthDate: '',
    idLastDigit: '',
    phoneNumber: '',
    verificationCode: '',
  });

  const [countdown, setCountdown] = useState(180);
  const [timerExpired, setTimerExpired] = useState(false);

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

  const startTimer = () => {
    setTimerExpired(false);
    setCountdown(180);
    const timerInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          setTimerExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{0,4})(\d{0,4})$/);
    if (match) {
      return !match[2]
        ? match[1]
        : `${match[1]}-${match[2]}${match[3] ? `-${match[3]}` : ''}`;
    }
    return text;
  };

  const handlePhoneNumberChange = (text: string) => {
    const formattedPhoneNumber = formatPhoneNumber(text);
    if (formattedPhoneNumber.replace(/[^0-9]/g, '').length <= 11) {
      setPhoneNumber(formattedPhoneNumber);
      setErrors(prev => ({...prev, phoneNumber: ''}));
    }
  };

  const handleNumberInput = (
    text: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    field: keyof ErrorState,
  ) => {
    const numberOnly = text.replace(/[^0-9]/g, '');
    setter(numberOnly);
    setErrors(prev => ({...prev, [field]: ''}));
  };

  const validateName = (name: string) => {
    const nameRegex = /^[가-힣a-zA-Z\s\d]{2,15}$/;
    return nameRegex.test(name);
  };

  const validateBirthDate = (birthDate: string) => {
    if (birthDate.length !== 6) return false;
    const year = parseInt(birthDate.slice(0, 2));
    const month = parseInt(birthDate.slice(2, 4));
    const day = parseInt(birthDate.slice(4, 6));
    return (
      year >= 0 &&
      year <= 99 &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
    );
  };

  const validateIdLastDigit = (digit: string) => {
    return ['1', '2', '3', '4'].includes(digit);
  };

  const validateInputs = () => {
    let newErrors: ErrorState = {
      name: '',
      birthDate: '',
      idLastDigit: '',
      phoneNumber: '',
      verificationCode: '',
    };
    let isValid = true;

    if (!validateName(name)) {
      newErrors.name =
        '이름을 올바르게 입력해주세요. (2-15자, 한글, 영어만 가능)';
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
    // TODO
    // 409 에러 발생시 이미 가입된 휴대폰 번호라는 에러 메시지 출력해야 함
    if (validateInputs()) {
      try {
        // 인증 요청 부분을 주석 처리
        const response = await axiosInstance.post('/auth/phone', {
          phoneNumber: phoneNumber.replace(/-/g, ''),
        });
        if (response.status === 200) {
          // 여기 까지 주석 처리 할 것
          setShowVerificationCode(true);
          setResendText('재전송');
          fadeIn(fadeAnim.verificationCode);
          Alert.alert('인증번호가 전송되었습니다.');
          startTimer();
          setIsVerified(false);
          setVerificationError('');
          // 이것도 주석 처리 할 것
        }
      } catch (error) {
        const err = error as AxiosError;
        if (err.response && err.response.status === 409) {
          Alert.alert('이미 가입된 휴대폰 번호입니다.');
        } else {
          console.error('인증번호 전송 오류:', err);
          Toast.show({
            text1: '인증번호 전송에 실패했습니다. 다시 시도해주세요.',
            type: 'error',
          });
        }
      }
    } else {
      Alert.alert('올바른 값을 입력하세요.');
    }
  };

  const handleVerifyCode = async () => {
    // 시간 초과시 인증 안해줄거임
    if (timerExpired) {
      Alert.alert('인증 실패', '요청 시간이 초과되었습니다.');
      return;
    }

    // 개발 테스트 환경에서는 인증번호를 999999으로 설정
    // if (verificationCode === '999999') {
    //   setIsVerified(true);
    //   setVerificationError('');
    //   setShowVerificationCode(false);
    // } else {
    //   setIsVerified(false);
    //   setVerificationError('인증번호가 일치하지 않습니다.');
    // }

    // 실제 서버 환경
    try {
      const response = await axiosInstance.put('/auth/phone', {
        phoneNumber: phoneNumber.replace(/-/g, ''), // 하이픈 제거한 휴대폰 번호
        verificationCode: verificationCode, // 입력된 인증번호
      });

      if (response.status === 200) {
        setIsVerified(true); // 인증 성공
        setVerificationError('');
        setShowVerificationCode(false);
        Alert.alert('인증 성공', '휴대폰 인증이 완료되었습니다.');
      }
    } catch (err) {
      const error = err as AxiosError;
      console.log('에러 메시지:', error.response?.data);
      if (error.response?.status === 400) {
        setVerificationError('인증번호가 일치하지 않습니다.');
      } else if (error.response?.status === 404) {
        setVerificationError('존재하지 않는 인증번호입니다.');
      } else {
        Alert.alert(
          '인증 실패',
          `서버 상태를 확인해주세요. (${error.response?.status})`,
        );
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`;
  };

  const getInputStyle = (field: keyof ErrorState) => [
    styles.input,
    errors[field] ? styles.inputError : {},
  ];

  const handleNext = () => {
    if (isVerified) {
      // 입력값들을 저장 (zustand 사용)
      setSignupData({
        name,
        birthDate,
        genderDigit: idLastDigit,
        phoneNumber: phoneNumber.replace(/-/g, ''), // 하이픈 제거하여 저장
      });

      // 다음 화면으로 이동
      navigation.navigate(authNavigations.SIGNUP2);
    } else {
      Alert.alert('인증을 완료해주세요.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            placeholder="홍길동"
            value={name}
            onChangeText={text => {
              setName(text);
              setErrors(prev => ({...prev, name: ''}));
            }}
            style={getInputStyle('name')}
            editable={!isVerified} // 인증 성공 시 수정 불가
          />
          {errors.name ? (
            <Text style={styles.errorText}>{errors.name}</Text>
          ) : null}
        </View>

        <Animated.View
          style={[styles.inputContainer, {opacity: fadeAnim.birthDate}]}>
          <Text style={styles.label}>주민등록번호</Text>
          <View style={styles.row}>
            <TextInput
              placeholder="생년월일 (6자리)"
              value={birthDate}
              onChangeText={text =>
                handleNumberInput(text, setBirthDate, 'birthDate')
              }
              style={[getInputStyle('birthDate'), styles.birthInput]}
              keyboardType="numeric"
              maxLength={6}
              editable={!isVerified} // 인증 성공 시 수정 불가
            />
            <Text style={styles.dash}>-</Text>
            <TextInput
              placeholder="●"
              value={idLastDigit}
              onChangeText={text =>
                handleNumberInput(text, setIdLastDigit, 'idLastDigit')
              }
              style={[getInputStyle('idLastDigit'), styles.idInput]}
              keyboardType="numeric"
              maxLength={1}
              editable={!isVerified} // 인증 성공 시 수정 불가
            />
            <Text style={{marginHorizontal: 10}}>● ● ● ● ● ●</Text>
          </View>
          {errors.birthDate ? (
            <Text style={styles.errorText}>{errors.birthDate}</Text>
          ) : null}
          {errors.idLastDigit ? (
            <Text style={styles.errorText}>{errors.idLastDigit}</Text>
          ) : null}
        </Animated.View>

        <Animated.View
          style={[styles.inputContainer, {opacity: fadeAnim.phoneNumber}]}>
          <Text style={styles.label}>휴대폰번호</Text>
          <View style={styles.row}>
            <TextInput
              placeholder="010-0000-0000"
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              style={[getInputStyle('phoneNumber'), styles.phoneInput]}
              keyboardType="phone-pad"
              editable={!isVerified} // 인증 완료 시 수정 불가
              maxLength={13} // 하이픈 포함 최대 13자
            />
            {!isVerified && (
              <TouchableOpacity
                style={styles.button}
                onPress={handleSendVerification}>
                <Text style={styles.buttonText}>{resendText}</Text>
              </TouchableOpacity>
            )}
          </View>
          {errors.phoneNumber ? (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
          ) : null}
          {isVerified && <Text style={styles.successText}>인증 성공</Text>}
        </Animated.View>

        {showVerificationCode && !isVerified && (
          <Animated.View
            style={[
              styles.inputContainer,
              {opacity: fadeAnim.verificationCode},
            ]}>
            <Text style={styles.label}>인증번호</Text>
            <View style={styles.row}>
              <TextInput
                placeholder="인증번호 6자리 입력"
                value={verificationCode}
                onChangeText={text =>
                  handleNumberInput(
                    text,
                    setVerificationCode,
                    'verificationCode',
                  )
                }
                style={[styles.input, styles.codeInput]}
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleVerifyCode}>
                <Text style={styles.buttonText}>확인</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.verificationResultContainer}>
              {!timerExpired && (
                <Text style={styles.timerText}>{formatTime(countdown)}</Text>
              )}
              {verificationError && (
                <Text style={styles.errorText}>{verificationError}</Text>
              )}
            </View>
          </Animated.View>
        )}

        {isVerified && (
          <Animated.View style={{opacity: fadeAnim.signup}}>
            <TouchableOpacity style={styles.signupButton} onPress={handleNext}>
              <Text style={styles.signupButtonText}>다음</Text>
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
    backgroundColor: colors.LIGHTGRAY,
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
    // flex: 0.5,
    width: 40,
    fontSize: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: colors.GREEN_700,
    paddingHorizontal: 15,
    paddingVertical: 13,
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
    backgroundColor: colors.GREEN_300,
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
    marginTop: 5,
  },
  timerText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  verificationResultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
});

export default SignupScreen1;
