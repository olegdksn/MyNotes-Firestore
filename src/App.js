import React, { useEffect, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";

import "./App.css";
import { motion } from "framer-motion";

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

//! Ende Editor

function App() {
  const [notes, setNotes] = useState(["abc"]);
  const [notesIDandName, setNotesIDandName] = useState(["abc"]);
  const [counter, setCounter] = useState(1);
  const [noteName, setNoteName] = useState(null);

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
  }

  //// Neue Note Speichern

  function noteSpeichern() {
    editor.save().then((outputData) => {
      console.log("Article data: ", outputData);
      if (noteName == null) {
        firebase.firestore().collection("notes").doc(timeStamp).set(outputData);
      } else {
        firebase.firestore().collection("notes").doc(noteName).set(outputData);
      }
    });
  }

  //// Klick auf Note in Sidebar

  function clicklog(event) {
    console.log(event.target.id, "LI geklickt");
    setNoteName(event.target.id);
    firebase
      .firestore()
      .collection("notes")
      .doc(event.target.id)
      .get()
      .then((antwort) => {
        console.log(antwort.data());
        editor.render(antwort.data());
      });
  }

  return (
    <div>
      <div className="wrapperDiv">
        <motion.div
          className="cssSidebarDiv"
          onHoverStart={() => counterButton()}
        >
          <div>
            {/* <motion.button onHoverStart={() => counterButton()}>
              TESTBUTTON
            </motion.button> */}
          </div>
          <div>
            <button
              onClick={() => {
                counterButton();
              }}
            >
              {counter}
            </button>
          </div>
          <div>
            <ul className="cssSidebarListe">
              {notesIDandName.map((item) => (
                <li
                  key={item[0]}
                  id={item[0]}
                  className="cssSidebarNotes"
                  onClick={(event) => {
                    clicklog(event);
                  }}
                >
                  {item[1]}
                </li>
              ))}
            </ul>
          </div>
          {/* <ul>
            {notes.map((item) => (
              <li key={item.inhalt}>{item.data}</li>
            ))}
          </ul> */}
        </motion.div>
        <div className="cssRechteSeite">
          <div id="editordiv">
            <div id="editorjs"></div>
          </div>

          <button
            onClick={() => {
              noteSpeichern();
            }}
            className="cssButtonSpeichern"
            id="speichernButtonID"
          >
            Speichern
          </button>

          {/* <div>
            <button
              onClick={() => {
                idaendern();
              }}
            >
              id aendern
            </button>
            <button id="test1">Test1</button>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default App;
