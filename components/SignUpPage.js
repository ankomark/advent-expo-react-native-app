// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';

// const BASE_URL = "http://192.168.143.138:8000/api/auth/signup/"; // Base URL for API

// const SignUpPage = () => {
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false); // To indicate loading state
//   const navigation = useNavigation();

//   const handleChange = (name, value) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async () => {
//     setError(''); // Clear any previous errors
//     setLoading(true);

//     try {
//       console.log('Form Data being sent:', formData); // Debugging log
//       const response = await axios.post(BASE_URL, formData);

//       // Check if the response contains tokens
//       if (response.data.access && response.data.refresh) {
//         await AsyncStorage.setItem('accessToken', response.data.access);
//         await AsyncStorage.setItem('refreshToken', response.data.refresh);

//         console.log('Tokens saved successfully');
//         navigation.navigate('Login'); // Navigate to login page
//       } else {
//         setError('Unexpected response from the server.');
//       }
//     } catch (error) {
//       console.error('Error signing up:', error.response?.data || error.message); // Improved debugging
//       setError(error.response?.data?.message || 'Failed to sign up. Please try again.');
//     } finally {
//       setLoading(false); // Stop loading spinner
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Sign Up</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Username"
//         autoComplete="username"
//         value={formData.username}
//         onChangeText={(value) => handleChange('username', value)}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         autoComplete="email"
//         keyboardType="email-address"
//         value={formData.email}
//         onChangeText={(value) => handleChange('email', value)}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         secureTextEntry
//         autoComplete="new-password"
//         value={formData.password}
//         onChangeText={(value) => handleChange('password', value)}
//       />

//       <TouchableOpacity
//         style={[styles.button, loading ? styles.disabledButton : {}]}
//         onPress={handleSubmit}
//         disabled={loading}
//       >
//         <Text style={styles.buttonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
//       </TouchableOpacity>

//       {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 20,
//     backgroundColor: '#f9f9f9',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   input: {
//     height: 50,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//     backgroundColor: '#fff',
//   },
//   button: {
//     backgroundColor: '#007bff',
//     paddingVertical: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   disabledButton: {
//     backgroundColor: '#9ac1ff',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   errorMessage: {
//     color: 'red',
//     textAlign: 'center',
//     marginTop: 10,
//   },
// });

// export default SignUpPage;


import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const SignUpPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', is_artist: false });
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // const handleCheckboxChange = () => {
  //   setFormData({
  //     ...formData,
  //     is_artist: !formData.is_artist,
  //   });
  // };

  const handleSubmit = async () => {
    try {
      await axios.post(' http://192.168.31.138:8000/api/auth/signup/', formData);
      navigation.navigate('Login'); // Redirect to login page after successful sign-up
    } catch (error) {
      setError(error.response?.data?.message || 'Error signing up');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={formData.username}
        onChangeText={(text) => handleChange('username', text)}
        autoComplete="username"
        required
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
        keyboardType="email-address"
        autoComplete="email"
        required
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => handleChange('password', text)}
        secureTextEntry
        autoComplete="password"
        required
      />
      {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}> */}
        {/* <TouchableOpacity onPress={handleCheckboxChange}>
          <View
            style={{
              height: 20,
              width: 20,
              borderWidth: 1,
              borderColor: '#ccc',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              backgroundColor: formData.is_artist ? '#007bff' : '#fff',
            }}
          >
            {formData.is_artist && <Text style={{ color: '#fff' }}>✓</Text>}
          </View>
        </TouchableOpacity>
        <Text>Are you an artist?</Text>
      </View> */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorMessage}>{error}</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ac1ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default SignUpPage;