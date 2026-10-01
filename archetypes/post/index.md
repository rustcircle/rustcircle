{{- $base := path.Base .File.Dir -}}
{{- $slug := replaceRE `^\d{5}[-_]` "" $base | replaceRE `_` "-" -}}
{{- $title := getenv "HUGO_POST_TITLE" | default (replace $slug "-" " " | strings.FirstUpper) -}}
---
title: {{ $title | jsonify }}
subtitle: {{ getenv "HUGO_POST_SUBTITLE" | default "" | jsonify }}
date: {{ .Date }}
author: "Pedro Jorge"
slug: {{ $slug | jsonify }}
description: ""
draft: true
---

<!--
Private notes go in HTML comments: they never reach the website.
Media lives in ./assets/ and is linked relatively:
  ![Alt text](assets/figure.png "Optional caption")
Video: the `video` shortcode with src="assets/clip.mp4" (see README).
Maths: inline $e^{i\pi}+1=0$, display between $$ … $$ or \[ … \].
-->

Write the opening paragraph here.
