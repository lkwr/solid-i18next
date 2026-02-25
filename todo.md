# TODOs

- suspense not working when switching languages. Because currenlty we hook into the "languageChanged" event to trigger suspsense. But I is fired after the resources are already loaded, but suspense needs to be triggered before the loading is done, on language change request or backend load resources request.