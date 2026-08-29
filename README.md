# dsh-photos

Photo upload for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) composer.

A 📷 button floats next to the voice mic at the composer's top-right. Tap it and you get the **native picker** — on iPhone: Photo Library / Take Photo / Choose File; on desktop: a file dialog. Picked images land in the composer as draft attachments with thumbnails, ready to send.

## How it works

The stock composer already supports image attachments via paste and drag-and-drop — there was just no way to *initiate* that from a phone. This plugin feeds the picked files into the composer's **own paste pipeline** (a synthetic `ClipboardEvent` with a `DataTransfer`), so:

- stock validation applies (media types, per-message count, byte limits, with the stock toast errors)
- stock thumbnails render in the attachments row
- the stock send flow serializes them — identical to a real clipboard paste

No React internals touched, no DOM mutation inside React's tree (the button and file input are fixed/hidden overlays).

## Install

```bash
cd ~/.dsh/profiles/web
pnpm add file:~/path/to/dsh-photos
```

Add `dsh-photos` to the profile's `dsh.profile.bundles` in `package.json`, restart the GUI, and the 📷 appears.

## Notes

- Sending images needs a **vision-capable model** selected (a GLM-5V variant, Gemini, Qwen-vl, Solar Pro 4, …) — admission is model-agnostic, but the model must accept image input for the turn to succeed
- Multiple selection works (the picker allows it; files arrive as one paste)

## License

MIT
