import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { getDatabase, ref, onValue } from "firebase/database";

// Define the component's style colors
const PoliceColors = {
  primary: '#003366',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  text: '#333333',
  textLight: '#6c757d',
  cardBackground: '#ffffff',
};

const FirebaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Checking connection...');
  const [statusColor, setStatusColor] = useState(PoliceColors.warning);

  useEffect(() => {
    // Get database reference
    const db = getDatabase();
    
    // Reference to a test location in your database
    // You might want to create this in your Firebase console
    const connectedRef = ref(db, '.info/connected');
    
    // Listen for connection state changes
    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        setConnectionStatus('Connected to Firebase');
        setStatusColor(PoliceColors.success);
      } else {
        setConnectionStatus('Disconnected from Firebase');
        setStatusColor(PoliceColors.danger);
      }
    }, (error) => {
      console.error('Firebase connection error:', error);
      setConnectionStatus('Error connecting to Firebase');
      setStatusColor(PoliceColors.danger);
    });

    // Clean up the listener
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {connectionStatus}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    backgroundColor: PoliceColors.cardBackground,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FirebaseConnectionTest;