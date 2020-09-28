import React, { useEffect, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";

import "./App.css";
import { motion, AnimatePresence } from "framer-motion";

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
let timeNow = new Date();
let datumJetzt = timeNow.toLocaleString("en-GB", { timeZone: "Asia/Brunei" });

//! Ende Editor

function App() {
  const [notes, setNotes] = useState(["abc"]);
  const [notesIDandName, setNotesIDandName] = useState(["abc"]);
  const [counter, setCounter] = useState(1);
  const [noteName, setNoteName] = useState(null);
  const [istVersteckt, setIstVersteckt] = useState(true);

  const [inputWert, setInputWert] = useState("Name");

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
          let tempidtext = [
            doc.id,
            doc.data().nameDerNote, /// Das ist der Eintrag mit dem aktuellen Datum wenn kein Name eingegeben wurde.
            doc.data().blocks[0].data.text,
          ];
          tempNotesIDandName.push(tempidtext);
        });
      })

      .then(setNotes(tempNotes)) ///...///...///.../// Problem:   Der State wird erst nach naechstem Render step geupdated. Deswegen hab ich den CounterButton als Test reingetan
      .then(setNotesIDandName(tempNotesIDandName));
  }, []);

  function counterButton() {
    setCounter(20);
  }

  //// Input Handler vom NamenFeld

  function handleInputChange(event) {
    setInputWert(event.target.value);
  }

  //// Neue Note Speichern

  function noteSpeichern() {
    editor.save().then((outputData) => {
      console.log("Article data: ", outputData);
      if (noteName == null) {
        if (inputWert == "Name" || inputWert == "") {
          firebase
            .firestore()
            .collection("notes")
            .doc(timeStamp)
            .set({ ...outputData, ...{ nameDerNote: datumJetzt } });
          let tempVorherigeNotes = notesIDandName;
          tempVorherigeNotes.unshift([timeStamp, datumJetzt, outputData]);
          setNotesIDandName(tempVorherigeNotes);
        } else {
          firebase
            .firestore()
            .collection("notes")
            .doc(timeStamp)
            .set({ ...outputData, ...{ nameDerNote: inputWert } });
          let tempVorherigeNotes = notesIDandName;
          tempVorherigeNotes.unshift([timeStamp, inputWert, outputData]);
          setNotesIDandName(tempVorherigeNotes);
        }
      } else {
        // noteName ist die Document ID , d.h. wenn die Note bereits existiert, dann ist (noteName != null) und es gibt (inputWert != "")
        firebase
          .firestore()
          .collection("notes")
          .doc(noteName)
          .set({ ...outputData, ...{ nameDerNote: inputWert } });
      }
    });

    // Liste der Notes soll geupdated werden mit neuem Namen falls Input Name anders ist.
    // d.h. die im State geladenen Notes werden durchsucht nach der geöffneten Note ID ( = noteName ) und der entsprechende Name wird durch inputWert ersetzt.
    notesIDandName.forEach((item) => {
      if (item[0] == noteName) {
        item[1] = inputWert;
      }
    });
  }

  //// Klick auf Note in Sidebar

  function clickSidebarNote(event) {
    setNoteName(event.target.id);
    firebase
      .firestore()
      .collection("notes")
      .doc(event.target.id)
      .get()
      .then((antwort) => {
        console.log(antwort.data());
        editor.render(antwort.data());
        setInputWert(antwort.data().nameDerNote); // Name der Note wird in Inputfeld als Value eingetragen.
      });
  }

  //// Note löschen
  function deleteNote(event) {
    let zuLoeschendeNoteID = event.target.id - "button";
    console.log(zuLoeschendeNoteID);
    // firebase.firestore().collection("notes").doc(event.target.id - "button").delete().then(function() {
    //   console.log("Document successfully deleted!");
  }

  //// RETURN Render

  return (
    <div>
      <div className="wrapperDiv">
        <motion.div
          className="cssSidebarDiv"
          onHoverStart={() => {
            counterButton();
            setIstVersteckt(true);
          }}
          onHoverEnd={() => {
            setIstVersteckt(false);
          }}
        >
          <div id="listeMitNotes">
            <AnimatePresence>
              {istVersteckt && (
                <motion.ul
                  className="cssSidebarListe"
                  initial={{ x: -1000 }}
                  animate={{ x: 0 }}
                  exit={{ x: -1000 }}
                >
                  {notesIDandName.map((item) => (
                    <li
                      key={item[0]}
                      id={item[0]}
                      className="cssSidebarNotes"
                      onClick={(event) => {
                        clickSidebarNote(event);
                      }}
                    >
                      {item[1] ? item[1] : "keinname"}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
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
          <div id="inputDIV">
            <input
              id="nameInput"
              placeholder="Name"
              maxLength="20"
              value={inputWert}
              onChange={handleInputChange}
            ></input>
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
        </div>
      </div>
    </div>
  );
}

export default App;
