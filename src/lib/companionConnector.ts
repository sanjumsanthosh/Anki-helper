const HEALTH_CHECK = '/health-check';
const LIST_ALL = '/list';
const GET_DOT = '/:id/dot';
const GET_JSON = '/:id/json';

class CompanionConnector {
    host: string = "http://localhost";
    port: number = 3939;
    connectionUtil: ConnectionUtil;

    constructor() {
        this.connectionUtil = new ConnectionUtil(this.host, this.port);
    }

    // Check the connection to the companion server
    async checkConnection() {
        try {
            const response = await this.connectionUtil.get(HEALTH_CHECK);
            if (response.status === 200) {
                return true;
            }
        } catch (error) {
            console.error("Error checking connection", error);
        }
        return false;
    }

    // List all available files from the companion server
    async listAll(): Promise<string[]> {
        try {
            const response = await this.connectionUtil.get(LIST_ALL);
            if (response.status === 200) {
                return response.json();
            }
        } catch (error) {
            console.error("Error listing all files", error);
        }
        return [];
    }

    // Get the DOT file for a specific ID from the companion server
    async getDot(id: string): Promise<string> {
        try {
            const response = await this.connectionUtil.get(GET_DOT.replace(':id', id));
            if (response.status === 200) {
                return response.text();
            }
        } catch (error) {
            console.error("Error getting DOT file", error);
        }
        return '';
    }

    // Get the JSON file for a specific ID from the companion server
    async getJSON(id: string): Promise<any> {
        try {
            const response = await this.connectionUtil.get(GET_JSON.replace(':id', id));
            if (response.status === 200) {
                return response.json();
            }
        } catch (error) {
            console.error("Error getting JSON file", error);
        }
        return {};
    }

    // Save the JSON file for a specific ID to the companion server
    async saveJSON(id: string, json: any) {
        try {
            const response = await this.connectionUtil.post(GET_JSON.replace(':id', id), json);
            if (response.status === 200) {
                return response.json();
            }
        } catch (error) {
            console.error("Error saving JSON file", error);
        }
        return {};
    }
}

class ConnectionUtil {
    host: string;
    port: number;
    baseURL: string;

    constructor(host: string, port: number) {
        this.host = host;
        this.port = port;
        this.baseURL = `${host}:${port}`;
    }

    // Perform a GET request to the specified path
    async get(path: string) {
        try {
            return fetch(`${this.baseURL}${path}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error("Error performing GET request", error);
            throw error;
        }
    }

    // Perform a POST request to the specified path with the given body
    async post(path: string, body: any) {
        try {
            return fetch(`${this.baseURL}${path}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
        } catch (error) {
            console.error("Error performing POST request", error);
            throw error;
        }
    }
}

export {
    CompanionConnector
}
