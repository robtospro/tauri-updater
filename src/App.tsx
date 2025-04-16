import { useState, useEffect } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { Toaster, toast } from "sonner";
import type { Update } from "@tauri-apps/plugin-updater";

import "./App.css";

function App() {
  // const isDev = import.meta.env.MODE === "development";
  const [version, setVersion] = useState("");
  const [updateExists, setUpdateExists] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<Update | null>(null);

  // Check for update but don't download it yet
  useEffect(() => {
    (async () => {
      try {
        const update = await check();

        if (update) {
          setUpdateExists(true);
          setUpdateInfo(update);
          toast(`🔔 Update available: ${update.version} \nNotes: ${update.body}`);
        } else {
          toast("✅ No update available");
          const currentVersion = await getVersion();
          setUpdateInfo({ version: currentVersion } as Update);
        }
      } catch (e) {
        toast.error("❌ Update check failed:");
      }
    })();
  }, []);

  // Get current version string
  useEffect(() => {
    getVersion().then(setVersion);
  }, []);


  return (
    <>
      <Toaster
        toastOptions={{
          style: {
            background: "rgba(0, 0, 0, 0.4)",
            color: "white",
            backdropFilter: "blur(5px)",
            borderColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      />

      <main className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center w-[400px]">
          <h1 className="font-bold text-6xl text-center mb-6">Update test</h1>

          <div className="flex flex-col gap-4 items-center">
            <p className="text-2xl font-medium">v{version}</p>

            {updateExists && updateInfo && (
              <button
                className="rounded-lg border border-transparent px-4 py-2 text-base font-medium text-[#0f0f0f] bg-white transition-colors duration-200 shadow hover:border-[#396cd8] active:border-[#396cd8] active:bg-[#e8e8e8] focus:outline-none cursor-pointer"
                onClick={async () => {
                  let downloaded = 0;
                  let contentLength = 0;

                  try {
                    await updateInfo.downloadAndInstall((event) => {
                      switch (event.event) {
                        case "Started":
                          contentLength = event.data.contentLength ?? 0;
                          console.log(`⬇️ Started downloading ${contentLength} bytes`);
                          break;
                        case "Progress":
                          downloaded += event.data.chunkLength;
                          console.log(`⬇️ Downloaded ${downloaded} of ${contentLength}`);
                          break;
                        case "Finished":
                          console.log("✅ Download finished");
                          break;
                      }
                    });

                    toast("✅ Update downloaded. Restarting...");
                    await relaunch();
                  } catch (e) {
                    toast.error("❌ Failed to download update");
                    console.error(e);
                  }
                }}
              >
                Update to v{updateInfo.version}
              </button>
            )}

            {updateInfo && version === updateInfo.version && (
              <p className="accent-lime-400">You're on the latest version!</p>
            )}

          </div>
        </div>
      </main>
    </>
  );
}

export default App;
