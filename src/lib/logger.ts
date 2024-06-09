class Logger {
    static color_map: { [key: string]: string } = {
        log: 'lightgray',
        debug: 'lightblue',
        info: 'lightgreen',
        warn: 'yellow',
        error: 'lightcoral'
    }
    static log(name: string, ...messages: any[]) {
        console.log(`%c[${name}]`,  `, color: ${this.color_map.log}`, ...messages);
    }

    static debug(name: string, ...messages: any[]) {
        console.debug(`%c[${name}]`, `, color: ${this.color_map.debug}`, ...messages);
    }

    static info(name: string, ...messages: any[]) {
        console.info(`%c[${name}]`, `, color: ${this.color_map.info}`, ...messages);
    }

    static warn(name: string,...messages: any[]) {
        console.warn(`%c[${name}]`, `, color: ${this.color_map.warn}`, ...messages);
    }

    static error(name: string, ...messages: any[]) {
        console.error(`%c[${name}]`, `, color: ${this.color_map.error}`, ...messages);
    }
}

export {
    Logger
}