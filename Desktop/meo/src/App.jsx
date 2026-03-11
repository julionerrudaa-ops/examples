import Header from './components/Header'
import LoginForm from './components/LoginForm'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <LoginForm />
      </main>
      <Footer />
    </div>
  )
}

export default App
