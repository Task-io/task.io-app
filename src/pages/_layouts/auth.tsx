import { Outlet } from 'react-router-dom'

import background from '../../assets/background.svg'
import logo from '../../assets/logo.svg'

export function AuthLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-muted p-10 text-muted-foreground md:flex">
        <img src={logo} alt="Logotipo Task.io" className="w-40" />

        <img src={background} className="mt-36 w-2/3" />

        <footer className="text-sm">
          Task.io &copy; task.io - {new Date().getFullYear()}
        </footer>
      </div>

      <div className="flex flex-col items-center justify-center p-6 md:p-10">
        <img
          src={logo}
          alt="Logotipo Task.io"
          className="mb-4 block w-36 sm:w-40 md:hidden"
        />
        <div className="flex w-full max-w-xs flex-col items-center">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
