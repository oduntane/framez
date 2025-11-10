import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = useAuthStore((state) => state.signUp);
  const navigation = useNavigation();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await signUp(email, password, username);
      
      // Redirect to login screen with success message
      navigation.navigate('Login' as never, { 
        message: 'Account created successfully! Please login with your credentials.' 
      } as never);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      {loading && <ActivityIndicator testID="loading-spinner" size="large" color="#007AFF" />}
      
      <TouchableOpacity
        testID="signup-button"
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
        <Text style={styles.link}>
          Already have an account? <Text style={styles.linkBold}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
  linkBold: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;