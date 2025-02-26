import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Card, Avatar, Badge, Divider, Searchbar } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

// Firebase imports
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZYvwt5dOL2jr7C7E0T7kHmy1wrVpvsCQ",
  authDomain: "omkar-bcfd4.firebaseapp.com",
  projectId: "omkar-bcfd4",
  storageBucket: "omkar-bcfd4.firebasestorage.app",
  messagingSenderId: "865551458358",
  appId: "1:865551458358:web:28e626110e592a7582f897",
  measurementId: "G-5SQD2GPRNB"
};
// Color scheme for police-themed app
const PoliceColors = {
  primary: '#003366', // Dark blue
  secondary: '#1a3c61', // Slightly lighter blue
  accent: '#bf2c37', // Police red
  background: '#f5f7fa', // Light background
  cardBackground: '#ffffff', // White for cards
  text: '#333333', // Near black for text
  textLight: '#6c757d', // Gray for secondary text
  border: '#d1d9e6', // Light border color
  success: '#28a745', // Green for success indicators
  warning: '#ffc107', // Yellow for warnings
  danger: '#dc3545', // Red for alerts
  lightBlue: '#e6f0ff', // Light blue for backgrounds
  gold: '#ffd700', // Gold for badge elements
  white: '#ffffff', // White color
  darkBlue: '#00264d', // Darker blue for gradients
  lightGray: '#f0f2f5', // Light gray for backgrounds
  darkGray: '#495057', // Dark gray for text
  shadowColor: 'rgba(0, 0, 0, 0.1)', // Shadow color
};

// Define the module routes explicitly
const moduleRoutes = {
  assign: '/(tabs)/assign',
  handover: '/(tabs)/handover',
  maintenance: '/(tabs)/maintenance',
  inventory: '/(tabs)/inventory',
  reports: '/(tabs)/reports',
  alerts: '/(tabs)/alerts',
};

