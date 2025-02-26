import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, StatusBar, Platform, Image } from 'react-native';
import { Card, Avatar, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// Use the same color scheme
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

export default function ProfileScreen() {
  const router = useRouter();

  // Mock user data
  const userData = {
    name: 'Inspector Sharma',
    badgeNumber: 'DP-78219',
    rank: 'Inspector',
    department: 'Cyber Crime Division',
    joinDate: 'June 15, 2018',
    contactNumber: '+91 98765 43210',
    email: 'inspector.sharma@delhipolice.gov.in',
    lastActive: 'Today at 10:45 AM',
    assets: [
      { name: 'Laptop', id: 'LP-2023-456', assignedDate: '12 Jan 2023' },
      { name: 'Mobile Phone', id: 'MP-2022-789', assignedDate: '05 Mar 2022' },
      { name: 'Body Camera', id: 'BC-2023-321', assignedDate: '18 Aug 2023' },
    ]
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PoliceColors.darkBlue} />
      
      {/* Header with back button */}
      <View style={[styles.header, { backgroundColor: PoliceColors.darkBlue }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={PoliceColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Officer Profile</Text>
        <View style={styles.emptySpace} />
      </View>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileCardContent}>
            <View style={styles.avatarContainer}>
              <Avatar.Text 
                size={80} 
                label="IS" 
                style={styles.avatar} 
                color={PoliceColors.white}
                labelStyle={styles.avatarLabel}
              />
              <View style={styles.badgeIconContainer}>
                <FontAwesome5 name="shield-alt" size={18} color={PoliceColors.gold} />
              </View>
            </View>
            
            <Text style={styles.officerName}>{userData.name}</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{userData.badgeNumber}</Text>
            </View>
            
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="police-badge" size={20} color={PoliceColors.primary} />
                <Text style={styles.infoText}>{userData.rank}</Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="account-group" size={20} color={PoliceColors.primary} />
                <Text style={styles.infoText}>{userData.department}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {/* Contact Information */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Divider style={styles.divider} />
            
            <View style={styles.detailItem}>
              <Ionicons name="call-outline" size={20} color={PoliceColors.primary} style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailValue}>{userData.contactNumber}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="mail-outline" size={20} color={PoliceColors.primary} style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{userData.email}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color={PoliceColors.primary} style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Joined:</Text>
              <Text style={styles.detailValue}>{userData.joinDate}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color={PoliceColors.primary} style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Last Active:</Text>
              <Text style={styles.detailValue}>{userData.lastActive}</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Assigned Assets */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Assigned Assets</Text>
            <Divider style={styles.divider} />
            
            {userData.assets.map((asset, index) => (
              <View key={asset.id} style={styles.assetItem}>
                <View style={styles.assetIconContainer}>
                  <Ionicons 
                    name={
                      asset.name.includes('Laptop') ? 'laptop-outline' : 
                      asset.name.includes('Mobile') ? 'phone-portrait-outline' : 'videocam-outline'
                    } 
                    size={24} 
                    color={PoliceColors.primary} 
                  />
                </View>
                <View style={styles.assetDetails}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetId}>{asset.id}</Text>
                </View>
                <Text style={styles.assetDate}>{asset.assignedDate}</Text>
              </View>
            ))}
            
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All Assets</Text>
              <Ionicons name="chevron-forward" size={16} color={PoliceColors.primary} />
            </TouchableOpacity>
          </Card.Content>
        </Card>
        
        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: PoliceColors.primary }]}>
            <Ionicons name="create-outline" size={20} color={PoliceColors.white} />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: PoliceColors.accent }]}>
            <Ionicons name="log-out-outline" size={20} color={PoliceColors.white} />
            <Text style={styles.actionButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PoliceColors.background,
  },
  header: {
    height: Platform.OS === 'ios' ? 100 : 80,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PoliceColors.white,
  },
  emptySpace: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    borderRadius: 15,
    elevation: 4,
    marginBottom: 20,
  },
  profileCardContent: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    backgroundColor: PoliceColors.primary,
  },
  avatarLabel: {
    fontSize: 30,
  },
  badgeIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: PoliceColors.white,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PoliceColors.lightGray,
  },
  officerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: PoliceColors.text,
    marginBottom: 8,
  },
  badgeContainer: {
    backgroundColor: PoliceColors.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 15,
  },
  badgeText: {
    color: PoliceColors.primary,
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  infoText: {
    marginLeft: 5,
    color: PoliceColors.text,
  },
  sectionCard: {
    borderRadius: 15,
    elevation: 2,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PoliceColors.text,
    marginBottom: 10,
  },
  divider: {
    backgroundColor: PoliceColors.border,
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 10,
    width: 22,
  },
  detailLabel: {
    width: 70,
    color: PoliceColors.textLight,
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    color: PoliceColors.text,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: PoliceColors.border,
  },
  assetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PoliceColors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetDetails: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '500',
    color: PoliceColors.text,
  },
  assetId: {
    fontSize: 14,
    color: PoliceColors.textLight,
  },
  assetDate: {
    fontSize: 14,
    color: PoliceColors.primary,
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 10,
  },
  viewAllText: {
    color: PoliceColors.primary,
    fontWeight: '500',
    marginRight: 5,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    flex: 0.48,
  },
  actionButtonText: {
    color: PoliceColors.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});