import React, { useEffect, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";

import "./App.css";
// import { motion } from "framer-motion";

const firebase = require("firebase");

//! Editor Component
const editor = new EditorJS({
  /**
   * Id of Element that should contain Editor instance
   */
  holder: "editorjs",
  tools: {
    header: {
      class: Header,
      shortcut: "CMD+SHIFT+H",
    },
  },
});

let timeStamp = String(Date.now());

function noteSpeichern() {
  editor.save().then((outputData) => {
    console.log("Article data: ", outputData);

    firebase.firestore().collection("notes").doc(timeStamp).set(outputData);
  });
}

//! Ende Editor

function App() {
  const [notes, setNotes] = useState(["abc"]);
  const [notesIDandName, setNotesIDandName] = useState(["abc"]);
  const [counter, setCounter] = useState(1);

  let tempNotes = [];
  let tempNotesIDandName = [];
  useEffect(() => {
    firebase
      .firestore()
      .collection("notes")
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          tempNotes.push(doc.data());
          let tempidtext = [doc.id, doc.data().blocks[0].data.text];
          tempNotesIDandName.push(tempidtext);
        });
      })

      .then(setNotes(tempNotes)) ///...///...///.../// Problem:   Der State wird erst nach naechstem Render step geupdated. Deswegen hab ich den CounterButton als Test reingetan
      .then(setNotesIDandName(tempNotesIDandName));
  }, []);

  function counterButton() {
    setCounter(20);
    console.log(notes[0]);
  }

  function clicklog(event) {
    console.log(event.target.id, "LI geklickt");
    firebase
      .firestore()
      .collection("notes")
      .doc(event.target.id)
      .get()
      .then((antwort) => {
        console.log(antwort.data());

        const editor2 = new EditorJS({
          /**
           * Id of Element that should contain Editor instance
           */
          holder: "editorjs",
          tools: {
            header: {
              class: Header,
              shortcut: "CMD+SHIFT+H",
            },
          },
          data: antwort.data(),
        });
      });
  }

  return (
    <div>
      <div className="wrapperDiv">
        <div>
          <p>SideBar</p>
          <button
            onClick={() => {
              counterButton();
            }}
          >
            {counter}
          </button>
          <ul>
            {notesIDandName.map((item) => (
              <li
                key={item[0]}
                id={item[0]}
                onClick={(event) => {
                  clicklog(event);
                }}
              >
                {item[1]}
              </li>
            ))}
          </ul>
          {/* <ul>
            {notes.map((item) => (
              <li key={item.inhalt}>{item.data}</li>
            ))}
          </ul> */}
        </div>
        <div>
          <div id="editorjs"></div>
          <button
            onClick={() => {
              noteSpeichern();
            }}
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
