use std::{cmp::Ordering, io::Cursor};

use ::serde::Serialize;
use image::{io::Reader, DynamicImage, ImageFormat};
use png::Decoder;
use wasm_bindgen::JsCast as _;
use wasm_bindgen_futures::JsFuture;
use web_sys::Response;

#[derive(Default, Serialize)]
pub struct Dmi {
    pub width: u32,
    pub height: u32,
    pub states: Vec<State>,
}

impl Dmi {
    pub async fn from_url(url: &str) -> Self {
        let data = {
            let window = web_sys::window().unwrap();
            let response_value = JsFuture::from(window.fetch_with_str(url)).await.unwrap();
            let response: Response = response_value.dyn_into().unwrap();
            let array_buffer = JsFuture::from(response.array_buffer().unwrap())
                .await
                .unwrap();
            let array = js_sys::Uint8Array::new(&array_buffer);
            array.to_vec()
        };

        let metadata = {
            let decoder = Decoder::new(Cursor::new(&data));
            let reader = decoder.read_info().unwrap();
            let chunk = reader.info().compressed_latin1_text.first().unwrap();
            chunk.get_text().unwrap()
        };

        let image = {
            let reader = Reader::with_format(Cursor::new(&data), ImageFormat::Png);
            reader.decode().unwrap()
        };

        let mut dmi = Dmi::from_metadata(metadata);

        let grid_width = image.width() / dmi.width;

        let mut index = 0;

        for state in dmi.states.iter_mut() {
            state.fix_delays();

            for _ in 0..state.frame_count {
                for _ in 0..state.dirs {
                    let x = dmi.width * (index % grid_width);
                    let y = dmi.height * (index / grid_width);

                    let image = image.crop_imm(x, y, dmi.width, dmi.height);

                    state.frames.push(image);

                    index += 1;
                }
            }
        }

        dmi
    }
    pub fn from_metadata(metadata: String) -> Dmi {
        let mut dmi = Dmi::default();

        let mut lines = metadata.lines();

        if lines.next().unwrap() != "# BEGIN DMI" {
            panic!("Invalid DMI metadata");
        }

        if lines.next().unwrap() != "version = 4.0" {
            panic!("Invalid DMI version");
        }

        for line in lines {
            if line == "# END DMI" {
                break;
            }

            let (key, value) = line.trim().split_once(" = ").unwrap();

            match key {
                "width" => dmi.width = value.parse().unwrap(),
                "height" => dmi.height = value.parse().unwrap(),
                "state" => dmi.states.push(State::new(value.trim_matches('"').into())),
                "dirs" => dmi.states.last_mut().unwrap().dirs = value.parse().unwrap(),
                "frames" => dmi.states.last_mut().unwrap().frame_count = value.parse().unwrap(),
                "delay" => {
                    let delays = value.split(',').map(|x| x.parse().unwrap()).collect();
                    dmi.states.last_mut().unwrap().delays = delays;
                }
                "loop" => dmi.states.last_mut().unwrap().r#loop = value.parse().unwrap(),
                "rewind" => dmi.states.last_mut().unwrap().rewind = value != "1",
                "movement" => dmi.states.last_mut().unwrap().movement = value != "1",
                "hotspot" => dmi.states.last_mut().unwrap().hotspots.push(value.into()),
                _ => {}
            }
        }

        dmi
    }
}

#[derive(Default, Serialize)]
pub struct State {
    pub name: String,
    pub dirs: u32,
    #[serde(with = "self::serde::dynamic_image")]
    pub frames: Vec<DynamicImage>,
    pub frame_count: u32,
    pub delays: Vec<f32>,
    pub r#loop: u32,
    pub rewind: bool,
    pub movement: bool,
    pub hotspots: Vec<String>,
}

impl State {
    pub fn new(name: String) -> Self {
        Self {
            name,
            dirs: 1,
            ..Default::default()
        }
    }
    pub fn fix_delays(&mut self) {
        let frame_count = self.frame_count as usize;

        if !self.delays.is_empty() {
            let delay_count = self.delays.len();
            match delay_count.cmp(&frame_count) {
                Ordering::Less => {
                    let last_delay = *self.delays.last().unwrap();
                    let additional_delays = vec![last_delay; frame_count - delay_count];
                    self.delays.extend(additional_delays);
                }
                Ordering::Greater => {
                    self.delays.truncate(frame_count);
                }
                _ => {}
            }
        } else if self.frame_count > 1 {
            self.delays = vec![1.; frame_count];
        }
    }
}

pub mod serde {
    pub mod dynamic_image {
        use std::io::Cursor;

        use base64::{engine::general_purpose, Engine as _};
        use image::{DynamicImage, ImageFormat};
        use serde::{ser::SerializeSeq as _, Serializer};

        pub fn serialize<S>(images: &Vec<DynamicImage>, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: Serializer,
        {
            let mut seq = serializer.serialize_seq(Some(images.len()))?;

            for image in images {
                let mut buffer = Vec::new();
                let mut cursor = Cursor::new(&mut buffer);

                image.write_to(&mut cursor, ImageFormat::Png).unwrap();

                let base64 = general_purpose::STANDARD.encode(&buffer);
                let base64 = format!("data:image/png;base64,{base64}");

                seq.serialize_element(&base64)?;
            }

            seq.end()
        }
    }
}
