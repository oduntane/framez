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

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigation = useNavigation();

  // Check for success message from navigation params
  React.useEffect(() => {
    // Only run if navigation has the required methods (not in tests)
    if (typeof navigation.addListener !== 'function') {
      return;
    }

    const unsubscribe = navigation.addListener('focus', () => {
      const route = navigation.getState?.()?.routes?.find(r => r.name === 'Login');
      if (route?.params?.message) {
        setSuccessMessage(route.params.message);
        // Clear the message after showing it
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      
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
      
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      {loading && <ActivityIndicator testID="loading-spinner" size="large" color="#007AFF" />}
      
      <TouchableOpacity
        testID="login-button"
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('SignUp' as never)}>
        <Text style={styles.link}>
          Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
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
  success: {
    color: 'green',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '500',
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

export default LoginScreen;