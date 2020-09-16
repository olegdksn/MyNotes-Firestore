import React, { useState } from "react";

import "./App.css";
// import { motion } from "framer-motion";

function App() {
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [notes, setNotes] = useState(null);
  return <p>Hallo</p>;
}

export default App;
