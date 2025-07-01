import './style.css'
import { App } from './components/App.ts'

const appRoot = document.getElementById('app')
if (appRoot) {
  App(appRoot)
}
