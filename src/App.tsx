// import { useState } from 'react'
import './App.css'
import ChessBoard from './components/ChessBoard';
import { game } from "./lib/chess";

function App() {


  return (
    <>
     <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
      <ChessBoard />
    </div>
    </>
  )
}

export default App
