# TODO-list

- [x] ~~/game should default to one player that is the editor code~~
- [ ] show UI warning that max players exceeded in player select
- [ ] more sidebar items in player select, e.g. "Small setup", "Medium setup", "Large setup" to randomly select players to fit in X rings.
- [x] convert `GameLive.js` to `.tsx`
- [x] delete unused `withRouter` and `NavBar`
- [ ] include `socket-io-client` dependency
- [x] route base router '/' to '/editor'
- [x] replace Vite icons and refs with hex related stuff
- [x] create and use page hook for changing document title based on path
- [x] visiting /game should not be loading if "No players selected" --> Show grid with overlay of navigating to player select page
- [ ] make modal dynamically adjust width to match parent (fixed position)
- [ ] new rule! - when taking over a cell, add a grace period of X rounds where no foreign owners can transfer resources to it
