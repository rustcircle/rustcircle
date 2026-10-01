---
title: "Hi man! A fractal might do the trick up my sleeve!"
subtitle: "Why this blog has a Julia set breathing behind every page"
date: 2026-10-01T03:14:00+01:00
author: "Pedro Jorge"
slug: "fractals"
description: "A first post: the Julia set in the background, the maths behind it, and how this blog is built."
draft: false
---

<!-- Private note: this comment is stripped from the website. -->

Welcome to **rustcircle**. I am a mathematician and programmer, and this is
where I write about mathematics, artificial intelligence and quantum
computing — with the occasional chess detour.

## The picture behind the text

The soft pattern moving behind this page is a *Julia set*. Fix a complex
number $c$ and iterate

$$
z_{n+1} = z_n^2 + c, \qquad z_0 = z \in \mathbb{C}.
$$

The filled Julia set $K_c$ is the set of starting points whose orbit stays
bounded. Here $c$ travels slowly around the circle $|c| = 0.7885$, so the set
morphs continuously:

$$
c(t) = 0.7885\, e^{i\theta(t)}, \qquad \theta(t) = \theta_0 + \omega t .
$$

Colour comes from the *smooth escape time*
$\nu(z) = n - \log_2 \log_2 |z_n|$, which removes the banding of the integer
iteration count. Everything runs in one tiny WebGL shader at half resolution
and 30 frames per second, and it stops entirely if you ask your system for
reduced motion.

![Fractal plasma, one of the oldest tricks in 80s computer graphics](assets/plasma.jpg "Diamond–square *plasma fractal*, the texture of many 80s demos.")

## A small piece of code

```python
def escape_time(z: complex, c: complex, n_max: int = 56) -> int:
    for n in range(n_max):
        if abs(z) > 16:
            return n
        z = z * z + c
    return n_max
```

## What comes next

- The Endless Quest! Or infinite adventures!
- Perhaps you already know or else we both might imagine!
- A world full of wonders!
