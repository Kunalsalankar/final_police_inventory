import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Card, List, Divider, Badge, Switch, Searchbar } from 'react-native-paper';
import { Stack } from 'expo-router';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// Color scheme from main app
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
  darkBlue: '#00264d', // Darker blue for gradients
  lightGray: '#f0f2f5', // Light gray for backgrounds
};

export default function AlertsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: 'Device Lifecycle Alert',
      message: '15 laptops approaching end of lifecycle (3 months remaining)',
      type: 'warning',
      category: 'lifecycle',
      time: '2 hours ago',
      isRead: false,
      stationId: 'central'
    },
    {
      id: 2,
      title: 'Maintenance Due',
      message: 'Server room air conditioning maintenance overdue by 5 days',
      type: 'danger',
      category: 'maintenance',
      time: '5 hours ago',
      isRead: false,
      stationId: 'north'
    },
    {
      id: 3,
      title: 'Low Stock Warning',
      message: 'Body camera batteries (Model BC-500) stock below minimum threshold',
      type: 'warning',
      category: 'inventory',
      time: '1 day ago',
      isRead: true,
      stationId: 'central'
    },
    {
      id: 4,
      title: 'Asset Transfer Completed',
      message: '5 radios successfully transferred from Central HQ to North Division',
      type: 'success',
      category: 'transfer',
      time: '2 days ago',
      isRead: true,
      stationId: 'north'
    },
    {
      id: 5,
      title: 'Software Update Available',
      message: 'Critical security update available for station computers',
      type: 'info',
      category: 'software',
      time: '3 days ago',
      isRead: true,
      stationId: 'all'
    },
  ]);

  const [activeFilter, setActiveFilter] = useState('all');

  // Mark alert as read
  const markAsRead = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  };

  // Get color based on alert type
  const getAlertColor = (type) => {
    switch (type) {
      case 'danger':
        return PoliceColors.danger;
      case 'warning':
        return PoliceColors.warning;
      case 'success':
        return PoliceColors.success;
      case 'info':
        return PoliceColors.primary;
      default:
        return PoliceColors.textLight;
    }
  };

  // Get icon based on alert category
  const getAlertIcon = (category) => {
    switch (category) {
      case 'lifecycle':
        return <MaterialIcons name="update" size={24} color={PoliceColors.text} />;
      case 'maintenance':
        return <MaterialCommunityIcons name="tools" size={24} color={PoliceColors.text} />;
      case 'inventory':
        return <MaterialIcons name="inventory" size={24} color={PoliceColors.text} />;
      case 'transfer':
        return <MaterialIcons name="swap-horiz" size={24} color={PoliceColors.text} />;
      case 'software':
        return <MaterialIcons name="system-update" size={24} color={PoliceColors.text} />;
      default:
        return <Ionicons name="alert-circle" size={24} color={PoliceColors.text} />;
    }
  };

  // Filter alerts based on active filter
  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !alert.isRead;
    return alert.type === activeFilter;
  }).filter(alert => {
    // Search filter
    if (!searchQuery) return true;
    return (
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PoliceColors.darkBlue} />
      
      <Stack.Screen 
        options={{
          title: 'System Alerts',
          headerStyle: { backgroundColor: PoliceColors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search alerts..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={PoliceColors.primary}
          />
        </View>

        {/* Controls section */}
        <View style={styles.controlsSection}>
          <View style={styles.notificationToggle}>
            <Text style={styles.toggleText}>Push Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              color={PoliceColors.primary}
            />
          </View>
          
          <View style={styles.filterButtons}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
              <TouchableOpacity 
                style={[styles.filterButton, activeFilter === 'all' && styles.activeFilterButton]}
                onPress={() => setActiveFilter('all')}
              >
                <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, activeFilter === 'unread' && styles.activeFilterButton]}
                onPress={() => setActiveFilter('unread')}
              >
                <Text style={[styles.filterText, activeFilter === 'unread' && styles.activeFilterText]}>Unread</Text>
                <Badge style={styles.badge}>{alerts.filter(a => !a.isRead).length}</Badge>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, activeFilter === 'danger' && styles.activeFilterButton, styles.dangerFilter]}
                onPress={() => setActiveFilter('danger')}
              >
                <Text style={[styles.filterText, activeFilter === 'danger' && styles.activeFilterText]}>Critical</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, activeFilter === 'warning' && styles.activeFilterButton, styles.warningFilter]}
                onPress={() => setActiveFilter('warning')}
              >
                <Text style={[styles.filterText, activeFilter === 'warning' && styles.activeFilterText]}>Warnings</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, activeFilter === 'success' && styles.activeFilterButton, styles.successFilter]}
                onPress={() => setActiveFilter('success')}
              >
                <Text style={[styles.filterText, activeFilter === 'success' && styles.activeFilterText]}>Success</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {/* Alerts list */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="notifications" size={18} color={PoliceColors.primary} style={styles.sectionIcon} />
          {activeFilter === 'all' ? 'All Alerts' : 
            activeFilter === 'unread' ? 'Unread Alerts' : 
            `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Alerts`}
        </Text>

        {filteredAlerts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyCardContent}>
              <Ionicons name="notifications-off" size={50} color={PoliceColors.textLight} />
              <Text style={styles.emptyText}>No alerts found</Text>
              <Text style={styles.emptySubtext}>Any new system alerts will appear here</Text>
            </Card.Content>
          </Card>
        ) : (
          filteredAlerts.map((alert, index) => (
            <TouchableOpacity key={alert.id} onPress={() => markAsRead(alert.id)}>
              <Card 
                style={[
                  styles.alertCard, 
                  { borderLeftColor: getAlertColor(alert.type), borderLeftWidth: 4 },
                  !alert.isRead && styles.unreadCard
                ]}
              >
                <Card.Content style={styles.alertCardContent}>
                  <View style={styles.alertIconContainer}>
                    {getAlertIcon(alert.category)}
                  </View>
                  <View style={styles.alertTextContainer}>
                    <View style={styles.alertTitleRow}>
                      <Text style={styles.alertTitle}>{alert.title}</Text>
                      {!alert.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                    <View style={styles.alertFooter}>
                      <Text style={styles.alertTime}>{alert.time}</Text>
                      <Text style={styles.alertStation}>
                        {alert.stationId === 'all' ? 'All Stations' : 
                          alert.stationId === 'central' ? 'Central HQ' : 
                          alert.stationId === 'north' ? 'North Division' : 'Other Station'}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}

        {filteredAlerts.length > 0 && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => setAlerts(alerts.map(alert => ({ ...alert, isRead: true })))}
            >
              <Text style={styles.actionButtonText}>Mark All as Read</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
              <Text style={styles.actionButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PoliceColors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: PoliceColors.cardBackground,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 10,
    height: 45,
  },
  controlsSection: {
    backgroundColor: PoliceColors.cardBackground,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: PoliceColors.border,
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  toggleText: {
    fontSize: 16,
    color: PoliceColors.text,
    fontWeight: '500',
  },
  filterButtons: {
    marginTop: 5,
  },
  filterScrollView: {
    paddingHorizontal: 10,
  },
  filterButton: {
    backgroundColor: PoliceColors.lightGray,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: PoliceColors.primary,
  },
  dangerFilter: {
    borderWidth: 1,
    borderColor: PoliceColors.danger,
  },
  warningFilter: {
    borderWidth: 1,
    borderColor: PoliceColors.warning,
  },
  successFilter: {
    borderWidth: 1,
    borderColor: PoliceColors.success,
  },
  filterText: {
    color: PoliceColors.text,
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  badge: {
    marginLeft: 5,
    backgroundColor: PoliceColors.accent,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 15,
    color: PoliceColors.text,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  alertCard: {
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: PoliceColors.lightBlue,
  },
  alertCardContent: {
    flexDirection: 'row',
    padding: 15,
  },
  alertIconContainer: {
    marginRight: 15,
    justifyContent: 'center',
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PoliceColors.text,
    marginBottom: 4,
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PoliceColors.accent,
    marginLeft: 5,
  },
  alertMessage: {
    fontSize: 14,
    color: PoliceColors.textLight,
    marginBottom: 8,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertTime: {
    fontSize: 12,
    color: PoliceColors.textLight,
  },
  alertStation: {
    fontSize: 12,
    color: PoliceColors.primary,
    fontWeight: '500',
  },
  emptyCard: {
    margin: 15,
    borderRadius: 8,
    elevation: 2,
  },
  emptyCardContent: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: PoliceColors.text,
  },
  emptySubtext: {
    marginTop: 5,
    fontSize: 14,
    color: PoliceColors.textLight,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 15,
    marginTop: 5,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: PoliceColors.primary,
  },
  secondaryButton: {
    backgroundColor: PoliceColors.secondary,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  }
});