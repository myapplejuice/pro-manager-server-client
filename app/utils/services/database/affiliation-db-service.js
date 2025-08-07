import 'react-native-get-random-values';

export default class AffiliationDatabaseService {
    static URL = "http://192.168.33.17:5000/api/Affiliation";

    static createAbortController() {
        const TIMEOUT = 5000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
        return { controller, timeoutId };
    }

    static async createAffiliation(affiliation) {
        if (!this.URL)
            return "No backend server available!\nPlease try again later.";

        const { controller, timeoutId } = this.createAbortController();

        try {
            const response = await fetch(this.URL, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(affiliation),
                signal: controller.signal,
            });

            switch (response.status) {
                case 400: return "Missing or invalid user information!";
                case 500: return "Internal server error!\nPlease try again later.";
                case 200: return await response.json();
                default: return "Unexpected error!\nPlease try again later.";
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

    static async fetchAllAffiliations() {
        if (!this.URL)
            return "No backend server available!\nPlease try again later.";

        const { controller, timeoutId } = this.createAbortController();

        try {
            const response = await fetch(this.URL, {
                method: 'GET',
                signal: controller.signal,
            });

            switch (response.status) {
                case 404: return [];
                case 200: return await response.json();
                case 500: return "Internal server error!\nPlease try again later.";
                default: return "Unexpected error!\nPlease try again later.";
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

    static async fetchUserAffiliations(userId) {
        if (!this.URL)
            return "No backend server available!\nPlease try again later.";

        if (!userId)
            return "User ID is required!";

        const { controller, timeoutId } = this.createAbortController();

        try {
            const response = await fetch(`${this.URL}/${userId}`, {
                method: 'GET',
                signal: controller.signal,
            });

            switch (response.status) {
                case 200: return await response.json();
                case 400: return "User ID cannot be null or empty!";
                default: return null;
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

    static async endAffiliation(affiliationId) {
        if (!this.URL)
            return "No backend server available!\nPlease try again later.";

        const { controller, timeoutId } = this.createAbortController();

        try {
            const response = await fetch(`${this.URL}/${affiliationId}`, {
                method: 'DELETE',
                signal: controller.signal,
            });

            switch (response.status) {
                case 400: return "User ID and Affiliate ID must be provided.";
                case 500: return "Failed to delete affiliation!\nPlease try again later.";
                case 200: return "Affiliation ended successfully!";
                default: return "Unexpected error!\nPlease try again later.";
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
}
