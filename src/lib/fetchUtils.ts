import { AnkiAction } from "@/const/ankiActions";

// RequestBuilder class to build and perform requests to the Anki API
class RequestBuilder<T extends AnkiAction> {

    url: URL;
    action: T;
    success: Boolean;

    // Static method to create a new instance of RequestBuilder
    static create<T extends AnkiAction>(){
        return new RequestBuilder<T>()
    }

    constructor(){
        this.url = new URL(process.env.ANKI_ENDPOINT || 'http://localhost:8765');
        this.action = null as unknown as T; // Placeholder, actual initialization might vary
        this.success = false;
    }

    // Method to set the action for the request
    setAction(action: T){
        this.action = action;
        return this;
    }

    // Method to get the response action
    getResponseAction(){
        return this.action;
    }

    // Method to check if the request was successful
    isSuccessful(){
        return this.success;
    }

    // Method to perform the action and handle the response
    async performAction(){
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
                this.success = true;
                this.action.parseResponse(text);
            }
        } catch (error) {
            console.error("Error performing action", error); 
            this.success = false;
        }
        return this;
    }
}

export { RequestBuilder }
