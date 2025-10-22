# React App Jumbler (JavaScript)

This implementation of the React App Jumbler is a small [React](https://reactjs.org) demo JavaScript application using the following features:

- Selection of [React Bootstrap](https://react-bootstrap.github.io) components
- Event handling
- Managing the state of the App class
- Managing the layout via Cascading Style Sheets (CSS)

You are welcome to inspect the JS(X), HTML and CSS code as well as the JSON config files.

# Installation

Run the following commands for installation:

```
$ cd jumbler-react/jumbler-app-js
$ npm install
$ npm list --depth=0
jumbler-app-js@0.0.1 /Users/mg/react/jumbler-react/jumbler-app-js
├── @babel/core@7.28.3
├── @babel/plugin-transform-class-properties@7.27.1
├── @babel/preset-env@7.28.3
├── @babel/preset-react@7.27.1
├── @popperjs/core@2.11.8
├── babel-loader@10.0.0
├── bootstrap@5.3.8
├── copy-webpack-plugin@13.0.1
├── css-loader@7.1.2
├── html-webpack-plugin@5.6.4
├── jquery@3.7.1
├── license-webpack-plugin@4.0.2
├── react-bootstrap@2.10.10
├── react-dom@19.1.1
├── react@19.1.1
├── style-loader@4.0.0
├── terser-webpack-plugin@5.3.14
├── webpack-cli@5.1.4
├── webpack-dev-server@5.2.2
└── webpack@5.101.3
```

You can start the webpack development server locally. Watch mode is configured via `webpack.config.json`:

```
$ npm run dev-server
```

Open React app in your browser: [http://localhost:8080/dist/index.html](http://localhost:8080/dist/index.html)

# Screenshot

You will see something like this.

![alt text](./page.png)

# Background

## Hypothesis

It doesn't matter in what order the letters in a word are, the only important thing is that the first and last letter be at the right place. The rest can be a total mess and you can still read it without problem. This is because the human mind does not read every letter by itself, but the word as a whole.

## Example

The jumbling of the words of the hypothesis stated above might end up in the following result:

"It doesn't matetr in what order the letrets in a word are, the only imonarptt thing is that the first and last letetr be at the right place. The rest can be a total mess and you can still read it wihuott prbelom. This is beasuce the human mind does not read every letetr by itslef, but the word as a whole."

## Reference

This statement goes back to Graham Ernest Rawlinson: "The Significance of Letter Position in Word Recognition", PhD Thesis, 1976, University of Nottingham
