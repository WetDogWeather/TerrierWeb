### Terrier Distribution Files

We haven't organized Terrier for Web into a proper distribution yet, so for now we just copy the files around.  Here are the pieces you need and what they're for.

Back up one level you'll find a terrier directory containing these.

        terrier.js
        WhirlyGlobeWeb.js       
        WhirlyGlobeWeb.wasm     
        stack_contents.json


These are, respectively:
- The high level Terrier for Web interface.  This is the only one you'll call into.
- Some crazy looking generated Javascript from Emscripten.
- The Web Assembly that makes it all go
- A description of the layers in your stack.  This one will go away soon to be replaced by a Boxer call, but for now we need it.

Each of these need to be accessible to terrier.js wherever they are served from.  So for now we just symlink them into this directory and also list them in the vite config, where we're using vite.
