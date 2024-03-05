import { State } from "../redux/slice";

export const initialState: State = {
    suggestions: [
        {
            id: "2mTWe8UNHY2z4VZEdZzFec",
            snippet: "Should we despair for a humanity too far gone and beyond redemption?",
            terms: "Humanity despair",
        },
        {   
            id: "pNXYbVxeofGpqBA84DsZAe",
            snippet: "the abundant nihilism of today is not a sign of the decline of humanity",
            terms: "abundant nihilism",
        },
        {   
            id: "cPa5NjgCMbKZw6y81BrTA1",
            snippet: "Nietzsche provides insight into how a society like ours came about, and how one can rise above our own mediocrity and become something greater.",
            terms: "Nietzsche mediocrity",
        }
    ],
    sources: [],
    selectedSuggestion: null,
    support: [],
    pendingTasks: [],
};