// src/components/modules/ActivityItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../common/Card';

const ActivityItem = ({ type, message, time, icon, onPress }) => {
  return (
    <Card style={styles.activityCard}>
      <View style={styles.activityIconContainer}>
        <Icon name={icon} size={24} color="#1a237e" />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityMessage}>{message}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
      <TouchableOpacity style={styles.activityArrow} onPress={onPress}>
        <Icon name="chevron-right" size={24} color="#9e9e9e" />
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 12,
  },
  activityIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#9e9e9e',
    marginTop: 4,
  },
  activityArrow: {
    padding: 4,
  },
});

export default ActivityItem;