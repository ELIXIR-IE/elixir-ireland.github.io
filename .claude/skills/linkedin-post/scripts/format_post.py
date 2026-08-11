#!/usr/bin/env python3
"""
Convert a markdown-ish LinkedIn post draft into ready-to-paste plain text.

LinkedIn's post composer has no rich-text formatting: **bold** typed
literally just posts as asterisks. The only way to get bold-looking text
is to use separate Unicode codepoints (Mathematical Alphanumeric Symbols)
that *are* bold glyphs, not a bold style applied to normal glyphs. This
script does that substitution so the output can be pasted directly into
LinkedIn and still look bold.

Usage:
    python3 format_post.py draft.md > post.txt
    cat draft.md | python3 format_post.py > post.txt

Draft syntax:
    **word or phrase**   -> rendered in bold sans-serif unicode
    everything else      -> passed through unchanged (emoji, links, line
                             breaks, hashtags all survive as-is)

Only letters and digits inside a **bold** span are remapped (Unicode has
no bold variant of punctuation/spaces/emoji), so "**ELIXIR-GOBLET**"
still shows its hyphen normally — that's expected and looks correct.
"""
import re
import sys

_UPPER_START = 0x1D5D4  # MATHEMATICAL SANS-SERIF BOLD CAPITAL A
_LOWER_START = 0x1D5EE  # MATHEMATICAL SANS-SERIF BOLD SMALL A
_DIGIT_START = 0x1D7EC  # MATHEMATICAL SANS-SERIF BOLD DIGIT ZERO


def _bold_char(ch: str) -> str:
    if "A" <= ch <= "Z":
        return chr(_UPPER_START + (ord(ch) - ord("A")))
    if "a" <= ch <= "z":
        return chr(_LOWER_START + (ord(ch) - ord("a")))
    if "0" <= ch <= "9":
        return chr(_DIGIT_START + (ord(ch) - ord("0")))
    return ch  # punctuation, spaces, emoji: no bold glyph exists, keep as-is


def to_linkedin_bold(text: str) -> str:
    return "".join(_bold_char(c) for c in text)


def format_post(draft: str) -> str:
    return re.sub(
        r"\*\*(.+?)\*\*",
        lambda m: to_linkedin_bold(m.group(1)),
        draft,
    )


if __name__ == "__main__":
    if len(sys.argv) > 1:
        with open(sys.argv[1], encoding="utf-8") as f:
            draft_text = f.read()
    else:
        draft_text = sys.stdin.read()
    sys.stdout.write(format_post(draft_text))
