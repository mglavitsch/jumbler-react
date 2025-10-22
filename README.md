# jumbler-react

Small React app run on Docker and Kubernetes.

# Installation

Install the package manager for the [Node JavaScript](https://nodejs.org) platform.

Run the following commands for installation:

```
$ cd myPath
$ git clone https://github.com/mglavitsch/jumbler-react.git
```

# Three versions of React App Jumbler

There are three directories containing two different implementations of [React](https://reactjs.org) app Jumbler run in different runtime environments.

## jumbler-app-js

This directory contains an implementation of React app Jumbler written in JavaScript and run using [webpack](https://webpack.js.org), see [./jumbler-app-js/README.md](./jumbler-app-js/README.md).

Additionally, it is hosted in the AWS cloud and available at [https://to-be-deployed-soon.ch](to-be-deployed-soon.ch).

## jumbler-app-ts

This directory contains an implementation of React app Jumbler written in TypeScript and run using [webpack](https://webpack.js.org), see [./jumbler-app-ts/README.md](./jumbler-app-ts/README.md).

## jumbler-app-k8s

This implementation of React app Jumbler represents the `jumbler-app-ts` implementation run on [Docker](https://www.docker.com) and [Kubernetes](https://kubernetes.io), see [./jumbler-app-k8s/README.md](./jumbler-app-k8s/README.md).

