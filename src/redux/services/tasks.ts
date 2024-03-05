import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { addSupport, removeTask } from '../slice';
import { TaskStatus } from '../../types';

/**
 * The API object for performing tasks-related operations.
 */
export const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    reducerPath: 'api',
    tagTypes: ['TaskStatus'],
    endpoints: (builder) => ({
        getTasks: builder.query<TaskStatus[], string[]>({
            query: (ids) => ({ url: '/result', method: 'POST', body: { tasks: ids } }),
            providesTags: ['TaskStatus'],
            transformResponse: (response: { results: TaskStatus[] }) => response.results,
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    console.log(data)
                    data.forEach((task) => {
                        if (task.ready && task.value !== null) {
                            dispatch(removeTask(task.key))
                            dispatch(addSupport(task.value))
                        }
                    })
                } catch (error) {
                    console.log(error);
                }
            },
        }),
    }),
})

export const { useGetTasksQuery } = api;