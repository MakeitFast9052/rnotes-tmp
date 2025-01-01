// This simple helper lib for Rnotes handles the MD-HTML Translation

use pulldown_cmark::{Parser, Options, html};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn write_markdown(markdown: &str) -> String {
    // Initialize options for pulldown-cmark
    let mut options = Options::empty();
    
    // Enable all extended CMARK functionality (that pulldown-cmark supports)
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_TASKLISTS);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_SMART_PUNCTUATION);
    options.insert(Options::ENABLE_HEADING_ATTRIBUTES);
    options.insert(Options::ENABLE_GFM);

    // Initialize the parser with its options & input
    let parser = Parser::new_ext(markdown, options);

    // Read the output to a string & return
    let mut output = String::new();
    html::push_html(&mut output, parser);
output
}
