# PageClock #

This repository presents a Google Chrome extension that can be used to track
the length of time spent on particular websites. For more information on
*exactly* what it does, read the Design Document (it's in LaTeX format).

# Compatibilities #

This extension is compatible with Google Chrome version 73 and newer.

# Developing #

If you feel the need to help develop PageClock, be my guest! However, this
application uses EC6 modules and classes, which means that the content needs to
be served statically to prevent CORS errors when loaded as an unpacked
extension. While it's obviously not the most secure method, I find using
`serve` is sufficient for this.

```
yarn global add serve
serve ./
```
