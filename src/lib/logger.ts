class Logger {
    static color_map: { [key: string]: string } = {
        log: 'lightgray',
        debug: 'lightblue',
        info: 'lightgreen',
        warn: 'yellow',
        error: 'lightcoral'
    }
    static log(name: string, message: string) {
        console.log(`%c[${name}] ${message}`, `color: ${this.color_map.log}`);
    }

    static debug(name: string, message: string) {
        console.debug(`%c[${name}] ${message}`, `color: ${this.color_map.debug}`);
    }

    static info(name: string, message: string) {
        console.info(`%c[${name}] ${message}`, `color: ${this.color_map.info}`);
    }

    static warn(name: string, message: string) {
        console.warn(`%c[${name}] ${message}`, `color: ${this.color_map.warn}`);
    }

    static error(name: string, message: string) {
        console.error(`%c[${name}] ${message}`, `color: ${this.color_map.error}`);
    }
}

export {
    Logger
}