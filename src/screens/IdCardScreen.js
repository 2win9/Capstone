import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { useRoute } from '@react-navigation/native';

const GeoLocationAPI = () => {
    const route = useRoute();
    const { userId, phoneNumber, adminName, institutionName } = route.params;

    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [ws, setWs] = useState(null);

    // 위치 권한 요청 함수
    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'This app needs to access your location.',
                        buttonPositive: 'OK',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // 권한 허용되면 위치 정보 가져오기
                    geoLocation();
                } else {
                    console.log('Location permission denied.');
                }
            } else {
                // iOS에서는 이미 Info.plist에 권한을 설정했으므로 따로 처리할 필요 없음
                geoLocation();
            }
        } catch (err) {
            console.warn(err);
        }
    };

    // 위치 정보 가져오기 함수
    const geoLocation = async () => {
        Geolocation.watchPosition(
            position => {
                const { latitude, longitude } = position.coords;
                setLatitude(latitude);
                setLongitude(longitude);
            },
            error => {
                console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, distanceFilter: 0, interval: 1000, fastestInterval: 500 },
        );
    };

    // WebSocket 연결 및 데이터 전송 함수
    useEffect(() => {
        // const newWs = new WebSocket('ws://220.69.240.148:3333/ws'); // 새로운 WebSocket 인스턴스 생성
        // test server url
        const newWs = new WebSocket('ws://cclab.anu.ac.kr:24030/gps');
        // server url
        newWs.onopen = () => {
            console.log('Connected to WebSocket server');
            setWs(newWs); // ws 상태 변수 업데이트
        };

        newWs.onerror = (e) => {
            console.error('WebSocket error:', e.message);
        };

        // 컴포넌트가 언마운트될 때 WebSocket 연결 닫기
        return () => {
            newWs.close();
        };
    }, []);

    // 위치 값이 변경될 때마다 WebSocket을 통해 데이터 전송
    useEffect(() => {
        if (latitude !== null && longitude !== null && ws !== null) {
            const locationData = {
                userId: userId,
                Location: `(${latitude}, ${longitude})`
            };
            ws.send(JSON.stringify(locationData));
        }
    }, [latitude, longitude, ws]);

    // 페이지 로드 시 위치 권한 요청
    useEffect(() => {
        requestLocationPermission();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>인솔자 정보</Text>
                <Text style={styles.cardText}>인솔자 이름: {adminName}</Text>
                <Text style={styles.cardText}>인솔자 번호: {phoneNumber}</Text>
                <Text style={styles.cardText}>소속 기관: {institutionName}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 20,
        alignItems: 'center', // 수평 가운데 정렬
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    cardText: {
        fontSize: 18,
        marginBottom: 10,
    },
});

export default GeoLocationAPI;
