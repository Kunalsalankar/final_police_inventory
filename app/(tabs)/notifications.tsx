import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { Card } from 'react-native-paper';
import Colors from '../../constants/Colors';

// Sample notification data - in a real app, this would come from a backend
const notifications = [
  {
    id: '1',
    title: 'New Asset Assignment',
    message: 'You have a new asset assignment pending approval',
    time: '2 hours ago',
  },
  {
    id: '2',
    title: 'Maintenance Alert',
    message: 'Scheduled maintenance for equipment #4572 is due',
    time: '5 hours ago',
  },
  {
    id: '3',
    title: 'Low Stock Warning',
    message: 'Body cameras inventory is running low. Please reorder.',
    time: 'Yesterday',
  },
];

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationTime}>{item.time}</Text>
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    padding: 20,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.secondary,
  },
});