export default function DashboardScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [modules, setModules] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalAssets: 0,
    pendingTasks: 0,
    lowStock: 0
  });

  // Fetch data from Firebase on component mount
  useEffect(() => {
    // Load default data first
    setDefaultData();
    
    // Then try to fetch from Firebase
    fetchFirebaseData();
  }, []);

  // Set default data
  const setDefaultData = () => {
    // Define the main modules available in the dashboard
    const defaultModules = [
      {
        id: 'assign',
        title: 'Assign Module',
        icon: 'account-arrow-right',
        description: 'Assign hardware assets to police officers',
        count: 85,
      },
      {
        id: 'handover',
        title: 'Handover Module',
        icon: 'account-switch',
        description: 'Transfer assets between officers',
        count: 32,
      },
      {
        id: 'maintenance',
        title: 'Maintenance Module',
        icon: 'tools',
        description: 'Schedule and track maintenance activities',
        count: 17,
      },
      {
        id: 'inventory',
        title: 'Stock Inventory',
        icon: 'cube',
        description: 'Monitor and manage hardware inventory',
        count: 127,
      },
      {
        id: 'reports',
        title: 'Analytics',
        icon: 'stats-chart',
        description: 'Usage and performance reports',
        count: 45,
      },
      {
        id: 'alerts',
        title: 'Alerts',
        icon: 'notification-important',
        description: 'System alerts and notifications',
        count: 8,
      },
    ];

    // Alert notifications
    const defaultAlerts = [
      {
        id: 1,
        title: 'Device Lifecycle Alert',
        message: '15 laptops approaching end of lifecycle (3 months remaining)',
        type: 'warning',
        icon: 'timer-outline',
      },
      {
        id: 2,
        title: 'Maintenance Due',
        message: 'Server room air conditioning maintenance overdue by 5 days',
        type: 'danger',
        icon: 'tools',
      },
    ];

    // Set default data
    setModules(defaultModules);
    setAlerts(defaultAlerts);
    setStats({
      totalAssets: 1245,
      pendingTasks: 17,
      lowStock: 8
    });
  };

  // Fetch data from Firebase
  const fetchFirebaseData = () => {
    try {
      // Fetch modules data
      const modulesRef = ref(database, 'modules');
      onValue(modulesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setModules(data);
      });

      // Fetch other data as needed
      // This is simplified for brevity
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    }
  };

  // Helper function to get the appropriate icon for module
  const getModuleIcon = (iconName) => {
    switch (iconName) {
      case 'account-arrow-right':
        return <MaterialCommunityIcons name="account-arrow-right" size={32} color={PoliceColors.primary} />;
      case 'account-switch':
        return <MaterialCommunityIcons name="account-switch" size={32} color={PoliceColors.primary} />;
      case 'tools':
        return <FontAwesome5 name="tools" size={28} color={PoliceColors.primary} />;
      case 'cube':
        return <Ionicons name="cube" size={30} color={PoliceColors.primary} />;
      case 'stats-chart':
        return <Ionicons name="stats-chart" size={30} color={PoliceColors.primary} />;
      case 'notification-important':
        return <MaterialIcons name="notification-important" size={30} color={PoliceColors.primary} />;
      default:
        return <Ionicons name="grid" size={30} color={PoliceColors.primary} />;
    }
  };

  // Helper function to get alert color
  const getAlertColor = (type) => {
    switch (type) {
      case 'danger':
        return PoliceColors.danger;
      case 'warning':
        return PoliceColors.warning;
      case 'success':
        return PoliceColors.success;
      default:
        return PoliceColors.textLight;
    }
  };
  
  // Handles navigation to module screens safely with TypeScript
  const navigateToModule = (moduleId) => {
    // Use the predefined routes or default to a safe route
    const route = moduleRoutes[moduleId] || '/(tabs)';
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PoliceColors.darkBlue} />
      
      {/* Header with Police banner */}
      <View style={[styles.headerBanner, { backgroundColor: PoliceColors.darkBlue }]}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTitleContainer}>
            <View style={styles.badgeContainer}>
              <FontAwesome5 name="shield-alt" size={18} color={PoliceColors.gold} style={styles.badgeIcon} />
            </View>
            <View>
              <Text style={styles.appTitle}>EQUIPTRACK</Text>
              <Text style={styles.appSubtitle}>Police Inventory Management</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Avatar.Text size={40} label="IS" style={styles.avatar} color={PoliceColors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Welcome section */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>Inspector Sharma</Text>
          </View>
          <Link href="/(tabs)/notifications" asChild>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications" size={24} color={PoliceColors.text} />
              <Badge style={styles.badge}>3</Badge>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search assets, officers, or reports..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={PoliceColors.primary}
          />
        </View>

        {/* Quick stats */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="stats-chart" size={18} color={PoliceColors.primary} style={styles.sectionIcon} />
          Quick Stats
        </Text>
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: `${PoliceColors.primary}20` }]}>
                <Ionicons name="hardware-chip" size={24} color={PoliceColors.primary} />
              </View>
              <Text style={styles.statValue}>{stats.totalAssets.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Assets</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: `${PoliceColors.warning}20` }]}>
                <FontAwesome5 name="tools" size={20} color={PoliceColors.warning} />
              </View>
              <Text style={styles.statValue}>{stats.pendingTasks}</Text>
              <Text style={styles.statLabel}>Pending Tasks</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: `${PoliceColors.danger}20` }]}>
                <MaterialIcons name="inventory" size={24} color={PoliceColors.danger} />
              </View>
              <Text style={styles.statValue}>{stats.lowStock}</Text>
              <Text style={styles.statLabel}>Low Stock</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Alert Section */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="alert-circle" size={18} color={PoliceColors.primary} style={styles.sectionIcon} />
          Critical Alerts
        </Text>
        <View style={styles.alertsContainer}>
          {alerts.map((alert) => (
            <Card key={alert.id} style={[styles.alertCard, { borderLeftColor: getAlertColor(alert.type), borderLeftWidth: 4 }]}>
              <Card.Content style={styles.alertCardContent}>
                <View style={styles.alertTextContainer}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Modules Grid Section */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="grid" size={18} color={PoliceColors.primary} style={styles.sectionIcon} />
          System Modules
        </Text>
        <View style={styles.moduleGrid}>
          {modules.map((module) => (
            <TouchableOpacity 
              key={module.id} 
              style={styles.moduleItem}
              onPress={() => navigateToModule(module.id)}
            >
              <Card style={styles.moduleCard}>
                <Card.Content style={styles.moduleCardContent}>
                  <View style={styles.moduleIconContainer}>{getModuleIcon(module.icon)}</View>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <View style={styles.moduleCountContainer}>
                    <Text style={styles.moduleCount}>{module.count}</Text>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PoliceColors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  
  // Header Banner styles
  headerBanner: {
    height: 120,
    backgroundColor: PoliceColors.primary,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 45 : 25,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PoliceColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  badgeIcon: {
    shadowColor: PoliceColors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  profileButton: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatar: {
    backgroundColor: PoliceColors.secondary,
  },
  
  // Welcome section styles
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: PoliceColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: PoliceColors.border,
  },
  welcomeText: {
    fontSize: 14,
    color: PoliceColors.textLight,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PoliceColors.text,
  },
  notificationButton: {
    position: 'relative',
    padding: 5,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: PoliceColors.accent,
  },

  // Search container styles
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: PoliceColors.cardBackground,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 10,
    height: 45,
  },

  // Section title styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
    color: PoliceColors.text,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },

  // Stats section styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  statCard: {
    width: '31%',
    elevation: 3,
    borderRadius: 15,
    overflow: 'hidden',
  },
  statCardContent: {
    alignItems: 'center',
    padding: 15,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: PoliceColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: PoliceColors.textLight,
    textAlign: 'center',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: PoliceColors.text,
    marginBottom: 6,
  },

  // Alert section styles
  alertsContainer: {
    marginHorizontal: 20,
  },
  alertCard: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  alertCardContent: {
    padding: 15,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PoliceColors.text,
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: PoliceColors.textLight,
  },

  // Modules grid styles
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  moduleItem: {
    width: '48%',
    marginBottom: 15,
  },
  moduleCard: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  moduleCardContent: {
    padding: 15,
    alignItems: 'center',
  },
  moduleIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    height: 45,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PoliceColors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  moduleCountContainer: {
    backgroundColor: PoliceColors.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  moduleCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PoliceColors.primary,
  },
});