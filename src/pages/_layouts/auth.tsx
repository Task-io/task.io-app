import { Outlet } from 'react-router-dom'

import logo from '../../assets/logo.svg'

export function AuthLayout() {
  return (
    <div className="grid min-h-screen grid-cols-2">
      <div className="flex h-full flex-col justify-between bg-muted p-10 text-muted-foreground">
        <img src={logo} alt="Logotipo Task.io" className="w-40" />

        <footer className="text-sm">
          Task.io &copy; task.io - {new Date().getFullYear()}
        </footer>
      </div>

      <div className="flex flex-col items-center justify-center">
        <Outlet />
      </div>
    </div>
  )
}
