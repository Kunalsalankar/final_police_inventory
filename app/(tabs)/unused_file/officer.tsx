import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  StatusBar, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  Image
} from 'react-native';
import { 
  Button, 
  TextInput, 
  HelperText, 
  Appbar, 
  Checkbox, 
  Dialog, 
  Portal, 
  Provider as PaperProvider,
  ActivityIndicator 
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

export default function Officer() {
  const router = useRouter();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [reportingOfficer, setReportingOfficer] = useState('');
  const [rank, setRank] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  
  // Error states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [badgeNumberError, setBadgeNumberError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [departmentError, setDepartmentError] = useState('');
  const [policeStationError, setPoliceStationError] = useState('');
  const [reportingOfficerError, setReportingOfficerError] = useState('');
  const [rankError, setRankError] = useState('');
  const [termsError, setTermsError] = useState('');

  const validateForm = () => {
    let isValid = true;
    
    // Validation logic here
    
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });
      
      // Save officer details to Firestore
      await addDoc(collection(db, 'normalofficers'), {
        uid: user.uid,
        firstName,
        lastName,
        email,
        badgeNumber,
        phone,
        department,
        policeStation,
        reportingOfficer,
        rank,
        role: 'officer',
        createdAt: Timestamp.now(),
        status: 'active'
      });
      
      setDialogVisible(true);
    } catch (error) {
      console.error("Error registering user:", error);
      Alert.alert('Registration Error', 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDialogClose = () => {
    setDialogVisible(false);
    router.replace('/(tabs)/inventory_officer/dashboard' as any);
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => router.back()} color={Colors.white} />
          <Appbar.Content title="Police Officer Registration" color={Colors.white} />
        </Appbar.Header>
        
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
          >
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formContainer}>
                {/* Header Section */}
                <View style={styles.headerContainer}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <MaterialCommunityIcons 
                      name="police-badge" 
                      size={60} 
                      color={Colors.white}
                    />
                    <Text style={styles.headerTitle}>Police Officer Registration</Text>
                    <Text style={styles.headerSubtitle}>
                      Create an account to manage and track equipment assigned to you
                    </Text>
                  </LinearGradient>
                </View>

                {/* Form Fields */}
                <View style={styles.row}>
                  <View style={styles.halfColumn}>
                    <TextInput
                      label="First Name"
                      value={firstName}
                      onChangeText={setFirstName}
                      mode="outlined"
                      style={[styles.input, {color: '#000000'}]}
                      error={!!firstNameError}
                      left={<TextInput.Icon icon="account" />}
                      theme={{ 
                        colors: { 
                          text: '#000000', 
                          placeholder: '#666666', 
                          primary: Colors.primary,
                          onSurface: '#000000'
                        } 
                      }}
                      selectionColor="#000000"
                      placeholderTextColor="#666666"
                    />
                    {!!firstNameError && <HelperText type="error" style={styles.errorText}>{firstNameError}</HelperText>}
                  </View>
                  
                  <View style={styles.halfColumn}>
                    <TextInput
                      label="Last Name"
                      value={lastName}
                      onChangeText={setLastName}
                      mode="outlined"
                      style={[styles.input, {color: '#000000'}]}
                      error={!!lastNameError}
                      left={<TextInput.Icon icon="account" />}
                      theme={{ 
                        colors: { 
                          text: '#000000', 
                          placeholder: '#666666', 
                          primary: Colors.primary,
                          onSurface: '#000000'
                        } 
                      }}
                      selectionColor="#000000"
                      placeholderTextColor="#666666"
                    />
                    {!!lastNameError && <HelperText type="error" style={styles.errorText}>{lastNameError}</HelperText>}
                  </View>
                </View>

                {/* Add other form fields here with the same structure */}
                
                <Button 
                  mode="contained" 
                  style={styles.button} 
                  labelStyle={styles.buttonLabel}
                  onPress={handleRegister}
                  loading={loading}
                  disabled={loading}
                >
                  Register as Police Officer
                </Button>
                
                <TouchableOpacity 
                  style={styles.loginLink} 
                  onPress={() => router.replace('/(tabs)/dashboard/login' as any)}
                >
                  <Text style={styles.loginText}>Already have an account? Login</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
        
        {/* Success Dialog */}
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={handleDialogClose}>
            <Dialog.Title>Registration Successful</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>
                Your police officer account has been created successfully. 
                You can now access the dashboard to manage your assigned equipment.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleDialogClose}>Go to Dashboard</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  appbar: {
    backgroundColor: Colors.primary,
    elevation: 4,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  formContainer: {
    padding: 20,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  halfColumn: {
    width: '48%',
  },
  input: {
    marginBottom: 8,
    backgroundColor: Colors.white,
  },
  errorText: {
    color: '#FF0000',
    fontWeight: '500',
    marginBottom: 8,
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: Colors.white,
  },
  loginLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  loginText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  dialogText: {
    color: '#000000',
    fontSize: 15,
    lineHeight: 22,
  },
});
