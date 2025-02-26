import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export default function HomeScreen() {
  const router = useRouter();

  const handleLoginPress = () => {
    router.push('/(tabs)/dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false} // Hides the scroll indicator for a cleaner look
      >
        {/* Logo and Title Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <MaterialCommunityIcons 
              name="police-badge" 
              size={80} 
              color={Colors.primary}
            />
          </View>
          
          <Text style={styles.title}>EquipTrack</Text>
          <Text style={styles.subtitle}>
            Hardware Inventory Management for Police Department
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featureContainer}>
          <Text style={styles.featureTitle}>Features</Text>
          
          <View style={styles.featureList}>
            <FeatureItem text="Real-time tracking of hardware assets" />
            <FeatureItem text="Seamless asset transfers between officers" />
            <FeatureItem text="Maintenance and lifecycle management" />
            <FeatureItem text="Automated alerts and notifications" />
            <FeatureItem text="Analytics and usage reports" />
          </View>
        </View>

        {/* Login Button Section */}
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            style={styles.button} 
            labelStyle={styles.buttonLabel}
            onPress={handleLoginPress}
          >
            Login to System
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// FeatureItem component remains the same
const FeatureItem = ({ text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureText}>• {text}</Text>
  </View>
);

// Updated styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    flexGrow: 1, // Ensures content can grow and be scrollable
  },
  // ... rest of the styles remain the same ...
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 60,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  featureContainer: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.text,
  },
  featureList: {
    marginLeft: 10,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  button: {
    padding: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});