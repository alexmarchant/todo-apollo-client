import React, { Dispatch, SetStateAction, BaseSyntheticEvent } from 'react'
import { gql, useQuery, useMutation, DataProxy, FetchResult } from '@apollo/client'
import { useForm } from 'react-hook-form'

const GET_TODOS = gql`
  query Todos {
    todos {
      id
      title
      done
      userId
    }
  }
`

const CREATE_TODO = gql`
  mutation CreateTodo($title: String!) {
    createTodo (title: $title) {
      id
      title
      done
      userId
    }
  }
`

const DELETE_TODO = gql`
  mutation DeleteTodo($id: Int!) {
    deleteTodo (id: $id) {
      id
    }
  }
`

const UDPATE_TODO = gql`
  mutation UpdateTodo($id: Int!, $title: String!, $done: Boolean!) {
    updateTodo (id: $id, title: $title, done: $done) {
      id
      title
      done
    }
  }
`

interface Props {
  setToken: Dispatch<SetStateAction<string | null | undefined>>;
}

interface FormData {
  title: string;
}

interface Todo {
  id: number;
  title: string;
  done: boolean;
  userId: number;
}

function createTodoCallback(cache: DataProxy, mutationResult: FetchResult<{ createTodo: Todo }>): void {
  const todo = mutationResult.data?.createTodo
  if (!todo) {
    throw new Error('Bad result')
  }
  const queryRes = cache.readQuery<{ todos: Todo[] }>({ query: GET_TODOS })
  if (!queryRes) {
    throw new Error('Bad result')
  }
  const todos = queryRes.todos
  const newTodos = todos.concat([todo])
  cache.writeQuery({
    query: GET_TODOS,
    data: { todos: newTodos },
  })
}

function deleteTodoCallback(cache: DataProxy, mutationResult: FetchResult<{ deleteTodo: { id: number } }>): void {
  const id = mutationResult.data?.deleteTodo.id
  if (!id) {
    throw new Error('Bad result')
  }
  const queryRes = cache.readQuery<{ todos: Todo[] }>({ query: GET_TODOS })
  if (!queryRes) {
    throw new Error('Bad result')
  }
  const todos = queryRes.todos
  const newTodos = todos.filter(todo => todo.id !== id)
  cache.writeQuery({
    query: GET_TODOS,
    data: { todos: newTodos },
  })
}

const Todos = ({ setToken }: Props): JSX.Element => {
  const { register, handleSubmit, errors } = useForm<FormData>()
  const { loading, error, data } = useQuery<{ todos: Todo[] }>(GET_TODOS)
  const [createTodo] = useMutation<{ createTodo: Todo }, { title: string }>(CREATE_TODO, { update: createTodoCallback })
  const [deleteTodo] = useMutation<{ deleteTodo: Todo }, { id: number }>(DELETE_TODO, { update: deleteTodoCallback })
  const [updateTodo] = useMutation<{ updateTodo: Todo }, { id: number; title: string; done: boolean }>(UDPATE_TODO)

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>

  async function onSubmit(data: FormData, event: BaseSyntheticEvent): Promise<void> {
    event.preventDefault()
    await createTodo({ variables: { title: data.title } })
  }

  const listItems = data?.todos.map(todo => {
    async function handleCheck(): Promise<void> {
      await updateTodo({ variables: { id: todo.id, title: todo.title, done: !todo.done } })
    }

    async function handleDelete(): Promise<void> {
      await deleteTodo({ variables: { id: todo.id } })
    }

    return (
      <li key={todo.id}>
        {todo.title}
        <input type="checkbox" checked={todo.done} onChange={handleCheck} />
        <button onClick={handleDelete}>x</button>
      </li>
    )
  }) 

  return (
    <div>
      <ol>
        {listItems}
      </ol>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" name="title" ref={register({ required: true })} />
        {errors.title && errors.title.message}
        <input type="submit" value="Submit"/>
      </form>
      <button onClick={(): void => setToken(null)}>Logout</button>
    </div>
  )
}

export default Todos