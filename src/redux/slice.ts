import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { Source, Suggestion, Support } from "../types";
import { initialState } from "../data/sampleStore";
import * as short from "short-uuid";

export interface State {
    sources: Source[]|undefined,
    suggestions: Suggestion[],
    selectedSuggestion: Suggestion|null,
    support: Support[],
    pendingTasks: string[],
}

interface Queries {
    "result": [
        {
            "snippet": string,
            "terms": string,
        }
    ]
}

/**
 * Creates suggestions by generating queries based on the provided text.
 * @param text - The input text to generate queries from.
 * @returns A Promise that resolves to the generated queries.
 */
export const createSuggestions = createAsyncThunk('store/generateQueries', async (text: string) => {
    const response = await fetch('/api/gen-terms', { method: 'POST', body: JSON.stringify({"text":text}), headers: { "Content-Type": "application/json" } });
    return (await response.json()) as Queries;
});

/**
 * Finds sources based on the provided text.
 * @param text - The text to search for sources.
 * @returns A Promise that resolves to an array of Source objects.
 */
export const findSources = createAsyncThunk('store/findSources', async (text: string) => {
    const response = await fetch('/api/scholar', { method: 'POST', body: JSON.stringify({"query":text}), headers: { "Content-Type": "application/json" } });
    return (await response.json()) as Source[];
});

/**
 * Finds support by making an asynchronous request to the server.
 * 
 * @param text - The text to be sent to the server.
 * @param source - The source of the text.
 * @returns A Promise that resolves to the result ID.
 */
export const findSupport = createAsyncThunk('store/findSupport', async ({text, source}: {text: string, source: Source}) => {
    const response = await fetch('/api/support-claim', { method: 'POST', body: JSON.stringify({"snippet":text, "source":source}), headers: { "Content-Type": "application/json" } });
    return (await response.json())['result_id'] as string;
});

/**
 * Redux slice for managing the store.
 */
export const slice = createSlice({
    name: "store",
    initialState,
    reducers: {
        /**
         * Sets the sources in the store.
         * @param state - The current state.
         * @param action - The action containing the payload.
         */
        setsources: (state, action: PayloadAction<Source[]>) => {
            state.sources = action.payload;
        },
        /**
         * Sets the suggestions in the store.
         * @param state - The current state.
         * @param action - The action containing the payload.
         */
        setSuggestions: (state, action: PayloadAction<Suggestion[]>) => {
            state.suggestions = action.payload;
        },
        /**
         * Sets the selected suggestion in the store.
         * @param state - The current state.
         * @param action - The action containing the payload.
         */
        setSelectedSuggestion: (state, action: PayloadAction<Suggestion>) => {
            state.selectedSuggestion = action.payload;
        },
        /**
         * Adds a task to the pending tasks list in the store.
         * @param state - The current state.
         * @param action - The action containing the payload.
         */
        addTask: (state, action: PayloadAction<string>) => {
            state.pendingTasks.push(action.payload)
        },
        /**
         * Removes a task from the pending tasks list in the store.
         * @param state - The current state.
         * @param action - The action containing the payload.
         */
        removeTask: (state, action: PayloadAction<string>) => {
            state.pendingTasks = state.pendingTasks.filter((task) => task !== action.payload)
        },
        /**
         * Adds a support object to the support list in the store.
         * @param state - The current state.
         * @param action - The action containing the payload.
         */
        addSupport: (state, action: PayloadAction<Support>) => {
            state.support.push(action.payload)
        },
        /**
         * Removes a support object from the support list in the store.
         * @param state - The current state.
         * @param action - The action containing the payload.
         */
        removeSupport: (state, action: PayloadAction<Support>) => {
            state.support = state.support.filter((support) => support !== action.payload)
        },
    },
    extraReducers: builder => {
        builder.addCase(createSuggestions.fulfilled, (state, action) => {
            /**
             * Maps the result from createSuggestions API call to terms in the store.
             * @param value - The value from the result array.
             * @returns An object with id, snippet, and terms properties.
             */
            const terms = action.payload['result'].map((value: any) => {
                return {
                    id: short.generate(),
                    snippet: value.snippet,
                    terms: value.terms,
                };
            });
            state.suggestions = terms;
        });
        builder.addCase(findSources.pending, (state, action) => {
            state.sources = undefined;
        });
        builder.addCase(findSources.fulfilled, (state, action) => {
            state.sources = action.payload;
        });
        builder.addCase(findSupport.fulfilled, (state, action) => {
            state.pendingTasks.push(action.payload);
        });
    }
});

export const { setsources, setSuggestions, setSelectedSuggestion, addSupport, addTask, removeSupport, removeTask } = slice.actions;

export const selectSources = (state: RootState) => state.slice.sources;
export const selectSuggestions = (state: RootState) => state.slice.suggestions;
export const selectSelectedSuggestion = (state: RootState) => state.slice.selectedSuggestion;
export const selectSuggestionBySnippet = (state: RootState, snippet: string) => state.slice.suggestions.find(suggestion => suggestion.snippet === snippet);
export const selectPendingTasks = (state: RootState) => state.slice.pendingTasks;
export const selectSupport = (state: RootState) => state.slice.support;

export default slice.reducer;