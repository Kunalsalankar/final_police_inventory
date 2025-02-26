import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import Colors from '@/constants/Colors';

export default function AssignScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Assign Module</Text>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Asset Assignment</Text>
            <Text style={styles.description}>
              Manage hardware asset assignments to police officers. Track equipment 
              distribution and maintain accountability.
            </Text>
          </Card.Content>
        </Card>
        
        {/* Add your module-specific content here */}
      </View>
    </ScrollView>
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
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.secondary,
    lineHeight: 20,
  },
});