
enum ACTION {
    UNDEFINED = 'undefined',
    DECK_NAMES = 'deckNames',
    GET_DECKS = 'getDecks'
}

class AnkiAction {
    parseResponse(text: string): any {
        throw new Error("Method not implemented.");
    }
    action: ACTION;
    version;

    constructor() {
        this.action = ACTION.UNDEFINED
        this.version = 0
    }

    setVersion(version: number) {
        this.version = version
        return this
    }

    build() {
        return JSON.stringify(this)
    }
}

class DeckNames extends AnkiAction {

    names: string[]

    static createDeckNames() {
        return new DeckNames()
    }

    constructor() {
        super()
        this.action = ACTION.DECK_NAMES
        this.version = 6
        this.names = []
    }

    parseResponse(response: string) {
        const data = JSON.parse(response)
        if (data.error) return
        this.names = data.result
    }
}


class GetDecks extends AnkiAction {
    cards: number[]
    cardArray: { [key: string]: number[]}
    
    static createGetDecks() {
        return new GetDecks()
    }

    constructor() {
        super()
        this.action = ACTION.GET_DECKS
        this.version = 6
        this.cards = []
        this.cardArray = {}
    }

    setCards(cards: number[]) {
        this.cards = cards
        return this
    }

    addCard(card: number) {
        this.cards.push(card)
        return this
    }

    parseResponse(response: string) {
        const data = JSON.parse(response)
        if (data.error) return
        this.cardArray = data.result
    }

}

export { ACTION, AnkiAction, DeckNames, GetDecks }