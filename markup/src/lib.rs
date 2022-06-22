use pest_derive::Parser;
use pest::{Parser, iterators::Pairs};
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Debug)]
#[derive(Serialize)]
pub enum BlockContent {
	Text(String),
	CodeInline(String),
	CodeBlock(String),
	Bold(Vec<Block>),
	Italic(Vec<Block>),
	Underline(Vec<Block>),
	Spoiler(Vec<Block>),
	Strikethrough(Vec<Block>),
	Mention(Mention),
	PlainMention(PlainMention)
}

#[derive(Debug)]
#[derive(Serialize)]
pub struct Block {
	content: BlockContent,
	raw: String,
	start: usize,
	end: usize
}

#[derive(Debug)]
#[derive(Serialize)]
pub struct Mention {
	id: String,
}

#[derive(Parser)]
#[grammar = "lang.pest"]
#[derive(Serialize)]
struct PestParser;

#[derive(Debug)]
#[derive(Serialize)]
pub struct PlainMention {
	text: String,
}

fn to_tree(pairs: Pairs<Rule>) -> Vec<Block> {
	let mut blocks = Vec::new();
	let mut text = String::new();
	let mut position = 0;
	for pair in pairs {
		let mut to_push = None;
		match pair.as_rule() {
			Rule::italic => {
				to_push = Some(Block {
					raw: pair.as_str().to_owned(),
					start: pair.as_span().start(),
					end: pair.as_span().end(),
					content: BlockContent::Italic(to_tree(pair.into_inner())),
				})
			},
			Rule::bold => {
				to_push = Some(Block {
					raw: pair.as_str().to_owned(),
					start: pair.as_span().start(),
					end: pair.as_span().end(),
					content: BlockContent::Bold(to_tree(pair.into_inner())),
				})
			},
			Rule::underline => {
				to_push = Some(Block {
					raw: pair.as_str().to_owned(),
					start: pair.as_span().start(),
					end: pair.as_span().end(),
					content: BlockContent::Underline(to_tree(pair.into_inner())),
				})
			},
			Rule::strikethrough => {
				to_push = Some(Block {
					raw: pair.as_str().to_owned(),
					start: pair.as_span().start(),
					end: pair.as_span().end(),
					content: BlockContent::Strikethrough(to_tree(pair.into_inner())),
				})
			},
			Rule::code_inline => {
				to_push = Some(Block {
					raw: pair.as_str().to_owned(),
					start: pair.as_span().start(),
					end: pair.as_span().end(),
					content: BlockContent::CodeInline(pair.into_inner().as_str().to_owned()),
				})
			},
			Rule::code_block => {
				to_push = Some(Block {
					raw: pair.as_str().to_owned(),
					start: pair.as_span().start(),
					end: pair.as_span().end(),
					content: BlockContent::CodeBlock(pair.into_inner().as_str().to_owned()),
				})
			},
			Rule::mention => {
				to_push = Some(Block {
					raw: pair.as_str().to_owned(),
					start: pair.as_span().start(),
					end: pair.as_span().end(),
					content: BlockContent::Mention(Mention {
						id: pair.into_inner().as_str().to_owned(),
					}),
				})
			},
			Rule::plain_mention => {
				to_push = Some(Block {
					raw: pair.as_str().to_owned(),
					start: pair.as_span().start(),
					end: pair.as_span().end(),
					content: BlockContent::PlainMention(PlainMention {
						text: pair.into_inner().as_str().to_owned()
					}),
				})
			},
			Rule::spoiler => {
				to_push = Some(Block {
					raw: pair.as_str().to_owned(),
					start: pair.as_span().start(),
					end: pair.as_span().end(),
					content: BlockContent::Spoiler(to_tree(pair.into_inner())),
				})
			},
			Rule::any => {
				text.push_str(&pair.as_str());
				position = pair.as_span().end();
			}
			_=>panic!("e")
		}
		if let Some(block) = to_push {
			if text.len() > 0 {
				blocks.push(Block {
					content: BlockContent::Text(text.clone()),
					start: position - text.len(),
					end: position,
					raw: text,
				});
				text = String::new();
			}
			blocks.push(block);
		}
	};
	if text.len() > 0 {
		blocks.push(Block {
			content: BlockContent::Text(text.clone()),
			start: position - text.len(),
			end: position,
			raw: text,
		});
	}
	return blocks;
}


fn parse(input: &str) -> Vec<Block> {
	let pairs = PestParser::parse(Rule::blocks, input).unwrap();
	return to_tree(pairs);
}

#[wasm_bindgen]
pub fn parse_with_serialize(input: &str) -> String {
	serde_json::to_string(&parse(input)).unwrap()
}

#[test]
fn test(){
	println!("{:#?}",parse(r"
		you *are*
	"));
}

fn blocks_to_html(blocks: Vec<Block>) -> String {
	println!("{:#?}", blocks);
	let mut html = String::new();
	for block in blocks {
		match block.content {
			BlockContent::Text(text) => {
				html.push_str(&text);
			},
			BlockContent::CodeInline(code) => {
				html.push_str(&format!("<code>{}</code>", code));
			},
			BlockContent::CodeBlock(code) => {
				html.push_str(&format!("<pre><code>{}</code></pre>", code));
			},
			BlockContent::Bold(blocks) => {
				html.push_str(&format!("<b>{}</b>", blocks_to_html(blocks)));
			},
			BlockContent::Italic(blocks) => {
				html.push_str(&format!("<i>{}</i>", blocks_to_html(blocks)));
			},
			BlockContent::Underline(blocks) => {
				html.push_str(&format!("<u>{}</u>", blocks_to_html(blocks)));
			},
			BlockContent::Spoiler(blocks) => {
				html.push_str(&format!("<span class=\"spoiler\">{}</span>", blocks_to_html(blocks)));
			},
			BlockContent::Strikethrough(blocks) => {
				html.push_str(&format!("<s>{}</s>", blocks_to_html(blocks)));
			},			
			BlockContent::Mention(mention) => {
				html.push_str(&format!("<span class=\"mention\">{}</span>", mention.id));
			},
			BlockContent::PlainMention(mention) => {
				html.push_str(&format!("<span class=\"mention\">{}</span>", mention.text));
			}
		}
	}
	return html;
}