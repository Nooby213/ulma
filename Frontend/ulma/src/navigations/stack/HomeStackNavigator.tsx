import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '@/constants';
import { homeNavigations } from '@/constants/navigations';

import ScheduleMainScreen from '@/screens/Home/ScheduleMainScreen';
import ScheduleAddScreen from '@/screens/Home/ScheduleAddScreen';
import FriendsListScreen from '@/screens/Freinds/FriendsListScreen';
import FriendsDetailScreen from '@/screens/Freinds/FriendsDeatilScreen';

export type homeStackParamList = {
  [homeNavigations.SCHEDULE_MAIN]: undefined;
  [homeNavigations.SCHEDULE_ADD]: { selectedUser?: { guestId: number; name: string } };
  [homeNavigations.SELECT_FRIEND]: undefined;
  [homeNavigations.FRIENDS_DETAIL]: { guestId: number }; // guestId를 받아오는 디테일 페이지
};

const Stack = createStackNavigator<homeStackParamList>();

function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
<<<<<<< HEAD
        cardStyle: {
          backgroundColor: colors.WHITE,
        },
        headerStyle: {
          backgroundColor: colors.WHITE,
        },
        headerTitleAlign: 'left',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
        headerTintColor: colors.BLACK,
      }}>
=======
        cardStyle: { backgroundColor: colors.WHITE },
        headerStyle: { backgroundColor: colors.WHITE },
        headerTitleAlign: 'left',
        headerTitleStyle: { fontSize: 18, fontWeight: 'bold' },
        headerTintColor: colors.BLACK,
      }}
    >
>>>>>>> 0634bef121e43bef7cf4344f053a62853915a7ee
      <Stack.Screen
        name={homeNavigations.SCHEDULE_MAIN}
        component={ScheduleMainScreen}
        options={({ navigation }) => ({
          headerTitle: '경조사 일정 관리',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate(homeNavigations.SCHEDULE_ADD)}
              style={{ marginRight: 15 }}
            >
              <Icon name="add" size={24} color={colors.BLACK} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name={homeNavigations.SCHEDULE_ADD}
        component={ScheduleAddScreen}
        options={{
          headerTitle: '경조사 일정 추가',
        }}
      />
      <Stack.Screen
        name={homeNavigations.SELECT_FRIEND}
        component={FriendsListScreen}
        options={{
          headerTitle: '지인 선택',
        }}
      />
      <Stack.Screen
        name={homeNavigations.FRIENDS_DETAIL}
        component={FriendsDetailScreen}
        options={{
          headerTitle: '거래내역 조회',
        }}
      />
      <Stack.Screen
        name={homeNavigations.LANDING} // LandingPage 추가
        component={LandingPage}
        options={{
          headerTitle: '홈',
        }}
      />
    </Stack.Navigator>
  );
}

export default HomeStackNavigator;