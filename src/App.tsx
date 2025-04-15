import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const update = await check();
        if (update) {
          console.log(
            `found update ${update.version} from ${update.date} with notes ${update.body}`
          );

          let downloaded = 0;
          let contentLength = 0;

          await update.downloadAndInstall((event) => {
            switch (event.event) {
              case "Started":
                contentLength = event.data.contentLength ?? 0;
                console.log(`started downloading ${contentLength} bytes`);
                break;
              case "Progress":
                downloaded += event.data.chunkLength;
                console.log(`downloaded ${downloaded} of ${contentLength}`);
                break;
              case "Finished":
                console.log("download finished");
                break;
            }
          });

          console.log("update installed");
          await relaunch();
        } else {
          console.log("No update available");
        }
      } catch (e) {
        console.error("Update check failed", e);
      }
    })();
  }, []);

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>
      <h2>Update test</h2>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
      <p className="px-2 text-4xl font-medium">Version {version}</p>
    </main>
  );
}

export default App;
