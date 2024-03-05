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

export const createSuggestions = createAsyncThunk('store/generateQueries', async (text: string) => {
    const response = await fetch('/api/gen-terms', { method: 'POST', body: JSON.stringify({"text":text}), headers: { "Content-Type": "application/json" } });
    return (await response.json()) as Queries;
});

export const findSources = createAsyncThunk('store/findSources', async (text: string) => {
    const response = await fetch('/api/scholar', { method: 'POST', body: JSON.stringify({"query":text}), headers: { "Content-Type": "application/json" } });
    return (await response.json()) as Source[];
});

export const findSupport = createAsyncThunk('store/findSupport', async ({text, source}: {text: string, source: Source}) => {
    const response = await fetch('/api/support-claim', { method: 'POST', body: JSON.stringify({"snippet":text, "source":source}), headers: { "Content-Type": "application/json" } });
    return (await response.json())['result_id'] as string;
});

export const slice = createSlice({
    name: "store",
    initialState,
    reducers: {
        setsources: (state, action: PayloadAction<Source[]>) => {
            state.sources = action.payload;
        },
        setSuggestions: (state, action: PayloadAction<Suggestion[]>) => {
            state.suggestions = action.payload;
        },
        setSelectedSuggestion: (state, action: PayloadAction<Suggestion>) => {
            state.selectedSuggestion = action.payload;
        },
        addTask: (state, action: PayloadAction<string>) => {
            state.pendingTasks.push(action.payload)
        },
        removeTask: (state, action: PayloadAction<string>) => {
            state.pendingTasks = state.pendingTasks.filter((task) => task !== action.payload)
        },
        addSupport: (state, action: PayloadAction<Support>) => {
            state.support.push(action.payload)
        },
        removeSupport: (state, action: PayloadAction<Support>) => {
            state.support = state.support.filter((support) => support !== action.payload)
        },
    },
    extraReducers: builder => {
        builder.addCase(createSuggestions.fulfilled, (state, action) => {
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