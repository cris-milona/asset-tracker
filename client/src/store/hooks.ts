import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';
//reaches into the store and hands us back the store's own dispatch function to be able to dispatch an action and mutate the store
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
//runs our selector function against the current state and returns the result, then subscribes the component to the store so it's notified every time any action is dispatched anywhere in the app and finally on every store update, it re-runs the selector and compares the new result to the old one If different → the component re-renders with the new value
export const useAppSelector = useSelector.withTypes<RootState>();
