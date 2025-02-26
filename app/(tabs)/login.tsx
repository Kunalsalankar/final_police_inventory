import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

export default function LoginScreen() {
  // State management for form inputs and loading state
  const [badgeNumber, setBadgeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Handle form validation and submission
  const handleLogin = async () => {
    // Basic form validation
    if (!badgeNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter your badge number');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement your authentication logic here
      // Example:
      // const response = await authService.login({ badgeNumber, password });
      // if (response.success) {
      //   await secureStorage.setToken(response.token);
      //   router.replace('/(tabs)');
      // }
      
      // Temporary: Direct navigation for demonstration
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
    } catch (error) {
      Alert.alert(
        'Login Failed',
        'Please check your credentials and try again'
      );
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image
          // Using require with the correct relative path
          source={require('../../assets/images/logo.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>EquipTrack</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          label="Badge Number"
          value={badgeNumber}
          onChangeText={setBadgeNumber}
          style={styles.input}
          mode="outlined"
          activeOutlineColor={Colors.primary}
          keyboardType="number-pad"
          autoCapitalize="none"
          returnKeyType="next"
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          activeOutlineColor={Colors.primary}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
        >
          Login
        </Button>

        <Text style={styles.forgotPassword}>
          Forgot password? Contact IT Support
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
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
  input: {
    marginBottom: 16,
    backgroundColor: Colors.white,
  },
  button: {
    marginTop: 10,
    padding: 5,
    backgroundColor: Colors.primary,
  },
  forgotPassword: {
    marginTop: 20,
    textAlign: 'center',
    color: Colors.text,
    fontSize: 14,
  },
});