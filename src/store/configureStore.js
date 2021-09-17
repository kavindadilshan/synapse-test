import { createStore, combineReducers, compose ,applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import userReducer from './reducers/user';

const rootReducer=combineReducers({
    user:userReducer,
});

let composeEnchancers=compose;

if (__DEV__) {
    composeEnchancers=window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

const configureStore=()=>{
    return createStore(rootReducer,composeEnchancers(applyMiddleware(thunk)));
};

export default configureStore;
