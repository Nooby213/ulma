import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import Modal from 'react-native-modal';
import {NavigationProp, useNavigation} from '@react-navigation/native';
<<<<<<< HEAD:Frontend/ulma/src/screens/Events/InputOptionModal.tsx
import {payStackParamList} from '@/navigations/stack/PayStackNavigator';
import {eventNavigations, payNavigations} from '@/constants/navigations';
import usePayStore from '@/store/usePayStore';
=======
import {payNavigations} from '@/constants/navigations';
import {payStackParamList} from '@/navigations/stack/PayStackNavigator';
import {colors} from '@/constants';
>>>>>>> b527ec73bdb4dbf0ee1b73a19b0d5d6d6136e2b5:Frontend/ulma/src/screens/Pay/InputOptionModal.tsx

interface InputOptionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDirectRegister: () => void;
}

// 옵션 정의
const options = [
  {
    key: '1',
    label: '계좌 내역 불러오기',
    description: '계좌 내역에서 선택 후 바로 등록해보세요.',
    imageUrl: require('@/assets/Pay/modal/option1.png'),
  },
  {
    key: '2',
    label: '엑셀 등록하기',
    description: '적어 놓은 내역을 등록해보세요.',
    imageUrl: require('@/assets/Pay/modal/option2.png'),
  },
  {
    key: '3',
    label: '직접 등록하기',
    description: '직접 받은 경조사비를 등록해보세요.',
    imageUrl: require('@/assets/Pay/modal/option3.png'),
  },
];

function InputOptionModal({
  isVisible,
  onClose,
  onDirectRegister,
}: InputOptionModalProps) {
  const navigation = useNavigation<NavigationProp<payStackParamList>>();

  // 계좌 내역 불러오기
  const handleAccountHistory = () => {
    console.log('계좌 내역 불러오기 실행');
<<<<<<< HEAD:Frontend/ulma/src/screens/Events/InputOptionModal.tsx
    getAccountInfo();
    navigation.navigate(eventNavigations.ACCOUNT_HISTORY);
=======
    navigation.navigate('Accounthistory');
>>>>>>> b527ec73bdb4dbf0ee1b73a19b0d5d6d6136e2b5:Frontend/ulma/src/screens/Pay/InputOptionModal.tsx
    onClose(); // 모달 닫기
  };

  // 엑셀 화면으로 이동
  const handleExcelRegister = () => {
    // ExcelScreen으로 파일 없이 이동
    navigation.navigate('ExcelScreen', {});
    onClose(); // 모달 닫기
  };

  // 직접 등록하기
  const handleDirectRegister = () => {
    onDirectRegister(); // 직접 등록하기 호출
    onClose(); // 모달 닫기
  };

  const handlePress = (key: string) => {
    if (key === '1') {
      handleAccountHistory();
    } else if (key === '2') {
      handleExcelRegister();
    } else if (key === '3') {
      handleDirectRegister();
    }
  };

  const renderItem = ({item}: {item: (typeof options)[0]}) => (
    <TouchableOpacity onPress={() => handlePress(item.key)}>
      <View style={styles.optionContainer}>
        <Image style={styles.icon} source={item.imageUrl} />
        <View style={styles.textContainer}>
          <Text style={styles.optionLabel}>{item.label}</Text>
          <Text style={styles.optionDescription}>{item.description}</Text>
        </View>
        <View style={styles.arrow}>
          <Icon name="chevron-right" size={20} color={colors.BLACK} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modalContainer}>
      <View style={styles.modalBody}>
        <FlatList
          data={options}
          renderItem={renderItem}
          keyExtractor={item => item.key}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  modalBody: {
    backgroundColor: colors.WHITE,
    paddingBottom: '20%',
    paddingTop: '3%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 7,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
  },
  optionDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.GRAY_700,
    marginTop: 5,
  },
  arrow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InputOptionModal;