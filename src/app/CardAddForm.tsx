import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { AddNotes } from '@/const/ankiActions';
import { RequestBuilder } from '@/lib/fetchUtils';
import { useCounterStore } from '@/provider/result-provider';
import { Textarea } from '@/components/ui/textarea';

export default function CardAddForm() {

    const SUPPORTED_MODEL_NAMES = ["Basic"];

    const { setStatus, deck } = useCounterStore((state) => state);

    const formSchema = z.object({
        front: z.string(),
        back: z.string(),
        modelName: z.string().refine((modelName) => SUPPORTED_MODEL_NAMES.includes(modelName), {
            message: "Model name not supported"
        })
    });


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            front: "",
            back: "",
            modelName: SUPPORTED_MODEL_NAMES[0]
        },
    });


    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const subscription = form.watch((values, { name, type }) => {
            const isEmpty = values.front === "" || values.back === "" || values.modelName === "";
            setIsValid(!isEmpty);
        });
        return () => subscription.unsubscribe();
    }, [form.watch]);
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (isValid) {
            const action = AddNotes.createAddNotes();
            action.setDeckName(deck);
            action.addQANotes([{
                front: values.front,
                back: values.back
            }]);
            const builder = await RequestBuilder.create<AddNotes>()
                .setAction(action)
                .performAction();
            if (builder.isSuccessful()) {
                const responseAction = builder.getResponseAction();
                setStatus(JSON.stringify(responseAction.result));
            }
            setIsValid(false);
            form.reset();
            setTimeout(() => form.setFocus('front'), 0); 
        } else {
            const currentField = document.activeElement as HTMLInputElement;
            switch (currentField.name) {
                case 'front':
                    form.setFocus('back');
                    break;
            
            }
        }
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField 
                    control={form.control}
                    name='front'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Front</FormLabel>
                            <FormControl>
                                <Input placeholder="front" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                <FormField
                    control={form.control}
                    name='back'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Back</FormLabel>
                            <FormControl>
                                <Textarea placeholder="back" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                <FormField
                    control={form.control}
                    name='modelName'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Model Name</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a model name" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {SUPPORTED_MODEL_NAMES.map((modelName) => (
                                        <SelectItem key={modelName} value={modelName} onSelect={() => field.onChange(modelName)}>
                                            {modelName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                <div className="text-right my-3">
                    <Button type="submit" size="sm" variant={isValid ? "brand" :"destructive"}> 
                        {isValid ? "Add" : "All Fields Required !!!"}
                    </Button>
                </div> 
            </form>
        </Form>
    )
}