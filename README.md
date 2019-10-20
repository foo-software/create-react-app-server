## Note About the State of This Repo (10/14/2019):

> This project is an unstable work in progress at the moment.

***

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

# Create React App Server

Tired of trying to figure out how to implement server side rendering in your application while keeping up with major releases of React? Frustrated with the framework you chose to make this process easier?

Despite major progress of the HTTP protocol and engines serving web pages, server side rendering remains important for many reasons. Imagine a world in which one could write React code in a standardized way, utilizing the newest core methods and techniques. [Create React App](https://create-react-app.dev/) provides a simple, standardized boilerplate to get up and running with a React app. Nowadays, Create React App is used as a starting point for robust web applications, but it isn't compatible with server side rendering. So, how does Create React App Server breakthrough this compatibility issue? The answer - it doesn't! Create React App Server provides server side rendering as a standalone process.

Server side rendering - why bother... behold **server side caching** ✨

## What is This?

Create React App Server is a Node.js [Express](https://expressjs.com/) application. It accepts Express customization options and more. It serves static files from a Create React App build. It parses client side rendered HTML, writes output to HTML files on disk, and caches the relationship in memory so proceeding requests are served a static file without heavy lifting.

### Server Side Caching - the Details

Below is a more elaborate explanation of the Create React App Server flow. It doesn't really render server side, but instead caches and serves client side rendered HTML from the initial mount of specified page level components. Here's how it works:

- A request is made for a Create React App route - let's say for example `/login`.
- An **efficient** check is made to find out if we have a cached version of the page. This needs to remain efficient since it will happen on every request. We check for the existence of a property in an "in-memory" store - easy peasy!
- If the route from above is found - a corresponding HTML file is served from Express.
  - The Create React App should use `ReactDOM.hydrate` in this case (see examples in this documentation).
- If the route from above is not found - Create React App Server will create a new HTML file.
  - An instance of [Puppeteer](https://github.com/GoogleChrome/puppeteer) is launched.
  - Puppeteer is served `index.html` as it normally would from Create React App and receives the client side rendered experience of the given route (`/login` for example).
  - `@foo-software/with-server-side-caching` provides the corresponding route's stringified HTML via [`ReactDOMServer.renderToString`](https://reactjs.org/docs/react-dom-server.html#rendertostring).
  - Puppeteer extracts the stringified HTML from above, hands it off for processing and closes.
  - A new file is cloned from `index.html`, injected with the HTML string from above, and renamed based on the route. 
- A key based on route and path is added to cache for proceeding requests.
- We then respond to the request with the new HTML file. This request will take a fair amount of time to be fulfilled, but will only occur once per route.

## Upcoming

Below is a to-do list ordered by priority to help make this project what it should be. PRs are welcome 🙏

- Fix Prettier. When I split out packages in Lerna, I broke Prettier for each. This will need to be a shared configuration somehow.
- Provide implementation option to customize Express.
- Provide implementation option to customize static files in Express (caching, etc).
- GitHub Action - workflow. Create a workflow to run tests.
- Example apps - as a package.
- More unit tests (Jest).
- Integration tests - as a package. Cypress could be a good framework for this. We could test the example app with newest releases.

## FAQ

- **When HTML files are generated - is `asset-manifest.json` also updated?** No, this file doesn't seem applicable to the application runtime based on [Webpack documentation](https://webpack.js.org/concepts/manifest/) and this [answered issue](https://github.com/facebook/create-react-app/issues/6436).
