[![Angular Logo](https://www.vectorlogo.zone/logos/angular/angular-icon.svg)](https://angular.io/) [![TypeScript Logo](https://www.vectorlogo.zone/logos/typescriptlang/typescriptlang-icon.svg)](https://www.typescriptlang.org/) [![Electron Logo](https://www.vectorlogo.zone/logos/electronjs/electronjs-icon.svg)](https://electronjs.org/) [![Git Logo](https://www.vectorlogo.zone/logos/git-scm/git-scm-icon.svg)](https://git-scm.com/)

peon-git because peons work, so ~~does~~ will this client

Performance on Windows apparantelly sucks - I blame it on Electron. I might want to migrate this thing on Tauri.

It's still one big WIP, but you can actually perform a lot of basic tasks right now.


First you need to add a new tab by clicking the '➕📢' button<br />
![Main view](readmepics/0.png?raw=true "Main view")


Paste the list to your local repo and click 'Submit' button<br />
![Adding a repo](readmepics/1.png?raw=true "Adding a repo")


All actions are performed from the context menu, so have at it<br />
![Context menu](readmepics/2.png?raw=true "Context menu")

I've made my own algorithm for drawing the git graph (structure is made in `git-graph.generator.ts` and it drawn it `git-graph.painter.ts`. I can't say I'm fully satisfied with it, but it'll do just for now.



It might seem that I'm not making any progress on this one, but in fact I'm secretely rewriting this thing into a JavaFX application. I will upload it at some point here
