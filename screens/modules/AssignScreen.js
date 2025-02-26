// src/screens/modules/AssignScreen.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

const AssignScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#1a237e" barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Assign Assets</Text>
        <Text style={styles.description}>
          This module allows you to assign inventory assets to police officers.
        </Text>
        <Text style={styles.comingSoon}>Full functionality coming soon...</Text>
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#424242',
  },
  comingSoon: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#757575',
  },
});

export default AssignScreen;