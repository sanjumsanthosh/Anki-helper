import { z } from 'zod'

enum ACTION {
    UNDEFINED = 'undefined',
    DECK_NAMES = 'deckNames',
    GET_DECKS = 'getDecks',
    DECK_NAMES_AND_IDS = "deckNamesAndIds",
    FIND_NOTES = "findNotes",
    NOTES_INFO = "notesInfo"
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

class DeckNamesAndIds extends AnkiAction {
    deckNamesAndIds: { [key: string]: number }

    static createDeckNamesAndIds() {
        return new DeckNamesAndIds()
    }

    constructor() {
        super()
        this.action = ACTION.DECK_NAMES_AND_IDS
        this.version = 6
        this.deckNamesAndIds = {}
    }

    parseResponse(response: string) {
        // eg response = '{"result": {"Default": 1}, "error": null}'
        const data = JSON.parse(response)
        if (data.error) return
        this.deckNamesAndIds = data.result
    }
}


class FindNotes extends AnkiAction {
    notes: number[]
    params = {}

    static createFindNotes() {
        return new FindNotes()
    }

    constructor() {
        super()
        this.action = ACTION.FIND_NOTES
        this.version = 6
        this.notes = []
    }

    setDeck(deck: string) {
        this.params = { query: `deck:"${deck}"` }
        return this
    }

    setNotes(notes: number[]) {
        this.notes = notes
        return this
    }

    addNote(note: number) {
        this.notes.push(note)
        return this
    }

    parseResponse(response: string) {
        // eg response = '{"result": [1483959289817, 1483959291695], "error": null}'
        const data = JSON.parse(response)
        if (data.error) return
        this.notes = data.result
    }
}


const NotesInfoResult = z.object({
    noteId: z.number(),
    modelName: z.string(),
    tags: z.array(z.string()),
    fields: z.object({
        Front: z.object({
            value: z.string(),
            order: z.number()
        }),
        Back: z.object({
            value: z.string(),
            order: z.number()
        })
    })
})

class NotesInfo extends AnkiAction {
    
    params = {}
    result: z.infer<typeof NotesInfoResult>[] = []

    static createNotesInfo() {
        return new NotesInfo()
    }

    constructor() {
        super()
        this.action = ACTION.NOTES_INFO
        this.version = 6
        this.params = {}
    }

    setNotes(notes: number[]) {
        this.params = { notes }
        return this
    }


    parseResponse(response: string) {
        const data = JSON.parse(response)
        if (data.error) return
        this.result = data.result
    }

    getAllNoteInfo(): any {
        return this.result
    }
    
    getResultForNoteId(noteId: number) {
        return this.result.find((note) => note.noteId === noteId)
    }
}


export { ACTION, AnkiAction, DeckNames, GetDecks, DeckNamesAndIds , FindNotes , NotesInfo, NotesInfoResult}