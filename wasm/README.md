# Writer (rnotes)

This simple Helper Library for [Rote Notes](#) leverages pulldown-cmark (a rust crate) compiled to WebAssembly (through wasm-bindgen) to generate MarkDown Previews.

It enables all features of pulldown-cmark, and is compiled to release in the final build.

## How to use

- Install wasm-pack
- Run `$ cargo build # --release`
- Run `$ wasm-pack --target web`
- Copy ./pkg/writer.js & ./pkg/writer\_bg.wasm into a convenient dire
