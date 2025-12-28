import { useEffect, useRef, useState } from 'react';
import './App.css'

function App() {
  const [messages,setMessages] = useState(["Welcome to Chat!","hi there"]);
  const inputRef = useRef();
  const wsRef = useRef();

  useEffect(()=>{
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (event)=>{
      setMessages(m=>[...m,event.data])
    }
    wsRef.current = ws;
    ws.onopen = ()=>{
      ws.send(JSON.stringify({
        type : "join",
        payload : {
          roomId : "red"
        }
      }))
    }
  },[])

  return (
    <div className="h-screen bg-black">
      <div className="h-[95vh] ">
        <br />
        <br />
        <br />
        {messages.map((message) => (
          <div className="m-8">
            <span className="rounded bg-white text-black p-4 ">{message}</span>
          </div>
        ))}
      </div>
      <div className="w-full bg-white flex">
        <input ref = {inputRef} type="text" className="flex-1 p-4" />
        <button onClick={() => {
          const message  = inputRef.current.value
          wsRef.current.send(JSON.stringify({ type: "chat", payload: { message } }));;
        }} className="bg-purple-600 text-white p-4">
          Send
        </button>
      </div>
    </div>
  );
}

export default App
