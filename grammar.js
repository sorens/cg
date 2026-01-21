/// <reference types="tree-sitter-cli/dsl" />

// @ts-nocheck

module.exports = grammar({
  name: "cg",

  extras: ($) => [/\s/],

  word: ($) => $.identifier,

  rules: {
    // cdl-file := [version-directive] (file-def | comment)*
    source_file: ($) =>
      seq(
        optional($.version_directive),
        repeat(choice($.file_definition, $.comment)),
      ),

    // version-directive := "#cdl" ":" integer
    version_directive: ($) => seq("#cdl", ":", $.integer),

    // comment := ("//" | "#") any-char* newline
    comment: ($) => token(prec(-1, choice(seq("//", /.*/), seq("#", /.*/)))),

    // file-def := file-type (string | identifier) ["," (string | identifier)] [block]
    file_definition: ($) =>
      prec.right(
        seq(
          $.file_type,
          choice($.string, $.identifier),
          optional(seq(",", choice($.string, $.identifier))),
          optional($.block),
        ),
      ),

    // file-type := "mprt" | "masm" | "mdrw" | "easm"
    file_type: ($) => choice("mprt", "masm", "mdrw", "easm"),

    // block := "do" [block-params] (property-call | file-def | comment)* "end"
    block: ($) =>
      prec.right(
        seq(
          "do",
          optional($.block_params),
          repeat(choice($.property_call, $.file_definition, $.comment)),
          "end",
        ),
      ),

    // block-params := "|" identifier ("," identifier)* "|"
    block_params: ($) =>
      seq("|", $.identifier, repeat(seq(",", $.identifier)), "|"),

    // property-call := property-keyword [value] ("," arg)* [block]
    property_call: ($) =>
      prec.right(
        seq(
          $.property_keyword,
          optional(choice($.string, $.integer, $.boolean, $.identifier)),
          repeat(
            seq(
              ",",
              choice(
                $.keyword_arg,
                $.string,
                $.integer,
                $.boolean,
                $.identifier,
              ),
            ),
          ),
          optional($.block),
        ),
      ),

    // property-keyword := short and long form CDL property names
    property_keyword: ($) =>
      choice(
        "config",
        "configuration",
        "dep",
        "depends_on",
        "content",
        "content_generate",
        "metadata",
        "meta",
        "drawing_of",
        "active",
      ),

    // keyword-arg := identifier ":" value (e.g., config: "Dark", active: true)
    keyword_arg: ($) =>
      prec(
        2,
        seq(
          alias($.identifier, $.keyword_arg_name),
          ":",
          choice($.string, $.boolean, $.integer, $.identifier),
        ),
      ),

    // boolean := "true" | "false"
    boolean: ($) => choice("true", "false"),

    // integer := [0-9]+
    integer: ($) => /[0-9]+/,

    // quoted-string := '"' (string-content | escape-sequence | interpolation)* '"'
    string: ($) =>
      seq(
        '"',
        repeat(choice($.string_content, $.escape_sequence, $.interpolation)),
        '"',
      ),

    // string-content := [^"\\#]+
    string_content: ($) => /[^"\\#]+/,

    // escape-sequence := "\\" any-char
    escape_sequence: ($) => /\\./,

    // interpolation := "#{" expr "}"
    interpolation: ($) => seq("#{", /[^}]*/, "}"),

    // identifier := [A-Za-z_$][A-Za-z0-9_]*
    identifier: ($) => /[A-Za-z_$][A-Za-z0-9_]*/,
  },
});
