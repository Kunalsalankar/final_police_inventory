import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Avatar, Button, Searchbar, Divider, List } from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export default function HandoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample handover requests data
  const handoverRequests = [
    {
      id: 1,
      fromOfficer: {
        name: 'Officer Kumar',
        badge: 'PO1234',
        avatar: 'K'
      },
      toOfficer: {
        name: 'Officer Singh',
        badge: 'PO5678',
        avatar: 'S'
      },
      assets: ['Police Radio #445', 'Body Camera #112'],
      status: 'pending',
      date: '2024-02-19'
    },
    // More handover requests...
  ];

  // Sample recent handovers data
  const recentHandovers = [
    {
      id: 1,
      fromOfficer: {
        name: 'Officer Patel',
        badge: 'PO8901',
        avatar: 'P'
      },
      toOfficer: {
        name: 'Officer Sharma',
        badge: 'PO2345',
        avatar: 'S'
      },
      assets: ['Laptop #789', 'Mobile Device #234'],
      status: 'completed',
      date: '2024-02-18'
    },
    // More completed handovers...
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return Colors.warning;
      case 'completed': return Colors.success;
      default: return Colors.primary;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="account-switch" size={32} color={Colors.primary} />
          <Text style={styles.headerTitle}>Asset Handover Management</Text>
        </View>
        <TouchableOpacity style={styles.newHandoverButton}>
          <Ionicons name="add-circle" size={24} color={Colors.white} />
          <Text style={styles.newHandoverText}>New Handover</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search handovers..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Pending Handovers Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Handovers</Text>
        {handoverRequests.map((request) => (
          <Card key={request.id} style={styles.handoverCard}>
            <Card.Content>
              <View style={styles.handoverHeader}>
                <View style={styles.officerInfo}>
                  <Avatar.Text size={40} label={request.fromOfficer.avatar} />
                  <View style={styles.officerDetails}>
                    <Text style={styles.officerName}>{request.fromOfficer.name}</Text>
                    <Text style={styles.badgeNumber}>{request.fromOfficer.badge}</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="arrow-right" size={24} color={Colors.primary} />
                <View style={styles.officerInfo}>
                  <Avatar.Text size={40} label={request.toOfficer.avatar} />
                  <View style={styles.officerDetails}>
                    <Text style={styles.officerName}>{request.toOfficer.name}</Text>
                    <Text style={styles.badgeNumber}>{request.toOfficer.badge}</Text>
                  </View>
                </View>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.assetsList}>
                {request.assets.map((asset, index) => (
                  <View key={index} style={styles.assetItem}>
                    <Ionicons name="hardware-chip" size={20} color={Colors.primary} />
                    <Text style={styles.assetText}>{asset}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.handoverFooter}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                  <Text style={styles.statusText}>{request.status.toUpperCase()}</Text>
                </View>
                <Text style={styles.dateText}>{request.date}</Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Recent Handovers Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Handovers</Text>
        {recentHandovers.map((handover) => (
          <Card key={handover.id} style={styles.handoverCard}>
            {/* Similar structure to pending handovers */}
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: Colors.text,
  },
  newHandoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newHandoverText: {
    color: Colors.white,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  searchBar: {
    margin: 20,
    elevation: 2,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.text,
  },
  handoverCard: {
    marginBottom: 15,
    elevation: 2,
  },
  handoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  officerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  officerDetails: {
    marginLeft: 10,
  },
  officerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  badgeNumber: {
    fontSize: 12,
    color: Colors.secondary,
  },
  divider: {
    marginVertical: 10,
  },
  assetsList: {
    marginVertical: 10,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  assetText: {
    marginLeft: 10,
    fontSize: 14,
    color: Colors.text,
  },
  handoverFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    color: Colors.secondary,
    fontSize: 12,
  },
});