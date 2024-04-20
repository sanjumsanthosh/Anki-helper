import { AnkiAction } from "@/const/ankiActions";

class RequestBuilder<T extends AnkiAction> {

    url: URL;
    action: T;
    success: Boolean;

    static create<T extends AnkiAction>(){
        return new RequestBuilder<T>()
    }

    constructor(){
        this.url = new URL(process.env.ANKI_ENDPOINT || 'http://localhost:8765');
        this.action = null as unknown as T; // Placeholder, actual initialization might vary
        this.success = false;
    }

    setAction(action: T){
        this.action = action;
        return this;
    }

    getResponseAction(){
        return this.action;
    }

    isSuccessful(){
        return this.success;
    }

    async performAction(){
        console.log(this.action.build());
        try {
            const response = await fetch(this.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: this.action.build()
            });
            if (response.body instanceof ReadableStream) {
                const text = await new Response(response.body).text();
                console.log(text); 
                this.success = true;
                this.action.parseResponse(text);
            }
        } catch (error) {
            console.error(error); 
            this.success = false;
        }
        return this;
    }
}

export { RequestBuilder }