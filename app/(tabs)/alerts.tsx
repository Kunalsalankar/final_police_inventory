import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, StatusBar, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Card, Avatar, Badge, Divider, Searchbar } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

// Firebase imports
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, get } from "firebase/database";
import { getFirestore, collection, getDocs, query, limit, orderBy } from 'firebase/firestore';

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

// Define interfaces for our data types
interface Module {
  id: string;
  title: string;
  icon: string;
  description: string;
  count: number;
}

interface Alert {
  id: number;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'success';
  timestamp?: number;
  priority?: number;
  icon?: string;
}

interface Stats {
  totalAssets: number;
  pendingTasks: number;
  lowStock: number;
}

interface FirestoreItem {
  id: string;
  title: string;
  description: string;
  createdAt?: any;
  status?: string;
  [key: string]: any; // Additional fields from Firestore
}

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
}

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
const moduleRoutes: Record<string, string> = {
  assign: '/assign',
  handover: '/handover',
  maintenance: '/maintenance',
  inventory: '/inventory',
  reports: '/reports',
  alerts: '/alerts',
};

// Initialize Firebase (only once)
let app: any;
let db: any;
let firestoreDb: any;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  firestoreDb = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export default function DashboardScreen(): React.ReactElement {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalAssets: 0,
    pendingTasks: 0,
    lowStock: 0
  });
  const [firestoreItems, setFirestoreItems] = useState<FirestoreItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Inspector Sharma");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch all data from Firebase
  const fetchAllData = useCallback(async (): Promise<void> => {
    try {
      // Set default data first (as fallback)
      setDefaultData();
      
      // Fetch user profile
      fetchUserProfile();
      
      // Parallel data fetching for better performance
      await Promise.all([
        fetchModuleData(),
        fetchAlertData(),
        fetchStatsData(),
        fetchNotificationData(),
        fetchFirestoreData()
      ]);
      
      // Update last fetched timestamp
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error("Data fetching error:", error);
      setError("Failed to fetch dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllData();
  }, [fetchAllData]);

  // Initialize and fetch data on component mount
  useEffect(() => {
    fetchAllData();
    
    // Set up real-time listeners for critical data
    const modulesRef = ref(db, 'modules');
    const alertsRef = ref(db, 'alerts');
    const statsRef = ref(db, 'stats');
    const notificationsRef = ref(db, 'notifications');
    
    // Real-time listener for modules
    const modulesListener = onValue(modulesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const modulesArray = Array.isArray(data) 
          ? data 
          : Object.keys(data).map(key => ({
              ...data[key],
              id: data[key].id || key
            }));
        setModules(modulesArray);
      }
    }, (error: any) => {
      console.error("Real-time modules error:", error);
    });
    
    // Real-time listener for alerts
    const alertsListener = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const alertsArray = Array.isArray(data) 
          ? data 
          : Object.keys(data).map(key => ({
              ...data[key],
              id: data[key].id || parseInt(key)
            }));
        // Sort alerts by priority if available, otherwise by timestamp or id
        const sortedAlerts = alertsArray.sort((a, b) => {
          if (a.priority !== undefined && b.priority !== undefined) {
            return b.priority - a.priority;
          } else if (a.timestamp && b.timestamp) {
            return b.timestamp - a.timestamp;
          }
          return b.id - a.id;
        });
        setAlerts(sortedAlerts);
      }
    }, (error: any) => {
      console.error("Real-time alerts error:", error);
    });
    
    // Real-time listener for stats
    const statsListener = onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStats(data);
      }
    }, (error: any) => {
      console.error("Real-time stats error:", error);
    });
    
    // Real-time listener for notifications
    const notificationsListener = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsArray = Array.isArray(data) 
          ? data 
          : Object.keys(data).map(key => ({
              ...data[key],
              id: data[key].id || parseInt(key)
            }));
        // Sort notifications by timestamp (newest first)
        const sortedNotifications = notificationsArray.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(sortedNotifications);
      }
    }, (error: any) => {
      console.error("Real-time notifications error:", error);
    });
    
    // Cleanup function to unsubscribe from listeners
    return () => {
      // Unsubscribe from real-time listeners
      modulesListener && modulesListener();
      alertsListener && alertsListener();
      statsListener && statsListener();
      notificationsListener && notificationsListener();
    };
  }, [fetchAllData]);

  // Set default data as fallback
  const setDefaultData = (): void => {
    // Default modules
    const defaultModules: Module[] = [
      {
        id: 'assign',
        title: 'Assign Module',
        icon: 'account-arrow-right',
        description: 'Assign hardware assets to police officers',
        count: 0,
      },
      {
        id: 'handover',
        title: 'Handover Module',
        icon: 'account-switch',
        description: 'Transfer assets between officers',
        count: 0,
      },
      {
        id: 'maintenance',
        title: 'Maintenance Module',
        icon: 'tools',
        description: 'Schedule and track maintenance activities',
        count: 0,
      },
      {
        id: 'inventory',
        title: 'Stock Inventory',
        icon: 'cube',
        description: 'Monitor and manage hardware inventory',
        count: 0,
      },
      {
        id: 'reports',
        title: 'Analytics',
        icon: 'stats-chart',
        description: 'Usage and performance reports',
        count: 0,
      },
      {
        id: 'alerts',
        title: 'Alerts',
        icon: 'notification-important',
        description: 'System alerts and notifications',
        count: 0,
      },
    ];

    // Default alerts (empty array - will be populated from Firebase)
    const defaultAlerts: Alert[] = [];

    // Set default data
    setModules(defaultModules);
    setAlerts(defaultAlerts);
    setStats({
      totalAssets: 0,
      pendingTasks: 0,
      lowStock: 0
    });
  };

  // Fetch module data
  const fetchModuleData = async (): Promise<void> => {
    try {
      const modulesRef = ref(db, 'modules');
      const snapshot = await get(modulesRef);
      const data = snapshot.val();
      if (data) {
        const modulesArray = Array.isArray(data) 
          ? data 
          : Object.keys(data).map(key => ({
              ...data[key],
              id: data[key].id || key
            }));
        setModules(modulesArray);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      throw error;
    }
  };

  // Fetch alert data
  const fetchAlertData = async (): Promise<void> => {
    try {
      const alertsRef = ref(db, 'alerts');
      const snapshot = await get(alertsRef);
      const data = snapshot.val();
      if (data) {
        const alertsArray = Array.isArray(data) 
          ? data 
          : Object.keys(data).map(key => ({
              ...data[key],
              id: data[key].id || parseInt(key)
            }));
        // Sort alerts by priority/timestamp
        const sortedAlerts = alertsArray.sort((a, b) => {
          if (a.priority !== undefined && b.priority !== undefined) {
            return b.priority - a.priority;
          } else if (a.timestamp && b.timestamp) {
            return b.timestamp - a.timestamp;
          }
          return b.id - a.id;
        });
        setAlerts(sortedAlerts);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      throw error;
    }
  };

  // Fetch stats data
  const fetchStatsData = async (): Promise<void> => {
    try {
      const statsRef = ref(db, 'stats');
      const snapshot = await get(statsRef);
      const data = snapshot.val();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  };

  // Fetch notification data
  const fetchNotificationData = async (): Promise<void> => {
    try {
      const notificationsRef = ref(db, 'notifications');
      const snapshot = await get(notificationsRef);
      const data = snapshot.val();
      if (data) {
        const notificationsArray = Array.isArray(data) 
          ? data 
          : Object.keys(data).map(key => ({
              ...data[key],
              id: data[key].id || parseInt(key)
            }));
        // Sort notifications by timestamp (newest first)
        const sortedNotifications = notificationsArray.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(sortedNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  };

  // Fetch user profile
  const fetchUserProfile = async (): Promise<void> => {
    try {
      const userRef = ref(db, 'user');
      const snapshot = await get(userRef);
      const data = snapshot.val();
      if (data && data.name) {
        setUserName(data.name);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Don't throw here - user profile is non-critical
    }
  };

  // Fetch data from Firestore
  const fetchFirestoreData = async (): Promise<void> => {
    try {
      // Create a query to get the latest items first, limited to 5
      const itemsQuery = query(
        collection(firestoreDb, 'items'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const querySnapshot = await getDocs(itemsQuery);
      const dataArray: FirestoreItem[] = [];
      querySnapshot.forEach((doc) => {
        dataArray.push({ id: doc.id, ...doc.data() } as FirestoreItem);
      });
      setFirestoreItems(dataArray);
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
      throw error;
    }
  };

  // Helper function to get the appropriate icon for module
  const getModuleIcon = (iconName: string): React.ReactNode => {
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
  const getAlertColor = (type: string): string => {
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
  
  // Get the count of unread notifications
  const getUnreadNotificationsCount = (): number => {
    return notifications.filter(notification => !notification.read).length;
  };
  
  // Handles navigation to module screens safely with TypeScript
  const navigateToModule = (moduleId: string): void => {
    // Use the predefined routes or default to a safe route
    const route = moduleRoutes[moduleId] || '/(tabs)';
    router.push(route as any);
  };

  // Format a timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Show loading indicator while initializing
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PoliceColors.primary} />
        <Text style={styles.loadingText}>Loading dashboard data...</Text>
      </View>
    );
  }

  // Show error message if there's an issue
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color={PoliceColors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchAllData();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
            onPress={() => router.push('/(tabs)/profile' as any)}
          >
            <Avatar.Text size={40} label={userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()} style={styles.avatar} color={PoliceColors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PoliceColors.primary]}
            tintColor={PoliceColors.primary}
          />
        }
      >
        {/* Welcome section */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <Link href="/(tabs)/notifications" asChild>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications" size={24} color={PoliceColors.text} />
              {getUnreadNotificationsCount() > 0 && (
                <Badge style={styles.badge}>{getUnreadNotificationsCount()}</Badge>
              )}
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
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <Card key={alert.id} style={[styles.alertCard, { borderLeftColor: getAlertColor(alert.type), borderLeftWidth: 4 }]}>
                <Card.Content style={styles.alertCardContent}>
                  <View style={styles.alertTextContainer}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                    {alert.timestamp && (
                      <Text style={styles.alertTimestamp}>{formatTimestamp(alert.timestamp)}</Text>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.noDataCard}>
              <Card.Content>
                <Text style={styles.noDataText}>No critical alerts at this time.</Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Firestore Items Section */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="cloud-done" size={18} color={PoliceColors.primary} style={styles.sectionIcon} />
          Firestore Items
        </Text>
        <View style={styles.firestoreItemsContainer}>
          {firestoreItems.length > 0 ? (
            firestoreItems.map((item) => (
              <Card key={item.id} style={styles.firestoreItemCard}>
                <Card.Content>
                  <Text style={styles.firestoreItemTitle}>{item.title}</Text>
                  <Text style={styles.firestoreItemDescription}>{truncateText(item.description, 100)}</Text>
                  {item.status && (
                    <Badge style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? PoliceColors.success : PoliceColors.warning }]}>
                      {item.status}
                    </Badge>
                  )}
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.noDataCard}>
              <Card.Content>
                <Text style={styles.noDataText}>No items found in Firestore collection.</Text>
              </Card.Content>
            </Card>
          )}
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
        
        {/* Last updated timestamp */}
        <Text style={styles.lastUpdatedText}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Text>
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
  
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PoliceColors.background,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: PoliceColors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PoliceColors.background,
    padding: 20,
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: PoliceColors.danger,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: PoliceColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: PoliceColors.white,
    fontWeight: 'bold',
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

searchContainer: {
  paddingHorizontal: 20,
  paddingVertical: 10,
},
searchBar: {
  elevation: 2,
  borderRadius: 10,
  backgroundColor: PoliceColors.white,
},

// Stats section styles
sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: PoliceColors.text,
  marginTop: 20,
  marginBottom: 10,
  paddingHorizontal: 20,
  flexDirection: 'row',
  alignItems: 'center',
},
sectionIcon: {
  marginRight: 8,
},
statsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 15,
},
statCard: {
  flex: 1,
  marginHorizontal: 5,
  borderRadius: 10,
  elevation: 2,
  backgroundColor: PoliceColors.white,
},
statCardContent: {
  alignItems: 'center',
  paddingVertical: 10,
},
statIconContainer: {
  width: 48,
  height: 48,
  borderRadius: 24,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 5,
},
statValue: {
  fontSize: 18,
  fontWeight: 'bold',
  color: PoliceColors.text,
},
statLabel: {
  fontSize: 12,
  color: PoliceColors.textLight,
  marginTop: 2,
},

// Alerts section styles
alertsContainer: {
  paddingHorizontal: 20,
},
alertCard: {
  marginBottom: 10,
  borderRadius: 10,
  elevation: 2,
  backgroundColor: PoliceColors.white,
},
alertCardContent: {
  flexDirection: 'row',
  alignItems: 'center',
},
alertTextContainer: {
  flex: 1,
},
alertTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: PoliceColors.text,
},
alertMessage: {
  fontSize: 14,
  color: PoliceColors.textLight,
  marginTop: 2,
},
alertTimestamp: {
  fontSize: 12,
  color: PoliceColors.textLight,
  marginTop: 5,
  fontStyle: 'italic',
},

// Firestore items section styles
firestoreItemsContainer: {
  paddingHorizontal: 20,
},
firestoreItemCard: {
  marginBottom: 10,
  borderRadius: 10,
  elevation: 2,
  backgroundColor: PoliceColors.white,
},
firestoreItemTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: PoliceColors.text,
},
firestoreItemDescription: {
  fontSize: 14,
  color: PoliceColors.textLight,
  marginTop: 5,
},
statusBadge: {
  alignSelf: 'flex-start',
  marginTop: 8,
},

// Module grid styles
moduleGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  paddingHorizontal: 15,
  paddingBottom: 20,
},
moduleItem: {
  width: '50%',
  padding: 5,
},
moduleCard: {
  borderRadius: 10,
  elevation: 2,
  backgroundColor: PoliceColors.white,
},
moduleCardContent: {
  alignItems: 'center',
  padding: 15,
},
moduleIconContainer: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: `${PoliceColors.primary}10`,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 10,
},
moduleTitle: {
  fontSize: 14,
  fontWeight: 'bold',
  color: PoliceColors.text,
  textAlign: 'center',
  marginBottom: 5,
},
moduleCountContainer: {
  height: 24,
  minWidth: 24,
  borderRadius: 12,
  backgroundColor: PoliceColors.lightGray,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 8,
},
moduleCount: {
  fontSize: 12,
  fontWeight: 'bold',
  color: PoliceColors.darkGray,
},

// No data styling
noDataCard: {
  marginBottom: 10,
  borderRadius: 10,
  elevation: 2,
  backgroundColor: PoliceColors.white,
  opacity: 0.8,
},
noDataText: {
  fontSize: 14,
  color: PoliceColors.textLight,
  textAlign: 'center',
  padding: 10,
},

// Last updated text
lastUpdatedText: {
  fontSize: 12,
  color: PoliceColors.textLight,
  textAlign: 'center',
  marginBottom: 20,
  fontStyle: 'italic',
}
});