import AsyncStorageService from '../async-storage-service'
import 'react-native-get-random-values';

export default class UserDatabaseService {
    static URL = "http://reactproj.somee.com/api/User";

    static createAbortController() {
        const TIMEOUT = 5000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
        return { controller, timeoutId };
    }

    static async fetchAllUsers() {
        if (!this.URL)
            return "No backend server available!\nPlease try again later";

        const { controller, timeoutId } = this.createAbortController();

        try {
            const response = await fetch(`${this.URL}/all`, {  // GET /all endpoint
                method: "GET",
                signal: controller.signal
            });

            switch (response.status) {
                case 200: {
                    const data = await response.json();
                    return data ?? [];
                }
                case 500:
                    return "Internal server error!\nPlease try again later.";
                default:
                    return "Unexpected error!\nPlease try again later.";
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                return "The request timed out!\nPlease try again later.";
            }
            return `An error occurred!\n${error.message}`;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    static async fetchUser(email, password) {
        if (!this.URL)
            return "No backend server available!\nPlease try again later";

        const { controller, timeoutId } = this.createAbortController();

        try {
            const response = await fetch(`${this.URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                signal: controller.signal
            });

            switch (response.status) {
                case 400: return "Please fill in both fields.";
                case 401:
                case 404: return "User not found!\nOne or both of the fields are incorrect.";
                case 500: return "Internal server error!\nPlease try again later.";
                case 200: {
                    const data = await response.json();
                    return data ?? "An error occurred while trying to log in!\nPlease try again later.";
                }
                default: return "Unexpected error!\nPlease try again later.";
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                return "The request timed out!\nPlease try again later.";
            }
            return `An error occurred!\n${error.message}`;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    static async insertUser(username, firstname, lastname, age, gender, email, phone, password, isCoach, imageBase64) {
        if (!this.URL)
            return "No backend server available!\nPlease try again later";

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        const id = Array.from(crypto.getRandomValues(new Uint8Array(15)), byte =>
            chars[byte % chars.length]
        ).join('');

        const data = JSON.stringify({ id, username, firstname, lastname, age, gender, email, phone, password, isCoach, imageBase64 });

        const { controller, timeoutId } = this.createAbortController();

        try {
            const response = await fetch(this.URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: data,
                signal: controller.signal
            });

            switch (response.status) {
                case 400: return "Please fill all fields.";
                case 500: return "Internal server error!\nPlease try again later.";
                case 200: return await response.json();
                default: return "Internal server error!\nPlease try again later.";
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                return "The request timed out!\nPlease try again later.";
            }
            return `Internal server error!\n${error.message}`;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    static async updateUser(id, username, firstname, lastname, age, gender, email, phone, password, imageBase64) {
        if (!this.URL)
            return "No backend server available!\nPlease try again later";

        const { controller, timeoutId } = this.createAbortController();

        const data = {
            username: username || "",
            firstname: firstname || "",
            lastname: lastname || "",
            age: typeof age === "number" && age > 0 ? age : 0,
            gender: gender || "",
            email: email || "",
            phone: phone || "",
            password: password || "",
            imageBase64: imageBase64 || "",
        };

        try {
            const response = await fetch(`${this.URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            switch (response.status) {
                case 400: return "Please fill at least one of the fields to update your account information.";
                case 404: return "User not found!\nOne or both of the credentials are incorrect.";
                case 500: return "An error occurred while trying to log in!\nPlease try again later.";
                case 200: return await response.json() ?? "An error occurred while trying to fetch user!\nPlease try again later.";
                default: return "Internal server error!\nPlease try again later.";
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                return "The request timed out!\nPlease try again later.";
            }
            return `Internal server error!\n${error.message}`;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    static async updateUserByEmail(email, password) {
        if (!this.URL)
            return "No backend server available!\nPlease try again later";

        const { controller, timeoutId } = this.createAbortController();

        try {
            const response = await fetch(this.URL, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                signal: controller.signal
            });

            if (response.status === 200) {
                return true;
            }

            return false;
        } catch (error) {
            if (error.name === 'AbortError') {
                return "Internal server error!\nPlease try again later.";
            }
            return `Internal server error!\n${error.message}`;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    static async removeUser(id) {
        if (!this.URL)
            return "No backend server available!\nPlease try again later";

        const { controller, timeoutId } = this.createAbortController();

        try {
            const response = await fetch(`${this.URL}/${id}`, {
                method: "DELETE",
                signal: controller.signal
            });

            if (response.status === 200) {
                AsyncStorageService.signOutUser();
                return true;
            }

            return "Internal server error!\nPlease try again later.";
        } catch (error) {
            if (error.name === 'AbortError') {
                return "The request timed out!\nPlease try again later.";
            }
            return `Internal server error!\n${error.message}`;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    static async sendRecoveryMail(email, recoveryCode) {
        if (!this.URL)
            return "No backend server available!\nPlease try again later";

        const { controller, timeoutId } = this.createAbortController();

        const data = JSON.stringify({ email, recoveryCode });

        try {
            const response = await fetch(`${this.URL}/send-recovery-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: data,
                signal: controller.signal
            });

            if (response.status === 200)
                return true;

            return 'No account matched with this email address!\nPlease try again';
        } catch (error) {
            if (error.name === 'AbortError') {
                return "The request timed out!\nPlease try again later.";
            }
            return "Internal server error!\nAn error occurred while sending the email.\nPlease try again later.";
        } finally {
            clearTimeout(timeoutId);
        }
    }
}

