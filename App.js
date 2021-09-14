/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import MainScreen from './src/screen/main/test';
import Providers from './src/navigation';

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    // <SafeAreaView style={backgroundStyle}>
    //   <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
    //   <ScrollView
    //     contentInsetAdjustmentBehavior="automatic"
    //     style={backgroundStyle}>
    //     <View>
    //       <Text style={[
    //           styles.background,
    //           {
    //               backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    //               color: isDarkMode ? Colors.white : Colors.black,
    //           },
    //       ]}>Bluetooth State Mgmt</Text>
    //     </View>
    //     <MainScreen />
    //   </ScrollView>
    // </SafeAreaView>
      <Providers/>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
