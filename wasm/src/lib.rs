use wasm_bindgen::prelude::*;

mod dmi;

pub use dmi::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}

#[wasm_bindgen]
pub async fn parse_dmi(url: &str) -> JsValue {
    let dmi = Dmi::from_url(url).await;
    serde_wasm_bindgen::to_value(&dmi).unwrap()
}
