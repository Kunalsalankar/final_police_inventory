import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, StatusBar, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Button, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Professional police-themed color scheme
const PoliceColors = {
  primary: '#1a3a5f',         // Navy blue
  secondary: '#2c3e50',       // Dark blue-gray
  accent: '#e74c3c',          // Emergency red
  accent2: '#3498db',         // Badge blue
  background: '#f5f7fa',      // Light gray
  cardBackground: '#ffffff',  // White
  text: '#2c3e50',            // Dark blue-gray
  textLight: '#7f8c8d',       // Medium gray
  textDark: '#1a2530',        // Near black
  white: '#ffffff',           // White
  shadow: 'rgba(0,0,0,0.15)', // Shadow color
  gold: '#f1c40f',            // Badge gold
  silver: '#bdc3c7',          // Badge silver
  // Gradients
  primaryGradient1: '#1a3a5f', // Dark navy blue
  primaryGradient2: '#2c5282', // Medium navy blue
  secondaryGradient1: '#2c3e50', // Dark blue-gray
  secondaryGradient2: '#34495e', // Medium blue-gray
  accentGradient1: '#c0392b',  // Dark red
  accentGradient2: '#e74c3c',  // Medium red
};

export default function Index() {
  const router = useRouter();
  const { width } = Dimensions.get('window');

  const InventoryOfficerSignUp = (): void => {
    router.push('/(tabs)/dashboard/inventoryOfficer' as any);
  };

    const HeadOfficerSignUp = (): void => {
    router.push('/(tabs)/dashboard/headOfficer' as any);
  };

   const  TechnicalOfficerSignUp = (): void => {
    router.push('/(tabs)/dashboard/teachicalteam' as any);
  };

  const PoliceOfficerSignUp = (): void => {
    router.push('/(tabs)/dashboard/policeofficer' as any);
  };

  const handleLogin = (): void => {
    router.push('/(tabs)/dashboard/login' as any);
  };

  
  
  
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={[PoliceColors.primaryGradient1, PoliceColors.primaryGradient2]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Title Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <LinearGradient
                colors={[PoliceColors.white, PoliceColors.white]}
                style={styles.logoInner}
              >
                <MaterialCommunityIcons 
                  name="police-badge" 
                  size={80} 
                  color={PoliceColors.primary}
                />
              </LinearGradient>
            </View>
            
            <Text style={styles.mainTitle}>EquipTrack</Text>
            <Text style={styles.subtitle}>
              Smart Hardware Inventory Management for Law Enforcement
            </Text>
          </View>

          {/* Features Section */}
          <BlurView intensity={15} tint="light" style={styles.blurContainer}>
            <View style={styles.featureContainer}>
              <Text style={styles.featureTitle}>Police Inventory Features</Text>
              <View style={styles.featureList}>
               
                <View style={styles.featureItem}>
                  <LinearGradient
                    colors={[PoliceColors.primaryGradient1, PoliceColors.primaryGradient2]}
                    style={styles.featureIconBg}
                  >
                    <FontAwesome5 name="tools" size={16} color={PoliceColors.white} />
                  </LinearGradient>
                  <Text style={styles.featureText}>Maintenance alerts and scheduling</Text>
                </View>
                <View style={styles.featureItem}>
                  <LinearGradient
                    colors={[PoliceColors.primaryGradient1, PoliceColors.primaryGradient2]}
                    style={styles.featureIconBg}
                  >
                    <FontAwesome5 name="exchange-alt" size={16} color={PoliceColors.white} />
                  </LinearGradient>
                  <Text style={styles.featureText}>Seamless equipment transfer</Text>
                </View>
                <View style={styles.featureItem}>
                  <LinearGradient
                    colors={[PoliceColors.primaryGradient1, PoliceColors.primaryGradient2]}
                    style={styles.featureIconBg}
                  >
                    <FontAwesome5 name="chart-bar" size={16} color={PoliceColors.white} />
                  </LinearGradient>
                  <Text style={styles.featureText}>Advanced analytics dashboard</Text>
                </View>
                <View style={styles.featureItem}>
                  <LinearGradient
                    colors={[PoliceColors.primaryGradient1, PoliceColors.primaryGradient2]}
                    style={styles.featureIconBg}
                  >
                    <FontAwesome5 name="user-shield" size={16} color={PoliceColors.white} />
                  </LinearGradient>
                  <Text style={styles.featureText}>Secure role-based access controls</Text>
                </View>
              </View>
            </View>
          </BlurView>
          

          {/* Sign Up Cards Section */}
          <View style={styles.cardsContainer}>
            {/* Technical Team Card */}
            <View style={[styles.card, styles.chiefCard]}>
              <Text style={styles.icon}>🛡️</Text>
              <Text style={styles.title}>Technical Team Sign-up</Text>
              <Text style={styles.description}>
                Manage and maintain equipment, receive maintenance alerts, and update technical team profiles. For officers responsible for technical support and asset upkeep.
              </Text>
              <TouchableOpacity onPress={TechnicalOfficerSignUp} style={styles.button}>
                <Text style={styles.buttonText}>Technical Team Sign Up</Text>
              </TouchableOpacity>
            </View>

            
            
               {/* Head Officer Card */}
             <View style={[styles.card, styles.chiefCard]}>
              <Text style={styles.icon}>🛡️</Text>
              <Text style={styles.title}>Head Officer Sign Up</Text>
              <Text style={styles.description}>
                Approve inventory and stock requests, manage and add stock, and edit your profile. Head Officers have full oversight of inventory operations and departmental resources.
              </Text>
              <TouchableOpacity onPress={HeadOfficerSignUp} style={styles.button}>
                <Text style={styles.buttonText}>Head Officer Sign-up</Text>
              </TouchableOpacity>
            </View>


               {/* Inventory Manager Card */}
            <View style={[styles.card, styles.chiefCard]}>
              <Text style={styles.icon}>🛡️</Text>
              <Text style={styles.title}>Inventory Manager Sign Up</Text>
              <Text style={styles.description}>
                Assign assets to officers, manage and add inventory, maintain asset records, submit departmental needs to Head Officer, and edit your profile. Inventory Managers oversee all inventory logistics and records.
              </Text>
              <TouchableOpacity onPress={InventoryOfficerSignUp} style={styles.button}>
                <Text style={styles.buttonText}>Inventory Officer Sign-up</Text>
              </TouchableOpacity>
            </View>

            {/* Field Officer Card */}
            <View style={[styles.card, styles.officerCard]}>
              <Text style={styles.icon}>👔</Text>
              <Text style={styles.title}>Field Officer (Police User)</Text>
              <Text style={styles.description}>
                Access your assigned equipment, report issues or complaints, and update your personal profile. Designed for police officers working in the field to efficiently manage and track their inventory and requests.
              </Text>
              <TouchableOpacity onPress={PoliceOfficerSignUp} style={styles.button}>
                <Text style={styles.buttonText}>Field Officer Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerTextContainer}>
              <Text style={styles.dividerText}>OR</Text>
            </View>
            <View style={styles.dividerLine} />
          </View>
          
          {/* Login Button Section */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.loginButtonContainer} 
              onPress={handleLogin}
            >
              <LinearGradient
                colors={[PoliceColors.accent2, '#2980b9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.gradientButton, styles.loginGradientButton]}
              >
                <View style={styles.loginButtonInner}>
                  <Ionicons name="log-in-outline" size={20} color={PoliceColors.white} style={styles.loginIcon} />
                  <Text style={styles.loginButtonText}>Login to Your Account</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.poweredByText}>Secure Authentication Powered by EquipTrack</Text>
          </View>
          
          {/* Footer Section */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2025 EquipTrack - Official Police Department Asset Management</Text>
            <Text style={styles.tagline}>Serving Those Who Serve</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Enhanced police-themed styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PoliceColors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 350,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingTop: 60,
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 50,
  },
  logoWrapper: {
    borderRadius: 75,
    padding: 5,
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  logoInner: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 70,
  },
  mainTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: PoliceColors.white,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: PoliceColors.white,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: PoliceColors.shadow,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  featureContainer: {
    padding: 25,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: PoliceColors.primary,
    textAlign: 'center',
  },
  featureList: {
    marginLeft: 5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: PoliceColors.text,
    lineHeight: 24,
    fontWeight: '500',
    flex: 1,
  },
  cardsContainer: {
    marginBottom: 40,
    gap: 25,
  },
  card: {
    borderRadius: 20,
    marginVertical: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  chiefCard: {
    backgroundColor: '#1a3c61',
  },
  officerCard: {
    backgroundColor: '#233142',
  },
  icon: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#bf2c37',
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dividerTextContainer: {
    backgroundColor: PoliceColors.background,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  dividerText: {
    color: PoliceColors.textLight,
    fontWeight: 'bold',
    fontSize: 12,
  },
  buttonContainer: {
    marginBottom: 50,
    alignItems: 'center',
  },
  loginButtonContainer: {
    width: '85%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  gradientButton: {
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginGradientButton: {
    paddingVertical: 14,
  },
  loginButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginIcon: {
    marginRight: 10,
  },
  loginButtonText: {
    color: PoliceColors.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loginButton: {
    borderColor: PoliceColors.primary,
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  poweredByText: {
    color: PoliceColors.textLight,
    fontSize: 13,
    marginTop: 10,
    fontStyle: 'italic',
  },
  footer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    color: PoliceColors.textLight,
    fontSize: 12,
    marginBottom: 5,
  },
  tagline: {
    color: PoliceColors.primary,
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});