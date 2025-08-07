
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class AsyncStorageService {
    static DEFAULT_PREFERENCES = { language: 'English', theme: 'dark' };

    static async signOutUser() {
        await AsyncStorage.multiRemove(["currentUser", "userAffiliates"]);
        router.replace('/screens/authentication/introduction');
    }

    static async signInUser(data) {
        data.preferences = await this.getOrSetUserPreferences();
        this.convertImageBase64ToUri(data);

        await AsyncStorage.setItem('currentUser', JSON.stringify(data));
        return data;
    }

    static async isUserSignedIn() {
        const user = JSON.parse(await AsyncStorage.getItem("currentUser"));
        if (!user) return null;

        user.preferences = await this.getOrSetUserPreferences();
        return user;
    }

    static convertImageBase64ToUri(data) {
        if (data.imageBase64) {
            data.image = { uri: `data:image/jpeg;base64,${data.imageBase64}` };
            delete data.imageBase64;
        }
    }

    static async getOrSetUserPreferences() {
        let userPreferences = JSON.parse(await AsyncStorage.getItem("userPreferences"));

        if (!userPreferences) {
            userPreferences = this.DEFAULT_PREFERENCES;
            await AsyncStorage.setItem("userPreferences", JSON.stringify(userPreferences));
        }

        return userPreferences;
    }
}
