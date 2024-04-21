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

const FormSchema = z.object({
    text: z.string()
});


export default function TextAreadAddForm() {

    const { setStatus , deck } = useCounterStore((state) => state);
    const [isValid, setIsValid] = useState(false);
    const [notes, setNotes] = useState<{ question: string; answer: string; }[]>([]);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            text: ""
        }
    });

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        if (isValid) {
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
        } else {
            try {
                setNotes(parseAnkiNote(data.text));
            } catch (error) {
                console.log(typeof error === 'object');
                console.log(typeof error);
                if (error instanceof Error) {
                    setStatus(JSON.stringify({error: error.message}, null, 2));
                } else if (typeof error === 'object') {
                    console.log(JSON.stringify({error: error||''.toString()}, null, 2));
                    setStatus(JSON.stringify({error: error||''.toString()}, null, 2));
                } else {
                    setStatus(JSON.stringify({error: "Got error when parsing"}, null, 2));
                }
            }
            if (notes.length > 0) {
                setIsValid(true);
                setStatus(JSON.stringify(notes, null, 2));
            }
            
        }
    }


    const onClear = () => {
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
                   Clear
                </Button>
            </form>
        </Form>
    );
}