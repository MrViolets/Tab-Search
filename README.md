# Tab Search

![Screenshot](./docs/assets/screenshot.jpg?raw=true)

Tab Search is a Chrome extension that lets you search the content of all of your tabs.

## Install

1. Download and uncompress zip.
2. In Chrome, go to the extensions page at `chrome://extensions/`.
3. Enable Developer Mode.
4. Choose `Load Unpacked` and select the folder.

## Build

1. `npm install` to install dependencies.
2. Update `version` in `manifest.json`.
3. `npm run build`.

## Usage

Once installed, you can access the extension by clicking the extension icon in the Chrome toolbar.

- Type a search query to seatch your tabs.
- Navigate with the arrow keys and press Enter or click on a search result to jump immediately to that tab.

Note: Tab Search works more smoothly with Chrome Memory Saver turned off. It still work with it on but it's a little slower since it has to reload discarded tabs before searching them.

## License

Tab Search is licensed under the GNU General Public License version 3.