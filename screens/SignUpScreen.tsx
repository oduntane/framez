import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigation = useNavigation();
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setLoading = useAuthStore((state) => state.setLoading);
  const loading = useAuthStore((state) => state.loading);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    try {
      setError('');

      // Validate email format
      if (!validateEmail(email)) {
        setError('Please enter a valid email');
        return;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setLoading(true);

      const { user, session } = await authService.signUp(email, password);

      setUser(user);
      setAuthenticated(true);
      
      navigation.navigate('Feed' as never);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {loading && (
          <ActivityIndicator
            testID="loading-spinner"
            size="large"
            color="#007AFF"
            style={styles.spinner}
          />
        )}

        <TouchableOpacity
          testID="signup-button"
          style={[styles.button, !isFormValid && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={!isFormValid || loading}
          accessibilityState={{ disabled: !isFormValid || loading }}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginTextBold}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  spinner: {
    marginVertical: 10,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginTextBold: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default SignUpScreen;