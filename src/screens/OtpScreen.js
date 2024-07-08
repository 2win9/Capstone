import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Homescreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']); // Array to store individual OTP characters
  const [loading, setLoading] = useState(false); // Loading state
  const inputRefs = useRef([]); // Refs for individual OTP inputs

  const handleInput = async () => {
    const otp = otpInputs.join(''); // Combine individual OTP characters into a single string
    // const url = 'http://220.69.240.148:3333/otp';
    const url = 'http://cclab.anu.ac.kr:24030/user/join';
    //서버 URL

    if (!userName || otp.length !== 6) {
      Alert.alert('입력 오류', '이름과 6자리 OTP를 입력하세요.');
      return;
    }

    try {
      setLoading(true); // Set loading to true when request is initiated

      const response = await Promise.race([ // Race between fetch request and timeout
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ otp, userName }),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000)) // Timeout after 15 seconds
      ]);

      if (response.ok) {
        const responseData = await response.json();
        console.log('서버 응답:', responseData);
        Alert.alert('전송여부', '전송이 완료되었습니다.');

        const { userId, phoneNumber, adminName, institutionName } = responseData;

        navigation.navigate('정보카드', {
          userId:  userId,
          phoneNumber: phoneNumber,
          adminName: adminName,
          institutionName: institutionName
        });
      } else {
        Alert.alert('Error', 'Failed to send OTP.');
      }
    } catch (error) {
      if (error.message === 'Timeout') {
        Alert.alert('Timeout', '서버 응답이 지연되고 있습니다. 나중에 다시 시도해주세요.');
      } else {
        Alert.alert('Error', 'An error occurred while sending OTP.');
        console.error('Error sending OTP:', error);
      }
    } finally {
      setLoading(false); // Set loading to false regardless of success or failure
    }
  };

  // Function to focus on the next OTP input
  const focusNextInput = (index) => {
    if (index < otpInputs.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Function to handle changes in OTP inputs
  const handleOtpInputChange = (index, value) => {
    const newOtpInputs = [...otpInputs];
    newOtpInputs[index] = value;
    setOtpInputs(newOtpInputs);

    // Automatically move to the next input when the current input is filled
    if (value.length === 1) {
      focusNextInput(index);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>성명</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="이름을 입력하세요"
          onChangeText={(text) => setUserName(text)}
        />
        <Text style={styles.header}>OTP</Text>
        <View style={styles.otpContainer}>
          {otpInputs.map((value, index) => (
            <TextInput
              key={index}
              ref={(ref) => inputRefs.current[index] = ref}
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={1} // Restrict input to one character
              onChangeText={(text) => handleOtpInputChange(index, text)}
              value={value}
            />
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleInput} disabled={loading}>
        <Text style={styles.buttonText}>입력하기</Text>
      </TouchableOpacity>
      {loading && (
        <ActivityIndicator style={styles.loadingIndicator} color="#5DB075" size="large" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    width: '80%',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: '#F5F5F5',
    elevation: 5,
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
  },
  otpInput: {
    height: 50,
    width: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: '#F5F5F5',
    elevation: 5,
    marginRight: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#F95700',
    borderRadius: 30,
    width: '80%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default Homescreen;
