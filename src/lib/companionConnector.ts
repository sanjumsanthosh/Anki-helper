

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

    async checkConnection() {
        try {
            const response = await this.connectionUtil.get(HEALTH_CHECK);
            if (response.status === 200) {
                return true;
            }
        } catch (error) {
            console.error(error);
        }
        return false;
    }

    async listAll(): Promise<string[]> {
        try {
            const response = await this.connectionUtil.get(LIST_ALL);
            if (response.status === 200) {
                return response.json();
            }
        } catch (error) {
            console.error(error);
        }
        return [];
    }

    async getDot(id: string): Promise<string> {
        try {
            const response = await this.connectionUtil.get(GET_DOT.replace(':id', id));
            if (response.status === 200) {
                return response.text();
            }
        } catch (error) {
            console.error(error);
        }
        return '';
    }

    async getJSON(id: string): Promise<any> {
        try {
            const response = await this.connectionUtil.get(GET_JSON.replace(':id', id));
            if (response.status === 200) {
                return response.json();
            }
        } catch (error) {
            console.error(error);
        }
        return {};
    }

    async saveJSON(id: string, json: any) {
        const response = await this.connectionUtil.post(GET_JSON.replace(':id', id), json);
        if (response.status === 200) {
            return response.json();
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

    async get(path: string) {
        return fetch(`${this.baseURL}${path}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async post(path: string, body: any) {
        return fetch(`${this.baseURL}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
    }
}


export {
    CompanionConnector
}