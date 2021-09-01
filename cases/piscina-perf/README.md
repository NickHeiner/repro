
# Nick notes to self
I don't think the issue is the TS compilation; I don't see TS bringing in any big libs.

```js
// "TFC" = "time to first completed task", i.e. measuring the startup delay we observe.

// Load babel-preset-tvui: TFC = ~34s
// Load babel-preset-tvui with all `plugins` commented out: TFC = ~13s
// presets: [['babel-preset-tvui', { modules: false, appName: '' }]],

// TFC = ~1.6s.
// presets: ['@babel/preset-env'],

// TFC = ~9.6s
```