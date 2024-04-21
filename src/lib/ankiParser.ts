// Q::What is scalar from microsoft?
// A::Scalar is a git client from microsoft that targets large repos and windows users. It includes features like sparse checkout, partial clone etc.. It automatically include many configs to handle large repos

function parseAnkiNote(text: string) {

    const notes = text.split('\n\n')
    const QAPair = notes.map((note) => {
        const [question, answer] = note.split('\n');
        if (!question || !answer || !question.startsWith('Q::') || !answer.startsWith('A::')) {
            throw new Error('Invalid note format');
        }
        return { 
            question: question.replace('Q::', ''),
            answer: answer.replace('A::', '')
         };
    });

    return QAPair;
}

export {
    parseAnkiNote
}