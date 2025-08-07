import { useEffect, useRef, useState, useContext } from 'react';
import { View, Animated, StyleSheet, Text, Button } from 'react-native';
import { Asset } from 'expo-asset';
import { router } from 'expo-router';
import { UserContext } from './utils/contexts/user-context';
import { criticalAssets, nonCriticalAssets } from './utils/assets';
import { scaleFont } from './utils/scale-fonts';
import AsyncStorageService from './utils/services/async-storage-service'
import NetInfo from "@react-native-community/netinfo";
import usePopups from './utils/hooks/use-popups';
import { routes } from './utils/settings/constants';
import { prefetchMainScreens, prefetchAuthenticationScreens } from './utils/services/screens-prefetch';
import { Images } from './utils/assets'
import UserDatabaseService from './utils/services/database/user-db-service';

export default function Index() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [appIsReady, setAppIsReady] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const { createAlert } = usePopups()

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, []);

  useEffect(() => {
    try {
      async function fetchUser() {
        const fetchedUser = await AsyncStorageService.isUserSignedIn()
        setUser(fetchedUser)
      }

      async function prepare() {
        try {
          await Asset.loadAsync(criticalAssets);
        } catch (e) {
          createAlert({ title: "Application Failure", text: "Application failed loading assets!", buttonText: "RETRY", onPress: () => router.replace("/"), });
        } finally {
          setAppIsReady(true);
        }
      }

      fetchUser();
      prepare();
    } catch (e) { console.log(e.message) }
  }, []);

  useEffect(() => {
    async function checkInternetConnection() {
      const netState = await NetInfo.fetch();
      const hasInternet = netState.isConnected && netState.isInternetReachable;

      if (!hasInternet)
        return false;
      return true;
    }

    async function reroute() {
      if (!appIsReady || user === undefined) return;

      try {
        const internet = await checkInternetConnection()
        if (!internet)
          throw new Error("No internet connection!");

        await Asset.loadAsync(nonCriticalAssets)

        if (!user) {
          prefetchAuthenticationScreens();
          router.replace(routes.INTRODUCTION);
        }
        else {
          prefetchMainScreens();
          router.replace(routes.HOMEPAGE);
        }
      } catch (e) {
        createAlert({ title: "Application Failure", text: e.message, buttonText: "RETRY", onPress: () => router.replace("/"), });
      }
    }

    reroute();
  }, [appIsReady, user]);

  return (
    <View style={styles.main}>
      <Animated.Image
        style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
        source={Images.logo}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  main: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgb(10, 10, 10)" },
  logo: { width: 300, height: 300 },
  title: { fontSize: scaleFont(50), fontWeight: 'bold', color: 'rgb(0,140,255)', fontFamily: 'monospace' },
});