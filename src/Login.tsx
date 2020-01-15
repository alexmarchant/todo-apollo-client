import React, { useState, BaseSyntheticEvent, useEffect, Dispatch, SetStateAction } from 'react'
import { gql, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'

interface FormData {
  name: string;
  email: string;
  password: string;
}

const SIGNUP = gql`
  mutation Signup($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password)
  }
`

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`

enum Mode {
  Login,
  Signup,
}

interface Props {
  setToken: Dispatch<SetStateAction<string | null | undefined>>;
}

interface SignupData {
  signup: string;
}

interface LoginData {
  login: string;
}

interface SignupVars {
  name: string;
  email: string;
  password: string;
}

interface LoginVars {
  email: string;
  password: string;
}

const Login = ({ setToken }: Props): JSX.Element => {
  const [signup, signupRes] = useMutation<SignupData, SignupVars>(SIGNUP)
  const [login, loginRes] = useMutation<LoginData, LoginVars>(LOGIN)
  const { register, handleSubmit, errors } = useForm<FormData>()
  const [mode, setMode] = useState(Mode.Signup)

  const token = signupRes.data?.signup || loginRes.data?.login

  const onSubmit = async (data: FormData, event: BaseSyntheticEvent): Promise<void> => {
    event.preventDefault()
    if (mode === Mode.Login) {
      await login({ variables: { email: data.email, password: data.password } })
    } else {
      await signup({ variables: { name: data.name, email: data.email, password: data.password } })
    }
  }

  useEffect(() => {
    setToken(token)
  }, [setToken, token])

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {mode === Mode.Signup && (
          <div>
            <label>Name</label>
            <input name="name" type="text" ref={register({ required: true })} />
          </div>
        )}
        <div>
          {errors.name && errors.name.message}
        </div>
        <div>
          <label>Email</label>
          <input name="email" type="text" ref={register({ required: true })} />
        </div>
        <div>
          {errors.email && errors.email.message}
        </div>
        <div>
          <label>Password</label>
          <input name="password" type="text" ref={register({ required: true })} />
        </div>
        <div>
          {errors.password && errors.password.message}
        </div>
        <input type="submit" value="Submit" />
      </form>
      <button
        onClick={(): void => {
          if (mode === Mode.Login) {
            setMode(Mode.Signup)
          } else {
            setMode(Mode.Login)
          }
        }}
      >
        {mode === Mode.Login ? 'Signup' : 'Login'}
      </button>
    </div>
  )
}

export default Login