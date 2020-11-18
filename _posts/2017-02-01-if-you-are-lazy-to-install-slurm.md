---
layout: post
mathjax: true
plyr: false
title: "Handling a queue of GPU jobs without resource manager"
author: Dmitry Ulyanov
excerpt_separator: <!--more-->
---

How do you execute a lot of experiments? Say you want to run as many as you can over night, and examine them in the morning. The jobs can be executed one after the other as easy as `bash run.sh` when you have a single GPU. The problems arise when you have more than one so you want to make sure each GPU is occupied with exactly one task at a time and new task is fetched when previous finished. A clever way would be to use a resource manager such as `slurm` or `torque`, but I leave it as a future work for myself. This post shows a possible workaround for a local workstation using a simple python script.
<!--more-->

So here it is:

<script src="https://gist.github.com/DmitryUlyanov/1a2e8882c664f235459b7aa25269ac86.js"></script>

Just adjust the command-line, `N_GPU` and parameter loop.

The most non-trivial part is to use `backend="threading"` because Queue seems to be thread-safe only with it (see [test](https://gist.github.com/DmitryUlyanov/b2040ab673c0ec9186eac9a0b336d9ea)). You may also notice printing issues, they can be fixed with print locks. Find a fixed version [here](https://gist.github.com/DmitryUlyanov/a5c37f08dcf0e242a50bf390c176daae).
