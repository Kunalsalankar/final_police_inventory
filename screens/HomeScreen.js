// src/screens/HomeScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import HeaderBar from '../components/common/HeaderBar';
import Card from '../components/common/Card';
import StatCard from '../components/modules/StatCard';
import ModuleCard from '../components/modules/ModuleCard';
import ActivityItem from '../components/modules/ActivityItem';
import QuickActionButton from '../components/modules/QuickActionButton';

const HomeScreen = ({ navigation }) => {
  // Mock data for statistics
  const [stats] = useState({
    totalAssets: 482,
    pendingComplaints: 17,
    schedulesMaintenance: 8,
    lowStockItems: 5,
  });

  // Mock data for usage chart
  const chartData = {
    labels: ['Comp', 'Comm', 'Body Cam', 'Server', 'Other'],
    datasets: [
      {
        data: [70, 82, 65, 90, 50],
      },
    ],
  };

  // Recent activity mock data
  const recentActivities = [
    {
      id: 1,
      type: 'assignment',
      message: 'Laptop #LP1289 assigned to SI Anand Sharma',
      time: '35 minutes ago',
      icon: 'laptop',
    },
    {
      id: 2,
      type: 'maintenance',
      message: 'Radio device #RD543 scheduled for maintenance',
      time: '2 hours ago',
      icon: 'radio',
    },
    {
      id: 3,
      type: 'complaint',
      message: 'New complaint #C2023 from Indore North PS',
      time: '4 hours ago',
      icon: 'alert-circle',
    },
    {
      id: 4,
      type: 'transfer',
      message: 'Server equipment transferred from HQ to Cyber Cell',
      time: '1 day ago',
      icon: 'server',
    },
  ];

  // Module links
  const modules = [
    {
      id: 1,
      name: 'Assign',
      icon: 'clipboard-account',
      screen: 'AssignScreen',
      description: 'Assign inventory to officers',
    },
    {
      id: 2,
      name: 'Handover',
      icon: 'hand-right',
      screen: 'HandoverScreen',
      description: 'Transfer assets between officers',
    },
    {
      id: 3,
      name: 'Maintenance',
      icon: 'tools',
      screen: 'MaintenanceScreen',
      description: 'Manage service requests and repairs',
    },
    {
      id: 4,
      name: 'Stock',
      icon: 'package-variant',
      screen: 'StockScreen',
      description: 'Monitor inventory levels',
    },
    {
      id: 5,
      name: 'Reports',
      icon: 'file-chart',
      screen: 'ReportsScreen',
      description: 'View analytics and reports',
    },
    {
      id: 6,
      name: 'Audit',
      icon: 'clipboard-check',
      screen: 'AuditScreen',
      description: 'Perform inventory audits',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#1a237e" barStyle="light-content" />
      <HeaderBar 
        title="EQUIPTRACK" 
        subtitle="MP Police Inventory Management"
        onNotificationPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView style={styles.container}>
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <StatCard 
            icon="desktop-tower-monitor" 
            number={stats.totalAssets} 
            label="Total Assets" 
          />
          
          <StatCard 
            icon="alert" 
            number={stats.pendingComplaints} 
            label="Pending Complaints" 
            color="#f44336"
          />
          
          <StatCard 
            icon="calendar-clock" 
            number={stats.schedulesMaintenance} 
            label="Scheduled Maintenance" 
            color="#ff9800"
          />
          
          <StatCard 
            icon="package-down" 
            number={stats.lowStockItems} 
            label="Low Stock Items" 
            color="#4caf50"
          />
        </View>

        {/* Main Modules */}
        <Text style={styles.sectionTitle}>Modules</Text>
        <View style={styles.modulesContainer}>
          {modules.map(module => (
            <ModuleCard
              key={module.id}
              name={module.name}
              icon={module.icon}
              description={module.description}
              onPress={() => navigation.navigate(module.screen)}
            />
          ))}
        </View>

        {/* Usage Chart */}
        <Text style={styles.sectionTitle}>Equipment Utilization</Text>
        <Card style={styles.chartCard}>
          <BarChart
            data={chartData}
            width={340}
            height={220}
            yAxisSuffix="%"
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(26, 35, 126, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        </Card>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentActivities.map(activity => (
          <ActivityItem
            key={activity.id}
            type={activity.type}
            message={activity.message}
            time={activity.time}
            icon={activity.icon}
            onPress={() => console.log(`Activity ${activity.id} clicked`)}
          />
        ))}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <QuickActionButton
            icon="qrcode-scan"
            text="Scan QR"
            onPress={() => navigation.navigate('ScanQR')}
          />
          
          <QuickActionButton
            icon="clipboard-plus"
            text="New Complaint"
            onPress={() => navigation.navigate('NewComplaint')}
          />
          
          <QuickActionButton
            icon="magnify"
            text="Search Asset"
            onPress={() => navigation.navigate('Search')}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>MP Police EQUIPTRACK v1.0</Text>
          <Text style={styles.footerText}>SIH2024 - Team Agroconnect</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
    color: '#333',
  },
  modulesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartCard: {
    marginBottom: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9e9e9e',
  },
});

export default HomeScreen;