import React, { useState, useEffect, useRef, useReducer } from 'react';
import Slider from '@react-native-community/slider';
import {
  Text,
  View,
  Image,
  ScrollView,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Camera } from 'expo-camera';
import styles from './style.js';
import { FontAwesome } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';
import IconButton from './src/components';

const initialState = {
  whbalance: 'auto',
  cameraType: 'back',
  flash: 'off',
  zoomValue: 0,
};

function reducer(state = initialState, action: { type: string, payload: any }) {
  switch (action.type) {
    case '@type/FLASH':
      return { ...state, flash: action.payload };
    case '@type/ZOOM':
      return {
        ...state,
        zoomValue: action.payload,
      };
    default:
      return { ...state };
  }
}

export default function App() {
  const camRef = useRef(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [open, setOpen] = useState(false);
  const { zoomValue, flash } = state;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    (async () => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  async function takePicture() {
    if (camRef) {
      const data = await camRef.current.takePictureAsync();
      setCapturedPhoto(data.uri);
      setOpen(true);
    }
  }

  async function savePicture() {
    const assets = await MediaLibrary.createAssetAsync(capturedPhoto).then(
      () => {
        alert('Salvo com sucesso');
      }
    );
  }

  const _zoomEffect = (value: number) => {
    dispatch({
      type: '@type/ZOOM',
      payload: value,
    });
  };

  const _toggleFlash = () => {
    if (flash === 'off') {
      dispatch({
        type: '@type/FLASH',
        payload: 'on',
      });
    } else {
      dispatch({
        type: '@type/FLASH',
        payload: 'off',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        ref={camRef}
        zoom={zoomValue}
        flashMode={flash}>
        <View 
          style={{ 
            padding: 20,
            position: 'absolute',
            zIndex: 2,
            }}>
          <ScrollView>
            <IconButton
              color="black"
              size= {35}
              icon={flash === 'on' ? 'zap' : 'zap-off'}
              onPress={_toggleFlash}
            />
          </ScrollView>
        </View>

        <View
          style={{
            position: 'absolute',
            top: 300,
            flexDirection: 'column',
            transform: [{ rotateZ: '-90deg' }],
            marginTop: 60,
            marginLeft: '80%',
          }}>
          <Slider
            onValueChange={_zoomEffect}
            style={{
              zIndex: 2,
              width: 300,
              height: 80,
            }}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            Slider
          />
        </View>
        <View style={styles.contentButtons}>
          <TouchableOpacity
            style={styles.buttonFlip}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <FontAwesome name="exchange" size={23} color="#fff"></FontAwesome>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonCamera} onPress={takePicture}>
            <FontAwesome name="camera" size={23} color="black"></FontAwesome>
          </TouchableOpacity>
        </View>
      </Camera>
      {capturedPhoto && (
        <Modal animationType="slide" transparent={true} visible={open}>
          <View style={styles.contentModal}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setOpen(false)}>
              <FontAwesome name="close" size={50} color="#fff"></FontAwesome>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={savePicture}>
              <FontAwesome name="download" size={50} color="#fff"></FontAwesome>
            </TouchableOpacity>
            <Image style={styles.imgPhoto} source={{ uri: capturedPhoto }} />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
