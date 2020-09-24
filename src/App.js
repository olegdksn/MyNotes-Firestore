import React, { useEffect, useState } from "react";

import "./App.css";
// import { motion } from "framer-motion";

const firebase = require("firebase");

function App() {
  const [notes, setNotes] = useState(null);

  let tempNotes = [];
  useEffect(() => {
    firebase
      .firestore()
      .collection("notes")
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          tempNotes.push(doc.data());
        });
      })
      .then(console.log(tempNotes));
    // Lade Firebase Inhalt ins State
    //  .then(setNotes(tempNotes));
  }, []);

  return (
    <div>
      <p>Hallo</p>
    </div>
  );
}

export default App;
