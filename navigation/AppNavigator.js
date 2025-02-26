// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import navigators
import MainTabNavigator from './MainTabNavigator';

// Import module screens
import AssignScreen from '../screens/modules/AssignScreen';
import HandoverScreen from '../screens/modules/HandoverScreen';
import MaintenanceScreen from '../screens/modules/MaintenanceScreen';
import StockScreen from '../screens/modules/StockScreen';
import ReportsScreen from '../screens/modules/ReportsScreen';
import AuditScreen from '../screens/modules/AuditScreen';
import NewComplaintScreen from '../screens/modules/NewComplaintScreen';
import SearchScreen from '../screens/modules/SearchScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a237e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        {/* Module screens */}
        <Stack.Screen name="AssignScreen" component={AssignScreen} options={{ title: 'Assign Assets' }} />
        <Stack.Screen name="HandoverScreen" component={HandoverScreen} options={{ title: 'Handover Assets' }} />
        <Stack.Screen name="MaintenanceScreen" component={MaintenanceScreen} options={{ title: 'Maintenance' }} />
        <Stack.Screen name="StockScreen" component={StockScreen} options={{ title: 'Stock Inventory' }} />
        <Stack.Screen name="ReportsScreen" component={ReportsScreen} options={{ title: 'Reports & Analytics' }} />
        <Stack.Screen name="AuditScreen" component={AuditScreen} options={{ title: 'Audit' }} />
        <Stack.Screen name="NewComplaint" component={NewComplaintScreen} options={{ title: 'File Complaint' }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search Assets' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;