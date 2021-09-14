/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry,LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

LogBox.ignoreLogs([
    'ReactNativeFiberHostComponent: Calling getNode() on the ref of an Animated component is no longer necessary. You can now directly use the ref instead. This method will be removed in a future release.',
]);

AppRegistry.registerComponent(appName, () => App);
