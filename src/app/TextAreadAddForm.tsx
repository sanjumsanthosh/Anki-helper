import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useCounterStore } from '@/provider/result-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { parseAnkiNote } from '@/lib/ankiParser';
import { AddNotes } from '@/const/ankiActions';
import { RequestBuilder } from '@/lib/fetchUtils';

// Define the schema for the form
const FormSchema = z.object({
    text: z.string()
});

export default function TextAreadAddForm() {
    const { setStatus , deck } = useCounterStore((state) => state);
    const [isValid, setIsValid] = useState(false);
    const [notes, setNotes] = useState<{ question: string; answer: string; }[]>([]);

    // Initialize the form with default values and validation schema
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            text: ""
        }
    });

    // Function to handle form submission
    async function onSubmit(data: z.infer<typeof FormSchema>) {
        if (isValid) {
            try {
                const action = AddNotes.createAddNotes();
                action.setDeckName(deck);
                notes.forEach(note => {
                    action.addQANotes([{
                        front: note.question,
                        back: note.answer
                    }]);
                });
                const builder = await RequestBuilder.create<AddNotes>()
                    .setAction(action)
                    .performAction();
                if (builder.isSuccessful()) {
                    const responseAction = builder.getResponseAction();
                    setStatus(JSON.stringify(responseAction.result));
                }
                setIsValid(false);
                form.reset();
            } catch (error) {
                console.error("Error submitting form", error);
                setStatus(JSON.stringify({error: "Error submitting form"}, null, 2));
            }
        } else {
            try {
                setNotes(parseAnkiNote(data.text));
                setIsValid(true);
                setStatus(JSON.stringify(notes, null, 2));
            } catch (error) {
                if (error instanceof Error) {
                    setStatus(JSON.stringify({error: error.message}, null, 2));
                } else if (typeof error === 'object') {
                    setStatus(JSON.stringify({error: error||''.toString()}, null, 2));
                } else {
                    setStatus(JSON.stringify({error: "Got error when parsing"}, null, 2));
                }
            }
        }
    }

    // Function to handle form reset
    const onClear = () => {
        if (isValid) {
            setIsValid(false);
            return;
        }
        form.reset();
        setIsValid(false);
        setNotes([]);
        setStatus('');
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} onReset={onClear}>
                <FormField 
                    control={form.control}
                    name='text'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Text</FormLabel>
                            <FormControl>
                                <Textarea
                                    disabled={isValid}
                                    placeholder="text"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className='my-4' variant="success">
                    {isValid ? "Add" : "Validate"}
                </Button>
                <Button type="reset" className='my-4 mx-5' variant="destructive">
                    {isValid ? "Cancel" : "Clear"}
                </Button>
            </form>
        </Form>
    );
}
